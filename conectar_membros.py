from pathlib import Path
from datetime import datetime
import shutil

p = Path("public/js/main.js")
s = p.read_text()

a = s.find("// Bracos esguios com mangas e articulacoes discretas")
b = s.find("// INTERFACE MOBILE", a)

if a < 0 or b < 0:
    raise SystemExit("Nao encontrei a secao esperada. Nada foi alterado.")

backup = p.with_name(
    "main.js.backup-juncoes-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)

# Amplia discretamente a parte superior do tronco.
s = s.replace(
    "torso.scale.set(0.88, 1, 0.70);",
    "torso.scale.set(0.96, 1, 0.76);",
    1
)

# Reposiciona e substitui os membros por versões com junções sobrepostas.
new = r'''// Membros conectados visualmente ao tronco
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x * 0.91, 1.475, 0);
  player.add(upper);

  // Ombro arredondado e manga que se sobrepoe ao peito
  oval(upper, shirtMat, 0, -0.025, 0, 0.078, 0.085, 0.075, 16);
  tapered(upper, shirtMat, 0.066, 0.047, 0.21, 0, -0.12, 0);
  oval(upper, shirtDark, 0, -0.218, 0, 0.05, 0.025, 0.05, 14);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.235, 0);
  upper.add(elbow);

  // Cotovelo e antebraco se sobrepoem para evitar frestas
  oval(elbow, skinMat, 0, 0.005, 0, 0.044, 0.047, 0.043, 14);
  tapered(elbow, skinMat, 0.044, 0.034, 0.215, 0, -0.105, 0);
  oval(elbow, skinMat, 0, -0.205, -0.003, 0.038, 0.044, 0.032, 12);

  const hand = new THREE.Group();
  hand.position.set(0, -0.215, -0.003);
  elbow.add(hand);
  oval(hand, skinMat, 0, -0.025, 0, 0.034, 0.043, 0.026, 12);

  for (let i = 0; i < 4; i++) {
    tapered(hand, skinMat, 0.008, 0.006, 0.045,
      (i - 1.5) * 0.016, -0.064, -0.002);
  }
  oval(hand, skinMat, x < 0 ? 0.032 : -0.032,
    -0.025, -0.012, 0.009, 0.024, 0.009, 10);

  return {upper, elbow};
}

const leftArmRig = makeArm(-0.255);
const rightArmRig = makeArm(0.255);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

// Pernas ligadas ao quadril, com coxas mais largas no topo
function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.82, 0);
  player.add(upper);

  oval(upper, pantsMat, 0, -0.035, 0, 0.079, 0.12, 0.073, 16);
  tapered(upper, pantsMat, 0.074, 0.051, 0.32, 0, -0.17, 0);

  const knee = new THREE.Group();
  knee.position.set(0, -0.34, 0);
  upper.add(knee);

  oval(knee, pantsMat, 0, 0, 0, 0.053, 0.058, 0.054, 14);
  tapered(knee, pantsMat, 0.052, 0.041, 0.29, 0, -0.145, 0);
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
s = s[:a] + new + s[b:]
p.write_text(s)

print("Juncoes dos membros ajustadas.")
print("Backup:", backup.name)
