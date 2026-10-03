---
name: imagepsd
description: Create maximum-quality artwork and convert it into faithful layered PSDs with complete independent raster assets, native editable shapes and real text, using source-based extraction and occlusion reconstruction. Always assemble, validate and deliver the actual .psd; assets alone never complete the task. Use when the user asks to turn an image into a PSD, create an editable Photoshop file, preserve image elements as layers, or reconstruct poster text as editable Photoshop type layers.
---

# ImagePSD

Use this skill to create a useful layered Photoshop document from generated artwork.

## Mandatory completion contract: always deliver the PSD

**ASSETS GENERATED != TASK FINISHED.** The final product of every ImagePSD execution is a physically existing, valid, organized, editable `.psd` delivered to the user. Generated images, transparent PNGs, SVGs, masks, raster assets, icons, backgrounds, photographs, auxiliary layers, temporary files, folders and previews are intermediate resources only. Never end successfully with only those resources or manual assembly instructions.

Treat this contract as mandatory in every workflow below, including new artwork, conversion and independently generated assets. Keep assembly, validation, saving and delivery pending until each actually succeeds. After every image-generation result, resume the workflow automatically in the same task; a displayed or automatically saved generated image is not PSD delivery. Do not wait for the user to ask “Where is the PSD?” or request another confirmation to assemble authorized artwork.

Before generating assets, identify the usable PSD builder, planned canvas and output path. Read `references/manifest.md` and prepare the layer plan so the generated resources can actually be assembled. Continue through this full sequence without stopping after asset generation:

1. Analyze the reference or creation brief; identify elements and plan the layer structure.
2. Decide raster, native vector/shape, editable text and masks for every element; budget final raster resolution.
3. Generate, extract or reconstruct complete independent assets, including reasonable hidden portions.
4. Create the PSD document with the planned dimensions; insert and position every asset.
5. Reconstruct editable text; create native shapes/vector elements where appropriate.
6. Configure masks, real alpha, independent owning effects and transparencies where appropriate.
7. Organize descriptively named layers and semantic groups in actual front-to-back visual order.
8. Validate composition and real editability, including the hide/move/solo checks below; repair failures.
9. Save the PSD; reopen the saved file and validate its structure and actual rendered composition.
10. Persist the final PSD through the available persistent-file workflow and deliver an explicit downloadable `.psd` link as the primary result. Optional previews and assets remain secondary.

### Blocking acceptance gate before successful delivery

Require all applicable checks to pass on the **saved PSD**, not merely on source assets, a manifest or a preview:

- Confirm the file physically exists, is nonempty, has a `.psd` extension and a valid PSD signature, and opens through the PSD reader without error. A renamed PNG or signature-only check is insufficient. Never claim Photoshop-specific verification without actually opening it there.
- Confirm the canvas matches the approved/planned dimensions.
- Confirm actual embedded asset pixels, expected layers, native text/shape metadata and organized groups are present; no missing, empty or merely externally linked working resources.
- Confirm the saved stack and every group's children match actual visual occlusion: foreground above background, hidden REFERENCE at the bottom. Do not reverse the entire stack.
- Confirm real alpha, masks and expected transparency survive readback and rendering; inspect edges on contrasting backgrounds for accidental white rectangles or halos.
- Confirm text remains editable and shapes remain independent/native wherever technically possible. Disclose specific unsupported features; naming a raster layer “text” or “shape” is not editability.
- Confirm important independent elements are not accidentally baked into the background, duplicated there, or concealed beneath a visible flattened master. Require a useful editing structure, never a single flattened image masquerading as a layered PSD.
- Confirm complete movable objects and continuous lower surfaces/routes; moving or hiding an object must not expose artificial holes. Preserve existing fidelity, quality and reconstruction checks below.
- Inspect the actual reopened PSD render against the authoritative composition and correct visual/structural defects before delivery.
- Confirm the saved final PSD is available to the user and include its download link in the final response. Local existence alone is not delivery.

If any condition fails, keep the task incomplete, repair/rebuild and repeat the relevant checks. Only mark the execution **COMPLETED** once the valid final PSD has been delivered. Intermediate generations are progress, never equivalent final deliverables.

### Real technical failure

If a genuine technical limitation prevents creating, validating or delivering a valid PSD after reasonable recovery, explicitly say that PSD creation or delivery failed and that the task is incomplete. State the concrete blocker. Preserve useful intermediates when possible and label them as intermediates, not a replacement PSD. Never say the task is completed, merely say “the assets are ready”, or silently substitute a flattened file. Continue to honor the existing rules for explaining and obtaining agreement to any less editable alternative.

