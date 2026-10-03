#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { writePsdBuffer, readPsd, initializeCanvas } from 'ag-psd';
import { compositeLayers } from './composite.mjs';
import { buildShape } from './shapes.mjs';

function usage() {
  console.error('Usage: node scripts/build-psd.mjs <manifest.json> <output.psd>');
  process.exit(2);
}

function clampOpacity(value) {
  if (value == null) return undefined;
  return Math.max(0, Math.min(1, Number(value)));
}

function parseHexColor(hex = '#000000') {
  const cleaned = hex.replace('#', '').trim();
  const normalized = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid color: ${hex}`);
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbaImageData(width, height, data) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
  };
}

async function loadImageData(filePath, resize = {}) {
  let pipeline = sharp(filePath).ensureAlpha();
  if (resize.width || resize.height) {
    const source = await sharp(filePath).metadata();
    const targetWidth = resize.width ?? source.width * resize.height / source.height;
    const targetHeight = resize.height ?? source.height * resize.width / source.width;
    if ((targetWidth > source.width || targetHeight > source.height) && !resize.allowUpscale) {
      throw new Error(`Raster asset ${filePath} is too small (${source.width}x${source.height}) for ${targetWidth}x${targetHeight}. Regenerate at sufficient native resolution; set allowUpscale only with explicit user authorization.`);
    }
    if (resize.width && resize.height && Math.abs(targetWidth / targetHeight / (source.width / source.height) - 1) > 0.01 && !resize.allowDistort) {
      throw new Error(`Raster resize would distort ${filePath}; preserve aspect ratio or explicitly authorize allowDistort.`);
    }
    pipeline = pipeline.resize({
      width: resize.width ? Math.round(resize.width) : undefined,
      height: resize.height ? Math.round(resize.height) : undefined,
      fit: 'fill',
    });
  }
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) throw new Error(`Expected RGBA image for ${filePath}`);
  return rgbaImageData(info.width, info.height, data);
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function renderTextPreview(layer) {
  const width = Math.max(1, Math.round(layer.width));
  const height = Math.max(1, Math.round(layer.height));
  const fontSize = Number(layer.fontSize ?? 48);
  const lineHeight = Number(layer.lineHeight ?? 1.2) * fontSize;
  const family = xmlEscape(layer.fontFamily ?? 'Arial');
  const weight = Number(layer.fontWeight ?? 400);
  const fill = layer.color ?? '#000000';
  const align = layer.align ?? 'left';
  const lines = String(layer.text ?? '').split('\n');

  let x = 0;
  let anchor = 'start';
  if (align === 'center') {
    x = width / 2;
    anchor = 'middle';
  } else if (align === 'right') {
    x = width;
    anchor = 'end';
  }

  const tspans = lines.map((line, index) => {
    const y = fontSize + index * lineHeight;
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${xmlEscape(line)}</text>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${tspans}</svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return rgbaImageData(info.width, info.height, data);
}

// Manifests use Photoshop panel order (top to bottom). ag-psd uses bottom to top.
// Reverse each sibling list exactly once, including nested groups.
async function buildLayer(layer, manifestDir, canvas) {
  const common = {
    name: layer.name ?? 'Layer',
    hidden: Boolean(layer.hidden),
  };
  const opacity = clampOpacity(layer.opacity);
  if (opacity != null) common.opacity = opacity;

  if (layer.type === 'group') {
    return {
      ...common,
      opened: layer.opened !== false,
      children: await Promise.all([...(layer.children ?? [])].reverse().map((child) => buildLayer(child, manifestDir, canvas))),
    };
  }

  if (layer.type === 'image') {
    if (!layer.path) throw new Error(`Image layer "${common.name}" is missing path`);
    const absolute = path.resolve(manifestDir, layer.path);
    const imageData = await loadImageData(absolute, { width: layer.width, height: layer.height, allowUpscale: layer.allowUpscale, allowDistort: layer.allowDistort });
    return {
      ...common,
      left: Math.round(layer.left ?? 0),
      top: Math.round(layer.top ?? 0),
      imageData,
    };
  }

  if (layer.type === 'shape') return { ...common, ...await buildShape(layer, canvas) };

  if (layer.type === 'text') {
    for (const key of ['text', 'left', 'top', 'width', 'height', 'fontSize']) {
      if (layer[key] == null) throw new Error(`Text layer "${common.name}" is missing ${key}`);
    }

    const color = parseHexColor(layer.color ?? '#000000');
    const preview = await renderTextPreview(layer);
    const left = Math.round(layer.left);
    const top = Math.round(layer.top);
    const align = layer.align ?? 'left';

    return {
      ...common,
      left,
      top,
      imageData: preview,
      text: {
        text: String(layer.text),
        transform: [1, 0, 0, 1, left + (align === 'center' ? preview.width / 2 : align === 'right' ? preview.width : 0), top + Number(layer.fontSize)],
        style: {
          font: { name: layer.fontPostScriptName ?? layer.fontFamily ?? 'ArialMT' },
          fontSize: Number(layer.fontSize),
          fillColor: color,
        },
        paragraphStyle: {
          justification: align,
        },
      },
    };
  }

  throw new Error(`Unknown layer type: ${layer.type}`);
}

const [manifestArg, outputArg] = process.argv.slice(2);
if (!manifestArg || !outputArg) usage();

const manifestPath = path.resolve(manifestArg);
const outputPath = path.resolve(outputArg);
if (!/\.psd$/i.test(outputPath)) throw new Error('Output must have a .psd extension');
const manifestDir = path.dirname(manifestPath);
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

if (!Number.isInteger(manifest.width) || !Number.isInteger(manifest.height) || manifest.width <= 0 || manifest.height <= 0) {
  throw new Error('Manifest width and height must be integers');
}
if (!Array.isArray(manifest.layers)) throw new Error('Manifest layers must be an array');

const psd = {
  width: manifest.width,
  height: manifest.height,
  children: await Promise.all([...manifest.layers].reverse().map((layer) => buildLayer(layer, manifestDir, manifest))),
};

const composite = await compositeLayers(psd.children, psd.width, psd.height);
psd.imageData = rgbaImageData(psd.width, psd.height, composite);
const buffer = writePsdBuffer(psd, { invalidateTextLayers: false });
initializeCanvas(() => { throw new Error('Unexpected canvas request'); },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }));
const readback = readPsd(buffer, { useImageData: true });
const rendered = await compositeLayers(readback.children, readback.width, readback.height);
function verifyMetadata(expected, actual) {
  if (expected.length !== actual.length) throw new Error('Layer count changed on PSD readback');
  for (let i = 0; i < expected.length; i++) {
    const a = expected[i], b = actual[i];
    if (a.name !== b.name || !!a.hidden !== !!b.hidden) throw new Error('Layer order/visibility changed on PSD readback');
    if (a.children) { verifyMetadata(a.children, b.children ?? []); continue; }
    if (a.text && (!b.text || a.text.text.replace(/\r/g, '\n') !== b.text.text.replace(/\r/g, '\n'))) throw new Error(`Editable text missing: ${a.name}`);
    if (a.vectorMask) {
      if (!b.vectorMask || !b.vectorFill || !b.vectorStroke) throw new Error(`Native shape metadata missing: ${a.name}`);
      if (JSON.stringify(a.vectorFill) !== JSON.stringify(b.vectorFill)) throw new Error(`Shape fill changed: ${a.name}`);
      for (const key of ['strokeEnabled', 'fillEnabled', 'lineCapType', 'lineJoinType', 'lineAlignment']) {
        if (a.vectorStroke[key] !== b.vectorStroke[key]) throw new Error(`Shape stroke changed: ${a.name}`);
      }
      if (Math.abs(a.vectorStroke.lineWidth.value - b.vectorStroke.lineWidth.value) > 0.001 || JSON.stringify(a.vectorStroke.content) !== JSON.stringify(b.vectorStroke.content)) throw new Error(`Shape stroke width/color changed: ${a.name}`);
      const ap = a.vectorMask.paths, bp = b.vectorMask.paths;
      if (ap.length !== bp.length) throw new Error(`Shape subpaths missing: ${a.name}`);
      for (let j = 0; j < ap.length; j++) {
        if (ap[j].open !== bp[j].open || ap[j].knots.length !== bp[j].knots.length) throw new Error(`Shape geometry changed: ${a.name}`);
        for (let k = 0; k < ap[j].knots.length; k++) for (let q = 0; q < 6; q++) {
          if (Math.abs(ap[j].knots[k].points[q] - bp[j].knots[k].points[q]) > 0.001) throw new Error(`Shape coordinates changed: ${a.name}`);
        }
      }
    }
  }
}
verifyMetadata(psd.children, readback.children);

// PSD stores layer opacity in 8 bits; permit rounding from that quantization.
let maxDifference = 0;
for (let i = 0; i < composite.length; i++) maxDifference = Math.max(maxDifference, Math.abs(composite[i] - rendered[i]));
if (maxDifference > 3) throw new Error(`PSD readback differs from preview by ${maxDifference}`);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
const temporaryPath = outputPath + '.tmp-' + process.pid;
await fs.writeFile(temporaryPath, buffer);
const diskBuffer = await fs.readFile(temporaryPath);
if (!diskBuffer.length || diskBuffer.toString('ascii', 0, 4) !== '8BPS') throw new Error('Invalid saved PSD');
const saved = readPsd(diskBuffer, { useImageData: true });
if (saved.width !== psd.width || saved.height !== psd.height || saved.colorMode !== 3) throw new Error('Saved PSD dimensions/RGB mode mismatch');
verifyMetadata(psd.children, saved.children ?? []);
const diskRender = await compositeLayers(saved.children, saved.width, saved.height);
if (!Buffer.from(diskRender).equals(Buffer.from(rendered))) throw new Error('Saved PSD render changed');
await fs.rename(temporaryPath, outputPath);
const previewPath = outputPath.replace(/\.psd$/i, '') + '-preview.png';
await sharp(rendered, { raw: { width: psd.width, height: psd.height, channels: 4 } }).png().toFile(previewPath);
console.log(`Verified PSD readback; preview: ${previewPath}`);
console.log(`Wrote ${outputPath} (${buffer.length} bytes)`);

const sha256 = value => createHash('sha256').update(value).digest('hex');
const reportPath = outputPath.replace(/\.psd$/i, '') + '-validation.json';
const report = { passed: true, outputPath, manifestPath, previewPath,
  psdSha256: sha256(await fs.readFile(outputPath)),
  manifestSha256: sha256(await fs.readFile(manifestPath)),
  previewSha256: sha256(await fs.readFile(previewPath)),
  width: saved.width, height: saved.height, colorMode: saved.colorMode,
  checks: ['physical-readback', 'dimensions', 'RGB', 'recursive-layer-order', 'native-metadata', 'render-consistency'],
  visualReviewRequired: true };
await fs.writeFile(reportPath + '.tmp', JSON.stringify(report, null, 2));
await fs.rename(reportPath + '.tmp', reportPath);
