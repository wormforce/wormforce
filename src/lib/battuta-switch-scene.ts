import { Box3, BoxGeometry, Color, DirectionalLight, DoubleSide, Group, HemisphereLight, Mesh, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, NeutralToneMapping, PCFShadowMap, PerspectiveCamera, PMREMGenerator, Scene, Vector3, WebGLRenderer } from "three";
import type { SwitchPathTracer } from "@/lib/battuta-path-tracing";
import { TextureLoader, type Texture } from "three";

export type PathTracingStatus = "off" | "loading" | "rendering" | "ready" | "error";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DEFAULT_HERO_ALIGNMENT, type HeroAlignment, type HeroFrame } from "@/lib/battuta-hero-choreography";
import { addPlasticSurfaceUVs, createPlasticSurface } from "@/lib/battuta-plastic-surface";
import { createLayeredGlass } from "@/lib/battuta-layered-glass";

export type SwitchScene = {
  dispose: () => void;
  isRotating: () => boolean;
  setRotating: (value: boolean) => void;
  rotateBy: (angle: number) => void;
  frame: (frame: HeroFrame, orbitDeltaSeconds?: number) => void;
  fitFrame: (area: { x: number; y: number; width: number; height: number }, centered?: boolean) => HeroFrame;
  resetPose: (alignment?: HeroAlignment) => void;
  setInteractive: (enabled: boolean) => void;
  setPathTracing: (enabled: boolean) => void;
  fitOrbit: () => void;
};

type SceneOptions = {
  baked?: boolean;
  layeredGlass?: boolean;
  rotating: boolean;
  onRotationChange: (rotating: boolean) => void;
  onError: () => void;
  onPathTracingChange: (status: PathTracingStatus) => void;
};