## Required production pipeline and recovery

Read [references/production-pipeline.md](references/production-pipeline.md) before every production run. Apply its persisted asset manifest, deterministic placement, occlusion graph, asset quality gates, checkpoints and targeted repair protocol alongside all existing fidelity rules.

Follow internal states `ANALYZE → PLAN → MASTER → ASSETS → ASSEMBLE → VALIDATE → REPAIR → EXPORT → DONE`. Enter REPAIR only for defects; record it as not needed when validation passes. Detect CREATE or RECONSTRUCT automatically. Default to master-first in CREATE; use the exact original as master in RECONSTRUCT. A native geometric composition can itself define the master without an unnecessary image generation.

Persist `production.json`, the builder manifest, original assets and validation evidence in a recoverable project location as work proceeds. Use `scripts/checkpoint.py <production.json> <state>` to record state changes atomically. This helper enforces transitions and binds completion evidence to the current PSD, manifest and preview hashes; it does not replace visual review. Resume the last successful checkpoint and reuse valid assets after assembly/export failures. Never regenerate everything merely because writing the PSD failed.

The builder writes `<output>-validation.json` only after reopening the physical PSD and checking dimensions, RGB mode, recursive order, native metadata and rendered pixels. Its report is technical evidence only. Before DONE, record actual visual comparison, hide/move/solo checks, asset review and successful persistent delivery for that exact revision. If a partial advanced feature is unavailable, continue assembling with the most editable supported representation and disclose the specific fallback; never flatten the complete design. Preserve the existing requirement to obtain agreement before materially reducing requested object independence.

## Optional interactive concept selection

Enable only when the user asks for options, proposals, choosing before production, or interactive mode (for example, “give me 3 proposals before continuing”). Keep direct production as the default. This mode is an explicitly requested review checkpoint: pausing for selection does not mean the PSD task is finished and does not violate the completion contract.

During MASTER, produce three distinct complete composition previews labeled A, B and C, following the same brief, exact copy, format, quality and avoid-list. Change meaningful art direction/layout rather than merely tiny color variations. Generate three separate previews, not a three-panel image mistaken for final artwork. Use native composition for geometric layouts and ImageGen for complex raster imagery; load its skill when generating. These are concept previews, not three fully layered PSDs. Clearly label any displayed generated image as a proposal. Inspect all three before presenting; do not claim exact typography when a generated preview cannot reproduce it.

Persist proposal files and source prompts/decisions before pausing. In production.json set `interactive.enabled: true`, `interactive.status: "awaiting_selection"`, `interactive.proposals` to three entries with unique `id` A/B/C, image path and checksum, and leave `interactive.selectedId` unset. Remain in MASTER; never mark DONE or proceed to detailed assets/assembly while selection is pending. Present the three visuals with short descriptions and ask the user to choose A/B/C or describe changes. Use a selection UI if available and appropriate; otherwise ask in the response. Waiting at this explicitly requested checkpoint is authorized. Never treat silence, timeout or a missing tool answer as selection. Keep the task pending across turns.

Accept a clear choice from the user without another approval request. Record selectedId, the exact user instruction, selected master path/checksum and `interactive.status: "selected"`. If the user requests a combination or revision, create/update the affected proposal, set status back to awaiting_selection, and show the revised visual for selection unless the user explicitly tells you to apply the changes and continue. Preserve unchanged proposals and assets. Do not generate endless rounds unasked.

Use the chosen/revised master as the authoritative composition, update the asset plan and resolved placements, then continue ASSETS → ASSEMBLE → VALIDATE → REPAIR as needed → EXPORT → DONE, delivering the physical editable PSD. Never ask again merely to assemble it. In RECONSTRUCT, preserve the source by default; only propose variants when the user explicitly authorizes design changes. If they request three faithful previews, vary allowed separation/editing strategies and explain them without redesigning the reference.

## Goal

Produce a faithful, high-quality `.psd` with complete independent assets, native editable shapes/paths, real text layers, descriptive names and semantic groups. Preserve the existing image-conversion and new-artwork workflows.

Do not claim that arbitrary layers can be recovered perfectly from a flattened image. A flat image does not contain its original layer structure.

## Default: maximum quality and priorities

