# Combined shrinking crossfade and crop fix — 2026-09-05

- Replaced sequential fixed-pose crossfade / retreat with one shared easing curve
  after the existing 650 ms hold. Photo and 3D shrink and translate together while
  their opacities crossfade; start/end calibration and total duration are unchanged.
- Browser inspection revealed that shrinking the old cover-layout container
  exposed a horizontal crop line. Now render the full bitmap at the original
  cover-derived scale/offset and transform its layer with overflow visible.
  Masking follows the bitmap, with a feathered bottom because the original photo
  itself does not contain the complete switch. No missing content was invented.
- Resize measures the untransformed layout, preventing accumulated transforms.
- Browser verified mid-blend photo scale ~0.66 with both layers visible and no
  old horizontal photo crop line; main hero/canvas viewport clipping remains.
- Build/TypeScript, lint, diff checks and shared-curve / anchor mapping assertions
  passed. This supersedes the earlier sequential-intro QA notes below.

---

# Dual-plastic studio trial — 2026-09-05

- Applied the discussed material direction in the existing Three.js renderer,
  not Blender: clear housing IOR 1.5 / transmission 1 / clearcoat 0, fine roughness
  and very weak bump; opaque stem roughness 0.52 with the existing microsurface.
- Replaced the closed room environment with an open reflection-card scene so
  low reflectors are not occluded by its floor. Added a dim neutral surround,
  left-upper key and side/lower strip reflections. No geometry changes.
- First pass lost too much shell reflection when coat was removed; rejected.
  Final pass restores distinct strip reflections using lights rather than coating.
- Compared matched 694 px before/after captures, then inspected the final render:
  `battuta-plastic-pair-before.png`, `battuta-plastic-pair-after.png`, and
  `battuta-plastic-pair-final.png` in the thread visualization directory.
- Replay/skip and final render checked; console clean, final production build,
  lint and diff checks passed. Pose and framing unchanged. Not a photo-fidelity
  or geometric-equivalence claim; CAD facets remain apparent. No push/deploy.

---

# Fine matte injection-plastic material iteration — 2026-09-05

- References: https://threejs.org/docs/pages/MeshPhysicalMaterial.html and
  https://marmoset.co/posts/physically-based-rendering-and-you-can-too/ .
  These ground shader semantics, not a measured resin preset.
- Stem/clicker: metalness 0, IOR 1.5, no transmission or clearcoat; base roughness
  0.56 multiplied by a subtle 0.84–1.0 roughness texture; specular intensity 1.
  Environment fill 0.12 retains directional contrast without crushing reflection.
- Added one deterministic 128 × 128 non-colour texture shared for bump height and
  roughness, with 3.2 mm box-projected UV tiles, mipmaps and capped anisotropy.
  No base-colour noise or geometry displacement. Bump scale is a renderer tuning
  value (0.035), not a claimed physical surface-height measurement.
- Browser replay/skip and settled render checked; no shader/console errors.
  Microsurface detail is intentionally subtle at settled size. CAD edge shape
  remains unchanged; no claim of resolving its missing bevels.
- Production build/TypeScript, lint, diff checks and deterministic data/channel/UV
  checks passed. Texture is disposed on failure and normal scene teardown.
- Approved pose, layout and housing material unchanged. No push or deployment.

---

# Approved pose, directional stem shading and final cleanup — 2026-09-05

- Final approved parameters: yaw -45.4°, pitch 51.4°, roll -24°, FOV 65°,
  source-image offset X 122 / Y -16, scale 1.05. These are now shared defaults.
- Removed the temporary alignment component, controls, CSS, and local-storage
  override code at the user's request. Old stored values are no longer read;
  no unrelated browser storage was cleared. Replay/skip/rotation remain.
- Wordmark gradient end opacity increased from 0.20 to 0.30; left/mid values kept.
- Corrected Three's scene environment override by assigning the stem an explicit
  environment map with 0.055 fill intensity. Kept the original lime base color,
  reduced opposite rim lighting to 1.3, and preserved the housing environment.
- Final framing projects the actual model vertices, then fits the silhouette
  into the right-hand safe area with 16 px right inset and 100 px bottom reserve.
  Pose fitting runs at initialization/replay/resize, not continuously during orbit.
- Browser checked at 390, 694 and 1440 CSS px: narrow layout has no horizontal
  overflow; settled silhouette remains above the buttons. Replay and skip work.
  Final DOM confirms zero alignment controls/panels and the 0.30 wordmark mask.
- ESLint, production build/TypeScript, diff checks, final parameter, animation
  endpoint and button-safe rectangle assertions passed.
- Remaining material limitation: the CAD still has simplified geometry compared
  with the reference photograph. This change improves directional shading, not
  geometric/photo equivalence. No push or deployment performed.

---

# Local opening-pose alignment controls — 2026-09-05 (historical, now removed)

