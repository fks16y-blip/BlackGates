import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

// BLACK GATES - PERSONAGEM E CONTROLES MOBILE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151922);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.touchAction = 'none';
document.body.style.cssText =
  'margin:0;overflow:hidden;background:#000;touch-action:none;';
document.body.appendChild(renderer.domElement);

// LUZES
const hemisphereLight = new THREE.HemisphereLight(
  0xdceaff, 0x34313e, 2
);
scene.add(hemisphereLight);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 6);
scene.add(light);

// SALA
const roomSize = 20;
const wallHeight = 6;

const wallMat = new THREE.MeshStandardMaterial({
  color: 0x505b70, roughness: 0.85, side: THREE.DoubleSide
});
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x424955, roughness: 0.9, side: THREE.DoubleSide
});
const ceilingMat = new THREE.MeshStandardMaterial({
  color: 0x292f3b, side: THREE.DoubleSide
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(roomSize, roomSize), floorMat
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const grid = new THREE.GridHelper(
  roomSize, 20, 0x78879b, 0x596474
);
grid.position.y = 0.015;
scene.add(grid);

const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(roomSize, roomSize), ceilingMat
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = wallHeight;
scene.add(ceiling);

const wallGeo = new THREE.PlaneGeometry(roomSize, wallHeight);

function createWall(x, y, z, rotationY = 0) {
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(x, y, z);
  wall.rotation.y = rotationY;
  scene.add(wall);
}

createWall(0, wallHeight / 2, -10);
createWall(0, wallHeight / 2, 10, Math.PI);
createWall(10, wallHeight / 2, 0, -Math.PI / 2);
createWall(-10, wallHeight / 2, 0, Math.PI / 2);

// INTERRUPTOR DA ILUMINACAO DO CENARIO
const switchGroup = new THREE.Group();
switchGroup.position.set(7, 1.5, -9.82);

const switchPlate = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.9, 0.1),
  new THREE.MeshStandardMaterial({
    color: 0x252d39, metalness: 0.7, roughness: 0.35
  })
);
switchGroup.add(switchPlate);

const switchButtonMat = new THREE.MeshStandardMaterial({
  color: 0x39d879, emissive: 0x12552a, roughness: 0.35
});
const switchButton = new THREE.Mesh(
  new THREE.BoxGeometry(0.28, 0.36, 0.12),
  switchButtonMat
);
switchButton.position.set(0, 0, 0.1);
switchGroup.add(switchButton);
scene.add(switchGroup);

let roomLightsOn = true;
const switchRaycaster = new THREE.Raycaster();
const switchPointer = new THREE.Vector2();

function applyRoomLights(on) {
  roomLightsOn = on === true;
  hemisphereLight.intensity = roomLightsOn ? 2 : 0.015;
  light.intensity = roomLightsOn ? 2 : 0;
  switchButton.position.y = roomLightsOn ? 0 : -0.16;
  switchButtonMat.color.setHex(roomLightsOn ? 0x39d879 : 0xe04444);
  switchButtonMat.emissive.setHex(roomLightsOn ? 0x12552a : 0x551010);
}

function toggleRoomLights() {
  applyRoomLights(!roomLightsOn);

  if (
    multiplayerRoomCode &&
    multiplayerSocket &&
    multiplayerSocket.readyState === WebSocket.OPEN
  ) {
    multiplayerSocket.send(JSON.stringify({
      type: 'roomLights',
      roomLightsOn
    }));
  }
}

// ESPELHO COM REFLEXAO 3D
const mirrorFrameMat = new THREE.MeshStandardMaterial({
  color: 0x171b24,
  metalness: 0.65,
  roughness: 0.35
});

const mirror = new THREE.Group();
mirror.position.set(0, 2.35, -9.88);

const mirrorFrame = new THREE.Mesh(
  new THREE.BoxGeometry(2.2, 3.8, 0.16),
  mirrorFrameMat
);
mirror.add(mirrorFrame);

const mirrorSurface = new Reflector(
  new THREE.PlaneGeometry(1.95, 3.55),
  {
    clipBias: 0.003,
    textureWidth: Math.min(window.innerWidth * 1.5, 1536),
    textureHeight: Math.min(window.innerHeight * 1.5, 1536),
    color: 0x9aabbc
  }
);
mirrorSurface.position.z = 0.09;
mirror.add(mirrorSurface);

scene.add(mirror);

// BLACK GATES - SILHUETA HUMANA 3D
const player = new THREE.Group();
scene.add(player);

// Jogadores remotos do multiplayer.
const remotePlayers = new Map();
let remoteCharacterSource = null;
let remoteCharacterAnimations = [];
let multiplayerPlayerId = null;
let multiplayerSyncTimer = 0;

const flashlightPickup = new THREE.Group();
flashlightPickup.scale.setScalar(0.5);

const flashlightBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.075, 0.09, 0.48, 16),
  new THREE.MeshStandardMaterial({
    color: 0x263342, roughness: 0.35, metalness: 0.75
  })
);
flashlightBody.rotation.z = Math.PI / 2;
flashlightPickup.add(flashlightBody);

const flashlightHead = new THREE.Mesh(
  new THREE.CylinderGeometry(0.105, 0.08, 0.12, 16),
  new THREE.MeshStandardMaterial({
    color: 0x71869b,
    emissive: 0x172535,
    emissiveIntensity: 0.25,
    roughness: 0.3,
    metalness: 0.8
  })
);
flashlightHead.rotation.z = Math.PI / 2;
flashlightHead.position.x = 0.27;
flashlightPickup.add(flashlightHead);

const flashlightLens = new THREE.Mesh(
  new THREE.CircleGeometry(0.073, 16),
  new THREE.MeshStandardMaterial({
    color: 0x8bd8ff,
    emissive: 0x258bff,
    emissiveIntensity: 2,
    roughness: 0.2,
    metalness: 0
  })
);
flashlightLens.position.set(0.332, 0, 0);
flashlightLens.rotation.y = Math.PI / 2;
flashlightPickup.add(flashlightLens);

// Feixe e foco da lanterna: apontados para a frente (+X).
const flashlightLight = new THREE.SpotLight(
  0xd9f3ff, 30, 35, Math.PI / 4, 0.2, 0.8
);
flashlightLight.position.set(0.34, 0, 0);
const flashlightTarget = new THREE.Object3D();
flashlightTarget.position.set(-5, 0, 0);
flashlightPickup.add(flashlightTarget);
flashlightLight.target = flashlightTarget;
flashlightPickup.add(flashlightLight);

const flashlightBeam = new THREE.Mesh(
  new THREE.ConeGeometry(1.2, 4.5, 24, 1, true),
  new THREE.MeshBasicMaterial({
    color: 0xbde8ff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
flashlightBeam.rotation.z = Math.PI / 2;
flashlightBeam.position.x = 2.55;
flashlightPickup.add(flashlightBeam);
flashlightLight.visible = false;
flashlightBeam.visible = false;
flashlightBeam.visible = false;

flashlightPickup.position.set(1.3, 0.13, 0);
flashlightPickup.rotation.z = 0.12;
scene.add(flashlightPickup);

let hasFlashlight = false;

let flashlightEquipped = false;

// Pistola 3D que poderá ser recolhida pelo jogador.
const pistolPickup = new THREE.Group();
pistolPickup.scale.setScalar(0.325);

const pistolBodyMat = new THREE.MeshStandardMaterial({
  color: 0x252b32, roughness: 0.42, metalness: 0.65
});
const pistolMetalMat = new THREE.MeshStandardMaterial({
  color: 0x737d87, roughness: 0.3, metalness: 0.85
});
const pistolGripMat = new THREE.MeshStandardMaterial({
  color: 0x17191d, roughness: 0.82, metalness: 0.05
});

const pistolBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.85, 0.19, 0.22),
  pistolBodyMat
);
pistolPickup.add(pistolBody);

const pistolBarrel = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.09, 0.12),
  pistolMetalMat
);
pistolBarrel.position.x = 0.59;
pistolPickup.add(pistolBarrel);

// Clarão visível na ponta do cano durante o disparo.
const muzzleFlash = new THREE.Mesh(
  new THREE.SphereGeometry(0.19, 8, 8),
  new THREE.MeshBasicMaterial({
    color: 0xffc247,
    transparent: true,
    opacity: 0.95
  })
);
muzzleFlash.position.set(0.84, 0, 0);
muzzleFlash.visible = false;
pistolPickup.add(muzzleFlash);

const muzzleLight = new THREE.PointLight(0xffa52b, 3, 2);
muzzleLight.position.set(0.84, 0, 0);
muzzleLight.visible = false;
pistolPickup.add(muzzleLight);

const pistolGrip = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.43, 0.19),
  pistolGripMat
);
pistolGrip.position.set(-0.19, -0.27, 0);
pistolGrip.rotation.z = -0.18;
pistolPickup.add(pistolGrip);

const pistolSight = new THREE.Mesh(
  new THREE.BoxGeometry(0.12, 0.06, 0.1),
  pistolMetalMat
);
pistolSight.position.set(0.16, 0.12, 0);
pistolPickup.add(pistolSight);

pistolPickup.position.set(-1.3, 0.2, 0);
pistolPickup.rotation.z = -0.08;
pistolPickup.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});
scene.add(pistolPickup);

let hasPistol = false;
let pistolEquipped = false;
let pistolAvailable = true;
let pistolPickupPending = false;

function grantPistolToLocalPlayer() {
  hasPistol = true;
  scene.remove(pistolPickup);
  pistolPickup.visible = false;
  pickupPistolButton.style.display = "none";

  secondItemSlot.querySelector("span").textContent = "🔫";
  secondItemSlot.setAttribute("aria-label", "Slot 2: Pistola");
  secondItemSlot.style.borderColor = "#ffcc80";
}

function applyPistolAvailability(available, collectorId = null) {
  pistolAvailable = available;
  pistolPickupPending = false;

  if (!available) {
    if (collectorId && collectorId === multiplayerPlayerId) {
      grantPistolToLocalPlayer();
    } else {
      scene.remove(pistolPickup);
      pistolPickup.visible = false;
      pickupPistolButton.style.display = "none";
    }
  } else if (!hasPistol) {
    scene.add(pistolPickup);
    pistolPickup.visible = true;
  }
}
let pistolMagazine = 50;
let pistolReserve = 50;
let pistolReloading = false;
let pistolReloadTime = 0;
let pistolReloadAmount = 0;

const ammoBox = new THREE.Group();
const ammoBoxBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.55, 0.28, 0.38),
  new THREE.MeshStandardMaterial({ color: 0x465b35, roughness: 0.82 })
);
const ammoBoxLid = new THREE.Mesh(
  new THREE.BoxGeometry(0.57, 0.06, 0.40),
  new THREE.MeshStandardMaterial({ color: 0x71804a, roughness: 0.72 })
);
ammoBoxLid.position.y = 0.17;
ammoBox.add(ammoBoxBody, ammoBoxLid);
ammoBox.position.set(0, 0.18, 1.3);
ammoBox.traverse((o) => {
  if (o.isMesh) {
    o.castShadow = true;
    o.receiveShadow = true;
  }
});
scene.add(ammoBox);



const bodyWhite = new THREE.MeshStandardMaterial({
  color: 0xe9edf0, roughness: 0.38, metalness: 0.08
});
const bodyLight = new THREE.MeshStandardMaterial({
  color: 0xfafafa, roughness: 0.4, metalness: 0.04
});
const jointMat = new THREE.MeshStandardMaterial({
  color: 0x303840, roughness: 0.55, metalness: 0.12
});
const jointLight = new THREE.MeshStandardMaterial({
  color: 0xb5bcc2, roughness: 0.48, metalness: 0.08
});

// Malha por secoes: cada contorno controla a anatomia da forma.
function meshY(parent, mat, sections, sides=24, exponent=0.82) {
  const v=[], ind=[];
  for (const [y,cx,cz,rx,rz] of sections) {
    for (let j=0;j<sides;j++) {
      const a=2*Math.PI*j/sides;
      const c=Math.cos(a), d=Math.sin(a);
      v.push(cx+Math.sign(c)*Math.pow(Math.abs(c),exponent)*rx,
             y,
             cz+Math.sign(d)*Math.pow(Math.abs(d),exponent)*rz);
    }
  }
  for(let i=0;i<sections.length-1;i++){
    for(let j=0;j<sides;j++){
      const a=i*sides+j,b=i*sides+(j+1)%sides;
      const c=(i+1)*sides+(j+1)%sides,d=(i+1)*sides+j;
      ind.push(a,b,d,b,c,d);
    }
  }
  // Fechar as extremidades para evitar bordas abertas.
  const bottom=v.length/3;
  v.push(sections[0][1],sections[0][0],sections[0][2]);
  const top=v.length/3;
  const last=sections.length-1;
  v.push(sections[last][1],sections[last][0],sections[last][2]);
  for(let j=0;j<sides;j++){
    const a=j,b=(j+1)%sides;
    ind.push(bottom,b,a);
    const c=last*sides+j,d=last*sides+(j+1)%sides;
    ind.push(top,c,d);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(v,3));
  g.setIndex(ind);
  g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);
  m.castShadow=true;
  m.receiveShadow=true;
  parent.add(m);
  return m;
}
function part(parent,mat,sections,x=0,y=0,z=0,sides=24,exponent=.82){
  const m=meshY(parent,mat,sections,sides,exponent);
  m.position.set(x,y,z);
  return m;
}

// Tronco: peito largo, caixa toracica, cintura estreita e pelvis.
part(player,bodyWhite,[
 [0,0,0,.105,.075],
 [.045,0,0,.145,.095],
 [.10,0,0,.155,.102],
 [.16,0,0,.145,.095],
 [.22,0,0,.135,.088],
 [.28,0,0,.155,.095],
 [.34,0,0,.195,.108],
 [.40,0,0,.225,.112],
 [.45,0,0,.232,.108],
 [.49,0,0,.205,.098],
 [.525,0,0,.15,.078],
 [.55,0,0,.075,.055]
],0,.88,0,32,.78);

