import { BackSide, FrontSide, HalfFloatType, LinearMipmapLinearFilter, Mesh, MeshPhysicalMaterial, NoToneMapping, ShaderChunk, ShaderMaterial, Vector2, WebGLRenderTarget } from "three";
import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";

/** Screen-space layered transmission. This is not multi-bounce ray tracing.
 * Back-facing geometry captures the cavity interfaces; it is not a fabricated
 * inner shell. Thickness is bounded to avoid treating the air cavity as solid PC.
 */
export function createLayeredGlass(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera, shells: Mesh[], scale: number) {
  const targetOptions = { type: HalfFloatType, minFilter: LinearMipmapLinearFilter, generateMipmaps: true };
  const background = new WebGLRenderTarget(1, 1, targetOptions);
  const backLayer = new WebGLRenderTarget(1, 1, targetOptions);
  const depths = shells.map(() => new WebGLRenderTarget(1, 1, { type: HalfFloatType }));
  const depthMaterial = new ShaderMaterial({
    side: BackSide,
    vertexShader: "varying float viewDepth; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); viewDepth=-p.z; gl_Position=projectionMatrix*p; }",
    fragmentShader: "varying float viewDepth; void main(){ gl_FragColor=vec4(viewDepth,0.0,0.0,1.0); }",
  });
  const resolution = new Vector2(1, 1);
  const buffer = { value: background.texture };
  const measuredThickness = { value: 0 };
  const originals = shells.map(mesh => mesh.material as MeshPhysicalMaterial);
  originals.forEach((material, index) => {
    material.map = null;
    material.aoMapIntensity = 0.35;
    material.roughness = 0.065;
    material.bumpScale = 0.0008;
    material.envMapIntensity = 0.65;
    material.thickness = 0.00065;
    material.side = FrontSide;
    material.onBeforeCompile = shader => {
      shader.uniforms.glassBuffer = buffer;
      shader.uniforms.glassResolution = { value: resolution };
      shader.uniforms.glassBackDepth = { value: depths[index].texture };
      shader.uniforms.glassMeasure = measuredThickness;
      shader.fragmentShader = "uniform sampler2D glassBuffer; uniform sampler2D glassBackDepth; uniform vec2 glassResolution; uniform float glassMeasure;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace("#include <transmission_pars_fragment>",
        ShaderChunk.transmission_pars_fragment.replaceAll("transmissionSamplerMap", "glassBuffer").replaceAll("transmissionSamplerSize", "glassResolution")
          .replace("uniform vec2 glassResolution;", "").replace("uniform sampler2D glassBuffer;", ""));
      shader.fragmentShader = shader.fragmentShader.replace("#include <transmission_fragment>",
        ShaderChunk.transmission_fragment.replace("material.thickness = thickness;", `
          float exitDepth = texture2D(glassBackDepth, gl_FragCoord.xy / glassResolution).r;
          float pathLength = exitDepth - vViewPosition.z;
          float wall = clamp(pathLength * abs(dot(normalize(vViewPosition), normal)), 0.035, 0.24);
          material.thickness = (glassMeasure > 0.5 && pathLength > 0.0) ? wall / ${scale.toFixed(8)} : thickness;
        `));
    };
    material.customProgramCacheKey = () => "layered-glass-v1";
    material.needsUpdate = true;
  });
  let width = 0, height = 0;
  return {
    render() {
      const drawingSize = renderer.getDrawingBufferSize(new Vector2());
      // Fixed quality during motion, capped to keep offscreen memory bounded.
      const ratio = Math.min(1, 1536 / Math.max(drawingSize.x, drawingSize.y));
      const w = Math.max(1, Math.round(drawingSize.x * ratio)), h = Math.max(1, Math.round(drawingSize.y * ratio));
      if (w !== width || h !== height) {
        width = w; height = h;
        for (const target of [background, backLayer, ...depths]) target.setSize(w, h);
      }
      const previousTarget = renderer.getRenderTarget();
      const toneMapping = renderer.toneMapping;
      const visibility = new Map<Mesh, boolean>();
      scene.traverse(obj => { if (obj instanceof Mesh) visibility.set(obj, obj.visible); });
      try {
        renderer.toneMapping = NoToneMapping;
        resolution.set(w, h);
        // Nearest exit surface of each closed shell, independently of the other.
        for (let i = 0; i < shells.length; i++) {
          visibility.forEach((_, mesh) => { mesh.visible = mesh === shells[i]; });
          shells[i].material = depthMaterial;
          renderer.setRenderTarget(depths[i]); renderer.clear(); renderer.render(scene, camera);
          shells[i].material = originals[i];
        }
        visibility.forEach((visible, mesh) => { mesh.visible = visible; });
        shells.forEach(mesh => { mesh.visible = false; });
        renderer.setRenderTarget(background); renderer.clear(); renderer.render(scene, camera);
        buffer.value = background.texture;
        measuredThickness.value = 0;
        shells.forEach((mesh, i) => { mesh.visible = visibility.get(mesh)!; originals[i].side = BackSide; });
        renderer.setRenderTarget(backLayer); renderer.clear(); renderer.render(scene, camera);
        buffer.value = backLayer.texture;
        measuredThickness.value = 1;
        shells.forEach((_, i) => { originals[i].side = FrontSide; });
        // gl_FragCoord is in the final framebuffer's pixel space.
        resolution.copy(drawingSize);
        renderer.toneMapping = toneMapping;
        renderer.setRenderTarget(previousTarget);
        renderer.setClearColor(0x000000, 0); renderer.clear();
        renderer.setClearColor(0x000000, 1); renderer.render(scene, camera);
      } finally {
        visibility.forEach((visible, mesh) => { mesh.visible = visible; });
        shells.forEach((mesh, i) => { mesh.material = originals[i]; originals[i].side = FrontSide; });
        renderer.toneMapping = toneMapping;
        renderer.setRenderTarget(previousTarget);
      }
    },
    dispose() { background.dispose(); backLayer.dispose(); depths.forEach(t => t.dispose()); depthMaterial.dispose(); },
  };
}
