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