Use this priority order whenever goals conflict: (1) visual fidelity, (2) image quality, (3) real editability, (4) coherence between assets, (5) PSD organization, (6) generation speed, (7) file size. Never reduce quality to save time, generations, processing or bytes unless the user explicitly requests that tradeoff. Preserve an approved image's original dimensions unless resizing is requested.

For new images and raster assets, request the highest quality and native resolution actually available through the active image-generation tool, appropriate to the final aspect ratio. Use supported quality/size controls when exposed; otherwise request the desired resolution/detail in the prompt and inspect the returned native dimensions. Never invent parameters, assume a prompt guarantees resolution, promise unsupported 4K output, or switch to a CLI/model requiring user authorization merely to obtain size controls.

Before generation, record the final canvas and each raster asset's intended pixel footprint. Generate at least enough native pixels for that footprint; add modest oversize (about 1.25× when useful and supported) for editing margin. Include all edges and transparent padding in that budget. For a source crop, measure its own usable pixel dimensions, not the size of the enclosing image. Inspect at final size and 100% for texture, sharpness and edge detail. Regenerate or source-reference a higher-resolution reconstruction when detail is insufficient; enlargement/interpolation does not recover detail. For an approved low-resolution source, explain the fidelity constraint before a redraw rather than silently inventing detail.

Keep original files and lossless RGBA/PNG intermediates. Avoid repeated resizing, lossy recompression and aggressive PSD-size optimization. Downsample only once when needed for final placement. The builder rejects raster enlargement and aspect-ratio distortion by default; use its explicit exception flags only when the user has authorized those operations.

## Classify every element before asset generation

Record each element's representation, final bounds, owning effects and occlusion dependencies. Use the classification for both master-image reconstruction and independently created designs:

- **Raster / ImageGen:** photographs, people, vehicles, realistic objects, complex illustrations, organic textures, scenery and artwork requiring visual generation. Preserve source pixels for faithful extraction; use the master as input for any reconstruction. Match light direction, illumination, perspective, scale, style, grading and detail across all assets. Avoid an unrelated set of generations that reads as a collage.
- **Native shapes / paths:** lines, routes, arrows, circles, rectangles, frames, separators, map pins, flat backgrounds, geometric blocks and simple decorations. Build editable PSD shape layers through `type: "shape"` in [references/manifest.md](references/manifest.md). Reconstruct a source graphic with matching vector geometry/colors instead of generating it as an image when fidelity permits. Retain artistic raster treatments only when vectors cannot reproduce them faithfully, and explain the exception.
- **Real text:** preserve every representable text element as a native PSD type layer with a matching raster display cache. Rasterize only an artistic treatment that cannot be reproduced as editable text; identify that limitation. A PNG label or SVG rendered into an ordinary image layer is not editable text or a native shape.

A master image may include graphics/text for design exploration, but reconstruct their native layers and remove their baked-in copies from lower artwork. For a new composition, omit typography and simple overlay graphics from the generated base when that improves fidelity and separation; compose them natively without weakening the scene. Use original coordinates and the master as the visual guide. Keep REFERENCE hidden; never use the flattened master to cover incomplete editable layers.

## Fidelity first

Treat conversion as preservation, never as permission to redesign. Preserve source dimensions, composition, object scale and placement, background scene, textures, palette, typography, line breaks and text colors. Prioritize visual fidelity over the number of separated layers. Never replace a detailed scene with a solid fill, move the title, or regenerate a different protagonist to simplify assembly.

Distinguish two tasks:

- **Convert an existing/approved image:** use that exact image as the authoritative reference. Extract or reconstruct only elements that can be preserved faithfully. Keep inseparable artwork together as a raster layer. Use image edits with the original as input when removal/inpainting is needed, not an unrelated new generation.
- **Create new artwork and a PSD:** classify elements first. For integrated raster scenes, generate one coherent global illustration, preferably without text/simple overlays, then derive independent object layers. For purely geometric/editorial designs, compose native shapes and text directly and generate only genuinely raster content. Use the global-first workflow when useful; do not simplify artwork to make it easier to layer.

## Default: global composition, source extraction, occlusion reconstruction

Use this approach for integrated scenes, watercolor illustrations, realistic composites and cinematic maps, both new and existing. Separate independently editable objects without sacrificing the original scene's quality.

