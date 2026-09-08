import { CubeCamera, HalfFloatType, Scene, WebGLCubeRenderTarget, type PerspectiveCamera, type WebGLRenderer } from "three";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";

// Loaded only after a visitor explicitly requests the higher-cost preview.
export async function createSwitchPathTracer(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, studio: Scene, rasterize: () => void, isCurrent: () => boolean) {
  const { WebGLPathTracer, DenoiseMaterial } = await import("three-gpu-pathtracer");
  if (!isCurrent()) throw new DOMException("Aborted", "AbortError");
  const environment = new WebGLCubeRenderTarget(128, { type: HalfFloatType });
  const tracer = new WebGLPathTracer(renderer);
  const denoise = new DenoiseMaterial({ sigma: 1.6, kSigma: 1.3, threshold: 0.18 });
  const denoiseQuad = new FullScreenQuad(denoise);
  const dispose = () => { denoiseQuad.dispose(); denoise.dispose(); tracer.dispose(); environment.dispose(); };
  try {
    // The rasterizer's PMREM atlas is not an equirectangular environment map.
    // Capture the same softboxes as a cube for physically traced reflections.
    const autoClear = renderer.autoClear;
    try {
      renderer.autoClear = true;
      new CubeCamera(0.1, 100, environment).update(renderer, studio);
    } finally {
      renderer.autoClear = autoClear;
    }
    const tracedScene = scene.clone();
    tracedScene.environment = environment.texture;
    tracedScene.environmentIntensity = 0.35;
    tracer.bounces = 8;
    tracer.transmissiveBounces = 12;
    tracer.filterGlossyFactor = 0.3;
    tracer.tiles.set(2, 2);
    tracer.textureSize.set(256, 256);
    // Bound the pixel budget on large / Retina displays as well as the samples.
    tracer.renderScale = Math.min(0.85, 1000 / Math.max(renderer.domElement.width, renderer.domElement.height));
    tracer.renderDelay = 150;
    tracer.minSamples = 3;
    tracer.fadeDuration = 0;
    tracer.rasterizeSceneCallback = rasterize;
    tracer.renderToCanvasCallback = (target) => {
      denoise.map = target.texture;
      denoiseQuad.render(renderer);
    };
    tracer.setScene(tracedScene, camera);
    return {
      reset: () => {
        tracer.renderScale = Math.min(0.85, 1000 / Math.max(renderer.domElement.width, renderer.domElement.height));
        tracer.updateCamera();
      },
      sample: () => { tracer.renderSample(); return tracer.samples; },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}

export type SwitchPathTracer = Awaited<ReturnType<typeof createSwitchPathTracer>>;
