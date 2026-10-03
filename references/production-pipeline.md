# Production pipeline

## States and durable project files

Keep these internal states; do not expose implementation details in product copy. ANALYZE identifies exact copy, canvas, brief and mode. PLAN creates the source-of-truth asset manifest before generation. MASTER defines the shared composition; optional requested interactive mode remains here while awaiting the user’s selection. ASSETS generates/extracts only planned elements and checks each. ASSEMBLE builds deterministically. VALIDATE inspects saved technical and visual results. REPAIR targets failed elements and returns to the relevant earlier stage. EXPORT persists the validated PSD and preview. DONE requires verified delivery. A failed run stays incomplete; retain checkpoints and report the concrete blocker honestly.

Store a recoverable project bundle through the persistent-file workflow: production.json, manifest.json, master, original assets, lossless intermediates, validation renders and reports. Save after planning, every accepted asset, each repair, assembly and export. Record paths and persistent identifiers. Do not put user project assets in the installed skill directory. Do not assume scratch survives across sessions. If persistence fails, keep available local files and report that recovery across sessions is not guaranteed.

Use `python3 scripts/checkpoint.py /absolute/project/production.json ANALYZE` to initialize; then edit the production record with mode, plan and decisions. Advance with the same command and the next state. Repeating the current state saves another checkpoint. The record stores history and the current state. Repair can return to PLAN, MASTER, ASSETS or ASSEMBLE; never erase good assets. Once DONE, start a new record for a new revision.

## Source-of-truth asset manifest

Maintain `assets` in production.json before generating. Every entry has a unique semantic id/name, group, conceptual type (raster, text, shape, vector, effect, adjustment, mask or group), editing expectation, required completeness, owning effects, dependencies and occlusion relationships. Also record path, accepted status, source checksum, native dimensions, required resolution, alpha expectation and quality evidence when applicable. Unsupported conceptual types are planning categories, not claims that the builder implements them: translate to supported image/text/shape/group representations or extend and verify the builder.

Record placement: coordinate system, x/y, width/height, anchor, bounding box, scale, rotation and z-order. Prefer normalized coordinates in [0,1] relative to the canvas, permitting explicitly intended bleed outside it. Define anchor precisely (e.g. top-left or center). Compile normalized coordinates once to rounded absolute pixels for manifest.json. Keep sibling arrays in Photoshop top-to-bottom order; use the documented builder reversal exactly once. Match native path geometry to canvas coordinates. Store final resolved bounds; inspect any crop. The current builder does not apply arbitrary rotation or anchor fields: preprocess raster transforms losslessly at adequate resolution, transform native geometry explicitly, or extend the implementation. Never silently ignore a planned transform.

Represent occlusion as directed edges from upper object to lower object. Reject cycles and inconsistent sibling ordering; split interleaved groups when needed. Each lower layer owns its reconstructed hidden pixels/geometry. Dependency changes invalidate only affected assets and validations. Keep complete routes, cables, walls, floors and objects behind occluders. Hidden pixels are plausible reconstructions, not recovered original information.

## Master and asset acceptance

CREATE: define/generate a shared full composition before independent assets; geometric layouts can use a native rendered master. RECONSTRUCT: use the exact source, preserving dimensions, layout, proportions, perspective, palette and typography. The hidden master never covers incomplete editable layers.

Budget raster native resolution against final transformed footprint including padding, with modest oversize when useful and supported. Inspect actual dimensions and detail at final size/100%. Regenerate insufficient detail instead of excessive upscaling. Use maximum supported quality without inventing tool controls. Keep originals and lossless intermediates.

Before accepting each raster, inspect alpha, accidental opaque backgrounds, light/dark edge halos, clipping, object completeness, padding, severe artifacts, resolution, shared perspective and lighting. Preserve semitransparent glass, smoke, highlights, glows, shadows and particles. Validate transparency expectations individually: an intentional opaque background is valid. Mark failed assets rejected, retain their failure reason and regenerate only those assets. Separate owning shadows, reflections, glows and lights where viable, avoiding duplicates.

Use native text and simple geometry; reserve ImageGen for complex raster imagery. Preserve text, line breaks, alignment, size, tracking, leading and color. Record font fallback. The bundled schema has limited typography: extend it for needed tracking/leading or document an editable approximation rather than silently dropping styling. Preserve fidelity-specific fallback rules already in SKILL.md.

## Validation and targeted repair

Run build-psd.mjs with the compiled manifest. The saved technical report binds output to manifest/PSD/preview checksums. Do not interpret successful parsing as visual approval. Inspect the actual reopened preview against the master for composition, position, scale, rotation, depth, color, light, perspective and missing content. Inspect saved groups, names, layer order, alpha, editable text and native vector metadata. Multiple layers are required when the plan has multiple independent elements; never satisfy this with duplicate flattened layers.

Perform actual hide/move/solo tests on temporary copies of important saved layers, including old and new footprints and every reconstructed overlap. Require continuous lower surfaces and paths, clean cutouts, no artificial holes, seams or baked-in duplicates. Save evidence paths and findings; restore deliverable visibility/positions. These are real editability checks, not merely a conceptual checklist.

Record failures by semantic asset id and cause. Enter REPAIR, revise only implicated layers and dependent assets, recompile/reassemble and repeat relevant checks. Reuse correct assets for export/parser/write failures. A changed manifest, PSD, asset or preview invalidates affected approvals; record the hashes of the exact reviewed revision. Do not carry old visual approvals into a new build. Do not retry unchanged failing commands indefinitely; diagnose and change the failing stage.

## Export and completion evidence

In production.json set `manifestPath` and `outputPath` to absolute paths. Record `review` with `passed: true`, `psdSha256`, `manifestSha256`, `previewSha256`, plus nonempty strings `visual`, `assets`, `editability` describing actual inspected evidence and applicable exceptions. Copy hashes from the builder technical report only after inspecting that exact revision. Set `delivery` with `persisted: true`, matching `psdSha256`, a real `persistentId` and `downloadUrl` after persistent saving succeeds. This records performed actions; do not manufacture approval or storage evidence.

Advance EXPORT after validation passes. Advance DONE only after final persistent saving succeeds and the explicit downloadable PSD link is ready for the final response. The checkpoint helper rechecks file/preview/report existence, signatures and hashes and requires review/delivery evidence. If the final response fails, retain EXPORT/recovery evidence and deliver on resume. Assets, folders, previews and assembly instructions never replace the PSD. A technical inability to deliver remains an incomplete run, never a fabricated success.