1. Classify elements and budget raster resolution as above. Plan the canvas, composition, perspective, palette, lighting, major objects, layer stack and text areas. For a new integrated raster design, generate a single coherent illustration through the image-generation skill, preferably with no baked-in text/simple overlays and reserved typography space. For a purely geometric design, build the native composition directly without ImageGen. Respect the user's style and avoid-list. For an existing image, use that exact image. Do not substitute a flat schematic map for detailed terrain, or a plain wash for an integrated watercolor scene, merely because those are easier to assemble.
2. Establish this global illustration as the authoritative visual reference. Add exact copy as editable text and simple graphics as native shapes separately when creating a new design. Do not require another approval when the user already authorized the complete creation workflow; proceed and preserve the selected design.
3. Before extraction, record which lower elements each foreground object occludes (terrain, routes, borders, cords, patterns, shadows). Plan a complete asset for each independently editable lower element, including its hidden portions. Then extract each major foreground object from the reference using accurate segmentation/masks and available supported image-editing tools. Prefer an alpha mask applied to original pixels when supported. Preserve the whole object with genuine alpha and reasonable transparent margin; inspect all edges on light and dark backgrounds for white/black halos, clipping and contamination. Preserve geometry, coordinates, resolution, texture and illumination; inspect soft watercolor edges, cords, hair and translucent areas. Save transparent object assets. Do not regenerate a different object from a text-only prompt and call it an extraction. An image-generation extraction may redraw pixels: compare it against the source and disclose material changes; never claim original-pixel preservation without measuring it.
4. On a lower copy of the source, remove the extracted object and reconstruct only its previously occluded background with source-referenced inpainting/image editing. Preserve all surrounding visible areas, camera angle and lighting. Use a precise local mask when the available tool supports one; otherwise use a tightly constrained source-image edit and verify its actual changed region. Do not assume prompt instructions guarantee unchanged pixels. If a valid mask and compositing tools are available, retain original pixels outside the repair area. Use the image-generation skill for generative edits; do not claim access to Photoshop Generative Fill or an explicit mask API unless actually available.
5. Reconstruct every occluded lower element, not only the base background. Follow the complete-layer rules below. Repeat in front-to-back order: remove foreground objects from the working lower scene, then derive scenery layers and reconstruct the underlying backdrop where needed. For the festival example, preserve the original lantern in a transparent layer, retain/reconstruct the plaza underneath, then separate the plaza from the sky/background when feasible. Keep contact shadows/glows on appropriate named layers or with their owning object; avoid duplicate shadows and halos. Hidden regions are plausible reconstructions, not recovered ground truth. Never replace the entire lower scene with a newly designed background.
6. Assemble the derived assets at their original positions with original scale. Keep major objects, scenery and background independently visible/editable wherever requested. Add editable typography from the exact copy. Put the complete authoritative reference in a hidden bottom REFERENCE group.
7. Build with the bundled builder and compare the actual PSD-rendered preview to the authoritative global illustration plus intended typography. Verify source fidelity as well as internal PSD/preview consistency. Check geometry, edges, scene texture, depth, lighting, contact shadows, palette and resolution; use overlays/difference images where helpful. Correct visible deviations rather than accepting a weaker composition to gain layers.
8. Reopen the PSD and perform both hide and move checks for every main object. On temporary copies, hide it, then move it far enough to expose its entire original footprint. Render and visually inspect the actual PSD layers in both states, including close-ups of every newly exposed overlap. Check the complete-layer acceptance criteria below; repair failures and rebuild before delivery. Restore the original visibility and positions in the deliverable. Hide scene layers and confirm the backdrop remains. Verify alpha, layer order and text. Do not claim successful separation from layer names, alpha presence, changed pixels, or an unchanged assembled preview alone.
9. Deliver the downloadable PSD and its actual rendered preview. Describe raster object layers, editable text and any imperfect extraction/hidden-region reconstruction. Do not silently satisfy a request for object layers with one composite artwork layer plus text. If independent extraction or reconstruction genuinely fails, explain the limitation and obtain agreement before substituting a flattened result.

## Complete layers beneath overlapping objects

Treat an upper object's silhouette as an occlusion in the source, not as a permanent hole in lower assets. Keep reconstruction on the owning lower layer so it remains when the upper object is moved or hidden.

