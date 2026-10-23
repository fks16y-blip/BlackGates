from pathlib import Path
from datetime import datetime
import shutil

p = Path("public/js/main.js")
s = p.read_text()

arm_start = "// Bracos com mangas arredondadas e articulacoes preservadas"
leg_start = "// Pernas arredondadas com transicao entre coxas e canelas"
mobile_start = "// INTERFACE MOBILE"

a = s.find(arm_start)
b = s.find(leg_start)
c = s.find(mobile_start)

if min(a, b, c) < 0 or not (a < b < c):
    raise SystemExit("Nao encontrei as secoes esperadas. Nenhuma alteracao feita.")

backup = p.with_name("main.js.backup-esguio-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
shutil.copy2(p, backup)

# Afinar o tronco e reduzir o quadril arredondado
s = s.replace("torso.scale.set(1, 1, 0.76);",
              "torso.scale.set(0.88, 1, 0.70);", 1)
s = s.replace(
    "oval(player, pantsMat, 0, 0.91, 0, 0.177, 0.13, 0.132, 20);",
    "oval(player, pantsMat, 0, 0.91, 0, 0.15, 0.105, 0.112, 20);",
    1
)

arms = r'''// Bracos esguios com mangas e articulacoes discretas
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 1.475, 0);
  player.add(upper);

  tapered(upper, shirtMat, 0.061, 0.047, 0.205, 0, -0.115, 0);
  oval(upper, shirtMat, 0, -0.025, 0, 0.064, 0.07, 0.061, 14);
  tapered(upper, shirtDark, 0.049, 0.047, 0.025, 0, -0.22, 0);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.235, 0);
  upper.add(elbow);

  tapered(elbow, skinMat, 0.041, 0.033, 0.205, 0, -0.105, 0);
  oval(elbow, skinMat, 0, 0, 0, 0.038, 0.039, 0.038, 12);

  const hand = new THREE.Group();
  hand.position.set(0, -0.215, -0.003);
  elbow.add(hand);
  oval(hand, skinMat, 0, -0.025, 0, 0.034, 0.043, 0.025, 12);

  for (let i = 0; i < 4; i++) {
    tapered(hand, skinMat, 0.008, 0.006, 0.045,
      (i - 1.5) * 0.016, -0.064, -0.002);
  }
  oval(hand, skinMat, x < 0 ? 0.033 : -0.033,
    -0.025, -0.012, 0.009, 0.025, 0.009, 10);

  return {upper, elbow};
}

const leftArmRig = makeArm(-0.245);
const rightArmRig = makeArm(0.245);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

'''

legs = r'''// Pernas esguias: volumes alongados em vez de varias bolas
function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.80, 0);
  player.add(upper);

  tapered(upper, pantsMat, 0.073, 0.052, 0.34, 0, -0.17, 0);

  const knee = new THREE.Group();
  knee.position.set(0, -0.35, 0);
  upper.add(knee);

  oval(knee, pantsMat, 0, 0, 0, 0.052, 0.055, 0.054, 12);
  tapered(knee, pantsMat, 0.052, 0.041, 0.29, 0, -0.145, 0);

  // Sapato discreto, com sola fina
  roundedBox(knee, shoeMat, 0.105, 0.065, 0.17, 0, -0.325, -0.035);
  roundedBox(knee, soleMat, 0.108, 0.012, 0.174, 0, -0.361, -0.035);

  return {upper, knee};
}

const leftLegRig = makeLeg(-0.105);
const rightLegRig = makeLeg(0.105);
const leftLeg = leftLegRig.upper;
const rightLeg = rightLegRig.upper;
const leftKnee = leftLegRig.knee;
const rightKnee = rightLegRig.knee;

'''

s = s[:a] + arms + legs + s[c:]
p.write_text(s)
print("Modelo mais esguio aplicado.")
print("Backup:", backup.name)
