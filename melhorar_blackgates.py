from pathlib import Path

p = Path("public/js/main.js")
s = p.read_text()

start = s.find("// PERSONAGEM LOW POLY COM PROPORCOES HUMANAS")
if start < 0:
    start = s.find("// PERSONAGEM LOW POLY - BLACK GATES")
if start < 0:
    start = s.find("// PERSONAGEM HUMANOIDE MELHORADO")
if start < 0:
    start = s.find("// PERSONAGEM HUMANOIDE FEITO DE PECAS 3D")

end = s.find("// INTERFACE MOBILE", start)

if start < 0 or end < 0:
    raise SystemExit("Nao encontrei a secao do personagem. Arquivo original preservado.")

new = r'''// BLACK GATES - PERSONAGEM LOW POLY REFINADO
const player = new THREE.Group();
scene.add(player);

const skinMat = new THREE.MeshStandardMaterial({color: 0xb98260, flatShading: true, roughness: 0.92});
const skinShade = new THREE.MeshStandardMaterial({color: 0x986344, flatShading: true});
const shirtMat = new THREE.MeshStandardMaterial({color: 0x2468b4, flatShading: true, roughness: 0.95});
const shirtDark = new THREE.MeshStandardMaterial({color: 0x194b80, flatShading: true});
const shirtLight = new THREE.MeshStandardMaterial({color: 0x4385c6, flatShading: true});
const pantsMat = new THREE.MeshStandardMaterial({color: 0x252d3a, flatShading: true, roughness: 1});
const pantsLight = new THREE.MeshStandardMaterial({color: 0x374354, flatShading: true});
const shoeMat = new THREE.MeshStandardMaterial({color: 0x17191e, flatShading: true});
const soleMat = new THREE.MeshStandardMaterial({color: 0x777d84, flatShading: true});
const hairMat = new THREE.MeshStandardMaterial({color: 0x30231e, flatShading: true});
const hairLight = new THREE.MeshStandardMaterial({color: 0x493329, flatShading: true});
const eyeWhite = new THREE.MeshStandardMaterial({color: 0xf0e8dc, flatShading: true});
const eyeDark = new THREE.MeshStandardMaterial({color: 0x29201b, flatShading: true});

function part(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function box(parent, material, w, h, d, x, y, z) {
  return part(parent, new THREE.BoxGeometry(w, h, d), material, x, y, z);
}
function ball(parent, material, x, y, z, rx, ry, rz, detail = 0) {
  const mesh = part(parent, new THREE.IcosahedronGeometry(1, detail), material, x, y, z);
  mesh.scale.set(rx, ry, rz);
  return mesh;
}
function bone(parent, material, top, bottom, length, x, y, z) {
  return part(parent, new THREE.CylinderGeometry(top, bottom, length, 7, 1), material, x, y, z);
}

// Peito, cintura e quadril com proporcoes humanas
bone(player, shirtMat, 0.235, 0.185, 0.39, 0, 1.37, 0);
bone(player, shirtMat, 0.185, 0.15, 0.24, 0, 1.075, 0);
bone(player, pantsMat, 0.17, 0.16, 0.18, 0, 0.855, 0);

// Gola e detalhes da roupa
bone(player, shirtDark, 0.073, 0.073, 0.025, 0, 1.57, -0.012);
box(player, shirtLight, 0.025, 0.19, 0.008, 0, 1.365, -0.197);
box(player, shirtDark, 0.105, 0.025, 0.012, 0, 1.20, -0.189);

// Pescoco e cabeca
bone(player, skinMat, 0.059, 0.065, 0.105, 0, 1.625, 0);
ball(player, skinMat, 0, 1.79, 0, 0.124, 0.151, 0.112, 1);

// Cabelo facetado
ball(player, hairMat, 0, 1.895, 0.012, 0.13, 0.065, 0.12, 1);
ball(player, hairLight, -0.045, 1.91, -0.018, 0.065, 0.035, 0.095, 0);
ball(player, hairMat, 0.095, 1.85, 0.025, 0.035, 0.09, 0.09, 0);
ball(player, hairMat, -0.095, 1.85, 0.025, 0.035, 0.09, 0.09, 0);

// Orelhas, olhos, sobrancelhas e nariz
ball(player, skinMat, -0.124, 1.785, 0, 0.025, 0.035, 0.025);
ball(player, skinMat, 0.124, 1.785, 0, 0.025, 0.035, 0.025);
box(player, hairMat, 0.045, 0.012, 0.012, -0.046, 1.817, -0.101);
box(player, hairMat, 0.045, 0.012, 0.012, 0.046, 1.817, -0.101);
ball(player, eyeWhite, -0.046, 1.795, -0.104, 0.022, 0.015, 0.009);
ball(player, eyeWhite, 0.046, 1.795, -0.104, 0.022, 0.015, 0.009);
ball(player, eyeDark, -0.046, 1.795, -0.113, 0.009, 0.011, 0.005);
ball(player, eyeDark, 0.046, 1.795, -0.113, 0.009, 0.011, 0.005);
ball(player, skinShade, 0, 1.758, -0.108, 0.019, 0.024, 0.022);
ball(player, skinMat, 0, 1.765, -0.12, 0.014, 0.016, 0.014);
box(player, skinShade, 0.035, 0.006, 0.008, 0, 1.722, -0.105);

// Bracos com mangas, cotovelos, antebracos e dedos
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 1.49, 0);
  player.add(upper);
  ball(upper, shirtMat, 0, -0.015, 0, 0.09, 0.09, 0.09);
  bone(upper, shirtMat, 0.066, 0.078, 0.19, 0, -0.12, 0);
  bone(upper, shirtDark, 0.071, 0.067, 0.045, 0, -0.22, 0);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.245, 0);
  upper.add(elbow);
  ball(elbow, skinMat, 0, 0, 0, 0.052, 0.055, 0.052);
  bone(elbow, skinMat, 0.043, 0.052, 0.22, 0, -0.12, 0);

  const hand = new THREE.Group();
  hand.position.set(0, -0.245, -0.004);
  elbow.add(hand);
  ball(hand, skinMat, 0, -0.025, 0, 0.046, 0.052, 0.031);
  for (let i = 0; i < 4; i++) {
    bone(hand, skinMat, 0.009, 0.011, 0.052, (i - 1.5) * 0.022, -0.075, -0.004);
  }
  bone(hand, skinMat, 0.011, 0.013, 0.045, x < 0 ? 0.05 : -0.05, -0.035, -0.018);
  return {upper, elbow};
}
const leftArmRig = makeArm(-0.255);
const rightArmRig = makeArm(0.255);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

// Pernas, joelhos e sapatos
function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.79, 0);
  player.add(upper);
  bone(upper, pantsMat, 0.087, 0.103, 0.34, 0, -0.17, 0);
  bone(upper, pantsLight, 0.092, 0.092, 0.035, 0, -0.32, -0.003);

  const knee = new THREE.Group();
  knee.position.set(0, -0.35, 0);
  upper.add(knee);
  ball(knee, pantsMat, 0, 0, 0, 0.071, 0.071, 0.073);
  bone(knee, pantsMat, 0.052, 0.071, 0.31, 0, -0.155, 0);
  box(knee, shoeMat, 0.125, 0.085, 0.205, 0, -0.34, -0.038);
  box(knee, soleMat, 0.128, 0.022, 0.21, 0, -0.388, -0.038);
  box(knee, pantsLight, 0.105, 0.045, 0.055, 0, -0.315, 0.045);
  return {upper, knee};
}
const leftLegRig = makeLeg(-0.105);
const rightLegRig = makeLeg(0.105);
const leftLeg = leftLegRig.upper;
const rightLeg = rightLegRig.upper;
const leftKnee = leftLegRig.knee;
const rightKnee = rightLegRig.knee;

'''
s = s[:start] + new + s[end:]

