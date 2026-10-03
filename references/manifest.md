# Manifest format

The builder accepts a JSON document:

```json
{
  "width": 1600,
  "height": 2000,
  "layers": [
    {
      "type": "group",
      "name": "TEXT",
      "children": [
        {
          "type": "text",
          "name": "Title",
          "text": "VERBENA DE VERANO",
          "left": 140,
          "top": 180,
          "width": 1320,
          "height": 220,
          "fontFamily": "Arial",
          "fontPostScriptName": "Arial-BoldMT",
          "fontSize": 110,
          "fontWeight": 700,
          "lineHeight": 1.05,
          "align": "center",
          "color": "#ffffff"
        }
      ]
    },
    {
      "type": "group",
      "name": "ARTWORK",
      "children": [
        {
          "type": "image",
          "name": "Lantern",
          "path": "./assets/lantern.png",
          "left": 350,
          "top": 550
        }
      ]
    },
    {
      "type": "image",
      "name": "BACKGROUND",
      "path": "./assets/background.png",
      "left": 0,
      "top": 0
    }
  ]
}
```

## Supported layer types

### `group`

Fields: `name`, `children`, optional `hidden`, `opacity`.

### `image`

Fields: `name`, `path`, optional `left`, `top`, `width`, `height`, `hidden`, `opacity`, `allowUpscale`, `allowDistort`.

The file is loaded through Sharp and converted to RGBA. PNG with transparency is recommended. Default raster resizing rejects enlargement and aspect-ratio distortion. Regenerate insufficient assets; set `allowUpscale: true` or `allowDistort: true` only when the user explicitly authorizes that operation. Omitting width/height preserves native dimensions.

### `shape` — native editable PSD geometry

Store a native vector mask with fill/stroke metadata and a lossless raster display cache. The cache enables consistent previews; it does not replace the editable geometry. Coordinates are absolute canvas pixels. `left`/`top` on rect/ellipse describe geometry; the generated layer cache is full-canvas at (0,0).

Fields: `name`, `shape` (`rect`, `ellipse`, `path`), optional `fill`/`stroke` (3- or 6-digit hex or `none`), `strokeWidth` (positive pixels, default 1), `lineCap` (`round`, `butt`, `square`), `lineJoin` (`round`, `miter`, `bevel`), `hidden`, `opacity`.

- `rect` / `ellipse`: supply `left`, `top`, positive `width`, positive `height`. Use equal ellipse dimensions for a circle.
- `path`: supply `commands` arrays with absolute `M x y`, `L x y`, `C control1x control1y control2x control2y endx endy`, and `Z` close. Start each subpath with `M`. Close all filled paths. Use separate layers for independently editable graphic elements, fills, route borders and effects. Other SVG commands, rounded-rectangle radius, arbitrary SVG imports, boolean holes, gradient fills and native layer effects are not implemented by this schema; do not claim otherwise.

```json
{
  "type": "shape",
  "name": "Route Main",
  "shape": "path",
  "commands": [["M",1400,800],["C",1300,700,1000,500,720,250],["L",400,200]],
  "fill": "none",
  "stroke": "#00bfff",
  "strokeWidth": 12,
  "lineCap": "round"
}
```

Create a pin or arrow with closed line/cubic paths, a label background with `rect`, and label copy with `text`. Add border/glow approximations as coordinated native shape layers when faithful; raster-only artistic effects must be separately named and disclosed. Keep the full route path behind vehicles and pins; never punch their silhouettes into it.

### `text`

Fields:

- `name`
- `text`
- `left`, `top`, `width`, `height`
- `fontFamily`: family used to rasterize preview pixels
- `fontPostScriptName`: name stored in PSD text metadata
- `fontSize`
- optional `fontWeight`
- optional `lineHeight` multiplier, default `1.2`
- optional `align`: `left`, `center`, `right`
- optional `color`: CSS hex such as `#ffffff`
- optional `hidden`, `opacity`

Multiline text can contain `\n`.

## Ordering

Manifest `layers` and every group’s `children` are top-to-bottom, matching the Photoshop Layers panel. Put foreground layers first and background layers last. The builder reverses each sibling list for ag-psd, whose `children` are bottom-to-top. Do not reverse manifest arrays yourself.

Keep the original reference hidden at the bottom. Order artwork by actual occlusion in the source image; group labels alone do not determine depth. Split groups when necessary to preserve overlapping elements.

## Composite and preview

The builder writes a merged PSD composite from the actual visible layers and
saves `<output>-preview.png` by reopening and rendering the resulting PSD.
Supported composition is normal alpha blending, including hidden layers/groups,
layer/group opacity and clipping at canvas edges. Native shapes are rendered from their cached pixels here; native path/fill/stroke metadata is independently verified on readback. Do not add unsupported blend
modes, arbitrary masks or effects to the manifest and assume they will be applied.
Compare the saved preview against the authoritative source before delivery.
The build verifies internal render consistency, not fidelity to the source.

## Production record and saved-file validation

Keep the richer planning manifest in production.json as described in production-pipeline.md; compile supported builder fields into this manifest. Planning-only types, anchor, scale and rotation are not automatically implemented by adding keys here. Preserve deterministic resolved pixel bounds.

The builder requires a .psd output extension, writes a temporary PSD, reopens its physical bytes and verifies dimensions, RGB mode, native metadata, recursive order and render consistency before replacing the output. It also saves <output>-validation.json with SHA-256 hashes of the PSD, manifest and preview. A report is valid only for those exact bytes; it does not establish visual fidelity, clean asset edges or independent layer editability. Perform and record those reviews before export, then record persistent delivery before DONE.
