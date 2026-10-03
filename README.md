# LayerForge

**Generate professional layered PSD files with AI.**

LayerForge is a ChatGPT Skill for creating and reconstructing editable Photoshop documents from natural-language prompts or reference images.

Instead of returning a single flattened image, LayerForge builds the composition from independent assets and assembles them into a structured `.psd` file with editable layers, groups, text, transparency, shadows, and reusable visual elements.

## What it does

LayerForge can:

- Create layered PSD files from text prompts.
- Reconstruct reference images as editable compositions.
- Separate meaningful visual elements into independent layers.
- Preserve transparency when appropriate.
- Keep objects complete even when parts are hidden behind other elements.
- Separate shadows, reflections, smoke, particles, props, backgrounds, and foreground elements.
- Prefer editable text, vector shapes, and native graphic elements when possible.
- Organize layers in a logical visual stacking order.
- Generate high-resolution raster assets appropriate for their final size.
- Deliver a valid `.psd` as the final output.

## Core principle

> The PSD is the product.

Generated images, PNGs, SVGs, masks, previews, and other assets are intermediate resources only.

A LayerForge task is not complete until the final layered PSD has been assembled and delivered.

## Example prompts

### Create a design from scratch

```text
@LayerForge

Create a vertical 4:5 advertisement for a fictional burger restaurant called BARRIO.

Use realistic food photography with a burger, fries, tray, drink, table and restaurant background.

Keep the burger, fries, tray, drink, shadows, background, graphic elements and text on separate layers.

Text:
"BARRIO"
"LA DE SIEMPRE."
"Burger + papas"

Deliver the final editable PSD.
```

### Reconstruct an existing image

```text
@LayerForge

Use the attached image as a visual reference and reconstruct it as a professional layered PSD.

Preserve the original composition, proportions, lighting and colors.

Do not simply cut the original image into rectangular pieces.

Rebuild meaningful elements as independent assets.

Objects must remain complete behind overlapping elements whenever reasonable.

Separate:
- background
- main subjects
- props
- shadows
- reflections
- graphic elements
- editable text

Deliver the final PSD.
```

## Layer organization

A typical LayerForge document may look like:

```text
TEXT
├── Headline
├── Subtitle
└── Details

GRAPHICS
├── Shapes
├── Lines
└── Decorative elements

FOREGROUND
├── Main subject
├── Props
├── Highlights
└── Shadows

BACKGROUND
├── Environment
├── Background objects
└── Base color
```

The exact structure depends on the composition.

## Design philosophy

LayerForge prioritizes:

- editability over flattening
- visual fidelity over shortcuts
- complete assets over destructive crops
- correct layer order
- maximum practical image quality
- native text and shapes where possible
- clean and understandable PSD organization

The goal is not merely to generate an image that looks correct.

The goal is to generate a design that can still be worked on.

## Installation

1. Download or clone this repository.
2. Package the Skill files if necessary.
3. In ChatGPT, open **Plugins → Skills**.
4. Create or import a Skill from the downloaded files.
5. Invoke it from a conversation using its configured Skill name.

Exact Skill installation options may depend on your ChatGPT workspace and current product version.

## Repository structure

The repository may include files such as:

```text
layerforge/
├── SKILL.md
├── scripts/
├── references/
├── assets/
├── README.md
└── LICENSE
```

`SKILL.md` contains the core behavior and instructions used by the Skill.

## Status

LayerForge is under active development.

Current areas of experimentation include:

- better automatic layer decomposition
- more reliable asset completion behind occlusions
- improved text reconstruction
- stronger vector/raster selection
- higher-fidelity reference reconstruction
- interactive concept selection before final PSD assembly

## Contributing

Issues, ideas and pull requests are welcome.

If you find a composition that LayerForge handles poorly, a reproducible prompt and reference image are especially useful.

## Disclaimer

LayerForge is an independent project and is not affiliated with or endorsed by Adobe.

Adobe and Photoshop are trademarks of Adobe Inc.

## License

Choose a license appropriate for how you want others to use, modify and redistribute the Skill.