- Added a development-only alignment panel that freezes photo and model at the
  opening frame. Sliders/numeric fields control yaw, pitch, roll, field of view,
  image-space X/Y offsets and scale; a photo/3D mix slider exposes both endpoints.
- Draft preview, restore defaults, cancel, explicit local save, and readable JSON
  parameters are available. Local storage is validated/clamped and is ignored in
  production; saving does not change the shared repository or deployed defaults.
- Browser verified: changed yaw to -20, X to 80 and scale to 0.9; saved, reloaded,
  and confirmed the same values. Restored baseline defaults after the test. Mix
  slider verified at 100% model, then returned to 50% for the user's alignment.
- One canvas remains after editing/replaying. Final browser console is clean.
- ESLint, TypeScript, production build, diff checks and parameter validation /
  responsive source-image coordinate assertions passed.
- Preview left with the alignment panel open. This tool enables user calibration;
  it does not claim that the original photograph and CAD now match.

---

# Battuta continuous photo-to-3D intro — 2026-09-05

## Scope and result

Working motion/material study using the supplied photograph and existing CAD
model. This is not a pixel-identical reconstruction of the photographed housing.

Final result: passed (interactive prototype; photorealistic equivalence not claimed).

## Reference and visual comparison

- Reference: `public/battuta/community/hero/battuta-lime-switch-hero.jpg`.
- Matched 694 × 863 captures opened together for comparison:
  `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-intro-final-photo.png`,
  `battuta-intro-final-aligned.png`, and `battuta-intro-final-settled.png` in the same directory.
- Additional responsive evidence: `battuta-intro-final-mobile.png` (390 CSS px),
  `battuta-intro-final-desktop.png` (1440 CSS px). Browser viewport overrides pad
  the captured image; DOM measurements confirm no document horizontal overflow.
- Iteration 1: rejected overly frontal pose and undersized initial silhouette.
- Iteration 2: corrected camera side and reduced settled size to clear controls.
- Iteration 3: rejected milky diffuse plastic; restored 99% transmission and
  strengthened studio reflections instead. Broad housing highlights remain
  visibly simpler than the photograph because the CAD has fewer curved surfaces.

## Implemented and checked

- Photo hold, fixed-pose crossfade, then eased retreat; no simultaneous shrink
  during the crossfade. The photo-space anchor accounts for object-fit cropping.
- One persistent wordmark mask and staggered letter entrance in both states.
- Removed photo/3D tabs; replay and skip work, with one canvas after repeat runs.
- Pause preference survives replay; rotation resumes only after the retreat.
- Reduced motion skips the intro and disables letter staggering and auto orbit
  (code reviewed; OS preference not changed during this test).
- Offscreen/document-hidden animation suspension and abort/disposal paths
  reviewed. Actual WebGL context-loss injection was not performed.
- Browser console: no errors or warnings in the final inspection.
- Production webpack build including TypeScript, ESLint, and pure choreography
  assertions passed (endpoints, fixed-pose hold, monotonic blend, width bounds).

## Follow-up polish

The photo and CAD are different objects: rim contour, stem proportions and
internal parts do not perfectly overlap. The intro is a deliberately visible
crossfade, not a seamless geometry morph. Matching the photograph's dense curved
highlights and silhouette requires refining/replacing the model. No deployment
or push was performed; preview remains local.

---

# Battuta photo-referenced 3D material study — 2026-09-05

- Reference inspected: `public/battuta/community/hero/battuta-lime-switch-hero.jpg`.
- Render evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-hero-model-studio-materials.png`.
- Replaced alpha-only smoke plastic with physical transmission (IOR 1.49,
  0.65 mm local thickness); retained a transparent canvas outside the silhouette.
- Fixed Three's white half-alpha transmission fallback by clearing the final
  canvas transparently, then using an opaque black clear color for transmission.
- Used an emissive studio environment, warm key/cool rim, neutral tone mapping,
  matte yellow-green stem, separate metallic contacts and spring materials.
- Added cached directional shadows, 0.75-resolution transmission buffer, a closer
  tilted view and slower rotation. Photo styling remains unchanged.
- Screenshot review: the grey transmission veil is removed and reflected edges,
  interior metal and directional shading are visible. This remains a material
  study, not a photorealistic match: the CAD's sharp edges and simpler shapes still
  differ visibly from the photograph. The housing also remains darker than the
  reference at some angles; no pixel-fidelity pass is claimed.
- Final `npm run build -- --webpack`, lint, TypeScript and diff whitespace checks
  passed. A deprecated PCFSoftShadowMap warning observed during iteration was
  corrected to PCFShadowMap. Preview is left on 3D, paused for inspection.

---

# Battuta layered hero and 3D preview QA — 2026-09-05

## Requested direction and comparison

Keep the monumental switch overlapping the Battuta wordmark. Do not move the full
word above it as a separate element. Let the obscured letters show faintly through
the foreground, remove the tiny photo twitch, and offer an actual rotating model.

- Before: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-hero-bug-before.png`
- Matched 694 × 863 after: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-hero-photo-opacity-after.png`
- Desktop 1440 × 1000: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-hero-photo-desktop-after.png`
- Mobile 390 × 844 photo/model: the adjacent `battuta-hero-photo-mobile-after.png` and `battuta-hero-model-mobile-after.png` evidence files.
- Browser viewport overrides produce padded captures in this environment; the CSS viewport dimensions above were independently read from the rendered DOM. The matched default-viewport before/after pair is the primary visual evidence.