- For a truck over a map route, create a complete truck raster, an independent continuous native route path/shape, independent pins, native label shapes, real label text and a terrain/background without their baked-in copies. Reconstruct the entire route between visible endpoints, including hidden portions, matching tangent, perspective, width, color and glow. Use layer order for occlusion. If a source route has an irreducibly artistic raster treatment, complete it in the truck-removed scene before extraction and disclose the raster exception. Never mistake terrain-only inpainting for route reconstruction. Never bundle route fragments into the truck asset.
- For other overlaps, extend the same rule to roads, borders, cables, patterns and secondary objects. Reconstruct each on its own layer; do not bake repairs into the foreground object or leave all lower repairs on one terrain layer.
- Keep the lower asset's alpha continuous across the occluded region. Never use `lower_alpha *= (1 - foreground_alpha)` as the final lower mask: it permanently cuts out the foreground silhouette. Include reconstructed pixels with alpha on the lower layer. Keep irrelevant surrounding terrain out of a route/object asset so moving it does not move a rectangular terrain patch.
- Remove contamination from the foreground cutout: do not carry fragments of the route, terrain or unrelated objects with a moved truck. Preserve only the owning object's edges and appropriate effects.

Require all of these acceptance checks before delivery:

1. With the upper object hidden, inspect the complete exposed lower element and both reconstruction joins. Require continuous geometry and matching edges, texture and glow; no missing segment, silhouette-shaped gap, duplicate object or seam. A visually identical assembled image can still hide a broken lower asset.
2. With the upper object displaced, inspect both its old and new positions. Require the complete lower elements to remain at the old position and the moved cutout to contain no unrelated fragments.
3. Solo each reconstructed lower asset over light and dark contrasting backgrounds. For native shapes, inspect complete path geometry and its rendered coverage. Inspect its alpha and hidden-region coverage. Then hide that asset and require its base background to remain usable without baked-in duplicates.
4. Ask for every conceptual object: "Could a designer move, hide, transform or replace this layer without visually breaking the others?" Test a representative scale/transform and replacement as well as hide/move behavior on temporary copies, moving owning effects together. Save temporary validation renders and note which overlaps were inspected. Numerical composite agreement and a check that hiding changes some pixels do not establish reconstruction correctness. Treat a failed continuity check as a blocking defect; repair it before calling the PSD independently editable. If repair genuinely fails, explain the specific limitation and obtain agreement before offering a less editable alternative.

## Alternative: generate independent assets

Use independently generated coordinated assets for simple collage, flat graphics, deliberately modular compositions, new insertions into an existing scene, or an explicit user request for that workflow. Do not make it the default for complex integrated scenes. Use the global reference/style guide across asset generation and match perspective, lighting, material and scale. Compose the assets into the PSD before showing the finished result.

In either workflow, rectangular slices of a complete image, duplicate full-image layers, hidden object assets, or a visible complete composite covering the independent stack do not satisfy genuine object separation. Show the actual PSD preview as the final result; identify intermediate generations as reference or working assets.

## Existing images: conversion workflow

1. Inspect the authoritative source image and generation prompt. Identify exact copy, dimensions, background details, object positions and typography. If no source image exists, create the coherent global reference using the default workflow above.
2. Recover exact text from the prompt or user-provided copy. Do not OCR known text.
3. Use source-based extraction and occlusion reconstruction from the default workflow above. If independent object layers are requested, do not silently fall back to a flattened artwork layer; explain a genuine limitation and obtain agreement first. Preserve source appearance and never imply that a flat image contains its original layer structure.
4. For editable visible text, remove the original baked-in text first while preserving surrounding artwork; match original font appearance, size, spacing, line breaks, alignment, position and color. Do not overlay identical baked-in text. If faithful text removal or font matching is unavailable, preserve the visible original and provide clearly named hidden editable alternatives, explaining the limitation. Do not silently trade fidelity for editability.
5. Save extracted objects as transparent PNGs; preserve alpha and edges. Keep artwork that cannot be separated faithfully together. Put the original complete image in a hidden REFERENCE group at the bottom.
6. Create a JSON manifest following `references/manifest.md`. Use top-to-bottom Photoshop panel order for every sibling list.
7. Run `npm install` in the skill directory if dependencies are absent.
8. Run `node scripts/build-psd.mjs <manifest.json> <output.psd>`. The builder supplies the merged PSD composite, reopens and renders the PSD layers, and saves `<output>-preview.png`. Do not manually reverse its layer ordering.
9. Inspect this actual PSD preview beside the authoritative source. Verify background scene/texture, object geometry and placement, typography and composition. A correct file structure alone is insufficient. Fix visible deviations; fall back to preserving more raster artwork rather than redesigning. For faithful raster conversion, compare pixel values; for reconstructed text/inpainting, inspect affected regions and disclose material differences. Do not claim pixel identity merely because the PSD matches its own preview.
10. Save the PSD and its actual preview through the available persistent-file workflow. Return an explicit downloadable `.psd` link as the main deliverable. Identify editable text, raster layers, and any limitations. Never return only an image or assets in place of the requested PSD.