// Volumes peitorais discretos, acompanhando o tronco.
for(const side of [-1,1]){
  part(player,bodyLight,[
   [.015,0,0,.018,.018],
   [.035,0,0,.052,.025],
   [.065,0,0,.064,.027],
   [.092,0,0,.057,.023],
   [.11,0,0,.025,.014]
  ],side*.094,1.245,-.079,20,.8);
}

// Abdomen com transicao gradual, sem placas quadradas.
part(player,bodyLight,[
 [0,0,0,.075,.012],
 [.025,0,0,.092,.014],
 [.07,0,0,.095,.014],
 [.12,0,0,.082,.013],
 [.16,0,0,.065,.012]
],0,1.00,-.094,24,.85);

// Pescoço e cabeça com queixo e crânio proporcionais.
part(player,bodyWhite,[
 [0,0,0,.043,.039],
 [.025,0,0,.052,.045],
 [.075,0,0,.049,.042],
 [.105,0,0,.044,.038]
],0,1.405,0,20,.8);

part(player,bodyLight,[
 [0,0,0,.038,.046],
 [.014,0,0,.057,.063],
 [.035,0,0,.074,.075],
 [.065,0,0,.084,.079],
 [.105,0,0,.087,.078],
 [.14,0,0,.078,.072],
 [.17,0,0,.061,.059],
 [.188,0,0,.033,.035]
],0,1.53,0,28,.78);

// Rosto minimalista: visor estreito e encaixado na frente.
part(player,jointMat,[
 [0,0,0,.042,.008],
 [.012,0,0,.060,.009],
 [.038,0,0,.061,.009],
 [.052,0,0,.047,.008]
],0,1.635,-.071,20,.75);

// Braços com volume de ombro, braço superior, cotovelo e antebraço.
function makeArm(x){
  const upper=new THREE.Group();
  upper.position.set(x,1.34,0);
  player.add(upper);

  // Deltoide e braço superior.
  part(upper,bodyWhite,[
   [.075,0,0,.035,.034],
   [.055,0,0,.062,.056],
   [.025,0,0,.079,.068],
   [-.015,0,0,.077,.066],
   [-.055,0,0,.064,.056],
   [-.10,0,0,.053,.048],
   [-.145,0,0,.045,.041],
   [-.18,0,0,.037,.036]
  ],0,0,0,24,.78);

  // Volume frontal do braço, integrado à silhueta.
  part(upper,bodyLight,[
   [.0,0,0,.018,.018],
   [-.035,0,0,.039,.026],
   [-.075,0,0,.042,.027],
   [-.11,0,0,.031,.022],
   [-.135,0,0,.014,.014]
  ],x<0?-.012:.012,-.005,-.044,18,.8);

  const elbow=new THREE.Group();
  elbow.position.set(0,-.19,0);
  upper.add(elbow);
  part(elbow,jointMat,[
   [.025,0,0,.029,.029],
   [.009,0,0,.042,.039],
   [-.012,0,0,.043,.039],
   [-.032,0,0,.031,.03]
  ],0,0,0,20,.82);

  // Antebraco mais cheio junto ao cotovelo e afunilado no pulso.
  part(elbow,bodyWhite,[
   [-.015,0,0,.034,.032],
   [-.04,0,0,.047,.043],
   [-.075,0,0,.052,.046],
   [-.11,0,0,.047,.042],
   [-.15,0,0,.037,.034],
   [-.185,0,0,.026,.027],
   [-.205,0,0,.022,.023]
  ],0,0,0,24,.8);

  const hand=new THREE.Group();
  hand.position.set(0,-.207,0);
  elbow.add(hand);

  // Palma mais larga e espessa, em vez de um ponto.
  part(hand,bodyLight,[
   [.014,0,0,.022,.02],
   [0,0,0,.033,.025],
   [-.025,0,0,.037,.023],
   [-.05,0,0,.033,.019],
   [-.065,0,0,.025,.015]
  ],0,0,0,20,.8);

  // Dedos individuais com falanges e comprimentos variados.
  for(let i=0;i<4;i++){
    const fx=(i-1.5)*.016;
    const L=[.045,.055,.052,.043][i];
    part(hand,bodyWhite,[
      [-.047,fx,0,.0075,.007],
      [-.047-L*.30,fx,0,.007,.0065],
      [-.047-L*.68,fx,0,.006,.006],
      [-.047-L,fx,0,.0035,.004]
    ],0,0,-.002,10,.9);
  }

  // Polegar afastado da palma.
  const thumb=new THREE.Group();
  thumb.position.set(x<0?.031:-.031,-.012,-.004);
  thumb.rotation.z=x<0?-.5:.5;
  hand.add(thumb);
  part(thumb,bodyWhite,[
   [.012,0,0,.009,.009],
   [0,0,0,.013,.011],
   [-.018,0,0,.011,.009],
   [-.034,0,0,.005,.006]
  ],0,0,0,12,.85);

  return {upper,elbow};
}
const leftArmRig=makeArm(-.255);
const rightArmRig=makeArm(.255);
const leftArm=leftArmRig.upper,rightArm=rightArmRig.upper;
const leftElbow=leftArmRig.elbow,rightElbow=rightArmRig.elbow;

// Pernas: quadril, coxas, joelhos, panturrilhas e pés.
function makeLeg(x){
  const upper=new THREE.Group();
  upper.position.set(x,.87,0);
  player.add(upper);

  // Coxa larga no quadril e afunilada perto do joelho.
  part(upper,bodyWhite,[
   [.045,0,0,.055,.052],
   [.015,0,0,.076,.068],
   [-.035,0,0,.084,.073],
   [-.085,0,0,.081,.072],
   [-.135,0,0,.069,.063],
   [-.19,0,0,.057,.053],
   [-.24,0,0,.045,.044],
   [-.28,0,0,.035,.035],
   [-.305,0,0,.031,.031]
  ],0,0,0,26,.8);

  // Volume frontal da coxa.
  part(upper,bodyLight,[
   [-.01,0,0,.012,.014],
   [-.045,0,0,.039,.024],
   [-.095,0,0,.043,.025],
   [-.14,0,0,.034,.022],
   [-.18,0,0,.015,.013]
  ],0,-.015,-.055,20,.85);

  const knee=new THREE.Group();
  knee.position.set(0,-.32,0);
  upper.add(knee);
  part(knee,jointMat,[
   [.025,0,0,.03,.029],
   [.008,0,0,.043,.039],
   [-.015,0,0,.042,.038],
   [-.034,0,0,.03,.029]
  ],0,0,0,20,.82);

  // Panturrilha com maior volume superior e tornozelo estreito.
  part(knee,bodyWhite,[
   [-.015,0,0,.031,.03],
   [-.045,0,0,.042,.04],
   [-.075,0,0,.047,.043],
   [-.11,0,0,.043,.04],
   [-.145,0,0,.034,.033],
   [-.18,0,0,.027,.028],
   [-.215,0,0,.022,.024],
   [-.235,0,0,.021,.023]
  ],0,0,0,24,.8);

  // Pe anatômico com calcanhar, peito do pé e ponta.
  part(knee,bodyLight,[
   [-.205,0,0,.022,.024],
   [-.225,0,-.012,.027,.033],
   [-.245,0,-.027,.035,.052],
   [-.267,0,-.04,.041,.067],
   [-.287,0,-.042,.038,.068],
   [-.302,0,-.036,.027,.055],
   [-.307,0,-.03,.012,.032]
  ],0,0,0,24,.78);

  part(knee,jointLight,[
   [-.292,0,-.037,.029,.054],
   [-.301,0,-.036,.03,.055],
   [-.306,0,-.03,.018,.037]
  ],0,0,0,20,.82);

  return {upper,knee};
}
const leftLegRig=makeLeg(-.105);
const rightLegRig=makeLeg(.105);
const leftLeg=leftLegRig.upper,rightLeg=rightLegRig.upper;
const leftKnee=leftLegRig.knee,rightKnee=rightLegRig.knee;


// CARREGAMENTO DO MODELO HUMANO GLB
// Mantém o grupo player e os controles existentes.
const proceduralParts = [...player.children];
const gltfLoader = new GLTFLoader();

let characterMixer = null;
let idleAction = null;
let walkAction = null;
let currentCharacterAction = null;

// Efeitos extras da corrida no modelo 3D.
let animatedCharacterModel = null;
let characterModelBaseY = 0;
let runPhase = 0;
let leftUpperArmBone = null;
let rightUpperArmBone = null;
let leftLowerArmBone = null;
let rightLowerArmBone = null;
let rightHandBone = null;
let headBone = null;
let leftHandBone = null;
let hipsBone = null;
let spineBone = null;
let leftThighBone = null;
let rightThighBone = null;
let leftShinBone = null;
let rightShinBone = null;

function switchCharacterAnimation(nextAction) {
  if (!nextAction || currentCharacterAction === nextAction) return;

  nextAction.reset();
  nextAction.fadeIn(0.2);
  nextAction.play();

  if (currentCharacterAction) {
    currentCharacterAction.fadeOut(0.2);
  }

  currentCharacterAction = nextAction;
}

function applySuitSkin() {
  if (!animatedCharacterModel) return;

  const roupaPreta = new THREE.MeshStandardMaterial({
    color: 0x111216,
    roughness: 0.88,
    metalness: 0.0
  });

  const pele = new THREE.MeshStandardMaterial({
    color: 0xc9ad88,
    roughness: 0.92,
    metalness: 0.0
  });

  animatedCharacterModel.traverse((object) => {
    // A roupa não deve alterar os materiais da lanterna equipada.
    if (
      object === flashlightBody ||
      object === flashlightHead ||
      object === flashlightLens ||
      object === flashlightBeam ||
      pistolPickup.getObjectById(object.id)
    ) return;

    if (!object.isMesh || !object.geometry.attributes.position) return;

    const pos = object.geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = Math.abs(pos.getX(i));

      // Roupa preta por padrão: braços, ombros, tronco e calças.
      let c = new THREE.Color(0x111216);

      // Cabeça cor de pele; gola preta um pouco mais alta na nuca.
      if (y > 1.57) {
        c.set(0xc9ad88);
      }
      if (y > 1.57 && y < 1.66 && x < 0.12) {
        c.set(0x111216);
      }

      // Mãos nas extremidades dos braços.
      if (y > 1.38 && y < 1.47 && x > 0.88) {
        c.set(0xc9ad88);
      }

      // Pés: colorir apenas a região inferior.
      if (y < 0.12) {
        c.set(0xc9ad88);
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    object.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    );

    // Vertex colors permitem preservar pele e deixar toda a roupa preta.
    object.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.0
    });

    object.castShadow = true;
    object.receiveShadow = true;
  });
}

