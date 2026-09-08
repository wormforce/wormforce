"""Bake only view-independent cavity shading; keep glass view-dependent."""
from pathlib import Path
import bpy
import sys

root = Path(__file__).resolve().parents[1]
detail = "--detail" in sys.argv
output = root / "public/battuta/community/hero" / ("hybrid-detail" if detail else "hybrid")
output.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root / "public/battuta/community/hero/mx-switch.glb"))
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 128
scene.render.threads_mode = "FIXED"
scene.render.threads = 6
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for device in prefs.devices:
        device.use = device.type == "METAL"
    if any(device.use for device in prefs.devices):
        scene.cycles.device = "GPU"
except Exception:
    pass
meshes = [obj for obj in scene.objects if obj.type == "MESH"]
for obj in meshes:
    # Glass should not become an opaque occluder in an ambient-occlusion bake.
    obj.hide_render = "housing" in obj.name.lower()
targets = [obj for obj in meshes if obj.name.lower() in ("stem", "clicker") or (detail and "housing" in obj.name.lower())]
for obj in targets:
    is_housing = "housing" in obj.name.lower()
    obj.hide_render = False
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    if not is_housing:
        bevel = obj.modifiers.new("Small injection-moulded edge radii", "BEVEL")
        bevel.width = 0.00004
        bevel.segments = 3
        bevel.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=bevel.name)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=1.1519, island_margin=0.035)
    bpy.ops.object.mode_set(mode="OBJECT")
    material = bpy.data.materials.new(obj.name + " cavity bake")
    material.use_nodes = True
    obj.data.materials.clear()
    obj.data.materials.append(material)
    nodes = material.node_tree.nodes
    nodes.clear()
    ao = nodes.new("ShaderNodeAmbientOcclusion")
    ao.inputs["Distance"].default_value = 0.00065 if is_housing else 0.0015
    # Glass gets short-range cavity detail, not opaque shadows from everything
    # behind it. Its transmission and reflections remain view-dependent at runtime.
    ao.only_local = is_housing
    ao.samples = 32
    emission = nodes.new("ShaderNodeEmission")
    target = nodes.new("ShaderNodeOutputMaterial")
    material.node_tree.links.new(ao.outputs["Color"], emission.inputs["Color"])
    material.node_tree.links.new(emission.outputs[0], target.inputs["Surface"])
    image = bpy.data.images.new(obj.name + " AO", width=512, height=512, alpha=False)
    image.colorspace_settings.name = "Non-Color"
    image.generated_color = (1, 1, 1, 1)
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = image
    nodes.active = texture
    scene.render.bake.margin = 12
    scene.render.bake.use_clear = True
    bpy.ops.object.bake(type="EMIT")
    image.filepath_raw = str(output / (obj.name + "-ao.png"))
    image.file_format = "PNG"
    image.save()
    obj.hide_render = is_housing
    print("BAKED", obj.name, flush=True)
for obj in meshes:
    obj.hide_render = False
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(output / "switch-baked.glb"), export_format="GLB", use_selection=True, export_materials="NONE")
print("Hybrid GLB and AO textures complete", flush=True)
