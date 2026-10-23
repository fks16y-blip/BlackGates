from pathlib import Path
from datetime import datetime
import shutil

p = Path("public/js/main.js")
s = p.read_text()

start = s.find("// BLACK GATES - PERSONAGEM LOW POLY REFINADO")
end = s.find("// INTERFACE MOBILE", start)

if start < 0 or end < 0:
    raise SystemExit("Nao encontrei os limites do personagem. Nada foi alterado.")

backup = p.with_name("main.js.backup-malha-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
shutil.copy2(p, backup)

new = r'''// BLACK GATES - PERSONAGEM LOW POLY COM VOLUMES SUAVIZADOS
const player = new THREE.Group();
scene.add(player);

const skinMat = new THREE.MeshStandardMaterial({
  color: 0xb98260, roughness: 0.88
});
const skinShade = new THREE.MeshStandardMaterial({
  color: 0x986344, roughness: 0.92
});
const shirtMat = new THREE.MeshStandardMaterial({
  color: 0x2468b4, roughness: 0.9
});
const shirtDark = new THREE.MeshStandardMaterial({
  color: 0x194b80, roughness: 0.95
});
const shirtLight = new THREE.MeshStandardMaterial({
  color: 0x4385c6, roughness: 0.9
});
const pantsMat = new THREE.MeshStandardMaterial({
  color: 0x252d3a, roughness: 0.96
});
const pantsLight = new THREE.MeshStandardMaterial({
  color: 0x374354, roughness: 0.95
});
const shoeMat = new THREE.MeshStandardMaterial({
  color: 0x17191e, roughness: 0.95
});
const soleMat = new THREE.MeshStandardMaterial({
  color: 0x777d84, roughness: 0.95
});
const hairMat = new THREE.MeshStandardMaterial({
  color: 0x30231e, roughness: 1
});
const hairLight = new THREE.MeshStandardMaterial({
  color: 0x493329, roughness: 1
});
const eyeWhite = new THREE.MeshStandardMaterial({color: 0xf0e8dc});
const eyeDark = new THREE.MeshStandardMaterial({color: 0x29201b});

function smoothPart(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function oval(parent, material, x, y, z, rx, ry, rz, segments = 16) {
  const mesh = smoothPart(
    parent,
    new THREE.SphereGeometry(1, segments, Math.max(10, Math.floor(segments * 0.7))),
    material, x, y, z
  );
  mesh.scale.set(rx, ry, rz);
  return mesh;
}

function roundedBox(parent, material, w, h, d, x, y, z) {
  return smoothPart(parent, new THREE.BoxGeometry(w, h, d), material, x, y, z);
}

function tapered(parent, material, top, bottom, length, x, y, z) {
  return smoothPart(
    parent,
    new THREE.CylinderGeometry(top, bottom, length, 12, 3, false),
    material, x, y, z
  );
}

// Tronco com perfil continuo: peito, cintura e abdome
const torsoProfile = [
  new THREE.Vector2(0.105, 0.00),
  new THREE.Vector2(0.145, 0.045),
  new THREE.Vector2(0.158, 0.13),
  new THREE.Vector2(0.175, 0.23),
  new THREE.Vector2(0.205, 0.34),
  new THREE.Vector2(0.225, 0.43),
  new THREE.Vector2(0.205, 0.51),
  new THREE.Vector2(0.15, 0.56),
  new THREE.Vector2(0.09, 0.57),
  new THREE.Vector2(0.00, 0.57)
];
const torsoGeometry = new THREE.LatheGeometry(torsoProfile, 24);
const torso = smoothPart(player, torsoGeometry, shirtMat, 0, 1.00, 0);
torso.scale.set(1, 1, 0.76);

// Quadril integrado visualmente à cintura
oval(player, pantsMat, 0, 0.91, 0, 0.177, 0.13, 0.132, 20);

// Gola macia e detalhes discretos da camisa
oval(player, shirtDark, 0, 1.555, -0.003, 0.078, 0.035, 0.07, 16);
roundedBox(player, shirtLight, 0.018, 0.20, 0.009, 0, 1.34, -0.171);
roundedBox(player, shirtDark, 0.105, 0.022, 0.012, 0, 1.19, -0.168);

// Pescoço e cabeça com mandíbula mais natural
tapered(player, skinMat, 0.062, 0.071, 0.12, 0, 1.615, 0);
oval(player, skinMat, 0, 1.785, 0, 0.124, 0.151, 0.108, 24);
oval(player, skinMat, 0, 1.716, -0.009, 0.083, 0.061, 0.083, 20);

// Cabelo como uma massa principal, com franja e laterais
oval(player, hairMat, 0, 1.888, 0.018, 0.132, 0.071, 0.119, 20);
oval(player, hairLight, -0.038, 1.916, -0.024, 0.075, 0.035, 0.085, 16);
oval(player, hairMat, 0.091, 1.841, 0.022, 0.036, 0.081, 0.087, 16);
oval(player, hairMat, -0.091, 1.841, 0.022, 0.036, 0.081, 0.087, 16);
oval(player, hairLight, 0.018, 1.867, -0.09, 0.064, 0.032, 0.035, 16);

// Orelhas, olhos, sobrancelhas e nariz
oval(player, skinMat, -0.123, 1.78, 0, 0.023, 0.033, 0.024, 12);
oval(player, skinMat, 0.123, 1.78, 0, 0.023, 0.033, 0.024, 12);
oval(player, eyeWhite, -0.044, 1.795, -0.099, 0.023, 0.015, 0.01, 12);
oval(player, eyeWhite, 0.044, 1.795, -0.099, 0.023, 0.015, 0.01, 12);
oval(player, eyeDark, -0.044, 1.795, -0.108, 0.009, 0.011, 0.006, 12);
oval(player, eyeDark, 0.044, 1.795, -0.108, 0.009, 0.011, 0.006, 12);
oval(player, hairMat, -0.045, 1.817, -0.098, 0.028, 0.008, 0.009, 12);
oval(player, hairMat, 0.045, 1.817, -0.098, 0.028, 0.008, 0.009, 12);
oval(player, skinShade, 0, 1.76, -0.103, 0.016, 0.021, 0.021, 12);
oval(player, skinMat, 0, 1.765, -0.115, 0.014, 0.015, 0.014, 12);
oval(player, skinShade, 0, 1.724, -0.094, 0.031, 0.005, 0.006, 12);

// Bracos com mangas arredondadas e articulacoes preservadas
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 1.475, 0);
  player.add(upper);

  oval(upper, shirtMat, 0, -0.025, 0, 0.088, 0.105, 0.087, 18);
  oval(upper, shirtMat, 0, -0.115, 0, 0.069, 0.112, 0.067, 18);
  oval(upper, shirtDark, 0, -0.205, 0, 0.069, 0.025, 0.068, 16);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.235, 0);
  upper.add(elbow);
  oval(elbow, skinMat, 0, 0, 0, 0.052, 0.057, 0.052, 16);
  oval(elbow, skinMat, 0, -0.105, 0, 0.047, 0.105, 0.046, 18);
  oval(elbow, skinMat, 0, -0.202, -0.003, 0.044, 0.047, 0.033, 16);

  const fingers = new THREE.Group();
  fingers.position.set(0, -0.225, -0.004);
  elbow.add(fingers);
  for (let i = 0; i < 4; i++) {
    oval(fingers, skinMat, (i - 1.5) * 0.019, -0.028, -0.005,
      0.009, 0.033, 0.009, 10);
  }
  oval(fingers, skinMat, x < 0 ? 0.042 : -0.042, -0.005, -0.018,
    0.012, 0.028, 0.012, 10);
  return {upper, elbow};
}

const leftArmRig = makeArm(-0.255);
const rightArmRig = makeArm(0.255);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

// Pernas arredondadas com transicao entre coxas e canelas
function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.80, 0);
  player.add(upper);

  oval(upper, pantsMat, 0, -0.105, 0, 0.092, 0.205, 0.093, 18);
  oval(upper, pantsMat, 0, -0.245, 0, 0.073, 0.125, 0.076, 18);

  const knee = new THREE.Group();
  knee.position.set(0, -0.355, 0);
  upper.add(knee);
  oval(knee, pantsMat, 0, 0, 0, 0.069, 0.075, 0.071, 16);
  oval(knee, pantsMat, 0, -0.13, 0.003, 0.061, 0.15, 0.065, 18);
  oval(knee, pantsLight, 0, -0.245, 0.004, 0.061, 0.052, 0.064, 16);

  // Sapato com ponta e sola, em vez de um bloco duro
  oval(knee, shoeMat, 0, -0.342, -0.045, 0.066, 0.051, 0.105, 18);
  oval(knee, soleMat, 0, -0.378, -0.045, 0.067, 0.017, 0.107, 18);
  oval(knee, pantsLight, 0, -0.307, -0.065, 0.034, 0.014, 0.042, 12);

  return {upper, knee};
}

const leftLegRig = makeLeg(-0.105);
const rightLegRig = makeLeg(0.105);
const leftLeg = leftLegRig.upper;
const rightLeg = rightLegRig.upper;
const leftKnee = leftLegRig.knee;
const rightKnee = rightLegRig.knee;

'''
p.write_text(s[:start] + new + s[end:])
print("Modelo reconstruido. Backup:", backup.name)