gltfLoader.load(
  './models/humanoid_p8jmt0.glb',
  (gltf) => {
    const model = gltf.scene;

    // Fonte independente para os modelos dos outros jogadores.
    remoteCharacterSource = cloneSkeleton(gltf.scene);
    remoteCharacterAnimations = gltf.animations || [];

    const initialBox = new THREE.Box3().setFromObject(model);
    const initialSize = initialBox.getSize(new THREE.Vector3());

    if (!Number.isFinite(initialSize.y) || initialSize.y <= 0) {
      console.error('O modelo GLB não tem altura válida.');
      return;
    }

    // Ajusta a altura para aproximadamente 1,8 metro.
    model.scale.setScalar(1.8 / initialSize.y);

    const box = new THREE.Box3().setFromObject(model);
    model.position.y -= box.min.y;
    animatedCharacterModel = model;
    characterModelBaseY = model.position.y;

    // Visual de manequim: material bege fosco e sem texturas.
    const mannequinMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9ad88,
      roughness: 0.92,
      metalness: 0.0
    });



    model.traverse((object) => {
      if (object.isMesh) {
        object.material = mannequinMaterial;
        object.castShadow = true;
        object.receiveShadow = true;
      }

      // Identifica ossos dos braços e das pernas pelo nome.
      if (object.name === 'LeftUpperArm') leftUpperArmBone = object;
      if (object.name === 'RightUpperArm') rightUpperArmBone = object;
      if (object.name === 'LeftLowerArm') leftLowerArmBone = object;
      if (object.name === 'RightLowerArm') rightLowerArmBone = object;
      if (object.name === 'RightHand') rightHandBone = object;
      if (object.name === 'LeftHand') leftHandBone = object;

      const boneName = object.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (object.isBone) {
        if (/^(hips|pelvis)$/.test(boneName)) hipsBone = object;
        if (/^(spine|spine1|spine2)$/.test(boneName) && !spineBone) spineBone = object;

        if (/leftupperleg|leftupleg|leftthigh|thigh_l|upleg_l/.test(boneName)) leftThighBone = object;
        if (/rightupperleg|rightupleg|rightthigh|thigh_r|upleg_r/.test(boneName)) rightThighBone = object;

        if (/leftlowerleg|leftleg|leftshin|calf_l|lowerleg_l/.test(boneName) && !/upperleg|upleg|thigh/.test(boneName)) leftShinBone = object;
        if (/rightlowerleg|rightleg|rightshin|calf_r|lowerleg_r/.test(boneName) && !/upperleg|upleg|thigh/.test(boneName)) rightShinBone = object;
      }
    });

    console.log('[AGACHAMENTO] Ossos:', {
      quadril: hipsBone?.name,
      coxaEsquerda: leftThighBone?.name,
      canelaEsquerda: leftShinBone?.name,
      coxaDireita: rightThighBone?.name,
      canelaDireita: rightShinBone?.name
    });

    // Só esconde o personagem antigo depois que o GLB carregar.
    proceduralParts.forEach((part) => {
      part.visible = false;
    });

    // Peruca 3D arredondada, oca e aberta por baixo.
    const hair = new THREE.Group();
    hair.name = 'spikyHair3D';
    hair.visible = false;
    window.blackGatesHairSlot1 = hair;

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x08090c,
      roughness: 0.82,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    // Casca única que envolve o crânio e desce pelas laterais.
    const wigGeometry = new THREE.SphereGeometry(
      1, 64, 32,
      0, Math.PI * 2,
      0, 2.15
    );

    // Achata suavemente o topo, mantendo a borda e os cortes.
    const topPositions = wigGeometry.attributes.position;
    for (let i = 0; i < topPositions.count; i++) {
      const x = topPositions.getX(i);
      const y = topPositions.getY(i);
      const z = topPositions.getZ(i);
      if (y > 0.45) {
        const factor = 1 - 0.16 * Math.min(1, (y - 0.45) / 0.55);
        topPositions.setY(i, y * factor);
      }
    }
    topPositions.needsUpdate = true;
    wigGeometry.computeVertexNormals();

    // Corte quadrado somente na frente, formando uma franja reta.
    const wigPositions = wigGeometry.attributes.position;
    const rimY = Math.cos(2.15);

    for (let i = 0; i < wigPositions.count; i++) {
      const x = wigPositions.getX(i);
      const y = wigPositions.getY(i);
      const z = wigPositions.getZ(i);

      // Franja quadrada na frente.
      if (z > 0.55 && Math.abs(x) < 0.58 && y < -0.05) {
        wigPositions.setY(i, -0.05);
      }
      // Corte mais alto nas duas laterais; preserva a nuca.
      else if (Math.abs(x) > 0.72 && y < 0.05) {
        wigPositions.setY(i, 0.05);
      }
      else if (y < rimY + 0.035) {
        const angle = Math.atan2(z, x);
        const wave = Math.sin(angle * 7 + 0.4)
                   + 0.45 * Math.sin(angle * 11);
        const strength = Math.max(0, (rimY + 0.035 - y) / 0.035);
        wigPositions.setY(i, y + wave * 0.018 * strength);
      }
    }

    wigPositions.needsUpdate = true;
    wigGeometry.computeVertexNormals();

    const wigShell = new THREE.Mesh(wigGeometry, hairMaterial);

    // Maior que a cabeça para reduzir interseções com a pele.
    wigShell.scale.set(0.132, 0.158, 0.148);
    wigShell.position.set(0, 1.702, 0);
    wigShell.castShadow = true;
    wigShell.receiveShadow = true;
    hair.add(wigShell);

    model.add(hair);

    // Faz a peruca acompanhar a rotacao do osso da cabeca.
    model.updateMatrixWorld(true);
    headBone = model.getObjectByName('Head');
    if (headBone) {
      headBone.attach(hair);
    } else {
      console.warn('Osso Head nao encontrado; peruca mantida no modelo.');
    }

    model.rotation.y = Math.PI;
    player.add(model);

    // Suporte articulado da camera: haste e joelho visiveis, sem camera 3D.
    if (!player.userData.backCameraRig) {
      const rig = new THREE.Group();
      rig.name = 'backCameraSupport';
      player.add(rig);
      player.userData.backCameraRig = rig;
      rig.userData.crouchBaseY = rig.position.y;

      const metal = new THREE.MeshStandardMaterial({
        color: 0x252a30,
        roughness: 0.58,
        metalness: 0.72
      });

      const jointMaterial = new THREE.MeshStandardMaterial({
        color: 0x111418,
        roughness: 0.48,
        metalness: 0.78
      });

      rig.userData.supportParts = [];

      function addSupportBar(start, end, radius) {
        const a = new THREE.Vector3(...start);
        const b = new THREE.Vector3(...end);
        const direction = new THREE.Vector3().subVectors(b, a);
        const bar = new THREE.Mesh(
          new THREE.CylinderGeometry(radius * 0.78, radius, direction.length(), 8),
          metal
        );
        bar.position.copy(a).add(b).multiplyScalar(0.5);
        bar.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
        bar.castShadow = true;
        rig.add(bar);
        rig.userData.supportParts.push(bar);
      }

      function addSupportJoint(position, radius) {
        const joint = new THREE.Mesh(
          new THREE.SphereGeometry(radius, 12, 10),
          jointMaterial
        );
        joint.position.set(...position);
        joint.castShadow = true;
        rig.add(joint);
        rig.userData.supportParts.push(joint);
      }

      // Suporte dobrado para tras e para baixo, como uma haste articulada.
      const base = [0, 1.08, 0.05];
      const joint1 = [0.04, 1.10, 0.18];
      const joint2 = [0.02, 1.27, 0.46];
      const joint3 = [0.06, 1.47, 0.72];
      const joint4 = [0.04, 1.65, 0.56];
      const tip = [0.03, 1.87, 0.42];

      addSupportBar(base, joint1, 0.045);
      addSupportBar(joint1, joint2, 0.038);
      addSupportBar(joint2, joint3, 0.034);
      addSupportBar(joint3, joint4, 0.030);
      addSupportBar(joint4, tip, 0.026);

      addSupportJoint(joint2, 0.060);
      addSupportJoint(joint3, 0.056);
      addSupportJoint(joint4, 0.050);

      // Camera fisica visual na ponta do suporte.
      const cameraBodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x171b20,
        roughness: 0.38,
        metalness: 0.65
      });

      const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0x080d18,
        roughness: 0.16,
        metalness: 0.35
      });

      const lensGlassMaterial = new THREE.MeshStandardMaterial({
        color: 0x246080,
        roughness: 0.12,
        metalness: 0.55,
        emissive: 0x071522
      });

      const cameraUnit = new THREE.Group();
      cameraUnit.name = 'VisibleBackCamera';
      cameraUnit.position.set(...tip);
      cameraUnit.visible = true;
      rig.add(cameraUnit);
      player.userData.backCameraLens = cameraUnit;

      rig.userData.rebuildSupport = function(fold, height) {
        for (const part of rig.userData.supportParts) {
          rig.remove(part);
          part.geometry.dispose();
        }
        rig.userData.supportParts.length = 0;

        const f = THREE.MathUtils.clamp(fold, 0, 1) - 0.35;
        const h = THREE.MathUtils.clamp(height, -30, 30) / 100;

        const base = [0, 1.08, 0.05];
        const joint1 = [0.04, 1.10, 0.18];
        const joint2 = [0.02, 1.27 + h * 0.35, 0.46 - f * 0.08];
        const joint3 = [0.06, 1.47 + h * 0.75 - f * 0.25, 0.72 - f * 0.18];
        const joint4 = [0.04, 1.65 + h * 0.90 - f * 0.42, 0.56 - f * 0.10];
        const tip = [0.03, 1.87 + h - f * 0.65, 0.42 - f * 0.20];

        addSupportBar(base, joint1, 0.045);
        addSupportBar(joint1, joint2, 0.038);
        addSupportBar(joint2, joint3, 0.034);
        addSupportBar(joint3, joint4, 0.030);
        addSupportBar(joint4, tip, 0.026);

        addSupportJoint(joint2, 0.060);
        addSupportJoint(joint3, 0.056);
        addSupportJoint(joint4, 0.050);

        cameraUnit.position.set(...tip);
      };

      const cameraBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.14, 0.16),
        cameraBodyMaterial
      );
      cameraUnit.add(cameraBody);
      cameraBody.castShadow = true;

      // Lente voltada para a frente do personagem.
      const lensMount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.075, 0.07, 20),
        cameraBodyMaterial
      );
      lensMount.rotation.x = Math.PI / 2;
      lensMount.position.z = -0.105;
      cameraUnit.add(lensMount);



      const topButton = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.018, 0.035),
        cameraBodyMaterial
      );
      topButton.position.set(0.055, 0.078, 0);
      cameraUnit.add(topButton);

      if (typeof updateSupportControls === 'function') {
        updateSupportControls();
      }
    }


    if (gltf.animations && gltf.animations.length) {
      characterMixer = new THREE.AnimationMixer(model);

      const findClip = (name) =>
        gltf.animations.find((clip) =>
          clip.name.toLowerCase().includes(name.toLowerCase())
        );

      const idleClip = findClip('Idle');
      const walkClip = findClip('Walk');

      if (idleClip) idleAction = characterMixer.clipAction(idleClip);
      if (walkClip) walkAction = characterMixer.clipAction(walkClip);

      switchCharacterAnimation(idleAction || walkAction);
      console.log('Animações encontradas:', gltf.animations.map(a => a.name));
    } else {
      console.warn('Este modelo não contém animações.');
    }

    console.log('Modelo humano animado carregado!', initialSize);
  },
  undefined,
  (error) => {
    console.error(
      'Não foi possível carregar personagem.glb. Mantendo personagem antigo.',
      error
    );
  }
);

// PERSONAGENS REMOTOS DO MULTIPLAYER
function createRemotePlayer(playerId) {
  if (!remoteCharacterSource || remotePlayers.has(playerId)) {
    return remotePlayers.get(playerId) || null;
  }

  const root = new THREE.Group();
  root.name = `remotePlayer_${playerId}`;

  const model = cloneSkeleton(remoteCharacterSource);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) return null;

  model.scale.setScalar(1.8 / size.y);
  model.updateMatrixWorld(true);
  const scaledBounds = new THREE.Box3().setFromObject(model);
  model.position.y -= scaledBounds.min.y;

  const remoteMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9ad88, roughness: 0.92, metalness: 0
  });

  let remoteRightHand = null;
  let remoteHandSocket = null;
  let remoteLeftUpperArm = null;
  let remoteRightUpperArm = null;
  let remoteLeftLowerArm = null;
  let remoteRightLowerArm = null;
  let remoteHipsBone = null;
  let remoteLeftThighBone = null;
  let remoteRightThighBone = null;
  let remoteLeftShinBone = null;
  let remoteRightShinBone = null;
  model.traverse((object) => {
    if (object.name === 'RightHand') remoteRightHand = object;
    if (object.name === 'Socket_RightHand') remoteHandSocket = object;
    if (object.name === 'LeftUpperArm') remoteLeftUpperArm = object;
    if (object.name === 'RightUpperArm') remoteRightUpperArm = object;
    if (object.name === 'LeftLowerArm') remoteLeftLowerArm = object;
    if (object.name === 'RightLowerArm') remoteRightLowerArm = object;
    if (object.isBone) {
      const boneName = object.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (/(hips|pelvis)$/.test(boneName)) remoteHipsBone = object;
      if (/leftupperleg|leftupleg|leftthigh|thigh_l|upleg_l/.test(boneName)) remoteLeftThighBone = object;
      if (/rightupperleg|rightupleg|rightthigh|thigh_r|upleg_r/.test(boneName)) remoteRightThighBone = object;
      if (/leftlowerleg|leftleg|leftshin|calf_l|lowerleg_l/.test(boneName) && !/upperleg|upleg|thigh/.test(boneName)) remoteLeftShinBone = object;
      if (/rightlowerleg|rightleg|rightshin|calf_r|lowerleg_r/.test(boneName) && !/upperleg|upleg|thigh/.test(boneName)) remoteRightShinBone = object;
    }
    if (object.isMesh) {
      object.material = remoteMaterial;
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  const mixer = new THREE.AnimationMixer(model);
  const findClip = (name) => remoteCharacterAnimations.find(
    (clip) => clip.name.toLowerCase().includes(name.toLowerCase())
  );
  const idleClip = findClip('Idle');
  const walkClip = findClip('Walk');
  const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
  const walkAction = walkClip ? mixer.clipAction(walkClip) : null;
  if (idleAction) idleAction.play();
  else if (walkAction) walkAction.play();

  model.rotation.y = Math.PI;
  root.add(model);

  // Cópias próprias para este jogador remoto; não movem os objetos locais.
  const remotePistol = pistolPickup.clone(true);
  remotePistol.scale.copy(pistolPickup.scale);
  remotePistol.visible = false;
  remotePistol.traverse((object) => {
    if (object.isMesh) object.castShadow = true;
    if (object.isMesh && object.geometry === muzzleFlash.geometry) object.visible = false;
  });

  const remoteFlashlight = flashlightPickup.clone(true);
  remoteFlashlight.scale.copy(flashlightPickup.scale);
  remoteFlashlight.visible = false;
  remoteFlashlight.traverse((object) => {
    if (object.isLight) object.visible = false;
    if (object.isMesh && object.geometry?.type === 'ConeGeometry') {
      object.visible = false;
    }
  });

  const remoteEquipmentSocket = remoteHandSocket || remoteRightHand;
  if (remoteEquipmentSocket) {
    remoteEquipmentSocket.add(remotePistol);
    remotePistol.position.set(-0.08, -0.02, 0.10);
    remotePistol.rotation.set(Math.PI / 2, Math.PI, 0);

    remoteEquipmentSocket.add(remoteFlashlight);
    remoteFlashlight.position.set(0, -0.12, 0);
    remoteFlashlight.rotation.set(0, Math.PI, 0);
  } else {
    model.add(remotePistol);
    model.add(remoteFlashlight);
  }

  // Suporte visual independente, preso ao tronco do personagem.
  const support = new THREE.Group();
  support.name = 'RemoteBackCameraSupport';
  root.add(support);

  const supportMetal = new THREE.MeshStandardMaterial({
    color: 0x252c34, roughness: 0.4, metalness: 0.7
  });
  const supportJointMat = new THREE.MeshStandardMaterial({
    color: 0x59636e, roughness: 0.45, metalness: 0.65
  });
  const cameraBodyMat = new THREE.MeshStandardMaterial({
    color: 0x171b20, roughness: 0.38, metalness: 0.65
  });
  const cameraLensMat = new THREE.MeshStandardMaterial({
    color: 0x246080, roughness: 0.12, metalness: 0.55,
    emissive: 0x071522
  });

  const addBar = (a, b, radius) => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const direction = new THREE.Vector3().subVectors(vb, va);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.72, radius, direction.length(), 10),
      supportMetal
    );
    mesh.position.copy(va).add(vb).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), direction.normalize()
    );
    mesh.castShadow = true;
    support.add(mesh);
  };

  const addJoint = (point, radius) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 10, 8), supportJointMat
    );
    mesh.position.set(...point);
    mesh.castShadow = true;
    support.add(mesh);
  };

  const cameraUnit = new THREE.Group();
  cameraUnit.name = 'RemoteVisibleBackCamera';
  support.add(cameraUnit);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.16), cameraBodyMat
  );
  body.castShadow = true;
  cameraUnit.add(body);

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.075, 0.07, 16), cameraLensMat
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.z = -0.105;
  cameraUnit.add(lens);

  const topButton = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.018, 0.035), cameraBodyMat
  );
  topButton.position.set(0.055, 0.078, 0);
  cameraUnit.add(topButton);

  function rebuildRemoteSupport(fold = 0.35, height = 0, tilt = 0) {
    for (const child of [...support.children]) {
      if (child !== cameraUnit) {
        support.remove(child);
        if (child.geometry) child.geometry.dispose();
      }
    }

    const f = THREE.MathUtils.clamp(fold, 0, 1) - 0.35;
    const h = THREE.MathUtils.clamp(height, -30, 30) / 100;
    const base = [0, 1.08, 0.05];
    const j1 = [0.04, 1.10, 0.18];
    const j2 = [0.02, 1.27 + h * 0.35, 0.46 - f * 0.08];
    const j3 = [0.06, 1.47 + h * 0.75 - f * 0.25, 0.72 - f * 0.18];
    const j4 = [0.04, 1.65 + h * 0.90 - f * 0.42, 0.56 - f * 0.10];
    const tip = [0.03, 1.87 + h - f * 0.65, 0.42 - f * 0.20];

    addBar(base, j1, 0.045);
    addBar(j1, j2, 0.038);
    addBar(j2, j3, 0.034);
    addBar(j3, j4, 0.030);
    addBar(j4, tip, 0.026);
    addJoint(j2, 0.060);
    addJoint(j3, 0.056);
    addJoint(j4, 0.050);
    cameraUnit.position.set(...tip);
    cameraUnit.rotation.x = THREE.MathUtils.degToRad(tilt);
  }

  rebuildRemoteSupport();

  scene.add(root);

  const remote = {
    root, model, mixer, idleAction, walkAction,
    currentAction: idleAction || walkAction,
    targetPosition: new THREE.Vector3(),
    targetRotationY: 0,
    moving: false, running: false, crouching: false,
    hipsBone: remoteHipsBone,
    leftThighBone: remoteLeftThighBone,
    rightThighBone: remoteRightThighBone,
    leftShinBone: remoteLeftShinBone,
    rightShinBone: remoteRightShinBone,
    rightHand: remoteRightHand,
    leftUpperArmBone: remoteLeftUpperArm,
    rightUpperArmBone: remoteRightUpperArm,
    leftLowerArmBone: remoteLeftLowerArm,
    rightLowerArmBone: remoteRightLowerArm,
    pistolEquipped: false,
    aimPitch: 0,
    aimYaw: 0,
    pistol: remotePistol,
    flashlight: remoteFlashlight,
    flashlightLight: remoteFlashlight.getObjectByProperty('type', 'SpotLight'),
    flashlightBeam: remoteFlashlight.children.find(
      (object) => object.isMesh && object.geometry?.type === 'ConeGeometry'
    ),
    support,
    rebuildRemoteSupport,
    supportMetal, supportJointMat, cameraBodyMat, cameraLensMat,
    lastPistolEquipped: false,
    lastFlashlightEquipped: false,
    lastSupportFold: null,
    lastSupportHeight: null,
    lastSupportTilt: null
  };

  remotePlayers.set(playerId, remote);
  return remote;
}