The paired captures show preserved scale/composition and visible letters through
the switch, instead of a detached full-word title. The photo layer is now 76%
opaque. Photo/3D controls have a separate foreground stacking level, avoiding the
image covering their labels. The existing split product/real-waveform cards are
unchanged by this hero adjustment.

## Root causes and changes

- The JPG has an opaque black background: its rectangle, not only the switch,
  covered the wordmark. Whole-layer opacity now lets the wordmark show through.
- Pointer-follow transforms and a filled entrance animation both controlled the
  image transform. The photo now has one static scale, no pointer-driven movement.
- Loading and ready branches placed the hero at different sibling indices. A
  stable React key now preserves it when audio metadata finishes loading, avoiding
  a repeated entrance animation.
- A lazily loaded Three.js scene renders a real seven-part MX-compatible CAD model
  converted to GLB. It is an optional comparison view; the photo remains default.
- Rotation is capped near 30 fps with pixel ratio capped at 1.5. Offscreen/hidden
  scenes stop automatic frames; reduced-motion is respected. Controls support
  pause and 30-degree rotation steps. The GLB is about 1.7 MB and loads on demand.
- Attribution, source revision, and asset license are shipped alongside the GLB;
  it is not presented as an official Cherry product render.

## Verified interactions and layout

- 694 px default, 1440 px desktop, and 390 px mobile: no horizontal overflow.
- Mobile controls end around y=364; the title block begins around y=467 in the
  tested state, leaving separation from the page copy.
- Photo transform stayed `matrix(1.055, 0, 0, 1.055, 0, 0)` across observations.
- Switching back to photo removes the model canvas (`canvasCount = 0`).
- Paused model azimuth stayed at -1.728 between observations; a right rotation
  step changed it to -1.204, confirming a stable pause and an actual 30-degree step.
- Audio preview play/pause passed; searching `brown` showed Cherry MX Brown and
  removed Cherry MX Blue; search and playback were reset afterwards.
- Browser console warnings/errors were empty after these interactions.

## Final verification

- Scene initialization has failure cleanup; context loss returns to the photo
  fallback with retry; media-query changes report actual rotation state to UI.
- Pause → Photo → 3D preserves the paused state (verified with the visible
  “继续旋转” control). Model credits link is visible in 3D mode.
- Loading announces status without exposing an invisible interactive image;
  view controls are a named group and rotation controls have action labels.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npm run verify:battuta-community`: passed.
- `npm run build -- --webpack`: passed, all 23 static pages generated. Initial
  sandboxed Turbopack build failed to fetch existing Google Fonts; the networked
  webpack build succeeded, and the final cached rebuild compiled in 16.7 seconds.
- `git diff --check`: passed.
- Final browser warning/error log: empty. Temporary viewport override reset;
  local preview left on the photo version. No push or deployment performed.

Final result: passed for the requested hero adjustment and tested interactions.
WebGL context loss and OS reduced-motion changes are code-reviewed paths, not
manually injected browser tests. Broader cross-browser visual testing is not
claimed by this pass.

---

# Battuta product-inspector card design QA

- Selected source visual: `/var/folders/fl/yb17qc717wz3ljd5p3_15b900000gn/T/codex-clipboard-bd4f7c9d-2a21-4f36-af1b-afe2167fa99b.png`
- Final browser implementation: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-community-implementation-flow-final.png`
- Normalized side-by-side evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-community-comparison-flow-final.png`
- Focused card/player evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-community-player-flow-final.png`
- Source pixels: 1586 x 992
- Implementation CSS viewport: 1422 x 800; the source was proportionally normalized to the same 1422 px width and cropped to the same visible height for comparison
- Responsive viewport: 390 x 844
- State: Chinese locale, all brands, first three cards settled, BCP selected and idle, loop enabled, real single-key inspector waveforms rendered
- Route: `/projects/battuta/community`

## Full-view comparison evidence

The implementation matches the selected concept's calm white product-page hierarchy, compact brand index, light catalog field, three-column card rhythm, approximately 47/53 product-to-inspector split, dark professional signal surface, lime attack highlight, and compact centered bottom player. Desktop content now fills the viewport without the oversized edge whitespace or long horizontal cards rejected in earlier iterations.