export async function createSwitchScene(container: HTMLDivElement, signal: AbortSignal, options: SceneOptions): Promise<SwitchScene> {
  const cleanupOnFailure: Array<() => void> = [];
  try {
  const response = await fetch(options.baked ? "/battuta/community/hero/hybrid-detail/switch-baked.glb" : "/battuta/community/hero/mx-switch.glb", { signal });
  if (!response.ok) throw new Error("Switch model unavailable");
  const data = await response.arrayBuffer();
  const gltf = await new GLTFLoader().parseAsync(data, "");
  cleanupOnFailure.push(() => gltf.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
  }));
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  cleanupOnFailure.push(() => { renderer.dispose(); renderer.domElement.remove(); });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.transmissionResolutionScale = 0.75;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  // Only the camera rotates; the model and lights are static, so reuse shadows.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  // The studio's emissive softboxes provide strong reflections on clear plastic.
  // Open black studio: a closed room's floor would occlude the low reflectors.
  const studio = new Scene();
  // A restrained neutral surround keeps unlit facets readable between strips.
  studio.background = new Color(0x999999);
  studio.position.y = -3.5;
  // Extra broad light cards catch the housing's front/left edges, like the photo.
  const lightCard = (position: [number, number, number], size: [number, number, number], intensity: number) => {
    const card = new Mesh(new BoxGeometry(...size), new MeshLambertMaterial({ color: 0x000000, emissive: 0xffffff, emissiveIntensity: intensity }));
    card.position.set(...position);
    card.lookAt(0, 3.5, 0);
    studio.add(card);
  };
  lightCard([5, 7, 10], [2, 7, 0.08], 8);
  lightCard([-8, 8, 4], [3, 9, 0.08], 22);
  // Low studio strips reflect in the front/side walls without adding a coat.
  lightCard([4, -5, 7], [6, 2, 0.08], 20);
  lightCard([-6, -5, -4], [2, 6, 0.08], 16);
  const disposeStudio = () => studio.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
  });
  cleanupOnFailure.push(() => { disposeStudio(); pmrem.dispose(); });
  const environment = pmrem.fromScene(studio, 0.025, 0.1, 100, { size: 256 });
  cleanupOnFailure.push(() => environment.dispose());
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.95;
  pmrem.dispose();
  renderer.autoClear = false;
  renderer.shadowMap.needsUpdate = true;
  scene.add(new HemisphereLight(0xffffff, 0x101210, 0.1));
  const keyLight = new DirectionalLight(0xfff8eb, 3.3);
  keyLight.position.set(-6, 8, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -3;
  keyLight.shadow.camera.right = 3;
  keyLight.shadow.camera.top = 3;
  keyLight.shadow.camera.bottom = -3;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.normalBias = 0.015;
  keyLight.shadow.bias = -0.0001;
  cleanupOnFailure.push(() => keyLight.shadow.dispose());
  scene.add(keyLight);
  const rimLight = new DirectionalLight(0xe4edff, 1.3);
  rimLight.position.set(4, 3, -4);
  scene.add(rimLight);
  if (options.baked) {
    keyLight.intensity = 2.4;
    rimLight.intensity = 0.8;
  }

  const model = gltf.scene;
  const plasticSurface = createPlasticSurface();
  plasticSurface.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  cleanupOnFailure.push(() => plasticSurface.dispose());
  const materials = new Set<MeshStandardMaterial | MeshPhysicalMaterial>();
  const bakedTextures = new Map<string, Texture>();
  cleanupOnFailure.push(() => bakedTextures.forEach(texture => texture.dispose()));
  if (options.baked) {
    for (const name of ["stem", "clicker", "housing_upper", "housing_lower"]) {
      const texture = await new TextureLoader().loadAsync(`/battuta/community/hero/hybrid-detail/${name}-ao.png`);
      texture.flipY = false;
      texture.channel = 1;
      bakedTextures.set(name, texture);
    }
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  }
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const previous = Array.isArray(object.material) ? object.material : [object.material];
    previous.forEach((material) => material.dispose());
    const name = object.name.toLowerCase();
    let material: MeshStandardMaterial | MeshPhysicalMaterial;
    if (name.includes("stem") || name.includes("clicker")) {
      const bakedAO = bakedTextures.get(name);
      if (bakedAO && object.geometry.getAttribute("uv")) {
        object.geometry.setAttribute("uv1", object.geometry.getAttribute("uv").clone());
      }
      // Explicit envMap prevents scene.environmentIntensity overriding the stem's
      // material-specific fill. Each plastic uses a different reflection strength.
      addPlasticSurfaceUVs(object.geometry);
      material = new MeshPhysicalMaterial({ color: name.includes("stem") ? 0xb1d900 : 0x7c9d0c, roughness: 0.52, roughnessMap: plasticSurface, bumpMap: plasticSurface, bumpScale: 0.035, metalness: 0, ior: 1.5, transmission: 0, clearcoat: 0, envMap: environment.texture, envMapIntensity: 0.12, specularIntensity: 1 });
      if (bakedAO) {
        material.aoMap = bakedAO;
        material.aoMapIntensity = 1;
        material.roughness = 0.42;
        material.bumpScale = 0.012;
        material.envMapIntensity = 0.28;
      }
      object.castShadow = true;
      object.receiveShadow = true;
    } else if (name.includes("spring")) {
      material = new MeshStandardMaterial({ color: 0xd8cba8, metalness: 1, roughness: 0.22 });
      object.castShadow = true;
    } else if (name.includes("pin") || name.includes("contact")) {
      material = new MeshStandardMaterial({ color: 0xd5ad59, metalness: 1, roughness: 0.19 });
      object.castShadow = true;
    } else {
      // GLB coordinates are in metres; thickness is local-space (0.65 mm).
      // Single dielectric surface, not a clear-coated paint. Keep the surface
      // variation much weaker than the opaque stem to avoid frosted plastic.
      const cavity = bakedTextures.get(name);
      if (cavity && object.geometry.getAttribute("uv")) {
        object.geometry.setAttribute("uv1", object.geometry.getAttribute("uv").clone());
      }
      addPlasticSurfaceUVs(object.geometry);
      material = new MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.12, roughnessMap: plasticSurface, bumpMap: plasticSurface, bumpScale: 0.005, transmission: 1, thickness: 0.00065, ior: 1.5, attenuationColor: new Color(0xffffff), attenuationDistance: 10, clearcoat: 0, envMap: environment.texture, envMapIntensity: 2, specularIntensity: 1 });
      // The CAD mesh already includes the cavity and its inward-facing walls.
      // Preserve both interfaces; duplicating/insetting it would add fake walls.
      material.side = DoubleSide;
      if (options.baked && material instanceof MeshPhysicalMaterial) {
        material.ior = 1.585;
        material.roughness = 0.115;
        material.bumpScale = 0.003;
        material.envMapIntensity = 1.05;
        if (cavity) {
          material.aoMap = cavity;
          material.aoMapIntensity = 0.9;
          material.map = cavity;
          // Restrained artistic cavity tint: retain at least 78% transmission
          // colour, instead of applying opaque AO black to transparent plastic.
          material.onBeforeCompile = shader => {
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <map_fragment>",
              "diffuseColor.rgb *= mix(vec3(0.78), vec3(1.0), texture2D(map, vMapUv).rgb);",
            );
          };
          material.customProgramCacheKey = () => "housing-cavity-v1";
        }
      }
    }
    object.material = material;
    materials.add(material);
  });
  const bounds = new Box3().setFromObject(model);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const scale = 3.8 / Math.max(size.x, size.y, size.z);
  model.position.sub(center);
  const pivot = new Group();
  pivot.add(model);
  pivot.scale.setScalar(scale);
  pivot.rotation.z = 0;
  scene.add(pivot);

  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  const photoCamera = new Vector3(-5.2, 6.8, 8.6);
  const photoUp = new Vector3(0, 1, 0).applyAxisAngle(photoCamera.clone().negate().normalize(), Math.PI / 30);
  camera.position.copy(photoCamera);
  camera.up.copy(photoUp);
  const shells: Mesh[] = [];
  model.traverse(object => { if (object instanceof Mesh && object.name.toLowerCase().includes("housing")) shells.push(object); });
  const layeredGlass = options.baked && options.layeredGlass !== false && renderer.extensions.has("EXT_color_buffer_float")
    ? createLayeredGlass(renderer, scene, camera, shells, scale) : null;
  if (layeredGlass) cleanupOnFailure.push(() => layeredGlass.dispose());
  container.dataset.glassMode = layeredGlass ? "layered" : "standard";
  const controls = new OrbitControls(camera, renderer.domElement);
  cleanupOnFailure.push(() => controls.dispose());
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.minPolarAngle = 0.01;
  controls.maxPolarAngle = Math.PI - 0.01;
  controls.autoRotateSpeed = 0.525;
  controls.rotateSpeed = 0.55;
  renderer.domElement.style.touchAction = options.baked ? "none" : "pan-y";
  controls.update();
  model.updateWorldMatrix(true, true);
  const housingPoints: Vector3[] = [];
  const silhouettePoints: Vector3[] = [];
  let stemAnchor = new Vector3(0, size.y / 2, 0);
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const vertices = object.geometry.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) silhouettePoints.push(new Vector3().fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld));
    object.geometry.computeBoundingBox();
    const box = object.geometry.boundingBox;
    if (!box) return;
    if (object.name.toLowerCase().includes("stem")) {
      stemAnchor = box.getCenter(new Vector3());
      stemAnchor.y = box.max.y;
      stemAnchor.applyMatrix4(object.matrixWorld);
    }
    if (!object.name.toLowerCase().includes("housing")) return;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      housingPoints.push(new Vector3(x, y, z).applyMatrix4(object.matrixWorld));
    }
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let rotating = options.rotating;
  let visible = false;
  let disposed = false;
  let contextLost = false;
  let frame: number | null = null;
  let lastTime = 0;
  let lastRender = 0;
  let framing: HeroFrame | null = null;
  let pathTracer: SwitchPathTracer | null = null;
  let pathRequested = false;
  let pathGeneration = 0;
  let pathFrame: number | null = null;
  let dragging = false;
  let interactive = false;
  let batchingFrame = false;
  let lastPathSample = 0;
  let inertiaFrame: number | null = null;
  const stopInertia = () => {
    if (inertiaFrame !== null) cancelAnimationFrame(inertiaFrame);
    inertiaFrame = null;
  };
  const inertiaTick = () => {
    inertiaFrame = null;
    if (disposed || contextLost || !interactive || !visible || document.hidden || reducedMotion.matches) return;
    if (controls.update()) inertiaFrame = requestAnimationFrame(inertiaTick);
  };
  const stopPathFrame = () => {
    if (pathFrame !== null) cancelAnimationFrame(pathFrame);
    pathFrame = null;
  };
  const canTrace = () => pathRequested && pathTracer && interactive && !rotating && !dragging && visible && !document.hidden && !disposed && !contextLost;
  const traceTick = (now: number) => {
    pathFrame = null;
    if (!canTrace()) return;
    if (now - lastPathSample < 33) { pathFrame = requestAnimationFrame(traceTick); return; }
    lastPathSample = now;
    try {
      const samples = pathTracer!.sample();
      container.dataset.pathSamples = String(Math.floor(samples));
      if (samples >= 192) { options.onPathTracingChange("ready"); return; }
      pathFrame = requestAnimationFrame(traceTick);
    } catch {
      setPathTracing(false);
      options.onPathTracingChange("error");
    }
  };
  const schedulePath = () => {
    stopPathFrame();
    if (canTrace()) {
      options.onPathTracingChange("rendering");
      pathFrame = requestAnimationFrame(traceTick);
    }
  };
  const fitFrame = (area: { x: number; y: number; width: number; height: number }, centered = false): HeroFrame => {
    const { width, height } = container.getBoundingClientRect();
    const previousZoom = camera.zoom;
    const previousView = camera.view ? { ...camera.view } : null;
    camera.clearViewOffset();
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    const pixel = (point: Vector3) => {
      const projected = point.clone().project(camera);
      return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 };
    };
    for (const point of silhouettePoints) {
      const p = pixel(point);
      left = Math.min(left, p.x); right = Math.max(right, p.x);
      top = Math.min(top, p.y); bottom = Math.max(bottom, p.y);
    }
    const ratio = Math.min(area.width / Math.max(1, right - left), area.height / Math.max(1, bottom - top));
    const anchor = pixel(stemAnchor);
    const housingX = housingPoints.map((point) => pixel(point).x);
    const target = {
      anchorX: centered ? area.x + area.width / 2 + (anchor.x - (left + right) / 2) * ratio : area.x + area.width - (right - anchor.x) * ratio,
      anchorY: centered ? area.y + area.height / 2 + (anchor.y - (top + bottom) / 2) * ratio : area.y + area.height - (bottom - anchor.y) * ratio,
      width: (Math.max(...housingX) - Math.min(...housingX)) * ratio,
    };
    camera.zoom = previousZoom;
    camera.view = previousView;
    camera.updateProjectionMatrix();
    return target;
  };
  const applyFrame = (target: HeroFrame) => {
    if (disposed || contextLost) return;
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.clearViewOffset();
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const projected = housingPoints.map((point) => point.clone().project(camera).x);
    const projectedWidth = (Math.max(...projected) - Math.min(...projected)) * width / 2;
    camera.zoom = Math.max(0.1, Math.min(8, target.width / Math.max(1, projectedWidth)));
    camera.updateProjectionMatrix();
    const anchor = stemAnchor.clone().project(camera);
    const offsetX = (anchor.x + 1) * width / 2 - target.anchorX;
    const offsetY = (1 - anchor.y) * height / 2 - target.anchorY;
    camera.setViewOffset(width, height, offsetX, offsetY, width, height);
  };
  const rasterize = () => {
    if (disposed || contextLost) return;
    // Keep the page visible outside the model, but give transmission a black studio.
    // Three otherwise substitutes a white, half-alpha transmission background.
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setClearColor(0x000000, 1);
    if (layeredGlass) layeredGlass.render();
    else renderer.render(scene, camera);
    if (process.env.NODE_ENV !== "production") container.dataset.cameraAngle = controls.getAzimuthalAngle().toFixed(3);
  };
  const render = () => {
    if (batchingFrame) return;
    rasterize();
    pathTracer?.reset();
    schedulePath();
  };
  const setPathTracing = (enabled: boolean) => {
    pathRequested = enabled;
    const generation = ++pathGeneration;
    stopPathFrame();
    if (!enabled) {
      pathTracer?.dispose();
      pathTracer = null;
      delete container.dataset.pathSamples;
      options.onPathTracingChange("off");
      rasterize();
      return;
    }
    rotating = false;
    sync();
    options.onPathTracingChange("loading");
    void import("@/lib/battuta-path-tracing").then(async ({ createSwitchPathTracer }) => {
      if (disposed || generation !== pathGeneration) return;
      if (!renderer.extensions.has("EXT_color_buffer_float")) throw new Error("Float render targets unavailable");
      const result = await createSwitchPathTracer(renderer, scene, camera, studio, rasterize, () => !disposed && generation === pathGeneration);
      if (disposed || generation !== pathGeneration) { result.dispose(); return; }
      pathTracer = result;
      render();
    }).catch(() => {
      if (disposed || generation !== pathGeneration) return;
      pathRequested = false;
      options.onPathTracingChange("error");
      rasterize();
    });
  };
  const tick = (now: number) => {
    frame = null;
    if (disposed || contextLost || !visible || document.hidden || !rotating || reducedMotion.matches) return;
    if (now - lastRender >= 1000 / 30) {
      controls.autoRotate = true;
      controls.update(lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0);
      lastTime = now;
      lastRender = now;
    }
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (document.hidden || !visible) stopInertia();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = 0;
    controls.autoRotate = rotating && !reducedMotion.matches;
    options.onRotationChange(controls.autoRotate);
    if (!disposed && !contextLost && visible && !document.hidden && controls.autoRotate) frame = requestAnimationFrame(tick);
    schedulePath();
  };
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (framing) applyFrame(framing);
    render();
  };
  controls.addEventListener("change", render);
  controls.addEventListener("start", () => {
    dragging = true; stopInertia(); stopPathFrame();
    sync(); rasterize();
  });
  controls.addEventListener("end", () => {
    dragging = false; render(); stopInertia();
    // Auto-rotation's frame loop already advances damping; don't update twice.
    if (controls.enableDamping && !rotating) inertiaFrame = requestAnimationFrame(inertiaTick);
  });
  const resizeObserver = new ResizeObserver(resize);
  cleanupOnFailure.push(() => resizeObserver.disconnect());
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.01 });
  cleanupOnFailure.push(() => intersectionObserver.disconnect());
  intersectionObserver.observe(container);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  cleanupOnFailure.push(() => { document.removeEventListener("visibilitychange", sync); reducedMotion.removeEventListener("change", sync); });
  const onContextLost = (event: Event) => { event.preventDefault(); contextLost = true; sync(); options.onError(); };
  const onContextRestored = () => { contextLost = false; resize(); sync(); };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
  cleanupOnFailure.push(() => { renderer.domElement.removeEventListener("webglcontextlost", onContextLost); renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored); });
  resize();

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopInertia();
    pathGeneration += 1;
    stopPathFrame();
    pathTracer?.dispose();
    if (frame !== null) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
    controls.dispose();
    layeredGlass?.dispose();
    model.traverse((object) => { if (object instanceof Mesh) object.geometry.dispose(); });
    materials.forEach((material) => material.dispose());
    bakedTextures.forEach(texture => texture.dispose());
    plasticSurface.dispose();
    environment.dispose();
    disposeStudio();
    keyLight.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
  if (signal.aborted) { dispose(); throw new DOMException("Aborted", "AbortError"); }
  return {
    dispose,
    fitFrame,
    isRotating: () => rotating && !reducedMotion.matches,
    frame: (target, orbitDeltaSeconds = 0) => {
      // Intro owns the clock: orbit and framing must reach the GPU together.
      const automatic = controls.autoRotate;
      batchingFrame = true;
      try {
        if (orbitDeltaSeconds > 0 && !reducedMotion.matches) {
          controls.autoRotate = true;
          controls.update(Math.min(orbitDeltaSeconds, 0.1));
        }
        framing = target;
        applyFrame(target);
      } finally {
        controls.autoRotate = automatic;
        batchingFrame = false;
      }
      render();
    },
    setInteractive: (enabled) => {
      stopInertia(); interactive = enabled; controls.enabled = enabled;
      controls.enableDamping = enabled && !reducedMotion.matches;
      controls.dampingFactor = 0.09;
      if (!enabled && pathRequested) setPathTracing(false);
    },
    setPathTracing,
    fitOrbit: () => {
      // A centred bounding sphere stays in frame at every pitch and yaw.
      // Hero framing uses an offset stem anchor and is unsuitable for free orbit.
      framing = null;
      camera.clearViewOffset();
      camera.fov = 50;
      camera.zoom = 1;
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      const halfAngle = Math.atan(Math.tan(25 * Math.PI / 180) * Math.min(1, camera.aspect));
      const distance = size.length() * scale * 0.5 / Math.sin(halfAngle) * 1.08;
      camera.position.sub(controls.target).normalize().multiplyScalar(distance).add(controls.target);
      camera.updateProjectionMatrix();
      controls.update();
      render();
    },
    resetPose: (alignment = DEFAULT_HERO_ALIGNMENT) => {
      if (disposed || contextLost) return;
      stopInertia();
      const damping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      controls.autoRotate = false;
      const yaw = alignment.yaw * Math.PI / 180;
      const pitch = alignment.pitch * Math.PI / 180;
      camera.position.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(photoCamera.length());
      camera.up.set(0, 1, 0).applyAxisAngle(camera.position.clone().negate().normalize(), alignment.roll * Math.PI / 180);
      camera.fov = alignment.fov;
      controls.target.set(0, 0, 0);
      controls.update();
      controls.enableDamping = damping;
      if (framing) applyFrame(framing);
      render();
    },
    setRotating: (value) => { stopInertia(); rotating = value; sync(); },
    rotateBy: (angle) => {
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new Vector3(0, 1, 0), angle);
      camera.position.copy(controls.target).add(offset);
      const automatic = controls.autoRotate;
      controls.autoRotate = false;
      controls.update();
      controls.autoRotate = automatic;
    },
  };
  } catch (error) {
    for (const cleanup of cleanupOnFailure.reverse()) {
      try { cleanup(); } catch { /* Preserve the original initialization error. */ }
    }
    throw error;
  }
}