function removeRemotePlayer(playerId) {
  const remote = remotePlayers.get(playerId);
  if (!remote) return;

  scene.remove(remote.root);
  remote.mixer.stopAllAction();

  // Geometrias dos clones podem ser compartilhadas com o modelo de origem.
  // Não descartar geometria nem materiais compartilhados.
  remotePlayers.delete(playerId);
}

function clearRemotePlayers() {
  for (const playerId of [...remotePlayers.keys()]) {
    removeRemotePlayer(playerId);
  }
}

function updateRemotePlayerState(playerId, state) {
  if (!playerId || playerId === multiplayerPlayerId || !state) return;
  if (![state.x, state.z].every(Number.isFinite)) return;

  const remote = createRemotePlayer(playerId);
  if (!remote) return;

  remote.targetPosition.set(
    state.x,
    Number.isFinite(state.y) ? state.y : 0,
    state.z
  );

  if (Number.isFinite(state.rotationY)) {
    remote.targetRotationY = state.rotationY;
  }

  remote.moving = state.moving === true;
  remote.running = state.running === true;
  remote.crouching = state.crouching === true;
  remote.pistolEquipped = state.pistolEquipped === true;
  remote.aimPitch = Number.isFinite(state.aimPitch) ? state.aimPitch : 0;
  remote.aimYaw = Number.isFinite(state.yaw) ? state.yaw : remote.targetRotationY;

  if (remote.moving && !remote.userDataWalkDebug) {
    remote.userDataWalkDebug = true;
    console.log("[REMOTO WALK]", {
      playerId,
      moving: remote.moving,
      walkClip: remote.walkAction?.getClip().name ?? null,
      walkEnabled: remote.walkAction?.enabled ?? false,
      walkPlaying: remote.walkAction?.isRunning() ?? false,
      legTracks: remote.walkAction?.getClip().tracks
        .filter(track => /UpperLeg|LowerLeg|Foot/i.test(track.name))
        .map(track => track.name) ?? []
    });
  }

  const nextAction = remote.moving
    ? (remote.walkAction || remote.idleAction)
    : (remote.idleAction || remote.walkAction);

  if (nextAction && nextAction !== remote.currentAction) {
    if (remote.currentAction) remote.currentAction.fadeOut(0.15);
    nextAction.reset().fadeIn(0.15).play();
    remote.currentAction = nextAction;
  }
  if (remote.walkAction) {
    remote.walkAction.timeScale = remote.running ? 1.55 : 1;
  }

  const pistolOn = state.pistolEquipped === true;
  const flashlightOn = state.flashlightEquipped === true;
  remote.pistol.visible = pistolOn;
  remote.flashlight.visible = flashlightOn;

  if (remote.flashlightLight) remote.flashlightLight.visible = false;
  if (remote.flashlightBeam) remote.flashlightBeam.visible = false;

  const fold = Number.isFinite(state.supportFold) ? state.supportFold : 0.35;
  const height = Number.isFinite(state.supportHeight) ? state.supportHeight * 100 : 0;
  const tilt = Number.isFinite(state.supportTilt) ? state.supportTilt : 0;

  if (
    remote.lastSupportFold !== fold ||
    remote.lastSupportHeight !== height ||
    remote.lastSupportTilt !== tilt
  ) {
    remote.rebuildRemoteSupport(fold, height, tilt);
    remote.lastSupportFold = fold;
    remote.lastSupportHeight = height;
    remote.lastSupportTilt = tilt;
  }
}

// INTERFACE MOBILE
const ui = document.createElement('div');
ui.innerHTML = `
  <button id="multiplayerButton" type="button">MULTIPLAYER</button>
  <div id="multiplayerPanel">
    <h2>MULTIPLAYER</h2>
    <div id="multiplayerStatus">Desconectado</div>
    <button id="createRoomButton" type="button">CRIAR SALA</button>
    <div id="createdRoomCode" style="display:none">
      <p>CÓDIGO DA SALA</p>
      <strong id="roomCodeDisplay">00000</strong>
    </div>
    <div class="multiplayerDivider"></div>
    <label for="joinRoomInput">Entrar em uma sala</label>
    <input id="joinRoomInput" type="text" inputmode="numeric"
      autocomplete="off" maxlength="5" placeholder="Digite 5 números">
    <button id="joinRoomButton" type="button">ENTRAR NA SALA</button>
    <div id="multiplayerRoomInfo"></div>
    <button id="multiplayerCloseButton" type="button">FECHAR</button>
  </div>
  <div id="stickBase"><div id="stickKnob"></div></div>
  <button id="runButton">CORRER</button>
  <button id="crouchButton">AGACHAR</button>
  <button id="cameraSettingsButton" aria-label="Configuracoes">🔧</button>
  <div id="cameraSettingsPanel">
    <strong>CONFIGURAÇÕES</strong>
    <p>Distância da câmera</p>
    <input id="cameraDistanceSlider" type="range" min="1" max="10" step="0.5" value="4.5">
    <div id="cameraDistanceValue">Normal</div>

    <p>Prévia do suporte</p>
    <svg id="supportPreview" viewBox="0 0 240 100" style="width:100%;height:100px;background:#0b111b;border-radius:10px">
      <circle cx="30" cy="55" r="12" fill="#788493"/>
      <path id="previewArm1" d="M30 55 L90 45" stroke="#aeb9c6" stroke-width="8" stroke-linecap="round"/>
      <path id="previewArm2" d="M90 45 L145 25" stroke="#aeb9c6" stroke-width="7" stroke-linecap="round"/>
      <path id="previewArm3" d="M145 25 L180 40" stroke="#aeb9c6" stroke-width="6" stroke-linecap="round"/>
      <rect id="previewCamera" x="176" y="30" width="38" height="22" rx="4" fill="#28394d" stroke="#9ab5cf" stroke-width="2"/>
      <circle cx="207" cy="41" r="6" fill="#3f9acb"/>
    </svg>

    <label for="supportFoldSlider">Dobra do suporte</label>
    <input id="supportFoldSlider" type="range" min="0" max="100" value="35" style="width:100%">
    <div id="supportFoldValue">35%</div>

    <label for="supportHeightSlider">Altura da articulação</label>
    <input id="supportHeightSlider" type="range" min="-30" max="30" value="0" style="width:100%">
    <div id="supportHeightValue">0</div>

    <label for="supportTiltSlider">Inclinação da câmera</label>
    <input id="supportTiltSlider" type="range" min="-45" max="45" value="0" style="width:100%">
    <div id="supportTiltValue">0°</div>

    <button id="supportSaveButton" type="button">SALVAR POSIÇÃO</button>
    <button id="supportResetButton" type="button">RESTAURAR PADRÃO</button>
    <button id="cameraSettingsClose">FECHAR</button>
  </div>

  <button id="skinsButton" type="button">SKINS</button>
  <div id="skinsPanel">
    <div id="skinsMenu">
      <h2>PERSONALIZAÇÃO</h2>
      <p>Escolha uma categoria</p>
      <button class="skinCategory" data-category="Cabelo">✂️ Cabelo</button>
      <button class="skinCategory" data-category="Rosto">👤 Rosto</button>
      <button class="skinCategory" data-category="Conjunto">👕 Conjunto</button>
      <button class="skinCategory" data-category="Sapato">👟 Sapato</button>
      <button id="skinsClose" type="button">FECHAR</button>
    </div>
    <div id="skinsCategoryScreen" style="display:none">
      <button id="skinsBack" type="button">← VOLTAR</button>
      <h2 id="skinsCategoryTitle">CABELO</h2>
      <div id="skinsSlots"></div>
    </div>
  </div>
  <div id="itemBar" aria-label="Inventário de itens">
    <button class="itemSlot" type="button" aria-label="Slot de item 1"><span>+</span><small>1</small></button>
    <button class="itemSlot" type="button" aria-label="Slot de item 2"><span>+</span><small>2</small></button>
    <button class="itemSlot" type="button" aria-label="Slot de item 3"><span>+</span><small>3</small></button>
    <button class="itemSlot" type="button" aria-label="Slot de item 4"><span>+</span><small>4</small></button>
  </div>
  <button id="pickupFlashlightButton" type="button" style="display:none">PEGAR LANTERNA</button>
  <button id="pickupPistolButton" type="button" style="display:none">PEGAR PISTOLA</button>
  <button id="pickupAmmoButton" type="button" style="display:none">PEGAR MUNIÇÃO +50</button>
  <div id="ammoCounter" style="display:none">50/50</div>
  <button id="shootButton" type="button" style="display:none">DISPARAR</button>
  <button id="reloadButton" type="button" style="display:none">RECARREGAR</button>
  <div id="helpText">JOYSTICK: MOVER · ARRASTE À DIREITA: OLHAR</div>
`;
document.body.appendChild(ui);

const pistolCrosshair = document.createElement("div");
pistolCrosshair.id = "pistolCrosshair";
pistolCrosshair.setAttribute("aria-hidden", "true");
document.body.appendChild(pistolCrosshair);

const pickupFlashlightButton = document.getElementById("pickupFlashlightButton");
const firstItemSlot = document.querySelector("#itemBar .itemSlot");
const pickupPistolButton = document.getElementById("pickupPistolButton");
const secondItemSlot = document.querySelectorAll("#itemBar .itemSlot")[1];
const pickupAmmoButton = document.getElementById("pickupAmmoButton");

let flashlightAvailable = true;
let flashlightPickupPending = false;
let ammoAvailable = true;
let ammoPickupPending = false;

function grantFlashlightToLocalPlayer() {
  hasFlashlight = true;
  scene.remove(flashlightPickup);
  flashlightPickup.visible = false;
  pickupFlashlightButton.style.display = "none";

  if (firstItemSlot) {
    firstItemSlot.querySelector("span").textContent = "🔦";
    firstItemSlot.setAttribute("aria-label", "Slot 1: Lanterna");
    firstItemSlot.style.borderColor = "#8ed5ff";
  }
}

function applyFlashlightAvailability(available, collectorId = null) {
  flashlightAvailable = available;
  flashlightPickupPending = false;

  if (!available) {
    if (collectorId && collectorId === multiplayerPlayerId) {
      grantFlashlightToLocalPlayer();
    } else if (!hasFlashlight) {
      scene.remove(flashlightPickup);
      flashlightPickup.visible = false;
      pickupFlashlightButton.style.display = "none";
    }
  } else if (!hasFlashlight) {
    scene.add(flashlightPickup);
    flashlightPickup.visible = true;
  }
}

function grantAmmoToLocalPlayer() {
  const ammoToLoad = Math.min(50 - pistolMagazine, pistolReserve + 50);
  pistolMagazine += ammoToLoad;
  pistolReserve = Math.max(0, pistolReserve + 50 - ammoToLoad);
  scene.remove(ammoBox);
  pickupAmmoButton.style.display = "none";
  updateAmmoUI();
}

function applyAmmoAvailability(available, collectorId = null) {
  ammoAvailable = available;
  ammoPickupPending = false;

  if (!available) {
    if (collectorId && collectorId === multiplayerPlayerId) {
      grantAmmoToLocalPlayer();
    } else {
      scene.remove(ammoBox);
      pickupAmmoButton.style.display = "none";
    }
  } else {
    scene.add(ammoBox);
  }
}
const ammoCounter = document.getElementById("ammoCounter");
const shootButton = document.getElementById("shootButton");
const reloadButton = document.getElementById("reloadButton");