The remaining visible differences are deliberate and truthful. The catalog reports the 21 profiles currently available rather than the concept's invented 217; audio is labelled with the source files' actual PCM 48 kHz / 16-bit format; creator and license provenance replaces fabricated avatars and dates; and the waveform is measured from a real rendered key event rather than stylized artwork. Generated switch visuals are explicitly marked as visual illustrations and are not presented as official manufacturer photography.

## Focused card and waveform evidence

- Each card uses a real raster switch visual on the left and a dark signal inspector on the right, preserving the selected product-card direction instead of stretching into one long waveform row.
- Inspector waveforms are generated from an offline-rendered 250 ms press/release event for that exact profile. Peak, RMS, and duration are calculated from the same PCM buffer displayed by the canvas.
- The lime segment emphasizes the true onset region; the remaining envelope retains its decoded amplitude with no synthetic amplitude floor.
- Full 12-second relaxed typing previews remain available from the play control and reuse the production audio path; the short inspector render exists only to make the professional transient view readable and fast.
- Card image scale, title clamping, metric spacing, footer provenance, 44 px play target, and comparison action were checked in the settled browser render.

## Findings and resolution

### Pass 1

- P1: the prior wide horizontal card direction did not match the selected product-inspector concept.
- P1: rendering dense 12-second typing sequences in every card obscured individual key transients and made the display look simulated.
- P2: excessive outer whitespace, a full-width player, and mid-width layout oscillation weakened hierarchy and produced unnecessarily tall cards.
- P2: the cards did not expose signal metrics or product imagery at the prominence shown in the source.
- P2: async one-shot preparation could race with a rapid profile switch, and a fourth comparison selection silently displaced the oldest item.

### Fixes

- Rebuilt the catalog as responsive split product/inspector cards, using three columns above 1360 px, two capped columns through tablet widths, and one capped column below 900 px.
- Added cohesive generated switch visuals with visible disclosure, while keeping all manufacturer/source claims textually accurate.
- Replaced card previews with real single-key transient renders and true peak/RMS/duration metrics; loading and unavailable states remain explicit.
- Tightened navigation, hero, brand strip, catalog gutters, and player width to match the selected density.
- Moved the player into normal page flow immediately after the first responsive card row: after three cards on desktop, two on tablet, and one on mobile. At the selected 1585 x 992 viewport the first row ends at 829 px and the player begins at 851 px, so no card content or action is obscured.
- Increased inspector metadata and metric contrast and type size, allowed long family/tone descriptions to wrap, and replaced the container-dependent mobile switch with an explicit 600 px breakpoint.
- Added generation guards for rapid profile changes, prevented silent comparison eviction at the three-item limit, and kept playback errors adjacent to the in-flow player.
- Verified 390 px mobile rendering without horizontal overflow; cards stack internally and the in-flow compact player appears immediately after the first card.

### Final pass

No actionable P0, P1, or P2 visual, responsive, interaction, console, accessibility, provenance, or waveform-integrity issues remain for the selected state.

## Verification

- Card play/pause, search, free typing, comparison selection, and sequential A/B playback: passed
- Desktop 1422 x 800 and mobile 390 x 844 layout checks: passed with no horizontal overflow
- Browser console warnings and errors after the final interaction pass: none
- `npm run lint`: passed
- `npm run build`: passed in the source-synchronized production verification workspace; Next.js compiled, TypeScript checks passed, and all routes generated
- `git diff --check`: passed

final result: passed

---

# Battuta click-pills design QA

- Source visual truth: `/var/folders/fl/yb17qc717wz3ljd5p3_15b900000gn/T/TemporaryItems/NSIRD_screencaptureui_sOpaPs/截屏2026-08-25 21.32.57.png`
- Implementation screenshot: `/private/tmp/battuta-click-preview.vZs75b/implementation-normalized.png`
- Side-by-side evidence: `/private/tmp/battuta-click-preview.vZs75b/comparison-crop.png`
- Source pixels: 348 × 120
- Implementation pixels: 346 × 120, cropped from the browser's 346 × 160 minimum viewport to the same 120 px vertical field
- CSS viewport: 346 px wide; browser device density reported through the captured pixels
- State: dark-theme, static decorative `down / up` sound illustration
- Density normalization: the supplied source is a magnified crop of the live page, so raw component size is not compared directly. Alignment is checked using the rendered CSS geometry and equal center offsets.

## Full-view comparison evidence

The supplied screenshot and revised browser render preserve the same dark surface, muted monospace labels, lime/dark capsule, copy, and horizontal order. The only intended changes are the capsule split and the symmetry of the label slots.

## Focused region comparison evidence

