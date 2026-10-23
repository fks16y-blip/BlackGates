from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

p = Path("public/js/main.js")
s = p.read_text()

if "MarchingCubes" in s:
    print("A pele MarchingCubes já foi adicionada. Nada alterado.")
    sys.exit(0)

marker = "// INTERFACE MOBILE"
if s.count(marker) != 1:
    print("ERRO: não encontrei o marcador único da interface mobile.")
    sys.exit(1)

if "const leftKnee = leftLegRig.knee;" not in s:
    print("ERRO: não encontrei as articulações esperadas.")
    sys.exit(1)

backup = Path("public/js/main.js.backup-pele-" +
              datetime.now().strftime("%Y%m%d-%H%M%S"))
shutil.copy2(p, backup)

s = s.replace(
    "import * as THREE from 'three';",
    "import * as THREE from 'three';\n"
    "import { MarchingCubes } from "
    "'three/addons/objects/MarchingCubes.js';",
    1
)

skin_code = r'''
// BLACK GATES - PELE ORGANICA CONTINUA
// Os grupos existentes continuam controlando a caminhada.
const skinMaterial = new THREE.MeshStandardMaterial({
  color: 0xb98260,
  roughness: 0.82,
  metalness: 0,
  flatShading: false
});

// Esconde as pecas antigas sem remover os grupos usados pela animacao.
player.traverse((obj) => {
  if (obj.isMesh) obj.visible = false;
});

const skinSurface = new MarchingCubes(
  28, skinMaterial, false, false, 12000
);
skinSurface.position.set(0, 1, 0);
skinSurface.scale.set(2.4, 2.4, 2.4);
skinSurface.isolation = 80;
skinSurface.enableUvs = false;
skinSurface.enableColors = false;
skinSurface.frustumCulled = false;
player.add(skinSurface);

const skinTemp = new THREE.Vector3();

function addSkinBall(x, y, z, strength) {
  const size = skinSurface.scale;
  const nx = 0.5 + x / size.x;
  const ny = 0.5 + (y - skinSurface.position.y) / size.y;
  const nz = 0.5 + z / size.z;

  if (nx <= 0.03 || nx >= 0.97 ||
      ny <= 0.03 || ny >= 0.97 ||
      nz <= 0.03 || nz >= 0.97) return;

  skinSurface.addBall(nx, ny, nz, strength, 12);
}

function addSkinAt(object, offsetY, strength, offsetX = 0, offsetZ = 0) {
  skinTemp.set(offsetX, offsetY, offsetZ);
  object.localToWorld(skinTemp);
  player.worldToLocal(skinTemp);
  addSkinBall(skinTemp.x, skinTemp.y, skinTemp.z, strength);
}

function updateContinuousSkin() {
  player.updateMatrixWorld(true);
  skinSurface.reset();

  // Cabeca, pescoco e coluna.
  addSkinBall(0, 1.79, 0, 1.25);
  addSkinBall(0, 1.68, 0, 0.95);
  addSkinBall(0, 1.57, 0, 1.0);

  // Tronco e quadril: volumes sobrepostos formam uma so superficie.
  addSkinBall(0, 1.47, 0, 2.0);
  addSkinBall(0, 1.36, 0, 2.6);
  addSkinBall(0, 1.24, 0, 2.5);
  addSkinBall(0, 1.12, 0, 2.1);
  addSkinBall(0, 1.00, 0, 1.9);
  addSkinBall(0, 0.91, 0, 1.6);

  // Ombros, bracos, antebracos e maos acompanham as articulacoes.
  for (const arm of [leftArmRig, rightArmRig]) {
    addSkinAt(arm.upper, 0, 1.0);
    addSkinAt(arm.upper, -0.09, 0.72);
    addSkinAt(arm.upper, -0.17, 0.65);
    addSkinAt(arm.elbow, 0, 0.58);
    addSkinAt(arm.elbow, -0.08, 0.52);
    addSkinAt(arm.elbow, -0.16, 0.48);
    addSkinAt(arm.elbow, -0.23, 0.38);
  }

  // Coxas, joelhos e canelas seguem o movimento atual.
  for (const leg of [leftLegRig, rightLegRig]) {
    addSkinAt(leg.upper, 0, 0.95);
    addSkinAt(leg.upper, -0.10, 0.78);
    addSkinAt(leg.upper, -0.20, 0.68);
    addSkinAt(leg.knee, 0, 0.55);
    addSkinAt(leg.knee, -0.09, 0.52);
    addSkinAt(leg.knee, -0.18, 0.48);
    addSkinAt(leg.knee, -0.28, 0.42);
  }

  skinSurface.update();
}

updateContinuousSkin();
// FIM DA PELE ORGANICA CONTINUA

'''

s = s.replace(marker, skin_code + marker, 1)

render_marker = "  renderer.render(scene, camera);"
if s.count(render_marker) != 1:
    print("ERRO: nao encontrei o ponto unico de renderizacao.")
    shutil.copy2(backup, p)
    sys.exit(1)

s = s.replace(
    render_marker,
    "  updateContinuousSkin();\n" + render_marker,
    1
)

p.write_text(s)
print("Pele organica adicionada.")
print("Backup:", backup)