function updateAmmoUI() {
  ammoCounter.textContent = `${pistolMagazine}/${pistolReserve}`;
  ammoCounter.style.display = pistolEquipped ? "block" : "none";
  shootButton.style.display = pistolEquipped ? "block" : "none";
  reloadButton.style.display = pistolEquipped ? "block" : "none";
}

pickupAmmoButton.addEventListener("click", () => {
  if (!ammoAvailable || ammoPickupPending || !ammoBox.parent) return;

  const d = Math.hypot(
    player.position.x - ammoBox.position.x,
    player.position.z - ammoBox.position.z
  );
  if (d > 1.8) return;

  if (multiplayerRoomCode) {
    if (!multiplayerSocket ||
        multiplayerSocket.readyState !== WebSocket.OPEN) {
      console.warn("Conexão multiplayer indisponível.");
      return;
    }
    try {
      multiplayerSocket.send(JSON.stringify({ type: "collectAmmo" }));
      ammoPickupPending = true;
      pickupAmmoButton.style.display = "none";
    } catch (error) {
      console.error("Erro ao solicitar munição:", error);
    }
    return;
  }

  ammoAvailable = false;
  grantAmmoToLocalPlayer();
});

reloadButton.addEventListener("click", () => {
  if (!pistolEquipped || pistolReloading ||
      pistolMagazine >= 50 || pistolReserve <= 0) return;

  pistolReloadAmount = Math.min(50 - pistolMagazine, pistolReserve);
  pistolReloadTime = 0;
  pistolReloading = true;

  // Dois sons curtos separados durante a recarga.
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const audio = new AudioCtx();

      const playBurst = (when, duration, cutoff, volume) => {
        const length = Math.floor(audio.sampleRate * duration);
        const buffer = audio.createBuffer(1, length, audio.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = audio.createBufferSource();
        const filter = audio.createBiquadFilter();
        const gain = audio.createGain();

        source.buffer = buffer;
        filter.type = "highpass";
        filter.frequency.value = cutoff;
        gain.gain.setValueAtTime(0.001, when);
        gain.gain.linearRampToValueAtTime(volume, when + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, when + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audio.destination);
        source.start(when);
        source.stop(when + duration);
      };

      const play = () => {
        const now = audio.currentTime;

        // Primeiro: mecanismo engasgando quando a mão começa a sair.
        playBurst(now, 0.12, 650, 0.22);

        // Segundo: chiado curto quando a mão está quase voltando.
        playBurst(now + 0.90, 0.16, 2800, 0.13);

        setTimeout(() => audio.close().catch(() => {}), 1600);
      };

      if (audio.state === "suspended") {
        audio.resume().then(play).catch(() => {});
      } else {
        play();
      }
    }
  } catch (error) {
    console.warn("Não foi possível tocar os sons de recarga:", error);
  }
});

shootButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (!pistolEquipped || pistolMagazine <= 0) return;

  pistolMagazine--;
  updateAmmoUI();

  // Clarão curto na ponta do cano.
  muzzleFlash.visible = true;
  muzzleLight.visible = true;
  setTimeout(() => {
    muzzleFlash.visible = false;
    muzzleLight.visible = false;
  }, 70);

  // Som de disparo sintetizado: estalo, grave e eco curto.
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const audio = new AudioCtx();

      const playNoise = (duration, volume, frequency) => {
        const length = Math.floor(audio.sampleRate * duration);
        const buffer = audio.createBuffer(1, length, audio.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) *
            Math.pow(1 - i / length, 2);
        }

        const source = audio.createBufferSource();
        const filter = audio.createBiquadFilter();
        const gain = audio.createGain();

        source.buffer = buffer;
        filter.type = "lowpass";
        filter.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001, audio.currentTime + duration
        );

        source.connect(filter);
        filter.connect(gain);
        gain.connect(audio.destination);
        source.start();
        source.stop(audio.currentTime + duration);
        source.onended = () => {
          source.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      };

      // Estalo agudo e curto.
      playNoise(0.09, 0.45, 4200);

      // Corpo grave do disparo.
      const oscillator = audio.createOscillator();
      const bassGain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(105, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        38, audio.currentTime + 0.18
      );
      bassGain.gain.setValueAtTime(0.4, audio.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(
        0.001, audio.currentTime + 0.2
      );
      oscillator.connect(bassGain);
      bassGain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.2);

      // Pequena reflexão sonora para dar sensação de espaço.
      setTimeout(() => {
        if (audio.state !== "closed") {
          playNoise(0.12, 0.10, 1600);
        }
      }, 75);

      oscillator.onended = () => {
        oscillator.disconnect();
        bassGain.disconnect();
        setTimeout(() => {
          if (audio.state !== "closed") audio.close();
        }, 250);
      };
    }
  } catch (error) {
    console.warn("Não foi possível reproduzir o som do disparo.", error);
  }
});


pickupFlashlightButton.addEventListener("click", () => {
  if (hasFlashlight || !flashlightAvailable || flashlightPickupPending) return;

  const distance = Math.hypot(
    player.position.x - flashlightPickup.position.x,
    player.position.z - flashlightPickup.position.z
  );
  if (distance > 1.8) return;

  if (multiplayerRoomCode) {
    if (!multiplayerSocket ||
        multiplayerSocket.readyState !== WebSocket.OPEN) {
      console.warn("Conexão multiplayer indisponível.");
      return;
    }
    try {
      multiplayerSocket.send(JSON.stringify({ type: "collectFlashlight" }));
      flashlightPickupPending = true;
      pickupFlashlightButton.style.display = "none";
    } catch (error) {
      console.error("Erro ao solicitar lanterna:", error);
    }
    return;
  }

  flashlightAvailable = false;
  grantFlashlightToLocalPlayer();
});


// Coleta da pistola e inventário do slot 2.
pickupPistolButton.addEventListener("click", () => {
  if (hasPistol || !pistolAvailable || pistolPickupPending) return;

  const distance = Math.hypot(
    player.position.x - pistolPickup.position.x,
    player.position.z - pistolPickup.position.z
  );

  if (distance > 1.8) return;

  if (multiplayerRoomCode) {
    if (
      !multiplayerSocket ||
      multiplayerSocket.readyState !== WebSocket.OPEN
    ) {
      console.warn("Não foi possível coletar: conexão multiplayer indisponível.");
      return;
    }

    try {
      multiplayerSocket.send(JSON.stringify({ type: "collectPistol" }));
      pistolPickupPending = true;
      pickupPistolButton.style.display = "none";
    } catch (error) {
      console.error("Erro ao solicitar a pistola:", error);
    }

    return;
  }

  grantPistolToLocalPlayer();
});

secondItemSlot.addEventListener("click", () => {
  if (!hasPistol) return;

  if (!pistolEquipped) {
    if (!rightHandBone) {
      console.warn("A mão direita ainda não foi carregada.");
      return;
    }

    if (flashlightEquipped) firstItemSlot.click();

    rightHandBone.attach(pistolPickup);
    pistolPickup.position.set(-0.08, -0.02, 0.10);
    pistolPickup.rotation.set(Math.PI / 2, Math.PI, 0);
    pistolPickup.visible = true;
    pistolEquipped = true;
    pistolCrosshair.style.display = "block";
    updateAmmoUI();
    secondItemSlot.style.borderColor = "#ffcc80";
    secondItemSlot.setAttribute("aria-label", "Slot 2: Pistola equipada");
  } else {
    pistolPickup.visible = false;
    scene.remove(pistolPickup);
    pistolEquipped = false;
    pistolCrosshair.style.display = "none";
    updateAmmoUI();
    secondItemSlot.setAttribute("aria-label", "Slot 2: Pistola guardada");
  }
});

// Tocar no slot 1 alterna entre equipar e guardar a lanterna.
firstItemSlot.addEventListener("click", () => {
  if (!hasFlashlight) return;

  if (!flashlightEquipped) {
    if (!rightHandBone) {
      console.warn("A mão direita ainda não foi carregada.");
      return;
    }

    // Prende a lanterna à mão direita para acompanhar a animação.
    rightHandBone.attach(flashlightPickup);
    flashlightPickup.position.set(0, -0.12, 0);
    flashlightPickup.rotation.set(0, Math.PI, 0);
    flashlightPickup.visible = true;
    flashlightLight.visible = true;
    flashlightBeam.visible = false;
    flashlightEquipped = true;

    firstItemSlot.style.background = "rgba(35,75,105,.95)";
    firstItemSlot.style.borderColor = "#8ed5ff";
    firstItemSlot.setAttribute("aria-label", "Slot 1: Lanterna equipada");
  } else {
    flashlightLight.visible = false;
    flashlightBeam.visible = false;
    flashlightPickup.visible = false;
    scene.remove(flashlightPickup);
    flashlightEquipped = false;

    firstItemSlot.style.background = "rgba(12,19,31,.78)";
    firstItemSlot.style.borderColor = "rgba(190,210,235,.7)";
    firstItemSlot.setAttribute("aria-label", "Slot 1: Lanterna guardada");
  }
});

const style = document.createElement('style');
style.textContent = `
  #pistolCrosshair {
    display:none;
    position:fixed;
    left:50%;
    top:50%;
    width:20px;
    height:20px;
    transform:translate(-50%,-50%);
    z-index:24;
    pointer-events:none;
  }
  #pistolCrosshair::before, #pistolCrosshair::after {
    content:"";
    position:absolute;
    background:#fff;
    box-shadow:0 0 3px #000;
  }
  #pistolCrosshair::before {
    left:9px; top:0; width:2px; height:20px;
  }
  #pistolCrosshair::after {
    left:0; top:9px; width:20px; height:2px;
  }
  #pickupPistolButton {
    display:none;
    position:fixed;
    left:50%;
    bottom:155px;
    transform:translateX(-50%);
    padding:13px 18px;
    border:1px solid #ffcc80;
    border-radius:12px;
    background:rgba(40,29,20,.95);
    color:#fff;
    font:bold 14px Arial,sans-serif;
    z-index:26;
  }
  #pickupAmmoButton {
    display:none; position:fixed; left:50%; bottom:205px;
    transform:translateX(-50%); padding:13px 18px;
    border:1px solid #b5d18a; border-radius:12px;
    background:rgba(45,65,30,.96); color:white;
    font:bold 14px Arial,sans-serif; z-index:26;
  }
  #ammoCounter {
    position:fixed; top:18px; left:50%; transform:translateX(-50%);
    padding:8px 13px; border-radius:10px;
    background:rgba(12,19,31,.88); color:white;
    font:bold 18px Arial,sans-serif; z-index:25; pointer-events:none;
  }
  #shootButton {
    display:none; position:fixed; right:28px; bottom:205px;
    width:76px; height:76px; border-radius:50%;
    border:2px solid white; background:rgba(165,45,35,.88);
    color:white; font:bold 13px Arial,sans-serif;
    z-index:25; touch-action:none; user-select:none;
  }
  #reloadButton {
    display:none; position:fixed; right:22px; bottom:295px;
    padding:12px 14px; border-radius:12px;
    border:2px solid white; background:rgba(35,105,65,.95);
    color:white; font:bold 13px Arial,sans-serif;
    z-index:25; touch-action:manipulation;
  }
  #stickBase {
    position:fixed; left:25px; bottom:35px;
    width:125px; height:125px; border-radius:50%;
    background:rgba(220,235,255,.16);
    border:2px solid rgba(255,255,255,.45);
    z-index:10; touch-action:none;
  }
  #stickKnob {
    position:absolute; left:35px; top:35px;
    width:55px; height:55px; border-radius:50%;
    background:rgba(235,242,255,.75);
    border:2px solid white; box-sizing:border-box;
    pointer-events:none;
  }
  #runButton {
    position:fixed; right:25px; bottom:42px;
    padding:17px 20px; border-radius:14px;
    border:2px solid white; background:rgba(25,95,170,.85);
    color:white; font-weight:bold; font-size:15px;
    z-index:10; touch-action:none;
  }
  #crouchButton {
    position:fixed; right:25px; bottom:125px;
    padding:14px 16px; border-radius:14px;
    border:2px solid white; background:rgba(65,75,90,.9);
    color:white; font-weight:bold; font-size:13px;
    z-index:10; touch-action:none;
  }
  #crouchButton.active { background:rgba(190,125,45,.95); }
  #runButton.active { background:rgba(25,180,90,.95); }

  #cameraSettingsButton {
    position:fixed; top:18px; right:18px; width:48px; height:48px;
    border-radius:14px; background:rgba(20,28,42,.9); color:white;
    font-size:25px; z-index:30;
  }
  #cameraSettingsPanel {
    display:none; position:fixed; top:76px; right:16px;
    width:min(270px, calc(100vw - 32px)); padding:18px;
    box-sizing:border-box; border-radius:16px;
    background:rgba(17,23,34,.97); color:white;
    font:14px Arial,sans-serif; z-index:31;
  }
  #cameraSettingsPanel.open { display:block; }
  #cameraDistanceSlider { width:100%; }
  #cameraDistanceValue { margin:10px 0; text-align:center; }
  #cameraSettingsClose {
    width:100%; padding:10px; border-radius:9px;
    background:#283448; color:white;
  }

  #multiplayerButton {
    position:fixed; left:12px; top:14px;
    padding:12px 13px; border:1px solid #57d6ff;
    border-radius:11px; background:rgba(10,35,53,.96);
    color:#fff; font:bold 12px Arial,sans-serif;
    letter-spacing:.5px; z-index:32;
  }
  #multiplayerPanel {
    display:none; position:fixed; left:12px; top:65px;
    width:min(290px, calc(100vw - 24px));
    max-height:calc(100vh - 85px); overflow-y:auto;
    box-sizing:border-box; padding:16px;
    border:1px solid #315773; border-radius:15px;
    background:rgba(8,17,29,.97); color:white;
    font:14px Arial,sans-serif; z-index:41;
  }
  #multiplayerPanel.open { display:block; }
  #multiplayerPanel h2 { margin:0 0 12px; text-align:center; font-size:18px; }
  #multiplayerStatus { margin:8px 0 12px; text-align:center; color:#ffd27a; }
  #multiplayerPanel button {
    width:100%; padding:11px; margin-top:8px;
    border:1px solid #355a78; border-radius:9px;
    background:#17344d; color:white; font-weight:bold;
  }
  #multiplayerPanel input {
    display:block; box-sizing:border-box; width:100%;
    margin-top:8px; padding:12px; border-radius:9px;
    border:1px solid #54718a; background:#101d2b;
    color:white; font-size:18px; text-align:center; letter-spacing:5px;
  }
  #createdRoomCode { margin-top:12px; padding:10px; text-align:center; background:#122b3d; border-radius:10px; }
  #createdRoomCode p { margin:0 0 6px; font-size:11px; color:#a8cce4; }
  #roomCodeDisplay { font-size:30px; letter-spacing:7px; color:#71e3ff; }
  .multiplayerDivider { height:1px; margin:15px 0; background:#294054; }
  #multiplayerRoomInfo { margin-top:10px; text-align:center; color:#a8e6bd; }
  #multiplayerCloseButton { background:#293448 !important; }
  #skinsButton {
    position:fixed; left:12px; top:42%;
    padding:13px 10px; border:1px solid #72baff;
    border-radius:12px; background:rgba(17,30,49,.94);
    color:#fff; font:bold 13px Arial,sans-serif;
    letter-spacing:1px; z-index:25;
  }
  #skinsPanel {
    display:none; position:fixed; left:50%; top:50%;
    transform:translate(-50%,-50%);
    width:min(350px, calc(100vw - 32px));
    max-height:80vh; overflow-y:auto; box-sizing:border-box;
    padding:18px; border:1px solid #344b68; border-radius:18px;
    background:rgba(12,19,31,.98); color:#fff;
    font:14px Arial,sans-serif; z-index:40;
  }
  #skinsPanel.open { display:block; }
  #skinsPanel h2 { margin:4px 0 12px; text-align:center; font-size:19px; }
  #skinsPanel p { text-align:center; color:#b9c7d8; }
  #skinsPanel button {
    box-sizing:border-box; color:#fff; cursor:pointer;
  }
  .skinCategory, #skinsClose, #skinsBack {
    width:100%; padding:12px; margin-top:8px;
    border:1px solid #344b68; border-radius:10px;
    background:#1b2b41; font-size:15px;
  }
  #skinsClose { background:#293448; margin-top:16px; }
  #skinsSlots {
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
    gap:10px; margin-top:16px;
  }
  .skinSlot {
    min-width:0; aspect-ratio:1/1;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:8px;
    border:1px dashed #58708d; border-radius:12px;
    background:rgba(35,51,72,.55); color:#a9bfd7;
  }
  .skinSlot .slotPlus { font-size:27px; color:#8fc9ff; }
  .skinSlot .slotNumber { font-size:11px; color:#8fa5bd; }
  @media (max-height:500px) {
    #skinsPanel { max-height:90vh; }
    .skinSlot { aspect-ratio:1.25/1; }
  }
  #itemBar {
    position:fixed; left:50%; bottom:12px;
    transform:translateX(-50%);
    display:flex; gap:7px; align-items:center; justify-content:center;
    z-index:12; pointer-events:auto;
    max-width:calc(100vw - 150px);
  }
  .itemSlot {
    position:relative; flex:0 1 52px;
    width:52px; height:52px; min-width:0;
    padding:0; border:2px solid rgba(190,210,235,.7);
    border-radius:10px; box-sizing:border-box;
    background:rgba(12,19,31,.78); color:#d9e8fa;
    touch-action:manipulation;
  }
  .itemSlot span { font:24px Arial,sans-serif; opacity:.8; }
  .itemSlot small {
    position:absolute; left:4px; top:2px;
    font:10px Arial,sans-serif; color:#c4d2e4;
  }
  @media (max-width:380px) {
    #itemBar { gap:5px; max-width:calc(100vw - 130px); }
    .itemSlot { width:44px; height:46px; }
  }

  #pickupFlashlightButton {
    position:fixed; left:50%; bottom:78px; transform:translateX(-50%);
    z-index:20; padding:12px 18px; border:1px solid #a8d8ff;
    border-radius:10px; background:rgba(18,35,55,.95);
    color:#f1f8ff; font:bold 14px Arial,sans-serif;
    touch-action:manipulation;
  }
  #helpText {
    position:fixed; top:12px; left:0; width:100%;
    text-align:center; color:white; font:11px Arial,sans-serif;
    text-shadow:0 1px 4px black; pointer-events:none;
  }
`;
document.head.appendChild(style);

