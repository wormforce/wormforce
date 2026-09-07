export type HeroFrame = { anchorX: number; anchorY: number; width: number };
export type HeroPhase = "photo" | "blend" | "model";

export const HERO_INTRO_DURATION = 4150;
export const MODEL_FADE_DURATION = 300;
export const MODEL_INTRO_DURATION = MODEL_FADE_DURATION + 2800;

export function sampleModelIntro(elapsed: number, start: HeroFrame, end: HeroFrame) {
  const fade = Math.max(0, Math.min(1, elapsed / MODEL_FADE_DURATION));
  const t = Math.max(0, Math.min(1, (elapsed - MODEL_FADE_DURATION) / (MODEL_INTRO_DURATION - MODEL_FADE_DURATION)));
  const eased = 1 - Math.pow(1 - t, 3);
  const mix = (a: number, b: number) => a + (b - a) * eased;
  return {
    modelOpacity: 0.87 * fade * fade * (3 - 2 * fade),
    phase: (t < 1 ? "blend" : "model") as HeroPhase,
    frame: { anchorX: mix(start.anchorX, end.anchorX), anchorY: mix(start.anchorY, end.anchorY), width: mix(start.width, end.width) },
  };
}
export const DEFAULT_HERO_ALIGNMENT = { yaw: -45.4, pitch: 51.4, roll: -24, fov: 65, x: 122, y: -16, scale: 1.05 };
export type HeroAlignment = typeof DEFAULT_HERO_ALIGNMENT;
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

// Photo-space calibration: the cross-stem's top centre and housing width.
// Coordinates refer to the original 1536 × 1024 hero, before object-fit cropping.
export function photoHeroFrame(image: { x: number; y: number; width: number; height: number; positionX: number; positionY: number }, alignment = DEFAULT_HERO_ALIGNMENT): HeroFrame {
  const scale = Math.max(image.width / 1536, image.height / 1024);
  const left = image.x + (image.width - 1536 * scale) * image.positionX;
  const top = image.y + (image.height - 1024 * scale) * image.positionY;
  return { anchorX: left + (1090 + alignment.x) * scale, anchorY: top + (155 + alignment.y) * scale, width: 1420 * scale * alignment.scale };
}

export function settledHeroArea(width: number, height: number) {
  const left = width * (width <= 600 ? 0.24 : width <= 900 ? 0.34 : 0.46);
  // Keep the full silhouette above the wrapped rotation/replay controls.
  return { x: left, y: 44, width: width - left - 16, height: Math.max(100, height - 144) };
}

export function sampleHeroIntro(elapsed: number, photo: HeroFrame, settled: HeroFrame) {
  // One shared curve: photo and model recede together while crossfading.
  const blend = smooth((elapsed - 650) / (HERO_INTRO_DURATION - 650));
  const phase: HeroPhase = elapsed < 650 ? "photo" : elapsed < HERO_INTRO_DURATION ? "blend" : "model";
  const mix = (start: number, end: number) => start + (end - start) * blend;
  return {
    phase,
    photoOpacity: 0.76 * (1 - blend),
    modelOpacity: 0.87 * blend,
    frame: { anchorX: mix(photo.anchorX, settled.anchorX), anchorY: mix(photo.anchorY, settled.anchorY), width: mix(photo.width, settled.width) },
  };
}

export function photoLayerTransform(photo: HeroFrame, frame: HeroFrame, origin: { x: number; y: number }) {
  const scale = frame.width / photo.width;
  return {
    scale,
    x: frame.anchorX - origin.x - scale * (photo.anchorX - origin.x),
    y: frame.anchorY - origin.y - scale * (photo.anchorY - origin.y),
  };
}
