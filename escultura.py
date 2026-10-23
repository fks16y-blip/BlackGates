from pathlib import Path
from datetime import datetime
import shutil, sys

p = Path("public/js/main.js")
s = p.read_text()
a = s.find("// BLACK GATES - PERSONAGEM LOW POLY")
b = s.find("// INTERFACE MOBILE", a)

if a < 0 or b < 0:
    sys.exit("Nao encontrei o bloco do personagem. Nada alterado.")

backup = p.with_name("main.js.backup-escultura-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
shutil.copy2(p, backup)

novo = r'''
// BLACK GATES - MANEQUIM ANATOMICO ESCULPIDO
const player = new THREE.Group();
scene.add(player);

const skinMat = new THREE.MeshStandardMaterial({
  color: 0xb98260, roughness: 0.78, metalness: 0
});
const skinShade = new THREE.MeshStandardMaterial({
  color: 0xa66f50, roughness: 0.84
});

function smoothPart(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function oval(parent, material, x, y, z, rx, ry, rz, n=24) {
  const mesh = smoothPart(parent,
    new THREE.SphereGeometry(1, n, 16), material, x, y, z);
  mesh.scale.set(rx, ry, rz);
  return mesh;
}
function tapered(parent, material, top, bottom, length, x, y, z) {
  return smoothPart(parent,
    new THREE.CylinderGeometry(top, bottom, length, 20, 4),
    material, x, y, z);
}

// Tronco esculpido com peito largo e cintura estreita.
const torsoProfile = [
  new THREE.Vector2(0.10,0), new THREE.Vector2(0.14,0.04),
  new THREE.Vector2(0.15,0.13), new THREE.Vector2(0.165,0.23),
  new THREE.Vector2(0.19,0.32), new THREE.Vector2(0.22,0.41),
  new THREE.Vector2(0.22,0.47), new THREE.Vector2(0.19,0.53),
  new THREE.Vector2(0.12,0.57), new THREE.Vector2(0.07,0.58),
  new THREE.Vector2(0,0.58)
];
const torso = smoothPart(player,
  new THREE.LatheGeometry(torsoProfile, 40), skinMat, 0, 0.99, 0);
torso.scale.set(1, 1, 0.80);

// Peitorais, abdome e musculos laterais.
oval(player, skinMat,-0.105,1.405,-0.105,0.105,0.073,0.045,28);
oval(player, skinMat, 0.105,1.405,-0.105,0.105,0.073,0.045,28);
for (let i=0; i<3; i++) {
  const y=1.315-i*0.075;
  oval(player,skinMat,-0.047,y,-0.126,0.054,0.031,0.023,24);
  oval(player,skinMat, 0.047,y,-0.126,0.054,0.031,0.023,24);
}
oval(player,skinShade,0,1.14,-0.112,0.008,0.014,0.005,16);
oval(player,skinMat,-0.157,1.30,-0.015,0.032,0.105,0.045,20);
oval(player,skinMat, 0.157,1.30,-0.015,0.032,0.105,0.045,20);

// Quadril e gluteos.
oval(player,skinMat,0,0.91,0,0.158,0.112,0.112,28);
oval(player,skinMat,-0.073,0.89,0.035,0.086,0.092,0.083,24);
oval(player,skinMat, 0.073,0.89,0.035,0.086,0.092,0.083,24);

// Pescoco e cabeca lisa: sem rosto nem cabelo.
tapered(player,skinMat,0.061,0.070,0.14,0,1.585,0);
oval(player,skinMat,0,1.765,0,0.119,0.148,0.105,32);

// Bracos articulados, ombros e biceps.
function makeArm(x) {
  const upper=new THREE.Group();
  upper.position.set(x*0.91,1.465,0);
  player.add(upper);
  oval(upper,skinMat,0,-0.025,0,0.078,0.080,0.073,28);
  oval(upper,skinMat,0,-0.105,-0.006,0.052,0.105,0.050,24);
  tapered(upper,skinMat,0.055,0.043,0.19,0,-0.145,0);

  const elbow=new THREE.Group();
  elbow.position.set(0,-0.235,0);
  upper.add(elbow);
  oval(elbow,skinMat,0,0,0,0.043,0.046,0.041,24);
  oval(elbow,skinMat,0,-0.085,-0.006,0.039,0.092,0.037,24);
  tapered(elbow,skinMat,0.040,0.029,0.17,0,-0.13,0);

  const hand=new THREE.Group();
  hand.position.set(0,-0.215,0);
  elbow.add(hand);
  oval(hand,skinMat,0,-0.025,-0.002,0.032,0.043,0.024,20);
  for(let i=0;i<4;i++)
    tapered(hand,skinMat,0.007,0.005,0.042,(i-1.5)*0.014,-0.063,-0.004);
  oval(hand,skinMat,x<0?0.029:-0.029,-0.025,-0.012,0.009,0.022,0.009,16);
  return {upper,elbow};
}
const leftArmRig=makeArm(-0.255);
const rightArmRig=makeArm(0.255);
const leftArm=leftArmRig.upper;
const rightArm=rightArmRig.upper;
const leftElbow=leftArmRig.elbow;
const rightElbow=rightArmRig.elbow;

// Pernas com coxas, joelhos e panturrilhas.
function makeLeg(x) {
  const upper=new THREE.Group();
  upper.position.set(x,0.84,0);
  player.add(upper);
  oval(upper,skinMat,0,-0.055,0,0.080,0.125,0.073,28);
  oval(upper,skinMat,0,-0.19,-0.012,0.063,0.145,0.060,24);
  tapered(upper,skinMat,0.067,0.047,0.24,0,-0.205,0);

  const knee=new THREE.Group();
  knee.position.set(0,-0.34,0);
  upper.add(knee);
  oval(knee,skinMat,0,0,-0.005,0.047,0.054,0.046,24);
  oval(knee,skinMat,0,-0.115,0.012,0.041,0.112,0.042,24);
  tapered(knee,skinMat,0.041,0.029,0.18,0,-0.17,0);
  oval(knee,skinMat,0,-0.275,-0.027,0.037,0.038,0.070,22);
  oval(knee,skinMat,0,-0.302,-0.055,0.043,0.022,0.060,22);
  return {upper,knee};
}
const leftLegRig=makeLeg(-0.095);
const rightLegRig=makeLeg(0.095);
const leftLeg=leftLegRig.upper;
const rightLeg=rightLegRig.upper;
const leftKnee=leftLegRig.knee;
const rightKnee=rightLegRig.knee;

'''
p.write_text(s[:a]+novo+s[b:])
print("Escultura aplicada. Backup:", backup)