# Inserir articulacoes na animacao existente, sem duplicar.
if "leftElbow.rotation.x" not in s:
    old = """    leftArm.rotation.x = -swing * 0.7;
    rightArm.rotation.x = swing * 0.7;
  } else {
    leftLeg.rotation.x *= 0.8;
    rightLeg.rotation.x *= 0.8;
    leftArm.rotation.x *= 0.8;
    rightArm.rotation.x *= 0.8;"""
    new_anim = """    leftArm.rotation.x = -swing * 0.7;
    rightArm.rotation.x = swing * 0.7;
    leftElbow.rotation.x = 0.08 + Math.max(0, swing) * 0.30;
    rightElbow.rotation.x = 0.08 + Math.max(0, -swing) * 0.30;
    leftKnee.rotation.x = Math.max(0, -swing) * 0.50;
    rightKnee.rotation.x = Math.max(0, swing) * 0.50;
  } else {
    leftLeg.rotation.x *= 0.8;
    rightLeg.rotation.x *= 0.8;
    leftArm.rotation.x *= 0.8;
    rightArm.rotation.x *= 0.8;
    leftElbow.rotation.x *= 0.8;
    rightElbow.rotation.x *= 0.8;
    leftKnee.rotation.x *= 0.8;
    rightKnee.rotation.x *= 0.8;"""
    if old in s:
        s = s.replace(old, new_anim, 1)
    else:
        print("Aviso: nao achei o trecho de animacao esperado; mantive a animacao existente.")

p.write_text(s)
print("Personagem Low Poly refinado aplicado.")