const stickBase = document.getElementById('stickBase');
const stickKnob = document.getElementById('stickKnob');
const runButton = document.getElementById('runButton');
const crouchButton = document.getElementById('crouchButton');
let crouching = false;

function setCrouching(value) {
  crouching = value;
  crouchButton.classList.toggle('active', value);
  crouchButton.textContent = value ? 'AGACHADO' : 'AGACHAR';
}

crouchButton.addEventListener('click', event => {
  event.preventDefault();
  setCrouching(!crouching);
});

const cameraSettingsButton = document.getElementById('cameraSettingsButton');
const cameraSettingsPanel = document.getElementById('cameraSettingsPanel');
const cameraSettingsClose = document.getElementById('cameraSettingsClose');
const cameraDistanceSlider = document.getElementById('cameraDistanceSlider');
const cameraDistanceValue = document.getElementById('cameraDistanceValue');
const defaultCameraFov = camera.fov;

const supportFoldSlider = document.getElementById('supportFoldSlider');
const supportHeightSlider = document.getElementById('supportHeightSlider');
const supportTiltSlider = document.getElementById('supportTiltSlider');
const supportFoldValue = document.getElementById('supportFoldValue');
const supportHeightValue = document.getElementById('supportHeightValue');
const supportTiltValue = document.getElementById('supportTiltValue');
const supportSaveButton = document.getElementById('supportSaveButton');
const supportResetButton = document.getElementById('supportResetButton');

const defaultSupportSettings = { fold: 35, height: 0, tilt: 0 };
let savedSupportSettings = { ...defaultSupportSettings };

function updateSupportControls() {
  const fold = Number(supportFoldSlider.value);
  const height = Number(supportHeightSlider.value);
  const tilt = Number(supportTiltSlider.value);

  supportFoldValue.textContent = `${fold}%`;
  supportHeightValue.textContent = `${height}`;
  supportTiltValue.textContent = `${tilt}°`;

  // Atualiza a prévia SVG para representar a dobra escolhida.
  const bend = fold / 100;
  const y = 45 - height * 0.45;
  const x2 = 90 + bend * 28;
  const y2 = y - bend * 28;
  const x3 = 145 + bend * 22;
  const y3 = 25 + bend * 38 - height * 0.25;
  const x4 = 180 + bend * 12;
  const y4 = 40 + bend * 20 - height * 0.2;

  document.getElementById('previewArm1')
    .setAttribute('d', `M30 55 L${x2} ${y}`);
  document.getElementById('previewArm2')
    .setAttribute('d', `M${x2} ${y} L${x3} ${y3}`);
  document.getElementById('previewArm3')
    .setAttribute('d', `M${x3} ${y3} L${x4} ${y4}`);

  const previewCamera = document.getElementById('previewCamera');
  previewCamera.setAttribute('x', String(x4 - 4));
  previewCamera.setAttribute('y', String(y4 - 10));
  previewCamera.setAttribute('transform', `rotate(${tilt} ${x4 + 15} ${y4})`);

  // A configuração é aplicada ao suporte real quando ele estiver disponível.
  const rig = player.userData.backCameraRig;
  const lens = player.userData.backCameraLens;

  if (rig) {
    if (!rig.userData.supportBasePosition) {
      rig.userData.supportBasePosition = rig.position.clone();
    }
    rig.userData.supportFold = fold / 100;
    rig.userData.supportHeight = height / 100;

    if (rig.userData.rebuildSupport) {
      rig.userData.rebuildSupport(fold / 100, height);
    }
  }

  if (lens) {
    lens.rotation.x = THREE.MathUtils.degToRad(tilt);
    lens.userData.supportTilt = tilt;
  }
}

[supportFoldSlider, supportHeightSlider, supportTiltSlider].forEach(slider => {
  slider.addEventListener('input', updateSupportControls);
});

supportSaveButton.addEventListener('click', () => {
  savedSupportSettings = {
    fold: Number(supportFoldSlider.value),
    height: Number(supportHeightSlider.value),
    tilt: Number(supportTiltSlider.value)
  };
  supportSaveButton.textContent = 'POSIÇÃO SALVA';
});

function applySupportSettings(settings) {
  supportFoldSlider.value = settings.fold;
  supportHeightSlider.value = settings.height;
  supportTiltSlider.value = settings.tilt;
  updateSupportControls();
}

supportResetButton.addEventListener('click', () => {
  applySupportSettings(defaultSupportSettings);
});

updateSupportControls();


cameraSettingsButton.addEventListener('click', () => {
  cameraSettingsPanel.classList.toggle('open');
});
cameraSettingsClose.addEventListener('click', () => {
  cameraSettingsPanel.classList.remove('open');
});

// MULTIPLAYER: conexão com o servidor remoto.
const multiplayerButton = document.getElementById('multiplayerButton');
const multiplayerPanel = document.getElementById('multiplayerPanel');
const multiplayerStatus = document.getElementById('multiplayerStatus');
const createRoomButton = document.getElementById('createRoomButton');
const joinRoomButton = document.getElementById('joinRoomButton');
const joinRoomInput = document.getElementById('joinRoomInput');
const createdRoomCode = document.getElementById('createdRoomCode');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const multiplayerRoomInfo = document.getElementById('multiplayerRoomInfo');
const multiplayerCloseButton = document.getElementById('multiplayerCloseButton');

const MULTIPLAYER_SERVER_URL = 'wss://blackgates-server.onrender.com';
let multiplayerSocket = null;
let multiplayerConnecting = false;
let multiplayerRoomCode = null;

function setMultiplayerStatus(message, color = '#ffd27a') {
  multiplayerStatus.textContent = message;
  multiplayerStatus.style.color = color;
}

function connectMultiplayer() {
  if (multiplayerSocket && multiplayerSocket.readyState === WebSocket.OPEN) {
    setMultiplayerStatus('Conectado ao servidor', '#8cf0ad');
    return;
  }
  if (multiplayerConnecting) return;
  multiplayerConnecting = true;
  setMultiplayerStatus('Conectando ao servidor...');
  multiplayerRoomInfo.textContent = '';

  try {
    const socket = new WebSocket(MULTIPLAYER_SERVER_URL);
    multiplayerSocket = socket;
    socket.addEventListener('open', () => {
      multiplayerConnecting = false;
      setMultiplayerStatus('Conectado ao servidor', '#8cf0ad');
    });
    socket.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }

      if (message.type === 'connected') {
        multiplayerPlayerId = message.playerId || message.id || null;
        setMultiplayerStatus('Conectado ao servidor', '#8cf0ad');
      } else if (message.type === 'roomCreated') {
        multiplayerRoomCode = String(message.roomCode || message.code || '');
        multiplayerPlayerId = message.playerId || multiplayerPlayerId;
        roomCodeDisplay.textContent = multiplayerRoomCode;
        createdRoomCode.style.display = 'block';
        multiplayerRoomInfo.textContent = 'Sala criada! Compartilhe o código.';
        if (typeof message.flashlightAvailable === 'boolean') {
          applyFlashlightAvailability(message.flashlightAvailable);
        }
        if (typeof message.ammoAvailable === 'boolean') {
          applyAmmoAvailability(message.ammoAvailable);
        }
        if (typeof message.roomLightsOn === 'boolean') {
          applyRoomLights(message.roomLightsOn);
    if (typeof message.pistolAvailable === 'boolean') {
      applyPistolAvailability(message.pistolAvailable);
    }
        }
      } else if (message.type === 'roomJoined') {
        multiplayerRoomCode = String(message.roomCode || message.code || joinRoomInput.value);
        multiplayerPlayerId = message.playerId || multiplayerPlayerId;
        roomCodeDisplay.textContent = multiplayerRoomCode;
        createdRoomCode.style.display = 'block';
        multiplayerRoomInfo.textContent = 'Você entrou na sala.';
        if (typeof message.flashlightAvailable === 'boolean') {
          applyFlashlightAvailability(message.flashlightAvailable);
        }
        if (typeof message.ammoAvailable === 'boolean') {
          applyAmmoAvailability(message.ammoAvailable);
        }
        if (typeof message.roomLightsOn === 'boolean') {
          applyRoomLights(message.roomLightsOn);
    if (typeof message.pistolAvailable === 'boolean') {
      applyPistolAvailability(message.pistolAvailable);
    }
        }
        if (Array.isArray(message.players)) {
          for (const item of message.players) {
            const id = typeof item === 'string' ? item : item?.playerId || item?.id;
            if (id && id !== multiplayerPlayerId && item?.state) {
              updateRemotePlayerState(id, item.state);
            }
          }
        }
      } else if (message.type === 'playerJoined') {
        multiplayerRoomInfo.textContent = 'Outro jogador entrou na sala.';
      } else if (message.type === 'roomLights') {
        if (typeof message.roomLightsOn === 'boolean') {
          applyRoomLights(message.roomLightsOn);
        }
      } else if (message.type === 'flashlightAvailability') {
        if (message.available === false && !message.playerId) {
          flashlightPickupPending = false;
          flashlightAvailable = false;
          pickupFlashlightButton.style.display = 'none';
        } else {
          applyFlashlightAvailability(
            message.available === true, message.playerId || null
          );
        }
      } else if (message.type === 'ammoAvailability') {
        if (message.available === false && !message.playerId) {
          ammoPickupPending = false;
          ammoAvailable = false;
          pickupAmmoButton.style.display = 'none';
        } else {
          applyAmmoAvailability(
            message.available === true, message.playerId || null
          );
        }
      } else if (message.type === 'pistolAvailability') {
    applyPistolAvailability(
      message.available === true,
      message.playerId || null
    );
  } else if (message.type === 'sync') {
        const id = message.playerId || message.id;
        const state = message.state || message;
        updateRemotePlayerState(id, state);
      } else if (message.type === 'playerLeft') {
        const id = message.playerId || message.id;
        if (id) removeRemotePlayer(id);
        multiplayerRoomInfo.textContent = 'Um jogador saiu da sala.';
      } else if (message.type === 'leftRoom') {
        multiplayerRoomCode = null;
        clearRemotePlayers();
        multiplayerRoomInfo.textContent = 'Você saiu da sala.';
      } else if (message.type === 'error') {
        multiplayerRoomInfo.textContent = message.message || 'Não foi possível realizar essa ação.';
      }
    });
    socket.addEventListener('error', () => {
      setMultiplayerStatus('Falha na conexão. Tente novamente.', '#ff9999');
    });
    socket.addEventListener('close', () => {
      multiplayerConnecting = false;
      if (multiplayerSocket === socket) {
        multiplayerSocket = null;
        multiplayerRoomCode = null;
        multiplayerPlayerId = null;
        multiplayerSyncTimer = 0;
        clearRemotePlayers();
        setMultiplayerStatus('Desconectado. Toque para reconectar.');
      }
    });
  } catch {
    multiplayerConnecting = false;
    setMultiplayerStatus('Não foi possível conectar.', '#ff9999');
  }
}

