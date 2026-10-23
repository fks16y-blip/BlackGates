from pathlib import Path
from datetime import datetime
import shutil
import sys

p = Path("public/js/main.js")
s = p.read_text()

start_marker = "// BLACK GATES - PERSONAGEM LOW POLY"
end_marker = "// INTERFACE MOBILE"

start = s.find(start_marker)
end = s.find(end_marker, start + 1)

if start < 0 or end < 0:
    print("ERRO: nao encontrei os limites do personagem.")
    sys.exit(1)

if "const leftArmRig" not in s[start:end] or "const leftLegRig" not in s[start:end]:
    print("ERRO: os grupos de animacao esperados nao foram encontrados.")
    sys.exit(1)

backup = Path(
    "public/js/main.js.backup-anatomia-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)

body = r'''// BLACK GATES - MANEQUIM HUMANO ANATOMICO
const player = new THREE.Group();
scene.add(player);

const skinMat = new THREE.MeshStandardMaterial({
  color: 0xb98260,
  roughness: 0.78,
  metalness: 0
});

function smoothPart(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function oval(parent, material, x, y, z, rx, ry, rz, segments = 24) {
  const mesh = smoothPart(
    parent,
    new THREE.SphereGeometry(1, segments, 16),
    material, x, y, z
  );
  mesh.scale.set(rx, ry, rz);
  return mesh;
}

function tapered(parent, material, top, bottom, length, x, y, z) {
  return smoothPart(
    parent,
    new THREE.CylinderGeometry(top, bottom, length, 16, 4, false),
    material, x, y, z
  );
}

// Tronco com perfil unico: ombros, peito, cintura e abdome.
const torsoProfile = [
  new THREE.Vector2(0.105, 0.00),
  new THREE.Vector2(0.145, 0.035),
  new THREE.Vector2(0.153, 0.12),
  new THREE.Vector2(0.166, 0.22),
  new THREE.Vector2(0.195, 0.34),
  new THREE.Vector2(0.218, 0.43),
  new THREE.Vector2(0.207, 0.50),
  new THREE.Vector2(0.16, 0.56),
  new THREE.Vector2(0.085, 0.59),
  new THREE.Vector2(0.00, 0.59)
];
const torso = smoothPart(
  player,
  new THREE.LatheGeometry(torsoProfile, 32),
  skinMat, 0, 0.98, 0
);
torso.scale.set(0.94, 1, 0.78);

// Quadril estreito e ligado visualmente ao tronco.
oval(player, skinMat, 0, 0.91, 0, 0.155, 0.115, 0.105, 24);

// Pescoço e cabeça.
tapered(player, skinMat, 0.061, 0.068, 0.13, 0, 1.575, 0);
oval(player, skinMat, 0, 1.755, 0, 0.119, 0.145, 0.105, 28);
oval(player, skinMat, 0, 1.692, -0.006, 0.078, 0.052, 0.078, 24);

// Orelhas e nariz discretos, feitos com a mesma pele.
oval(player, skinMat, -0.119, 1.755, 0, 0.019, 0.029, 0.021, 16);
oval(player, skinMat,  0.119, 1.755, 0, 0.019, 0.029, 0.021, 16);
oval(player, skinMat, 0, 1.755, -0.105, 0.014, 0.026, 0.018, 16);

// Bracos articulados, com sobreposicao discreta nas juntas.
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 1.465, 0);
  player.add(upper);

  oval(upper, skinMat, 0, -0.018, 0, 0.069, 0.075, 0.068, 20);
  tapered(upper, skinMat, 0.057, 0.043, 0.235, 0, -0.125, 0);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.245, 0);
  upper.add(elbow);

  oval(elbow, skinMat, 0, 0.005, 0, 0.041, 0.043, 0.040, 18);
  tapered(elbow, skinMat, 0.041, 0.030, 0.245, 0, -0.12, 0);

  const hand = new THREE.Group();
  hand.position.set(0, -0.235, 0);
  elbow.add(hand);
  oval(hand, skinMat, 0, -0.025, -0.002, 0.032, 0.045, 0.024, 18);

  return {upper, elbow};
}

const leftArmRig = makeArm(-0.235);
const rightArmRig = makeArm(0.235);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

// Pernas mais longas que o tronco, com coxas e canelas afuniladas.
function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.86, 0);
  player.add(upper);

  oval(upper, skinMat, 0, -0.045, 0, 0.077, 0.105, 0.071, 20);
  tapered(upper, skinMat, 0.069, 0.047, 0.37, 0, -0.19, 0);

  const knee = new THREE.Group();
  knee.position.set(0, -0.375, 0);
  upper.add(knee);

  oval(knee, skinMat, 0, 0, 0, 0.046, 0.052, 0.047, 18);
  tapered(knee, skinMat, 0.046, 0.032, 0.36, 0, -0.18, 0);

  // Pes fica proximo ao chao, sem sapatos ou roupas.
  oval(knee, skinMat, 0, -0.365, -0.035, 0.047, 0.035, 0.083, 20);

  return {upper, knee};
}

const leftLegRig = makeLeg(-0.095);
const rightLegRig = makeLeg(0.095);
const leftLeg = leftLegRig.upper;
const rightLeg = rightLegRig.upper;
const leftKnee = leftLegRig.knee;
const rightKnee = rightLegRig.knee;

'''

s = s[:start] + body + s[end:]

# Remove import antigo caso tenha ficado de uma tentativa anterior.
s = s.replace(
    "import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';\n",
    ""
)

p.write_text(s)
print("Personagem anatomico criado.")
print("Backup:", backup)
