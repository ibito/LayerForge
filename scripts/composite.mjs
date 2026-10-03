import sharp from 'sharp';

// Render the same supported normal-blend pixel layers written to the PSD.
// ag-psd children are bottom-to-top. Hidden groups hide all descendants.
export async function compositeLayers(children, width, height) {
  const overlays = [];
  for (const layer of children ?? []) {
    if (layer.hidden || layer.opacity === 0) continue;
    let data, w, h, left = 0, top = 0;
    if (layer.children) {
      data = await compositeLayers(layer.children, width, height);
      w = width; h = height;
    } else if (layer.imageData) {
      ({ width: w, height: h } = layer.imageData);
      data = Buffer.from(layer.imageData.data);
      left = layer.left ?? 0; top = layer.top ?? 0;
    } else continue;
    const x = Math.max(0, left), y = Math.max(0, top);
    const cw = Math.min(width, left + w) - x;
    const ch = Math.min(height, top + h) - y;
    if (cw <= 0 || ch <= 0) continue;
    data = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .extract({ left: x - left, top: y - top, width: cw, height: ch }).raw().toBuffer();
    if (layer.opacity != null && layer.opacity < 1) {
      for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * layer.opacity);
    }
    overlays.push({ input: data, raw: { width: cw, height: ch, channels: 4 }, left: x, top: y });
  }
  return sharp({ create: { width, height, channels: 4, background: '#00000000' } })
    .composite(overlays).raw().toBuffer();
}