multiplayerButton.addEventListener('click', () => {
  cameraSettingsPanel.classList.remove('open');
  skinsPanel.classList.remove('open');
  multiplayerPanel.classList.toggle('open');
  if (multiplayerPanel.classList.contains('open')) connectMultiplayer();
});
multiplayerCloseButton.addEventListener('click', () => {
  if (multiplayerRoomCode &&
      multiplayerSocket &&
      multiplayerSocket.readyState === WebSocket.OPEN) {
    multiplayerSocket.send(JSON.stringify({ type: 'leaveRoom' }));
  }
  multiplayerRoomCode = null;
  clearRemotePlayers();
  multiplayerPanel.classList.remove('open');
});

createRoomButton.addEventListener('click', () => {
  if (!multiplayerSocket || multiplayerSocket.readyState !== WebSocket.OPEN) {
    connectMultiplayer();
    setMultiplayerStatus('Conectando... toque em CRIAR SALA novamente.');
    return;
  }
  multiplayerRoomInfo.textContent = '';
  createdRoomCode.style.display = 'none';
  multiplayerSocket.send(JSON.stringify({ type: 'createRoom' }));
});

joinRoomInput.addEventListener('input', () => {
  joinRoomInput.value = joinRoomInput.value.replace(/[^0-9]/g, '').slice(0, 5);
});
joinRoomButton.addEventListener('click', () => {
  const code = joinRoomInput.value.trim();
  if (!/^[0-9]{5}$/.test(code)) {
    multiplayerRoomInfo.textContent = 'Digite um código com exatamente 5 números.';
    return;
  }
  if (!multiplayerSocket || multiplayerSocket.readyState !== WebSocket.OPEN) {
    connectMultiplayer();
    multiplayerRoomInfo.textContent = 'Conectando... toque em ENTRAR novamente.';
    return;
  }
  multiplayerRoomInfo.textContent = '';
  multiplayerSocket.send(JSON.stringify({ type: 'joinRoom', roomCode: code }));
});

// MENU DE SKINS: quatro categorias independentes, seis slots por categoria.
const skinsButton = document.getElementById('skinsButton');
const skinsPanel = document.getElementById('skinsPanel');
const skinsMenu = document.getElementById('skinsMenu');
const skinsCategoryScreen = document.getElementById('skinsCategoryScreen');
const skinsCategoryTitle = document.getElementById('skinsCategoryTitle');
const skinsSlots = document.getElementById('skinsSlots');

function showSkinsMenu() {
  skinsCategoryScreen.style.display = 'none';
  skinsMenu.style.display = 'block';
}

skinsButton.addEventListener('click', () => {
  cameraSettingsPanel.classList.remove('open');
  skinsPanel.classList.toggle('open');
  showSkinsMenu();
});

document.getElementById('skinsClose').addEventListener('click', () => {
  skinsPanel.classList.remove('open');
});

document.getElementById('skinsBack').addEventListener('click', showSkinsMenu);

document.querySelectorAll('.skinCategory').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    skinsCategoryTitle.textContent = category.toUpperCase();
    skinsSlots.replaceChildren();

    for (let i = 1; i <= 6; i++) {
      const slot = document.createElement('div');
      slot.className = 'skinSlot';
      slot.setAttribute('aria-label', category + ', slot ' + i);

      const plus = document.createElement('span');
      plus.className = 'slotPlus';
      plus.textContent = '+';

      const number = document.createElement('span');
      number.className = 'slotNumber';
      number.textContent = 'SLOT ' + i;

      if (category === 'Cabelo' && i === 1) {
        plus.textContent = '💈';
        number.textContent = 'SLOT 1';
        slot.style.cursor = 'pointer';
        slot.addEventListener('click', () => {
          if (window.blackGatesHairSlot1) {
            window.blackGatesHairSlot1.visible = true;
            number.textContent = 'SLOT 1 ✓';
          }
        });
      }

      if (category === 'Conjunto' && i === 1) {
        plus.textContent = '';
        number.textContent = 'SLOT 1';
        slot.style.background = '#000000';
        slot.style.borderColor = '#000000';
        slot.style.color = '#000000';
        slot.style.cursor = 'pointer';
        slot.addEventListener('click', () => {
          applySuitSkin();
          number.textContent = 'SLOT 1 ✓';
        });
      }

      slot.append(plus, number);
      skinsSlots.appendChild(slot);
    }

    skinsMenu.style.display = 'none';
    skinsCategoryScreen.style.display = 'block';
  });
});

cameraDistanceSlider.addEventListener('input', () => {
  const distance = Number(cameraDistanceSlider.value);
  camera.fov = THREE.MathUtils.clamp(defaultCameraFov * (4.5 / distance), 25, 95);
  camera.updateProjectionMatrix();
  cameraDistanceValue.textContent =
    distance < 3 ? 'Perto' : distance > 6.5 ? 'Longe' : 'Normal';
});


let stickX = 0;
let stickY = 0;
let stickPointer = null;
let running = false;
let cameraYaw = 0;
let cameraPitch = 0.28;
let cameraPointer = null;
let lastTouchX = 0;
let lastTouchY = 0;

function updateStick(event) {
  const rect = stickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const max = 43;
  const length = Math.hypot(dx, dy);

  if (length > max) {
    const scale = max / length;
    dx *= scale;
    dy *= scale;
  }

  stickX = THREE.MathUtils.clamp(dx / max, -1, 1);
  stickY = THREE.MathUtils.clamp(dy / max, -1, 1);

  stickKnob.style.transform =
    `translate(${dx}px, ${dy}px)`;
}

function releaseStick() {
  stickPointer = null;
  stickX = 0;
  stickY = 0;
  stickKnob.style.transform = 'translate(0px, 0px)';
}

stickBase.addEventListener('pointerdown', event => {
  event.preventDefault();
  stickPointer = event.pointerId;
  stickBase.setPointerCapture(event.pointerId);
  updateStick(event);
});
stickBase.addEventListener('pointermove', event => {
  if (event.pointerId === stickPointer) updateStick(event);
});
stickBase.addEventListener('pointerup', releaseStick);
stickBase.addEventListener('pointercancel', releaseStick);

function setRunning(value) {
  running = value;
  runButton.classList.toggle('active', value);
}
runButton.addEventListener('click', event => {
  event.preventDefault();
  setRunning(!running);
});

// OLHAR: arraste com o dedo na metade direita da tela
renderer.domElement.addEventListener('pointerdown', event => {
  switchPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  switchPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  switchRaycaster.setFromCamera(switchPointer, camera);
  if (switchRaycaster.intersectObjects(switchGroup.children, false).length > 0) {
    event.preventDefault();
    toggleRoomLights();
    cameraPointer = null;
    return;
  }

  if (event.clientX < window.innerWidth * 0.42) return;
  cameraPointer = event.pointerId;
  lastTouchX = event.clientX;
  lastTouchY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});
renderer.domElement.addEventListener('pointermove', event => {
  if (event.pointerId !== cameraPointer) return;
  const dx = event.clientX - lastTouchX;
  const dy = event.clientY - lastTouchY;
  cameraYaw -= dx * 0.006;
  cameraPitch = THREE.MathUtils.clamp(
    cameraPitch + dy * 0.003, -0.60, 1.3
  );
  lastTouchX = event.clientX;
  lastTouchY = event.clientY;
});
function stopCameraDrag() {
  cameraPointer = null;
}
renderer.domElement.addEventListener('pointerup', stopCameraDrag);
renderer.domElement.addEventListener('pointercancel', stopCameraDrag);

// TECLADO OPCIONAL
const keys = {};
window.addEventListener('keydown', event => {
  keys[event.key.toLowerCase()] = true;
  if (event.key === 'Shift') setRunning(true);
});
window.addEventListener('keyup', event => {
  keys[event.key.toLowerCase()] = false;
  if (event.key === 'Shift') setRunning(false);
});