- Rendered group center: 173 px
- Capsule center: 173 px
- Left label-slot center: 106.5508 px
- Right label-slot center: 239.4492 px
- Both label-slot centers are 66.4492 px from the capsule center.
- Rendered gradient boundary: exactly 50%.

## Required fidelity surfaces

- Fonts and typography: unchanged; existing monospace family, size, color, and weight preserved.
- Spacing and layout rhythm: left and right label slots now use equal `4ch` tracks with equal 14 px gaps.
- Colors and visual tokens: unchanged; existing `--lime`, dark fill, border, and radius preserved.
- Image quality and asset fidelity: no raster or icon assets are involved in this decorative component.
- Copy and content: `down` and `up` remain unchanged.

## Findings and comparison history

### Pass 1

- P2: the 42% gradient boundary made the capsule visibly asymmetric.
- P2: content-sized labels gave `down` and `up` unequal layout widths.

### Fix

- Changed the row to equal `4ch / 76px / 4ch` grid tracks.
- Centered both labels inside equal slots.
- Moved the gradient boundary from 42% to 50%.

### Pass 2

No actionable P0, P1, or P2 differences remain. The rendered geometry is mathematically symmetric and visually balanced. No additional focused state is needed because the element is decorative and non-interactive.

## Test gaps

The repository's local Next.js runtime did not start because loading its native SWC dependency stalled in the current Node environment. The exact production stylesheet was therefore verified in a browser-rendered isolated component harness; full-page regression remains a follow-up check when the Next.js runtime is available.

final result: passed

---

# Battuta compact-player spacing refinement QA

- Source visual truth: `/var/folders/fl/yb17qc717wz3ljd5p3_15b900000gn/T/TemporaryItems/NSIRD_screencaptureui_C6OCur/截屏2026-09-04 21.28.39.png`
- Final focused implementation: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-player-spacing-pass2-crop.png`
- Combined before/after evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-player-spacing-comparison-pass2-stacked.png`
- Desktop full-view evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-spacing-desktop-pass2.png`
- Mobile evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-spacing-mobile-pass2.png`
- Source pixels: 2940 × 288 (@2x crop representing 1470 × 144 CSS px)
- Focused implementation pixels: normalized to 2940 × 288 from the in-app browser capture
- Desktop CSS viewport: 1470 × 800; device pixel ratio reported as 1.98
- Mobile CSS viewport: 390 × 844; raw capture 433 × 938
- State: Chinese locale, BCP (Suit80) selected, idle at 0:00 / 0:12, loop enabled, no comparison selections, footer behind the fixed player
- Route: `/projects/battuta/community`

## Findings and comparison history

### Pass 1

- P1, player hierarchy: identity, transport, long progress, loop, persistent volume range, comparison, and install actions all occupied one visual row, making the right side feel compressed despite ample width.
- P2, page rhythm: primary content used 48 px desktop gutters and the player used 32 px gutters, leaving the page visually lighter at the edges than the user requested.
- P2, control balance: permanently showing the volume range and full install label gave secondary controls the same visual weight as playback.

### Fixes

- Rebuilt the player as three regions: fuller identity, a two-level center playback group, and separated secondary actions.
- Limited the progress region to 560 CSS px while increasing the identity waveform to 84 × 48, the main play target to 58 × 58, and secondary targets to 46 × 46.
- Changed volume to a keyboard- and pointer-accessible popover, shortened the compact install label, and added an 11 px action gap plus a hairline divider.
- Expanded the global content ceiling from 1392 to 1720 px and reduced desktop content gutters from 48 to 24 px, player gutters from 32 to 20 px, intermediate gutters to 20 px, and mobile content gutters to 16 px.
- Kept the three-column catalog and existing card proportions, allowing the wider content frame to make each card and waveform naturally fuller without changing information hierarchy.

### Pass 2

- The player measures 1430 × 114 CSS px at the 1470 px desktop viewport.
- Its tracks measure 300 px for identity, 736.8 px for playback, and 268.6 px for secondary actions; the progress group itself is capped at 560 px and centered.
- The page content frame measures 1422 px with 24 px outer gutters and no horizontal overflow.
- The 1024, 820, and 390 px responsive widths retain the intended hierarchy with no horizontal overflow; the 390 px content frame measures 358 px with 16 px gutters.
- The volume range is hidden at rest, becomes visible and keyboard-focusable from the mute control, and keeps its accessible label.
- Playback starts and stops from the revised primary control; browser console warnings and errors after the final interaction pass: none.

## Required fidelity surfaces

- Fonts and typography: existing Wormforce/Battuta system type, weights, line heights, and hierarchy are unchanged; the player title and metadata were increased one step to match the fuller control scale.
- Spacing and layout rhythm: outer gutters are consistently tighter, player functions are grouped by priority, and the capped progress line no longer dominates or crowds the utility cluster.
- Colors and visual tokens: the white glass surface, subtle border, lime primary state, muted metadata, and dark footer remain unchanged.
- Image quality and asset fidelity: the supplied Battuta logo and exact rendered audio waveform remain intact; no replacement or simulated asset was introduced.
- Copy and content: full labels remain available to assistive technology; only the compact player presentation shortens “安装 Battuta” to “安装”.

