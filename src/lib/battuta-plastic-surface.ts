import { DataTexture, Float32BufferAttribute, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, type BufferGeometry } from "three";

// Non-colour material data, not a painted grain overlay. Fixed seed prevents
// texture changes between reloads; mipmaps suppress distant sparkle during orbit.
export function createPlasticSurface() {
  const size = 128;
  let seed = 73129;
  const noise = new Float32Array(size * size);
  for (let i = 0; i < noise.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    noise[i] = seed / 4294967296;
  }
  const sample = (x: number, y: number) => noise[((y + size) % size) * size + (x + size) % size];
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const grain = (4 * sample(x, y) + sample(x - 1, y) + sample(x + 1, y) + sample(x, y - 1) + sample(x, y + 1)) / 8;
    const i = (y * size + x) * 4;
    data[i] = Math.round(255 * grain); // bump height
    data[i + 1] = Math.round(255 * (0.84 + 0.16 * grain)); // roughness multiplier
    data[i + 2] = 0;
    data[i + 3] = 255;
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.name = "Fine moulded plastic microsurface";
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

// The source CAD has no UVs. Project each hard-surface face at a consistent
// physical density: a 3.2 mm tile, giving very fine rather than sandpaper grain.
export function addPlasticSurfaceUVs(geometry: BufferGeometry) {
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  const uv = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i)), nz = Math.abs(normals.getZ(i));
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const axis = nx >= ny && nx >= nz ? "x" : ny >= nz ? "y" : "z";
    uv[i * 2] = (axis === "x" ? z : x) / 0.0032;
    uv[i * 2 + 1] = (axis === "y" ? z : y) / 0.0032;
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
}
