#!/usr/bin/env python3
"""Atomic production checkpoints; DONE requires evidence for the current revision."""
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

NEXT = {
    'ANALYZE': {'PLAN'}, 'PLAN': {'MASTER'}, 'MASTER': {'ASSETS'},
    'ASSETS': {'ASSEMBLE'}, 'ASSEMBLE': {'VALIDATE', 'REPAIR'},
    'VALIDATE': {'REPAIR', 'EXPORT'},
    'REPAIR': {'PLAN', 'MASTER', 'ASSETS', 'ASSEMBLE', 'VALIDATE'},
    'EXPORT': {'DONE', 'REPAIR'}, 'DONE': set(),
}

def digest(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def completion(record, require_delivery=True):
    output = Path(record['outputPath'])
    manifest = Path(record['manifestPath'])
    if output.suffix.lower() != '.psd' or output.read_bytes()[:4] != b'8BPS':
        raise ValueError('Missing or invalid physical PSD')
    report = json.loads(output.with_name(output.stem + '-validation.json').read_text())
    if report.get('passed') is not True or Path(report['outputPath']).resolve() != output.resolve():
        raise ValueError('Missing technical validation for this output')
    if Path(report['manifestPath']).resolve() != manifest.resolve():
        raise ValueError('Validation belongs to another manifest')
    hashes = {'psdSha256': digest(output), 'manifestSha256': digest(manifest),
              'previewSha256': digest(report['previewPath'])}
    review = record.get('review', {})
    for key, value in hashes.items():
        if report.get(key) != value or review.get(key) != value:
            raise ValueError('Stale or missing technical/visual evidence: ' + key)
    if review.get('passed') is not True or any(not isinstance(review.get(k), str) or not review[k].strip() for k in ('visual', 'assets', 'editability')):
        raise ValueError('Actual visual, asset and editability reviews required')
    delivery = record.get('delivery', {})
    if require_delivery and (delivery.get('persisted') is not True or delivery.get('psdSha256') != hashes['psdSha256'] or not delivery.get('persistentId') or not delivery.get('downloadUrl')):
        raise ValueError('Verified persistent delivery required')

def checkpoint(filename, target):
    if target not in NEXT:
        raise ValueError('Unknown production state: ' + target)
    p = Path(filename)
    record = json.loads(p.read_text()) if p.exists() else {'version': 1, 'assets': [], 'history': []}
    current = record.get('state')
    if current is None and target != 'ANALYZE':
        raise ValueError('Start with ANALYZE')
    if current == 'DONE' or (current and target != current and target not in NEXT[current]):
        raise ValueError('Invalid transition: ' + str(current) + ' -> ' + target)
    interactive = record.get('interactive', {})
    if interactive.get('enabled') and target in {'ASSETS', 'ASSEMBLE', 'VALIDATE', 'EXPORT', 'DONE'}:
        ids = {proposal.get('id') for proposal in interactive.get('proposals', [])}
        if interactive.get('status') != 'selected' or interactive.get('selectedId') not in ids or not interactive.get('selectedId'):
            raise ValueError('Interactive master selection is pending')
    if target in {'EXPORT', 'DONE'}:
        completion(record, require_delivery=target == 'DONE')
    record['state'] = target
    record['history'].append({'state': target, 'at': datetime.now(timezone.utc).isoformat()})
    p.parent.mkdir(parents=True, exist_ok=True)
    temporary = p.with_name(p.name + '.tmp-' + str(os.getpid()))
    temporary.write_text(json.dumps(record, indent=2) + '\n')
    os.replace(temporary, p)
    return record

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Usage: checkpoint.py <production.json> <STATE>')
    try:
        checkpoint(sys.argv[1], sys.argv[2])
        print('Checkpoint: ' + sys.argv[2])
    except (OSError, ValueError, KeyError) as error:
        sys.exit('Checkpoint rejected: ' + str(error))