// MOVIMENTO E CAMERA
const cameraTarget = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();
const clock = new THREE.Clock();
let walkTime = 0;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  let forward = -stickY;
  let side = stickX;
  if (keys.w || keys.arrowup) forward = 1;
  if (keys.s || keys.arrowdown) forward = -1;
  if (keys.a || keys.arrowleft) side = -1;
  if (keys.d || keys.arrowright) side = 1;

  const inputLength = Math.hypot(forward, side);
  if (inputLength > 1) {
    forward /= inputLength;
    side /= inputLength;
  }

  const speed = running ? 5.2 : 2.6;
  const moveX = -Math.sin(cameraYaw) * forward +
                 Math.cos(cameraYaw) * side;
  const moveZ = -Math.cos(cameraYaw) * forward -
                 Math.sin(cameraYaw) * side;

  player.position.x += moveX * speed * delta;
  player.position.z += moveZ * speed * delta;

  const limit = roomSize / 2 - 0.65;
  player.position.x = THREE.MathUtils.clamp(
    player.position.x, -limit, limit
  );
  player.position.z = THREE.MathUtils.clamp(
    player.position.z, -limit, limit
  );

  // Envia a posição local ao servidor dez vezes por segundo.
  if (multiplayerRoomCode &&
      multiplayerSocket &&
      multiplayerSocket.readyState === WebSocket.OPEN) {
    multiplayerSyncTimer += delta;
    if (multiplayerSyncTimer >= 0.1) {
      multiplayerSyncTimer = 0;
      multiplayerSocket.send(JSON.stringify({
        type: 'sync',
        state: {
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
          rotationY: player.rotation.y,
          yaw: cameraYaw,
          aimPitch: cameraPitch,
          moving: inputLength > 0.12,
          running: running && inputLength > 0.12,
          crouching,
          pistolEquipped,
          flashlightEquipped,
          supportFold: player.userData.backCameraRig?.userData.supportFold ?? 0.35,
          supportHeight: player.userData.backCameraRig?.userData.supportHeight ?? 0,
          supportTilt: player.userData.backCameraLens?.userData.supportTilt ?? 0
        }
      }));
    }
  } else {
    multiplayerSyncTimer = 0;
  }

  const moving = inputLength > 0.12;

  switchCharacterAnimation(moving ? (walkAction || idleAction) : (idleAction || walkAction));

  // A corrida usa a caminhada acelerada, postura inclinada e impulsos verticais.
  if (walkAction) {
    walkAction.timeScale = running && moving ? 1.55 : 1;
  }

  // Remove a flexao do quadro anterior antes de atualizar a animacao.
  for (const bone of [leftThighBone, rightThighBone, leftShinBone, rightShinBone]) {
    if (bone && bone.userData.crouchOffset) {
      bone.quaternion.multiply(bone.userData.crouchOffset.clone().invert());
      delete bone.userData.crouchOffset;
    }
  }

  if (characterMixer) characterMixer.update(delta);

  if (headBone) {
    if (!headBone.userData.aimBaseRotation) {
      headBone.userData.aimBaseRotation = headBone.rotation.clone();
    }

    const headBase = headBone.userData.aimBaseRotation;
    const relativeHeadYaw = Math.atan2(
      Math.sin(cameraYaw - player.rotation.y),
      Math.cos(cameraYaw - player.rotation.y)
    );

    headBone.rotation.set(
      headBase.x + THREE.MathUtils.clamp(cameraPitch * 0.45, -0.35, 0.45),
      headBase.y + THREE.MathUtils.clamp(relativeHeadYaw, -0.65, 0.65),
      headBase.z
    );
  }

  // Ajusta a elevação e a direção do antebraço com a lanterna equipada.
  if (rightLowerArmBone && flashlightEquipped) {
    rightLowerArmBone.rotation.x -= Math.PI / 4;
    rightLowerArmBone.rotation.y += Math.PI / 3;
    rightLowerArmBone.rotation.z += Math.PI / 6;
  }


  // Flexiona os cotovelos e aproxima os braços do tronco ao correr.
  if (moving && running) {
    const armSwing = Math.sin(runPhase) * 0.12;

    if (leftUpperArmBone) leftUpperArmBone.rotation.z += 0.12 + armSwing;
    if (rightUpperArmBone) rightUpperArmBone.rotation.z -= 0.12 + armSwing;

    if (leftLowerArmBone) leftLowerArmBone.rotation.z -= 0.75;
    if (rightLowerArmBone) rightLowerArmBone.rotation.z += 0.75;
  }

  if (animatedCharacterModel) {
    let runBounce = 0;

    if (moving && running) {
      runPhase += delta * 17;
      runBounce = Math.abs(Math.sin(runPhase)) * 0.045;
    }

    // Mantém a inclinação normal da corrida e articula as pernas ao agachar.
    animatedCharacterModel.rotation.x = moving && running ? -0.12 : 0;
    animatedCharacterModel.position.y = characterModelBaseY + runBounce;

    const crouchAmount = crouching ? 1 : 0;


    if (hipsBone) {
      if (hipsBone.userData.crouchBaseY === undefined) {
        hipsBone.userData.crouchBaseY = hipsBone.position.y;
      }
      hipsBone.position.y = hipsBone.userData.crouchBaseY - 0.38 * crouchAmount;
    }

    // Flexao das pernas aplicada sobre a pose atual da animacao.
    const bendBone = (bone, angle) => {
      if (!bone) return;
      const offset = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        angle * crouchAmount
      );
      bone.quaternion.multiply(offset);
      if (crouchAmount) bone.userData.crouchOffset = offset;
    };

    bendBone(leftThighBone, -1.15);
    bendBone(rightThighBone, -1.15);
    bendBone(leftShinBone, 1.90);
    bendBone(rightShinBone, 1.90);
  }

  if (moving) {
    player.rotation.y = Math.atan2(-moveX, -moveZ);
    walkTime += delta * (running ? 12 : 7);
    const swing = Math.sin(walkTime) * 0.55;
    leftLeg.rotation.x = swing;
    rightLeg.rotation.x = -swing;
    leftArm.rotation.x = -swing * 0.7;
    rightArm.rotation.x = swing * 0.7;

    // Flexao suave dos cotovelos e joelhos
    leftElbow.rotation.x = 0.12 + Math.max(0, swing) * 0.45;
    rightElbow.rotation.x = 0.12 + Math.max(0, -swing) * 0.45;
    leftKnee.rotation.x = Math.max(0, -swing) * 0.65;
    rightKnee.rotation.x = Math.max(0, swing) * 0.65;
  } else {
    leftLeg.rotation.x *= 0.8;
    rightLeg.rotation.x *= 0.8;
    leftArm.rotation.x *= 0.8;
    rightArm.rotation.x *= 0.8;
    leftElbow.rotation.x *= 0.8;
    rightElbow.rotation.x *= 0.8;
    leftKnee.rotation.x *= 0.8;
    rightKnee.rotation.x *= 0.8;
  }

  // Controla a duração da animação e atualiza a munição ao terminar.
  if (pistolReloading) {
    pistolReloadTime += delta;
    if (pistolReloadTime >= 1.2) {
      pistolReloading = false;
      pistolMagazine += pistolReloadAmount;
      pistolReserve -= pistolReloadAmount;
      pistolReloadAmount = 0;
      updateAmmoUI();
    }
  }

  // Bracos mais estendidos, acompanhando a mira da camera.
  if (pistolEquipped) {
    const aimArmPitch = THREE.MathUtils.clamp(
      cameraPitch - 0.28,
      -0.63,
      1.02
    );

    const relativeAimYaw = Math.atan2(
      Math.sin(cameraYaw - player.rotation.y),
      Math.cos(cameraYaw - player.rotation.y)
    );

    const aimArmYaw = THREE.MathUtils.clamp(relativeAimYaw, -Math.PI, 1.65);

    const applyPistolPose = (bone, x, y, z) => {
      if (!bone) return;
      if (!bone.userData.pistolPoseBase) {
        bone.userData.pistolPoseBase = bone.rotation.clone();
      }
      const base = bone.userData.pistolPoseBase;
      bone.rotation.set(base.x + x, base.y + y, base.z + z);
    };

    // Os bracos apontam para a frente; cotovelos quase retos.
    // Braco esquerdo fixo; braco direito acompanha a mira.
    applyPistolPose(leftUpperArmBone, -0.90, -Math.PI / 2 + 0.35, 0.05);
    applyPistolPose(leftLowerArmBone, 0, 0, 0);
    applyPistolPose(rightUpperArmBone, aimArmPitch - 0.90, Math.PI / 2 + aimArmYaw, -0.05);
    applyPistolPose(rightLowerArmBone, aimArmPitch * 0.12, 0, 0);

    // A mao esquerda acompanha a direita e o braco superior aponta para ela.
    if (leftHandBone && rightHandBone && leftHandBone.parent && leftUpperArmBone) {
      player.updateWorldMatrix(true, true);

      const rightHandWorld = new THREE.Vector3();
      rightHandBone.getWorldPosition(rightHandWorld);

      const handOffset = new THREE.Vector3(-0.12, 0, 0);
      handOffset.applyQuaternion(player.getWorldQuaternion(new THREE.Quaternion()));
      rightHandWorld.add(handOffset);

      // Durante a recarga, a mão esquerda desce até o bolso.
      if (pistolReloading) {
        const t = Math.min(pistolReloadTime / 1.2, 1);
        let amount = 0;

        if (t < 0.25) {
          const a = t / 0.25;
          amount = a * a * (3 - 2 * a);
        } else if (t < 0.42) {
          amount = 1;
        } else if (t < 0.75) {
          const a = (t - 0.42) / 0.33;
          amount = 1 - a * a * (3 - 2 * a);
        }

        const pocketMove = new THREE.Vector3(0, -0.48, 0.18);
        pocketMove.applyQuaternion(
          player.getWorldQuaternion(new THREE.Quaternion())
        );
        rightHandWorld.addScaledVector(pocketMove, amount);
      }

      const upperParent = leftUpperArmBone.parent;
      upperParent.updateWorldMatrix(true, false);

      const shoulderWorld = new THREE.Vector3();
      leftUpperArmBone.getWorldPosition(shoulderWorld);

      const targetInParent = upperParent.worldToLocal(rightHandWorld.clone());
      const shoulderInParent = upperParent.worldToLocal(shoulderWorld.clone());
      const armDirection = targetInParent.sub(shoulderInParent).normalize();

      leftUpperArmBone.quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        armDirection
      );

      // Alinha o antebraco esquerdo do cotovelo ate a mao direita.
      player.updateWorldMatrix(true, true);
      if (leftLowerArmBone) {
        const lowerParent = leftLowerArmBone.parent;
        lowerParent.updateWorldMatrix(true, false);

        const elbowWorld = new THREE.Vector3();
        leftLowerArmBone.getWorldPosition(elbowWorld);

        const targetLower = lowerParent.worldToLocal(rightHandWorld.clone());
        const elbowLower = lowerParent.worldToLocal(elbowWorld.clone());
        const forearmDirection = targetLower.sub(elbowLower).normalize();

        leftLowerArmBone.quaternion.setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),
          forearmDirection
        );
      }

      leftHandBone.parent.updateWorldMatrix(true, false);
      leftHandBone.position.copy(
        leftHandBone.parent.worldToLocal(rightHandWorld)
      );
    }
  } else {
    for (const bone of [
      leftUpperArmBone,
      rightUpperArmBone,
      leftLowerArmBone,
      rightLowerArmBone
    ]) {
      if (bone) delete bone.userData.pistolPoseBase;
    }
  }

  // A lanterna acompanha a direcao para onde a camera esta olhando.
  if (flashlightEquipped) {
    flashlightPickup.updateWorldMatrix(true, false);

    const aimDirection = new THREE.Vector3(
      -Math.sin(cameraYaw) * Math.cos(cameraPitch),
      -Math.sin(cameraPitch),
      -Math.cos(cameraYaw) * Math.cos(cameraPitch)
    ).normalize();

    const flashlightWorldPosition = new THREE.Vector3();
    flashlightPickup.getWorldPosition(flashlightWorldPosition);

    flashlightTarget.position.copy(
      flashlightPickup.worldToLocal(
        flashlightWorldPosition.clone().addScaledVector(aimDirection, 5)
      )
    );
  }

  // Visao em primeira pessoa controlada pelo toque.
  const cameraRig = player.userData.backCameraRig;
  if (cameraRig) {
    if (cameraRig.userData.crouchBaseY === undefined) {
      cameraRig.userData.crouchBaseY = cameraRig.position.y;
    }
    cameraRig.position.y =
      cameraRig.userData.crouchBaseY - (crouching ? 0.45 : 0);
  }

  const physicalCamera = player.userData.backCameraLens;

  if (physicalCamera) {
    physicalCamera.updateWorldMatrix(true, false);
    physicalCamera.getWorldPosition(cameraPosition);

    const physicalDirection = new THREE.Vector3(
      -Math.sin(cameraYaw) * Math.cos(cameraPitch),
      -Math.sin(cameraPitch),
      -Math.cos(cameraYaw) * Math.cos(cameraPitch)
    ).normalize();

    cameraTarget.copy(cameraPosition)
      .addScaledVector(physicalDirection, 5);

    // Visao sobre o ombro direito: desloca a camera sem mover o alvo da mira.
    camera.position.copy(cameraPosition);
    if (flashlightEquipped || pistolEquipped) {
      // Visao sobre o ombro somente com a lanterna equipada.
      camera.position.x += Math.cos(cameraYaw) * 0.65;
      camera.position.z -= Math.sin(cameraYaw) * 0.65;
    }
    camera.lookAt(cameraTarget);
  } else {
    const crouchCameraOffset = crouching ? 0.55 : 0;
    cameraTarget.set(
      player.position.x,
      player.position.y + 1.35 - crouchCameraOffset,
      player.position.z
    );

    cameraPosition.set(
      player.position.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * 4.5,
      player.position.y + 1.35 - crouchCameraOffset + Math.sin(cameraPitch) * 4.5 + 0.7,
      player.position.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * 4.5
    );

    const cameraLimit = roomSize / 2 - 0.5;
    cameraPosition.x = THREE.MathUtils.clamp(cameraPosition.x, -cameraLimit, cameraLimit);
    cameraPosition.z = THREE.MathUtils.clamp(cameraPosition.z, -cameraLimit, cameraLimit);
    cameraPosition.y = THREE.MathUtils.clamp(cameraPosition.y, 1, wallHeight - 0.5);

    camera.position.lerp(cameraPosition, 1 - Math.exp(-7 * delta));
    camera.lookAt(cameraTarget);
  }


  if (!hasFlashlight && flashlightAvailable && !flashlightPickupPending) {
    const flashlightDistance = Math.hypot(
      player.position.x - flashlightPickup.position.x,
      player.position.z - flashlightPickup.position.z
    );
    pickupFlashlightButton.style.display =
      flashlightDistance < 1.8 ? "block" : "none";
  } else {
    pickupFlashlightButton.style.display = "none";
  }

  if (!hasPistol && pistolAvailable && !pistolPickupPending) {
    const pistolDistance = Math.hypot(
      player.position.x - pistolPickup.position.x,
      player.position.z - pistolPickup.position.z
    );
    pickupPistolButton.style.display =
      pistolDistance < 1.8 ? "block" : "none";
  } else {
    pickupPistolButton.style.display = "none";
  }

  if (ammoAvailable && !ammoPickupPending && ammoBox.parent) {
    const ammoDistance = Math.hypot(
      player.position.x - ammoBox.position.x,
      player.position.z - ammoBox.position.z
    );
    pickupAmmoButton.style.display =
      ammoDistance < 1.8 ? "block" : "none";
  } else {
    pickupAmmoButton.style.display = "none";
  }

  // Suaviza a movimentação dos personagens remotos.
  for (const remote of remotePlayers.values()) {
    remote.root.position.lerp(remote.targetPosition, 1 - Math.exp(-12 * delta));
    const rotationDifference = Math.atan2(
      Math.sin(remote.targetRotationY - remote.root.rotation.y),
      Math.cos(remote.targetRotationY - remote.root.rotation.y)
    );
    remote.root.rotation.y += rotationDifference * (1 - Math.exp(-12 * delta));
    const crouchBones = [
      [remote.leftThighBone, -1.15],
      [remote.rightThighBone, -1.15],
      [remote.leftShinBone, 1.90],
      [remote.rightShinBone, 1.90]
    ];

    if (remote.crouchApplied) {
      if (remote.hipsBone &&
          remote.hipsBone.userData.remoteCrouchBaseY !== undefined) {
        remote.hipsBone.position.y =
          remote.hipsBone.userData.remoteCrouchBaseY;
      }

      for (const [bone] of crouchBones) {
        if (bone?.userData.remoteCrouchOffset) {
          bone.quaternion.multiply(
            bone.userData.remoteCrouchOffset.clone().invert()
          );
          delete bone.userData.remoteCrouchOffset;
        }
      }
    }

    remote.mixer.update(delta);

    // Pose de mira aplicada depois da animacao.
    if (remote.pistolEquipped) {
      const aimArmPitch = THREE.MathUtils.clamp(
        remote.aimPitch - 0.28, -0.63, 1.02
      );
      const relativeAimYaw = Math.atan2(
        Math.sin(remote.aimYaw - remote.root.rotation.y),
        Math.cos(remote.aimYaw - remote.root.rotation.y)
      );
      const aimArmYaw = THREE.MathUtils.clamp(
        relativeAimYaw, -Math.PI, 1.65
      );

      const applyRemotePistolPose = (bone, x, y, z) => {
        if (!bone) return;
        if (!bone.userData.remotePistolPoseBase) {
          bone.userData.remotePistolPoseBase = bone.rotation.clone();
        }
        const base = bone.userData.remotePistolPoseBase;
        bone.rotation.set(base.x + x, base.y + y, base.z + z);
      };

      applyRemotePistolPose(
        remote.leftUpperArmBone, -0.90, -Math.PI / 2 + 0.35, 0.05
      );
      applyRemotePistolPose(remote.leftLowerArmBone, 0, 0, 0);
      applyRemotePistolPose(
        remote.rightUpperArmBone,
        aimArmPitch - 0.90,
        Math.PI / 2 + aimArmYaw,
        -0.05
      );
      applyRemotePistolPose(
        remote.rightLowerArmBone, aimArmPitch * 0.12, 0, 0
      );
    } else {
      // RESTORE_REMOTE_PISTOL_POSE
      for (const bone of [
        remote.leftUpperArmBone,
        remote.rightUpperArmBone,
        remote.leftLowerArmBone,
        remote.rightLowerArmBone
      ]) {
        const base = bone?.userData.remotePistolPoseBase;
        if (base) {
          bone.rotation.copy(base);
          delete bone.userData.remotePistolPoseBase;
        }
      }
    }

    if (remote.crouching) {
      if (remote.hipsBone) {
        if (remote.hipsBone.userData.remoteCrouchBaseY === undefined) {
          remote.hipsBone.userData.remoteCrouchBaseY =
            remote.hipsBone.position.y;
        }

        remote.hipsBone.position.y =
          remote.hipsBone.userData.remoteCrouchBaseY - 0.38;
      }

      for (const [bone, angle] of crouchBones) {
        if (!bone) continue;

        const offset = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          angle
        );

        bone.quaternion.multiply(offset);
        bone.userData.remoteCrouchOffset = offset;
      }
    }

    remote.crouchApplied = remote.crouching;
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