No actionable P0, P1, or P2 visual, responsive, interaction, console, or accessibility issues remain for the supplied player state and tested viewport widths.

## Verification

- `npm run lint`: passed
- `npm run build`: passed; Next.js 16.1.6 compiled, TypeScript checks passed, and all 23 routes generated
- `git diff --check`: passed

final result: passed

---

# Battuta brand-led Sound Atlas design QA

- Source visual truth: `/Users/zqb/.codex/generated_images/01a0275c-1bf2-7d20-aada-3deee853767a/exec-b5176336-9790-486c-b98d-701ab1fe54b2.png`
- Final desktop implementation: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-implementation-desktop-css-exact-pass2-crop.png`
- Side-by-side evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-comparison-desktop-css-exact-pass2.png`
- Responsive evidence: `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-implementation-mobile-top-pass2.png`, `/Users/zqb/.codex/visualizations/2026/08/22/01a0275c-1bf2-7d20-aada-3deee853767a/battuta-implementation-mobile-cards-pass2.png`
- Source pixels: 1487 × 1058
- Desktop CSS viewport: 1486 × 1058 at device pixel ratio 0.9; the browser surface was cropped from the raw 1651 × 1174 capture and normalized to 1487 × 1058 for comparison
- Mobile CSS viewport: 390 × 844 at device pixel ratio 0.9; raw capture 433 × 938
- State: Chinese locale, light theme, all brands selected, first three cards visible, BCP loaded in the compact player, exact sequence waveforms rendered
- Route: `/projects/battuta/community`

## Product and provenance model

The catalog now uses two independent dimensions: keyboard brand and recording source. Brand labels organize compatible switch or keyboard families; they do not imply the recording came from the manufacturer. Current library audio is truthfully identified as either a Battuta built-in recording or a community submission. BCP (Suit80) credits J_Eason001 with “Used with permission”, and Keychron Red credits C40115 under CC BY 4.0. No existing recording is presented as official manufacturer audio.

The contribution flow is deliberately a reviewed submission workflow rather than a fake instant upload. Its modal explains the three review steps, accepted sample requirements, attribution and license information, and starts a pre-addressed email to the Wormforce team. The UI leaves room for a future verified `official` source type without claiming one exists today.

## Full-view comparison evidence

The implementation preserves the selected concept's white Apple-like product navigation, oversized title, calm typography, horizontal brand strip, light-gray catalog field, three-column sound cards, waveform-led hierarchy, lime active state, and fixed compact player. It intentionally adds search, random listening, submission review, source and sort controls, provenance metadata, free typing, and an optional three-item comparison drawer to make the selected direction product-complete.

Text-only manufacturer labels replace the concept's decorative logo approximations because no authorized logo asset set exists in the repository. This keeps the catalog honest and avoids fabricated brand artwork while preserving the same navigation rhythm.

## Interaction and responsive evidence

- Brand and community-source filters update the catalog independently; the community view contains exactly the two attributed community profiles.
- Search narrows against profile name, brand, creator, family, and tone; random listening respects the filtered set.
- Exact PCM waveforms render from each prepared preview buffer. Pending and unavailable states show explicit text and never substitute a simulated waveform.
- Play, quick sample, free-typing input, comparison selection, and sequential A/B playback were exercised without audio errors.
- Physical key codes remain audible while a Chinese IME is composing; only non-physical `Process` and `Unidentified` codes are ignored.
- Keyboard activation of “加入对比” moves focus directly to the comparison drawer. Closing it restores focus to the same card, and the compact player exposes an explicit “查看对比” control.
- Submission review opens as a focus-trapped dialog, focuses its close control, closes with Escape, and restores focus to the triggering button.
- While the submission dialog is open, body scrolling is locked and all background sections are inert; both states are restored on close.
- The 390 × 844 layout has no horizontal overflow, retains a horizontally scrollable brand strip, stacks catalog controls, shows one card per row, and keeps the compact player usable above the safe area.
- Browser console warnings and errors after the final desktop and mobile passes: none.

## Findings and comparison history

### Pass 1

- P2: an immediate screenshot captured the truthful “正在生成真实波形” loading state before offline rendering completed, which did not represent the settled browsing experience.
- P2: the original concept could be misread as using official manufacturer recordings and did not expose personal creators, licenses, or review status.
- P1: the comparison drawer opened visually after a keyboard selection but remained dozens of Tab stops away.
- P1: ignoring all composing keyboard events made free typing effectively silent with a Chinese IME.
- P1: an offline waveform exception could leave the UI in its pending state indefinitely.
- P1: community copy promised a review status that the present manifest does not contain.
- P2: provenance text was too small, comparison remove controls were below 44 × 44 px, and the submission dialog did not immobilize its background.

