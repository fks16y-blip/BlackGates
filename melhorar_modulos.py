from pathlib import Path
from datetime import datetime
import shutil, sys

p = Path("public/js/main.js")
s = p.read_text()

start = s.find("function makeArm(x) {")
end = s.find("// INTERFACE MOBILE", start)

if start < 0 or end < 0:
    sys.exit("Nao encontrei os limites esperados. Nada foi alterado.")

backup = p.with_name(
    "main.js.backup-musculos-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)

novo = r'''
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x * 0.91, 1.465, 0);
  player.add(upper);

  // Ombro e deltoide
  oval(upper, skinMat, 0, -0.025, 0, 0.078, 0.082, 0.073, 28);
  oval(upper, skinMat, 0, -0.075, -0.012, 0.057, 0.082, 0.052, 28);

  // Biceps e triceps como volumes separados
  oval(upper, skinMat, 0, -0.135, -0.031, 0.044, 0.087, 0.033, 28);
  oval(upper, skinMat, 0, -0.142, 0.030, 0.041, 0.083, 0.030, 28);
  tapered(upper, skinMat, 0.050, 0.038, 0.16, 0, -0.16, 0);

  // Cotovelo articulado
  const elbow = new THREE.Group();
  elbow.position.set(0, -0.235, 0);
  upper.add(elbow);
  oval(elbow, skinMat, 0, 0, 0, 0.043, 0.046, 0.042, 24);

  // Antebraco: braquiorradial e massa flexora
  oval(elbow, skinMat, 0, -0.075, -0.019, 0.035, 0.083, 0.030, 28);
  oval(elbow, skinMat, 0, -0.115, 0.018, 0.031, 0.076, 0.027, 28);
  tapered(elbow, skinMat, 0.038, 0.027, 0.15, 0, -0.13, 0);

  const hand = new THREE.Group();
  hand.position.set(0, -0.215, 0);
  elbow.add(hand);
  oval(hand, skinMat, 0, -0.025, 0, 0.032, 0.043, 0.024, 20);
  for (let i = 0; i < 4; i++) {
    tapered(hand, skinMat, 0.007, 0.005, 0.042,
      (i - 1.5) * 0.014, -0.063, -0.004);
  }
  oval(hand, skinMat, x < 0 ? 0.029 : -0.029,
    -0.025, -0.012, 0.009, 0.022, 0.009, 16);

  return { upper, elbow };
}

const leftArmRig = makeArm(-0.255);
const rightArmRig = makeArm(0.255);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.84, 0);
  player.add(upper);

  // Coxa e quadriceps
  oval(upper, skinMat, 0, -0.055, 0, 0.080, 0.125, 0.073, 28);
  oval(upper, skinMat, -0.025, -0.16, -0.035, 0.046, 0.112, 0.040, 28);
  oval(upper, skinMat, 0.027, -0.17, -0.025, 0.043, 0.105, 0.038, 28);

  // Isquiotibiais na parte posterior
  oval(upper, skinMat, 0, -0.17, 0.035, 0.052, 0.105, 0.038, 28);
  tapered(upper, skinMat, 0.066, 0.047, 0.20, 0, -0.21, 0);

  const knee = new THREE.Group();
  knee.position.set(0, -0.34, 0);
  upper.add(knee);

  // Patela e cabeca da articulacao
  oval(knee, skinMat, 0, 0, -0.008, 0.047, 0.054, 0.046, 24);
  oval(knee, skinMat, 0, 0, -0.041, 0.029, 0.034, 0.018, 20);

  // Panturrilha e musculo soleo
  oval(knee, skinMat, -0.012, -0.105, 0.018, 0.034, 0.096, 0.033, 28);
  oval(knee, skinMat, 0.015, -0.12, 0.022, 0.032, 0.087, 0.031, 28);
  tapered(knee, skinMat, 0.040, 0.027, 0.16, 0, -0.17, 0);

  // Pe e dedos
  oval(knee, skinMat, 0, -0.275, -0.027, 0.037, 0.038, 0.070, 22);
  oval(knee, skinMat, 0, -0.302, -0.055, 0.043, 0.022, 0.060, 22);

  return { upper, knee };
}

const leftLegRig = makeLeg(-0.095);
const rightLegRig = makeLeg(0.095);
const leftLeg = leftLegRig.upper;
const rightLeg = rightLegRig.upper;
const leftKnee = leftLegRig.knee;
const rightKnee = rightLegRig.knee;

'''

p.write_text(s[:start] + novo + s[end:])
print("Modulos musculares atualizados.")
print("Backup:", backup)
