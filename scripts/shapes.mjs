import sharp from 'sharp';

const color = (hex) => {
  const s = String(hex).replace(/^#/, '');
  const h = s.length === 3 ? [...s].map(x => x + x).join('') : s;
  if (!/^[a-f\d]{6}$/i.test(h)) throw new Error(`Invalid shape color: ${hex}`);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
};
const finite = (values) => values.every(x => typeof x === 'number' && Number.isFinite(x));

// Absolute canvas coordinates. Incoming handle, anchor, outgoing handle.
export function commandsToPaths(commands) {
  const paths = []; let p;
  for (const c of commands) {
    if (!Array.isArray(c)) throw new Error('Shape commands must be arrays');
    const [op, ...v] = c;
    const arity = { M: 2, L: 2, C: 6, Z: 0 }[op];
    if (arity == null || v.length !== arity || !finite(v)) throw new Error(`Invalid shape command: ${JSON.stringify(c)}`);
    if (op === 'M') {
      p = { open: true, operation: 'combine', fillRule: 'non-zero', knots: [{ linked: false, points: [...v, ...v, ...v] }] };
      paths.push(p);
    } else {
      if (!p || !p.open) throw new Error('Start a new shape subpath with M');
      if (op === 'Z') { p.open = false; continue; }
      const last = p.knots.at(-1);
      const end = op === 'C' ? v.slice(4) : v;
      if (op === 'C') last.points.splice(4, 2, ...v.slice(0, 2));
      p.knots.push({ linked: false, points: [...(op === 'C' ? v.slice(2, 4) : end), ...end, ...end] });
    }
  }
  if (!paths.length || paths.some(p => p.knots.length < 2)) throw new Error('A shape needs at least two knots per subpath');
  // A final cubic may explicitly return to the first anchor; merge the knot.
  for (const p of paths) if (!p.open && p.knots.length > 2) {
    const first = p.knots[0], last = p.knots.at(-1);
    if (first.points[2] === last.points[2] && first.points[3] === last.points[3]) {
      first.points.splice(0, 2, ...last.points.slice(0, 2)); p.knots.pop();
    }
  }
  return paths;
}

function geometry(layer) {
  if (layer.shape === 'path') {
    if (!Array.isArray(layer.commands)) throw new Error('Path shape requires commands');
    return layer.commands;
  }
  const { left: x = 0, top: y = 0, width: w, height: h } = layer;
  if (!finite([x,y,w,h]) || w <= 0 || h <= 0) throw new Error('Shape bounds must be finite with positive width and height');
  if (layer.shape === 'rect') return [['M',x,y],['L',x+w,y],['L',x+w,y+h],['L',x,y+h],['Z']];
  if (layer.shape === 'ellipse') {
    const cx=x+w/2,cy=y+h/2,rx=w/2,ry=h/2,k=.5522847498307936;
    return [['M',cx+rx,cy],['C',cx+rx,cy+k*ry,cx+k*rx,cy+ry,cx,cy+ry],['C',cx-k*rx,cy+ry,cx-rx,cy+k*ry,cx-rx,cy],['C',cx-rx,cy-k*ry,cx-k*rx,cy-ry,cx,cy-ry],['C',cx+k*rx,cy-ry,cx+rx,cy-k*ry,cx+rx,cy],['Z']];
  }
  throw new Error(`Unknown shape geometry: ${layer.shape}`);
}

export async function buildShape(layer, canvas) {
  const commands = geometry(layer), paths = commandsToPaths(commands);
  const fillEnabled = layer.fill != null && layer.fill !== 'none';
  const strokeEnabled = layer.stroke != null && layer.stroke !== 'none';
  if (!fillEnabled && !strokeEnabled) throw new Error('Shape requires fill or stroke');
  if (fillEnabled && paths.some(p => p.open)) throw new Error('Filled shape paths must be closed');
  const width = layer.strokeWidth ?? 1;
  if (!finite([width]) || width <= 0) throw new Error('Shape strokeWidth must be positive');
  const cap = layer.lineCap ?? 'round', join = layer.lineJoin ?? 'round';
  if (!['butt','round','square'].includes(cap) || !['miter','round','bevel'].includes(join)) throw new Error('Invalid shape stroke cap/join');
  const fillColor = color(fillEnabled ? layer.fill : '#000000');
  const strokeColor = color(strokeEnabled ? layer.stroke : '#000000');
  const d = commands.map(c=>c.join(' ')).join(' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><path d="${d}" fill="${fillEnabled ? layer.fill : 'none'}" stroke="${strokeEnabled ? layer.stroke : 'none'}" stroke-width="${width}" stroke-linecap="${cap}" stroke-linejoin="${join}"/></svg>`;
  const {data,info}=await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  return {
    left:0,top:0,
    imageData:{width:info.width,height:info.height,data:new Uint8ClampedArray(data)},
    vectorMask:{fillStartsWithAllPixels:false,paths},
    vectorFill:{type:'color',color:fillColor},
    vectorStroke:{fillEnabled,strokeEnabled,lineWidth:{units:'Pixels',value:width},lineCapType:cap,lineJoinType:join,lineAlignment:'center',content:{type:'color',color:strokeColor},opacity:1,resolution:72},
  };
}