### Resolution

- Waited for the exact offline-rendered sequence buffers and recaptured the settled waveform state for final comparison.
- Separated brand from source, labeled every current recording truthfully, added creator/license provenance, and implemented a clearly reviewed personal-submission flow.
- Kept the concept's hierarchy and visual direction while removing unsupported official claims and invented manufacturer assets.
- Added comparison focus management, focus restoration, a polite selection-count announcement, and an explicit player-level “查看对比” entry.
- Switched free typing to physical key-code handling during IME composition, with guards only for codes that cannot identify a key.
- Made waveform failures settle to the explicit unavailable state and removed the unsupported review-status promise.
- Raised provenance text contrast and size, restored 44 × 44 px remove targets, and locked/inerted the dialog background.

### Final pass

No actionable P0, P1, or P2 visual, responsive, interaction, console, accessibility, attribution, or waveform-integrity issues remain for the tested states.

## Verification

- `npm run lint`: passed
- `npm run build`: passed; Next.js 16.1.6 compiled, TypeScript checks passed, and all 23 routes generated
- `git diff --check`: passed

final result: passed

---

# Battuta exact-sequence waveform QA

- Source visual truth: `/var/folders/fl/yb17qc717wz3ljd5p3_15b900000gn/T/codex-clipboard-8869df86-81e1-4212-94cc-89580aa8d235.png`
- Final browser-rendered implementation: `/private/tmp/battuta-true-waveform-final.png`
- Final side-by-side evidence: `/private/tmp/battuta-true-waveform-comparison.png`
- Source and implementation comparison size: 1487 × 1058 each
- State: Chinese locale, desktop light theme, BCP selected and playing at 0:04, BCP and Topre selected for A/B comparison
- Preview route: `https://wormforce-git-codex-battuta-latest-downloads-7b7b7bs-projects.vercel.app/projects/battuta/community`

## Audio-to-waveform invariant

Each 12-second profile preview is rendered once with `OfflineAudioContext` from the exact 46-hit typing schedule, including the same press/release sample resolution, 55 ms release offset, playback gain/rate variation, sample offsets, and 16-voice ceiling used by live playback. `buildWaveform()` reads that rendered `AudioBuffer`, and `playPreparedSequence()` assigns the same buffer object to the live `AudioBufferSourceNode`.

Collection and A/B previews follow the same rule with one composite multi-profile buffer. If exact offline rendering is unavailable or the prepared buffer cannot be played, the UI marks the waveform unavailable and displays a zero envelope instead of substituting an unrelated sprite waveform.

## Runtime and interaction evidence

- 18 visible/near-visible canvases reported `data-waveform-source="rendered-sequence"`; 9 below-fold canvases remained intentionally pending under lazy loading; 0 canvases reported unavailable.
- BCP and Topre rendered visibly different waveform envelopes.
- BCP's card, right player, and comparison item reuse the same cached profile-preview points.
- BCP progressed to 0:04 / 0:12 and remained active after the 12-second loop boundary.
- Profile cadence measured 4.02 keys per second with a 248 ms average gap, deliberate 360–405 ms word gaps, and a 520 ms line-break gap.
- Quick audition stopped the running main track before emitting its one-shot sample, keeping the displayed active waveform aligned with current output.
- The deep-night collection used a single exact composite buffer and reported 0:02 / 0:07 during playback.
- The BCP/Topre A/B run used a single exact composite buffer and reported 0:02 / 0:05 during playback.
- The 390 × 844 responsive layout retained working search, filters, collection preview, sound cards, and comparison dock.
- Browser console warnings/errors after the final desktop interaction pass: none.

## Performance safeguards

- Waveforms render only when their canvas enters or approaches the viewport.
- Offline rendering is limited to two concurrent contexts; remaining work uses a FIFO queue.
- Prepared audio keeps an eight-entry LRU cache and releases queued work, cached buffers, timers, voices, and contexts on teardown.
- Resize observers remain stable while playback progress redraws the canvas.

## Findings and fixes

### Pass 1

- P1: waveform points came from each full sample sprite, not from the 12-second track actually being played.
- P2: a prepared-buffer playback failure could fall back to timer taps while the UI still claimed the waveform was exact.
- P2: quick audition could overlap the main preview with sound absent from the displayed waveform.
- P2: vertical peak bars read more like an equalizer than the continuous audio waveform in the supplied reference.
- P2: the initial preview cadence was approximately 8.6 keys per second and read as a typing-speed demonstration instead of relaxed everyday typing.

### Final fix

