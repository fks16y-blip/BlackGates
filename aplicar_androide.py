from pathlib import Path
p = Path("public/js/main.js")
s = p.read_text()
start = s.find("// BLACK GATES - MANEQUIM ANATOMICO ESCULPIDO")
end = s.find("// INTERFACE MOBILE", start)
if start < 0 or end < 0:
    raise SystemExit("ERRO: marcadores não encontrados; arquivo não foi alterado.")
new_block = r"""// BLACK GATES - ANDROIDE BRANCO ARTICULADO
const player = new THREE.Group();
scene.add(player);

const bodyWhite = new THREE.MeshStandardMaterial({
  color: 0xe8edf0, roughness: 0.42, metalness: 0.16
});
const bodyLight = new THREE.MeshStandardMaterial({
  color: 0xffffff, roughness: 0.38, metalness: 0.12
});
const jointMat = new THREE.MeshStandardMaterial({
  color: 0x343b43, roughness: 0.58, metalness: 0.28
});
const jointLight = new THREE.MeshStandardMaterial({
  color: 0x77828b, roughness: 0.46, metalness: 0.25
});

// Cria uma malha fechada a partir de secções variáveis.
// Cada secção: [altura, centroX, centroZ, raioX, raioZ].
function loftY(parent, material, sections, sides = 20) {
  const vertices = [];
  const indices = [];
  for (const s of sections) {
    const [y, cx, cz, rx, rz] = s;
    for (let j = 0; j < sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      vertices.push(cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz);
    }
  }
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j;
      const b = i * sides + (j + 1) % sides;
      const c = (i + 1) * sides + (j + 1) % sides;
      const d = (i + 1) * sides + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const topCenter = vertices.length / 3;
  vertices.push(sections[0][1], sections[0][0], sections[0][2]);
  const bottomCenter = vertices.length / 3;
  const last = sections[sections.length - 1];
  vertices.push(last[1], last[0], last[2]);
  for (let j = 0; j < sides; j++) {
    indices.push(topCenter, (j + 1) % sides, j);
    const base = (sections.length - 1) * sides;
    indices.push(bottomCenter, base + j, base + (j + 1) % sides);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function part(parent, material, sections, x=0, y=0, z=0, sides=20) {
  const m = loftY(parent, material, sections, sides);
  m.position.set(x, y, z);
  return m;
}

// Tronco contínuo: ombros largos, cintura estreita e quadril integrado.
part(player, bodyWhite, [
  [0.00,0,0,0.105,0.080],
  [0.045,0,0,0.145,0.105],
  [0.13,0,0,0.135,0.098],
  [0.22,0,0,0.145,0.100],
  [0.32,0,0,0.185,0.112],
  [0.41,0,0,0.218,0.112],
  [0.48,0,0,0.207,0.100],
  [0.535,0,0,0.142,0.083],
  [0.56,0,0,0.070,0.065]
], 28).position.y = 0.91;

// Pescoço e cabeça sem rosto.
part(player, jointMat, [
  [0,0,0,0.045,0.043],[0.035,0,0,0.052,0.048],
  [0.095,0,0,0.052,0.048],[0.12,0,0,0.043,0.040]
], 0, 1.48, 0, 18);
part(player, bodyLight, [
  [0,0,0,0.068,0.065],[0.018,0,0,0.093,0.082],
  [0.055,0,0,0.112,0.097],[0.115,0,0,0.116,0.100],
  [0.175,0,0,0.098,0.087],[0.205,0,0,0.061,0.058]
], 0, 1.62, 0, 24);

// Painel frontal integrado ao tronco, sem parecer uma placa sobreposta.
part(player, bodyLight, [
  [0,0,0,0.105,0.018],[0.035,0,0,0.132,0.019],
  [0.095,0,0,0.139,0.018],[0.145,0,0,0.122,0.016],
  [0.17,0,0,0.085,0.012]
], 0, 1.235, -0.087, 24);

// Braços construídos em peças curvas independentes.
function makeArm(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 1.405, 0);
  player.add(upper);

  // Ombro arredondado, com perfil próprio.
  part(upper, bodyWhite, [
    [0.055,0,0,0.035,0.035],[0.035,0,0,0.065,0.061],
    [0.005,0,0,0.083,0.073],[-0.035,0,0,0.078,0.070],
    [-0.075,0,0,0.057,0.055],[-0.095,0,0,0.042,0.042]
  ], 0, 0, 0, 22);

  // Braço superior: afunila em direção ao cotovelo.
  part(upper, bodyLight, [
    [-0.045,0,0,0.050,0.048],[-0.075,0,0,0.060,0.054],
    [-0.12,0,0,0.056,0.050],[-0.17,0,0,0.047,0.044],
    [-0.215,0,0,0.037,0.036],[-0.245,0,0,0.030,0.030]
  ], 0, 0, 0, 22);

  const elbow = new THREE.Group();
  elbow.position.set(0, -0.245, 0);
  upper.add(elbow);
  part(elbow, jointMat, [
    [0.030,0,0,0.032,0.031],[0.015,0,0,0.043,0.040],
    [-0.015,0,0,0.044,0.041],[-0.035,0,0,0.033,0.032]
  ], 0, 0, 0, 18);
  part(elbow, jointLight, [
    [0.018,0,0,0.022,0.018],[0,0,0,0.026,0.020],
    [-0.018,0,0,0.020,0.017]
  ], 0, 0, -0.035, 16);

  // Antebraço com volume maior perto do cotovelo e pulso estreito.
  part(elbow, bodyWhite, [
    [-0.018,0,0,0.034,0.032],[-0.045,0,0,0.044,0.041],
    [-0.085,0,0,0.047,0.043],[-0.13,0,0,0.039,0.037],
    [-0.175,0,0,0.028,0.029],[-0.205,0,0,0.023,0.024]
  ], 0, 0, 0, 22);

  const hand = new THREE.Group();
  hand.position.set(0, -0.205, 0);
  elbow.add(hand);
  part(hand, bodyLight, [
    [0.015,0,0,0.022,0.022],[0,0,0,0.030,0.026],
    [-0.035,0,0,0.029,0.023],[-0.065,0,0,0.020,0.018]
  ], 0, 0, 0, 18);
  part(hand, bodyWhite, [
    [-0.005,0,0,0.012,0.012],[-0.028,0,0,0.014,0.012],
    [-0.047,0,0,0.009,0.009]
  ], x < 0 ? 0.027 : -0.027, -0.005, -0.008, 12);
  return { upper, elbow };
}

const leftArmRig = makeArm(-0.245);
const rightArmRig = makeArm(0.245);
const leftArm = leftArmRig.upper;
const rightArm = rightArmRig.upper;
const leftElbow = leftArmRig.elbow;
const rightElbow = rightArmRig.elbow;

// Pernas com coxas largas, joelhos separados e canelas afuniladas.
function makeLeg(x) {
  const upper = new THREE.Group();
  upper.position.set(x, 0.86, 0);
  player.add(upper);

  part(upper, bodyWhite, [
    [0.035,0,0,0.060,0.060],[0.005,0,0,0.078,0.072],
    [-0.055,0,0,0.083,0.076],[-0.115,0,0,0.074,0.070],
    [-0.18,0,0,0.061,0.058],[-0.245,0,0,0.049,0.048],
    [-0.30,0,0,0.040,0.041],[-0.335,0,0,0.034,0.035]
  ], 0, 0, 0, 24);

  const knee = new THREE.Group();
  knee.position.set(0, -0.34, 0);
  upper.add(knee);
  part(knee, jointMat, [
    [0.032,0,0,0.034,0.034],[0.015,0,0,0.047,0.043],
    [-0.018,0,0,0.045,0.041],[-0.038,0,0,0.032,0.032]
  ], 0, 0, 0, 18);
  part(knee, jointLight, [
    [0.012,0,0,0.025,0.016],[0,0,0,0.029,0.018],
    [-0.014,0,0,0.021,0.014]
  ], 0, 0, -0.036, 16);

  part(knee, bodyWhite, [
    [-0.020,0,0,0.033,0.032],[-0.055,0,0,0.043,0.040],
    [-0.10,0,0,0.042,0.039],[-0.15,0,0,0.034,0.033],
    [-0.205,0,0,0.026,0.028],[-0.245,0,0,0.023,0.026]
  ], 0, 0, 0, 22);

  // Pé alongado e simples, ligado à canela.
  part(knee, bodyLight, [
    [-0.225,0,0,0.024,0.028],[-0.245,0, -0.012,0.033,0.043],
    [-0.270,0,-0.025,0.041,0.065],[-0.292,0,-0.028,0.038,0.064],
    [-0.305,0,-0.025,0.025,0.045]
  ], 0, 0, 0, 20);

  return { upper, knee };
}

const leftLegRig = makeLeg(-0.095);
const rightLegRig = makeLeg(0.095);
const leftLeg = leftLegRig.upper;
const rightLeg = rightLegRig.upper;
const leftKnee = leftLegRig.knee;
const rightKnee = rightLegRig.knee;

"""
p.write_text(s[:start] + new_block + "\n" + s[end:])
print("Personagem androide aplicado. Interface e código após INTERFACE MOBILE foram preservados.")