## Layer conventions

Use semantic groups such as TEXT, FOREGROUND, VEHICLE, PINS / LABELS, ROUTE, MAP DETAILS, BACKGROUND and hidden REFERENCE in front-to-back visual order. ARTWORK, OBJECTS, MAP and EFFECTS are also suitable when meaningful. Group an object with its owning effects when useful; keep pins, label backgrounds and label text distinct. Do not impose a group order that contradicts actual occlusion.

Retain this simpler compatible structure when applicable:

- `TEXT`
  - title
  - date/time
  - location / subtitle
- `ARTWORK`
  - protagonist / main illustration
  - secondary illustrations
  - decorations
- `BACKGROUND`
- `REFERENCE` (original flattened generation, hidden when possible)

Use descriptive layer names such as Truck, Route Main, Hermosillo Pin, Hermosillo Label, Background Map, Title and Subtitle. Avoid generic names such as Layer 1, Layer 2 or Image 3. Keep layer names descriptive. List manifest layers and group children in Photoshop panel order, top-to-bottom; the builder converts them to ag-psd order. Never reverse the manifest manually. Place the visible background below all artwork, and the hidden reference at the bottom. Order elements by actual occlusion in the composition, including inside groups; split groups if needed to preserve this order.

## Editable text

Use PSD text layers for copy that is known exactly. Supply both:

- text metadata, so Photoshop can edit the text;
- raster preview pixels, so the layer displays correctly before Photoshop redraws it.

If a required font is unavailable, use the closest available font only for the raster preview and keep the requested PostScript font name in the text metadata. Tell the user Photoshop may substitute the font if it is not installed locally.

Do not use OCR if the exact copy is available from the conversation or prompt.

## Quality checks

For both new and existing designs, preserve the authoritative global reference and validate independent layer hide/move behavior as specified above. Before finishing:

- Confirm raster assets have sufficient native detail at final placement size; review any authorized enlargement or raster exceptions.
- Confirm simple graphics have native vector masks and editable fill/stroke metadata after PSD readback; a raster preview alone is insufficient.
- Confirm the PSD dimensions match the planned canvas or authoritative source, unless the user requested resizing.
- Compare the actual PSD preview against the authoritative global composition, not only against intermediate assets. For new artwork, also check the brief and avoid-list. Verify reconstructed lower layers by hiding the objects above them.
- Confirm no unexpected text was added.
- Confirm text layers are separate from artwork layers.
- Confirm transparent image assets have alpha and complete hidden-region coverage. Complete the hide, move and solo checks for each overlap; explicitly inspect continuity of routes and other extended elements.
- Reopen the PSD and confirm foreground/background order and ordering inside every group (ag-psd readback arrays are bottom-to-top).
- Confirm the original flattened image is hidden at the bottom and is not accidentally visible over reconstructed layers.
- Confirm the output file exists and has a `.psd` extension.

## Implementation and compatibility

Use `scripts/build-psd.mjs` with the existing group/image/text schema and the added native shape schema. Keep manifest arrays in top-to-bottom panel order; the builder reverses them once, recursively, for ag-psd. It writes raster caches plus editable text and native shape metadata, verifies ordering/visibility and vector geometry on readback, and renders the actual saved layers. These checks do not replace visual fidelity and independence checks.

After changing the builder, run `node scripts/verify-builder.mjs` to check native geometry, text, recursive stacking, continuous hidden routes and raster quality guards. This fixture validates implementation behavior, not the visual quality of a user deliverable.

Use `scripts/shapes.mjs` for rectangles, ellipses and absolute line/cubic paths; see the manifest reference for supported commands. Do not silently feed an arbitrary SVG into an image layer and call it a native vector. If a requested native feature is unsupported, extend and validate the implementation or explain the exact limitation before substituting a raster layer. Preserve existing image/group/text behavior and the ImagePSD display name.

## Known limitation

Editable text written by `ag-psd` is useful but its text support is incomplete. Photoshop may need to refresh/redraw a text layer in some cases. Do not claim the file was verified in Photoshop unless it actually was. For maximum compatibility, an optional Photopea/Photoshop open-and-save normalization pass can be used after generation.