- Replaced sprite-derived display data with peaks computed from the exact rendered preview buffer.
- Made playback report its actual mode and removed false exact markers from every fallback path.
- Made one-shot audition cancel active preview playback.
- Drew the real peaks as a continuous symmetric envelope with a clipped lime played region.
- Added visibility-based generation, two-render concurrency, and stable canvas resizing.
- Reduced profile, collection, and A/B cadence to approximately four keys per second and aligned longer pauses with spaces and Enter.

## Verification

- `npx tsc --noEmit`: passed
- `npm run lint`: passed
- `npm run build`: passed, including the Battuta community manifest verifier and all 23 static/dynamic route checks
- Vercel deployment for commit `3d4dde2`: passed

No actionable P0, P1, or P2 visual, responsive, interaction, console, or waveform-integrity issues remain for the tested states.

final result: passed

---

# Battuta Sound Atlas design QA

- Source visual truth: `/var/folders/fl/yb17qc717wz3ljd5p3_15b900000gn/T/codex-clipboard-8869df86-81e1-4212-94cc-89580aa8d235.png`
- Browser-rendered implementation: `/private/tmp/battuta-sound-atlas-final-playing.png`
- Side-by-side evidence: `/private/tmp/battuta-sound-atlas-comparison-final-playing.png`
- Responsive evidence: `/private/tmp/battuta-sound-atlas-tablet-top.png`, `/private/tmp/battuta-sound-atlas-mobile-final.png`
- Source pixels: 1487 × 1058
- Implementation capture pixels: 1472 × 1047; normalized to 1487 × 1058 for comparison
- Requested browser viewport override: 1487 × 1058; in-app page capture excludes the browser surface gutter
- State: Chinese locale, desktop light theme, BCP selected and playing at 0:04, BCP and Topre selected for A/B comparison
- Route: `/projects/battuta/community`

## Full-view comparison evidence

The final browser render preserves the reference's dark 63 px product navigation, white atlas workspace, title/search/random-listen header, pill filters, three curated waveform collections, three-column sound-card grid, sticky right-side player, and fixed comparison dock. The first six profiles are deliberately curated to match the reference's varied opening set: BCP, Holy Panda, Cherry MX Blue, NovelKeys Cream, Topre, and IBM Buckling Spring.

The implementation uses decoded PCM from Battuta's real 21-profile library. It intentionally replaces the reference mock's invented likes, plays, and creator handles with actual attribution, sample counts, and sample rate.

## Focused interaction evidence

- BCP card and right-rail playback entered the synchronized 0:04 playing state.
- Loop playback remained active beyond one 12-second sequence and restarted without stopping.
- “深夜线性” advanced through Gateron Black Ink, Cherry MX Black, and Alpaca in order.
- Search and family filters narrowed the catalog; random listening respected the filtered result.
- Quick Space audition and the free-typing focus/key path were exercised.
- A/B playback entered its running state and stopped immediately when a selected profile was removed.
- Player collapse exposed an “展开播放器” control and restored the full rail.
- Desktop, 820 px tablet, and 390 px mobile layouts were inspected.
- Browser console warnings/errors after the interaction pass: none.

## Required fidelity surfaces

- Fonts and typography: existing Wormforce/Battuta families retained, with the source's compact bold hierarchy and mono time readout.
- Spacing and layout rhythm: measured 328 px rail, 30 px rail gap, 12 px card grid, 100 px comparison dock, and 12 px card radius are preserved.
- Colors and visual tokens: near-black navigation/wave panels, white surfaces, subtle gray borders, and lime `#d8ff73` action/playing state match the source direction.
- Image and waveform fidelity: every waveform is generated from decoded real audio rather than placeholder or pseudo-random art.
- Copy and content: Chinese product copy is concise and all visible statistics are truthful; English route uses equivalent localized copy.

## Findings and comparison history

### Pass 1

- P1: the Battuta brand inherited dark page text on the dark navigation.
- P1: placeholder and small metadata contrast were below the intended readable level.
- P2: manifest order put four similar tactile profiles in the opening six cards.
- P2: the rail chevron looked interactive but did not collapse the player.
- P2: “试听合集” only played the representative profile.
- P2: looping could stop after the first sequence because playback refs were not cleared synchronously.
- P2: editing the comparison queue did not cancel already scheduled A/B playback.

### Fixes

- Restored light navigation text and increased low-contrast secondary colors.
- Added curated first-six ordering while retaining all 21 real profiles.
- Implemented desktop player collapse/expand with accessible state.
- Implemented sequential three-profile collection playback.
- Synchronized playback refs during cleanup and invalidated async work on unmount.
- Cancelled A/B playback whenever its queue changes.
- Added filter group semantics, localized waveform labels, and polite player-title announcements.

### Final pass

No actionable P0, P1, or P2 visual, responsive, interaction, console, or accessibility issues remain for the supplied desktop target and the tested responsive surfaces.

final result: passed
