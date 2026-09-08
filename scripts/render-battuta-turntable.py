"""Blender 4.5 / Cycles offline turntable; preserves the GLB's actual inner walls.

blender -b --python scripts/render-battuta-turntable.py -- --output /tmp/battuta-frames
Use --indices 0,9,27 for a three-angle material proof before rendering a full set.
The source asset's license and attribution remain in public/battuta/community/hero.
"""
import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector, Quaternion

parser = argparse.ArgumentParser()
parser.add_argument("--output", required=True)
parser.add_argument("--frames", type=int, default=72)
parser.add_argument("--indices", default="0,9,27")
parser.add_argument("--samples", type=int, default=512)
parser.add_argument("--size", type=int, default=900)
parser.add_argument("--cpu", action="store_true")
parser.add_argument("--resume", action="store_true", help="Skip complete PNGs from the same render settings")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
output = Path(args.output).resolve()
output.mkdir(parents=True, exist_ok=True)
repo = Path(__file__).resolve().parents[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = args.samples
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.006
scene.cycles.adaptive_min_samples = min(64, args.samples)
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
scene.cycles.max_bounces = 16
scene.cycles.transmission_bounces = 12
scene.cycles.glossy_bounces = 8
scene.cycles.transparent_max_bounces = 16
scene.cycles.sample_clamp_indirect = 3
scene.cycles.blur_glossy = 0.5
scene.render.threads_mode = "FIXED"
scene.render.threads = 6
scene.render.use_persistent_data = True
if not args.cpu:
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for device in prefs.devices:
            device.use = device.type == "METAL"
        if any(d.use for d in prefs.devices):
            scene.cycles.device = "GPU"
    except Exception as error:
        print("Metal unavailable; using CPU:", error, flush=True)

scene.render.resolution_x = scene.render.resolution_y = args.size
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.render.film_transparent = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.world = bpy.data.worlds.new("Neutral studio")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.57, 0.6, 1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.06

bpy.ops.import_scene.gltf(filepath=str(repo / "public/battuta/community/hero/mx-switch.glb"))
meshes = [obj for obj in scene.objects if obj.type == "MESH"]
# Import transforms glTF's Y-up into Blender's Z-up. Apply transforms first,
# then use one uniform scale: no offset/duplicate "fake" shell is generated.
for obj in meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
center = (low + high) / 2
for obj in meshes:
    # Bake world coordinates so physically measured wall thickness survives.
    matrix = obj.matrix_world.copy()
    for vertex in obj.data.vertices:
        vertex.co = (matrix @ vertex.co - center) * 100
    obj.matrix_world.identity()

def plastic(name, color, roughness, transmission=0, ior=1.48):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = 0
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["IOR"].default_value = ior
    bsdf.inputs["Transmission Weight"].default_value = transmission
    bsdf.inputs["Coat Weight"].default_value = 0
    if not transmission:
        noise = nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 300
        noise.inputs["Detail"].default_value = 2
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.09
        bump.inputs["Distance"].default_value = 0.0006
        links.new(noise.outputs["Fac"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return material

shell = plastic("Clear molded PC · actual inner and outer walls", (0.985, 0.99, 1), 0.09, 1, 1.585)
stem = plastic("Lime POM · satin molded surface", (0.43, 0.68, 0.003), 0.4)
gold = plastic("Gold contacts", (0.65, 0.43, 0.13), 0.23)
gold.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1
steel = plastic("Steel spring", (0.55, 0.58, 0.62), 0.22)
steel.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1
for obj in meshes:
    name = obj.name.lower()
    material = shell if "housing" in name else steel if "spring" in name else gold if "pin" in name or "contact" in name else stem
    obj.data.materials.clear()
    obj.data.materials.append(material)

def light(name, location, power, width, height, color=(1, 1, 1)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.shape = "RECTANGLE"
    data.size = width
    data.size_y = height
    data.color = color
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (-obj.location).to_track_quat("-Z", "Y").to_euler()

light("Large left key", (-3.5, -4, 5), 380, 3, 5, (1, 0.96, 0.89))
light("Right vertical reflection", (4, -1, 2.5), 80, 1.2, 4)
light("Rear edge", (0.5, 3.5, 3), 240, 3, 2, (0.9, 0.95, 1))
light("Low front strip", (-1, -3, -1), 85, 3, 0.6)

camera_data = bpy.data.cameras.new("Fixed-pitch turntable")
camera = bpy.data.objects.new("Camera", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
camera_data.lens = 48
camera_data.clip_start = 0.01
camera_data.clip_end = 100
indices = range(args.frames) if args.indices == "all" else [int(i) for i in args.indices.split(",")]
for index in indices:
    existing = output / f"frame-{index:03d}.png"
    if args.resume and existing.exists():
        try:
            image = bpy.data.images.load(str(existing), check_existing=False)
            valid = tuple(image.size) == (args.size, args.size)
            bpy.data.images.remove(image)
        except RuntimeError:
            valid = False
        if valid:
            print(f"SKIP {index}/{args.frames}: existing complete frame", flush=True)
            continue
    yaw = math.radians(-45.4 + index * 360 / args.frames)
    pitch = math.radians(51.4)
    camera.location = Vector((math.sin(yaw) * math.cos(pitch), -math.cos(yaw) * math.cos(pitch), math.sin(pitch))) * 4.4
    camera.rotation_mode = "QUATERNION"
    # Camera-local roll has the opposite sign to Three's rotated up vector.
    camera.rotation_quaternion = (-camera.location).to_track_quat("-Z", "Y") @ Quaternion((0, 0, 1), math.radians(24))
    scene.cycles.seed = 42
    scene.render.filepath = str(output / f"frame-{index:03d}.png")
    print(f"RENDER {index}/{args.frames}: {scene.render.filepath}", flush=True)
    bpy.ops.render.render(write_still=True)

(output / "render-settings.json").write_text(json.dumps({
    "engine": "Blender Cycles", "samples": args.samples, "denoise": "OpenImageDenoise RGB+Albedo+Normal",
    "noiseThreshold": 0.006, "frames": args.frames, "size": args.size,
    "pitch": 51.4, "yawStart": -45.4, "roll": -24,
    "note": "Actual GLB cavity geometry; offline traced transmission, not baked highlights.",
}, indent=2) + "\n")
