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
renderer.domElement.style.cssText =
  'position:fixed;left:0;top:0;width:100vw;height:100vh;display:block;margin:0;padding:0;border:0;touch-action:none;';
document.documentElement.style.cssText =
  'width:100%;height:100%;margin:0;padding:0;overflow:hidden;background:#000;';
document.body.style.cssText =
  'position:fixed;left:0;top:0;width:100%;height:100%;margin:0;padding:0;overflow:hidden;background:#000;touch-action:none;';
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

// BLACKGATES_X1_REAL_OPENING_V1
// Parede traseira dividida para criar um vão real no portão X1.
// A abertura fica centrada em x=-6.3, com 2.6 m de largura
// e 3 m de altura, aberta desde o chão.

// Trecho à esquerda da entrada: x de -10 até -7.6
const x1WallLeft = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, wallHeight),
  wallMat
);
x1WallLeft.position.set(-9.25, wallHeight / 2, -10);
scene.add(x1WallLeft);

// Trecho à direita da entrada: x de -5 até 10
const x1WallRight = new THREE.Mesh(
  new THREE.PlaneGeometry(14.1, wallHeight),
  wallMat
);
x1WallRight.position.set(2.95, wallHeight / 2, -10);
scene.add(x1WallRight);

// Trecho acima da entrada: 2.6 m de largura e 3 m de altura
const x1WallTop = new THREE.Mesh(
  new THREE.PlaneGeometry(4.4, wallHeight - 3),
  wallMat
);
x1WallTop.position.set(-6.3, 4.5, -10);
scene.add(x1WallTop);

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

// BLACKGATES_X1_GATE_V1 — portão visual do modo PvP
const x1Gate = new THREE.Group();
x1Gate.name = 'BlackGatesX1Gate';
x1Gate.position.set(-6.3, 0, -9.72);
scene.add(x1Gate);

const x1GateMetal = new THREE.MeshStandardMaterial({
  color: 0x111923, metalness: 0.82, roughness: 0.3
});
const x1GateEdge = new THREE.MeshStandardMaterial({
  color: 0x168bc1, metalness: 0.55, roughness: 0.28,
  emissive: 0x06334c, emissiveIntensity: 1.2
});
const x1GateDoorMat = new THREE.MeshStandardMaterial({
  color: 0x07111b, metalness: 0.65, roughness: 0.36
});

function x1GateBox(parent, w, h, d, x, y, z, material) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d), material
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Moldura
x1GateBox(x1Gate, 0.18, 3.15, 0.24, -2.28, 1.575, 0, x1GateMetal);
x1GateBox(x1Gate, 0.18, 3.15, 0.24,  2.28, 1.575, 0, x1GateMetal);
x1GateBox(x1Gate, 4.72, 0.18, 0.24, 0, 3.06, 0, x1GateMetal);

// Portas com pivôs para abrir para os lados
const x1LeftDoor = new THREE.Group();
x1LeftDoor.position.set(-2.12, 1.5, 0);
x1Gate.add(x1LeftDoor);

const x1RightDoor = new THREE.Group();
x1RightDoor.position.set(2.12, 1.5, 0);
x1Gate.add(x1RightDoor);

x1GateBox(x1LeftDoor, 2.08, 2.88, 0.12, 1.04, 0, 0, x1GateDoorMat);
x1GateBox(x1RightDoor, 2.08, 2.88, 0.12, -1.04, 0, 0, x1GateDoorMat);

// Linhas luminosas das portas
for (const side of [-1, 1]) {
  const door = side < 0 ? x1LeftDoor : x1RightDoor;
  x1GateBox(door, 0.035, 2.5, 0.035, side < 0 ? 1.04 : -1.04, 0, 0.085, x1GateEdge);
  x1GateBox(door, 1.55, 0.035, 0.035, side < 0 ? 1.04 : -1.04, 0.68, 0.085, x1GateEdge);
  x1GateBox(door, 1.55, 0.035, 0.035, side < 0 ? 1.04 : -1.04, -0.68, 0.085, x1GateEdge);
}

// Placa "PvP" feita com textura Canvas
const x1SignCanvas = document.createElement('canvas');
x1SignCanvas.width = 512;
x1SignCanvas.height = 160;
const x1SignCtx = x1SignCanvas.getContext('2d');
x1SignCtx.fillStyle = '#050d16';
x1SignCtx.fillRect(0, 0, 512, 160);
x1SignCtx.strokeStyle = '#25bdff';
x1SignCtx.lineWidth = 8;
x1SignCtx.strokeRect(5, 5, 502, 150);
x1SignCtx.fillStyle = '#e8f8ff';
x1SignCtx.font = 'bold 86px Arial';
x1SignCtx.textAlign = 'center';
x1SignCtx.textBaseline = 'middle';
x1SignCtx.fillText('PvP', 256, 83);

const x1SignTexture = new THREE.CanvasTexture(x1SignCanvas);
const x1Sign = new THREE.Mesh(
  new THREE.PlaneGeometry(1.9, 0.58),
  new THREE.MeshBasicMaterial({ map: x1SignTexture, side: THREE.DoubleSide })
);
x1Sign.position.set(0, 3.58, 0.02);
x1Gate.add(x1Sign);


// BLACKGATES_X1_PASSAGE_FIX_V1 — extensão de chão para atravessar o vão
const x1PassageFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(4.4, 5.0),
  floorMat
);
x1PassageFloor.rotation.x = -Math.PI / 2;
x1PassageFloor.position.set(-6.3, 0.008, -12.5);
scene.add(x1PassageFloor);

// BLACKGATES_X1_CORRIDOR_WALLS_V1
// Paredes externas para bloquear a visão para fora do mapa.
// Mantém livre a passagem do portão até o fim do corredor.
const x1CorridorWallMat = wallMat;

// Parede lateral esquerda do corredor.
const x1CorridorLeftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(5.0, wallHeight),
  x1CorridorWallMat
);
x1CorridorLeftWall.rotation.y = Math.PI / 2;
x1CorridorLeftWall.position.set(-8.5, wallHeight / 2, -12.5);
scene.add(x1CorridorLeftWall);

// Parede lateral direita do corredor.
const x1CorridorRightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(5.0, wallHeight),
  x1CorridorWallMat
);
x1CorridorRightWall.rotation.y = Math.PI / 2;
x1CorridorRightWall.position.set(-4.1, wallHeight / 2, -12.5);
scene.add(x1CorridorRightWall);

// Parede de fundo: fecha a visão para além do corredor.
const x1CorridorEndWall = new THREE.Mesh(
  new THREE.PlaneGeometry(4.4, wallHeight),
  x1CorridorWallMat
);
x1CorridorEndWall.position.set(-6.3, wallHeight / 2, -15.0);
scene.add(x1CorridorEndWall);

// BLACKGATES_X1_GATE_V1 — chão sem marcação azul

// BLACKGATES_X1_ARENA_V1
let x1GateOpen = false;
let x1ArenaActive = false;
let x1ArenaLoading = false;
let x1ArenaGroup = null;
let x1RoundBarriers = [];
let x1RoundHud = null;
let x1RoundPhase = 'waiting';
let x1RoundCountdown = 0;
let x1RoundNumber = 0;
let x1RoundScores = {};
let x1MatchFinished = false;
let x1LastLoadoutResetRound = 0;

function createX1RoundBarriers() {
  if (!x1ArenaGroup) return;

  for (const barrier of x1RoundBarriers) {
    x1ArenaGroup.remove(barrier);
    barrier.geometry?.dispose();
    barrier.material?.dispose();
  }
  x1RoundBarriers = [];

  const material = new THREE.MeshBasicMaterial({
    color: 0x168cff,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  for (const centerX of [-23, 23]) {
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 3, 4.5),
      material.clone()
    );
    barrier.position.set(centerX, 1.5, 0);
    barrier.name = 'BlackGatesX1RoundBarrier';
    x1ArenaGroup.add(barrier);
    x1RoundBarriers.push(barrier);
  }
}

function setX1RoundBarriersVisible(visible) {
  for (const barrier of x1RoundBarriers) {
    barrier.visible = visible;
  }
}

function updateX1RoundHUD(message = {}) {
  x1RoundPhase = message.phase || x1RoundPhase;
  x1RoundCountdown = Number.isFinite(message.countdown)
    ? message.countdown : x1RoundCountdown;
  x1RoundNumber = Number.isFinite(message.round)
    ? message.round : x1RoundNumber;
  if (message.scores && typeof message.scores === 'object') {
    x1RoundScores = message.scores;
  }

  if (!x1RoundHud) {
    x1RoundHud = document.createElement('div');
    x1RoundHud.id = 'x1RoundHud';
    x1RoundHud.style.cssText = [
      'position:fixed', 'top:12%', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'padding:12px 20px', 'border:1px solid #00cfff',
      'border-radius:10px', 'background:rgba(3,12,28,.88)',
      'color:#fff', 'font:700 18px Arial,sans-serif',
      'text-align:center', 'white-space:pre-line', 'pointer-events:none',
      'text-shadow:0 0 8px #0088ff', 'display:none'
    ].join(';');
    document.body.appendChild(x1RoundHud);
  }

  const scores = Object.entries(x1RoundScores)
    .map(([id, score], index) =>
      `Jogador ${index + 1}: ${score}`).join('  |  ');

  if (x1RoundPhase === 'countdown') {
    x1RoundHud.textContent =
      `RODADA ${x1RoundNumber}\nCOMEÇA EM ${x1RoundCountdown}\n${scores}`;
    x1RoundHud.style.display = 'block';
    setX1RoundBarriersVisible(true);
  } else if (x1RoundPhase === 'active') {
    x1RoundHud.textContent = `RODADA ${x1RoundNumber}\nLUTEM!\n${scores}`;
    x1RoundHud.style.display = 'block';
    setX1RoundBarriersVisible(false);
  } else if (x1RoundPhase === 'intermission') {
    x1RoundHud.textContent = `FIM DA RODADA\n${scores}`;
    x1RoundHud.style.display = 'block';
    setX1RoundBarriersVisible(false);
  } else if (x1RoundPhase === 'finished') {
    x1RoundHud.textContent = `PARTIDA ENCERRADA\n${scores}`;
    x1RoundHud.style.display = 'block';
    setX1RoundBarriersVisible(false);
  } else {
    x1RoundHud.style.display = 'none';
    setX1RoundBarriersVisible(false);
  }
}
let x1HiddenWorldObjects = [];
const x1ArenaCenter = 1000;

function enterX1Arena(options = {}) {
  if (x1ArenaActive || x1ArenaLoading) return;

  // No multiplayer, só entra após a confirmação do servidor.
  if (multiplayerRoomCode && options.confirmedByServer !== true) {
    const status = document.getElementById('x1GateStatus');
    if (status) status.textContent = 'AGUARDANDO PRONTO DOS DOIS JOGADORES';
    return;
  }

  x1ArenaLoading = true;
  const loading = document.getElementById('x1LoadingScreen');
  if (loading) loading.classList.add('open');

  const readyButton = document.getElementById('x1OpenButton');
  if (readyButton) readyButton.style.display = 'none';

  // Dá tempo para a tela de carregamento aparecer antes da transição.
  requestAnimationFrame(() => {
    setTimeout(() => {
    try {
      // Esconde o cenário antigo, mantendo o jogador e as luzes principais.
      x1HiddenWorldObjects = [];
      for (const object of [...scene.children]) {
        if (
          object === player ||
          object === hemisphereLight ||
          object === light ||
          [...remotePlayers.values()].some((remote) => remote.root === object)
        ) continue;

        object.visible = false;
        x1HiddenWorldObjects.push(object);
      }

      x1ArenaGroup = new THREE.Group();
      x1ArenaGroup.name = 'BlackGatesX1WhiteArena';

      const arenaFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({
          color: 0x242b35,
          roughness: 0.92,
          metalness: 0.12,
          side: THREE.DoubleSide
        })
      );
      arenaFloor.rotation.x = -Math.PI / 2;
      arenaFloor.position.y = 0;
      x1ArenaGroup.add(arenaFloor);

      // BLACKGATES_X1_DEPTH_GRID_V1 — linhas de profundidade no chão.
      const depthGridPositions = [];
      const depthGridSize = 50;
      const depthGridStep = 2.5;
      const depthGridHalf = depthGridSize / 2;

      for (let i = -depthGridHalf; i <= depthGridHalf; i += depthGridStep) {
        // Linhas paralelas ao eixo X.
        depthGridPositions.push(
          -depthGridHalf, 0.025, i,
           depthGridHalf, 0.025, i
        );

        // Linhas paralelas ao eixo Z.
        depthGridPositions.push(
          i, 0.025, -depthGridHalf,
          i, 0.025,  depthGridHalf
        );
      }

      const depthGridGeometry = new THREE.BufferGeometry();
      depthGridGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(depthGridPositions, 3)
      );

      const depthGridMaterial = new THREE.LineBasicMaterial({
        color: 0x536b80,
        transparent: true,
        opacity: 0.8,
        toneMapped: false
      });

      const depthGrid = new THREE.LineSegments(
        depthGridGeometry,
        depthGridMaterial
      );
      depthGrid.name = "BlackGatesX1DepthGrid";
      x1ArenaGroup.add(depthGrid);

      const arenaWallMaterial = new THREE.MeshStandardMaterial({
        color: 0x151d29,
        roughness: 0.88,
        metalness: 0.16,
        side: THREE.DoubleSide
      });

      const arenaWallHeight = 50;
      const arenaWallThickness = 0.3;

      function addArenaWall(width, height, x, y, z, rotationY = 0) {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, arenaWallThickness),
          arenaWallMaterial
        );
        wall.position.set(x, y, z);
        wall.rotation.y = rotationY;
        x1ArenaGroup.add(wall);
      }

      addArenaWall(50, arenaWallHeight, 0, arenaWallHeight / 2, -25);
      addArenaWall(50, arenaWallHeight, 0, arenaWallHeight / 2, 25);
      addArenaWall(50, arenaWallHeight, -25, arenaWallHeight / 2, 0, Math.PI / 2);
      addArenaWall(50, arenaWallHeight, 25, arenaWallHeight / 2, 0, Math.PI / 2);

      // Teto da arena: fecha o cubo em 50 unidades de altura.
      const arenaCeiling = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        arenaWallMaterial
      );
      arenaCeiling.rotation.x = -Math.PI / 2;
      arenaCeiling.position.set(0, 50, 0);
      x1ArenaGroup.add(arenaCeiling);

      // BLACKGATES_X1_NEON_EDGES_V2 — contorno nas 12 arestas.
      const x1NeonCoreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00cfff,
        toneMapped: false
      });

      const x1NeonGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        toneMapped: false
      });

      function addX1NeonBeam(width, height, depth, x, y, z) {
        const glow = new THREE.Mesh(
          new THREE.BoxGeometry(
            width + 0.10,
            height + 0.10,
            depth + 0.10
          ),
          x1NeonGlowMaterial
        );
        glow.position.set(x, y, z);
        x1ArenaGroup.add(glow);

        const core = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, depth),
          x1NeonCoreMaterial
        );
        core.position.set(x, y, z);
        x1ArenaGroup.add(core);
      }

      // BLACKGATES_X1_NEON_INNER_EDGES_V1
      const edge = 24.82;
      const edgeLength = 49.64;
      const edgeY = 0.08;
      const edgeTopY = 49.92;
      const edgeThickness = 0.055;

      // Quatro arestas inferiores: duas em X e duas em Z.
      for (const z of [-edge, edge]) {
        addX1NeonBeam(
          edgeLength, edgeThickness, edgeThickness,
          0, edgeY, z
        );
      }
      for (const x of [-edge, edge]) {
        addX1NeonBeam(
          edgeThickness, edgeThickness, edgeLength,
          x, edgeY, 0
        );
      }

      // Quatro arestas superiores: contorno do teto.
      for (const z of [-edge, edge]) {
        addX1NeonBeam(
          edgeLength, edgeThickness, edgeThickness,
          0, edgeTopY, z
        );
      }
      for (const x of [-edge, edge]) {
        addX1NeonBeam(
          edgeThickness, edgeThickness, edgeLength,
          x, edgeTopY, 0
        );
      }

      // Quatro arestas verticais nos cantos.
      for (const x of [-edge, edge]) {
        for (const z of [-edge, edge]) {
          addX1NeonBeam(
            edgeThickness, 50, edgeThickness,
            x, 25, z
          );
        }
      }

            x1ArenaGroup.position.set(x1ArenaCenter, 0, x1ArenaCenter);
      scene.add(x1ArenaGroup);

      // Restaura os itens disponíveis dentro da arena X1.
      syncGroundItemList(flashlightGroundItems, flashlightItemAvailability, flashlightItemAvailability);
      syncGroundItemList(pistolGroundItems, pistolItemAvailability, pistolItemAvailability);
      syncGroundItemList(ammoGroundItems, ammoItemAvailability, ammoItemAvailability);

      createX1RoundBarriers();
      setX1RoundBarriersVisible(x1RoundPhase === 'countdown');
      scene.background = new THREE.Color(0x080e18);
      hemisphereLight.intensity = 1.25;
      light.intensity = 1.1;

      const spawn = options.spawn;
      player.position.set(
        Number.isFinite(spawn?.x) ? spawn.x : x1ArenaCenter,
        Number.isFinite(spawn?.y) ? spawn.y : 0,
        Number.isFinite(spawn?.z) ? spawn.z : x1ArenaCenter
      );
      player.rotation.y = 0;

      // BLACKGATES_X1_CAMERA_ENTRY_V1
      // Reposiciona a câmera dentro da arena ao entrar.
      camera.position.set(
        x1ArenaCenter,
        2.2,
        x1ArenaCenter + 4.5
      );
      camera.lookAt(
        x1ArenaCenter,
        1.35,
        x1ArenaCenter - 5
      );

      x1ArenaActive = true;

      const status = document.getElementById('x1GateStatus');
      if (status) status.textContent = 'ARENA X1';
      if (loading) loading.classList.remove('open');
      x1ArenaLoading = false;
    } catch (error) {
      console.error('Falha ao carregar arena X1:', error);
      if (loading) loading.classList.remove('open');
      x1ArenaLoading = false;

      // Restaura o cenário caso a criação da arena falhe.
      for (const object of x1HiddenWorldObjects) {
        object.visible = true;
      }
      x1HiddenWorldObjects = [];
      scene.background = new THREE.Color(0x151922);
    }
    }, 900);
  });
}
const x1GateRaycaster = new THREE.Raycaster();

function setX1GateOpen(open) {
  x1GateOpen = Boolean(open);
  x1LeftDoor.rotation.y = x1GateOpen ? -1.25 : 0;
  x1RightDoor.rotation.y = x1GateOpen ? 1.25 : 0;


  const status = document.getElementById('x1GateStatus');
  const openButton = document.getElementById('x1OpenGateButton');
  if (status) status.textContent = x1GateOpen
    ? 'PORTÃO ABERTO · ENTRE NA ÁREA'
    : 'PORTÃO FECHADO';
  if (openButton) openButton.textContent = x1GateOpen
    ? 'FECHAR PORTÃO'
    : 'ABRIR PORTÃO';
}


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
  new THREE.BoxGeometry(3.3, 3.8, 0.16),
  mirrorFrameMat
);
mirror.add(mirrorFrame);

const mirrorSurface = new Reflector(
  new THREE.PlaneGeometry(3.0, 3.55),
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
flashlightTarget.name = 'FlashlightTarget';
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

const flashlightGroundItems = [
  flashlightPickup.clone(true),
  flashlightPickup.clone(true)
];
flashlightGroundItems[0].position.set(978, 0.13, 1000);
flashlightGroundItems[1].position.set(1022, 0.13, 1001.8);
flashlightGroundItems.forEach((item) => {
  item.visible = true;
  scene.add(item);
});
flashlightPickup.visible = false;

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

const pistolGroundItems = [
  pistolPickup.clone(true),
  pistolPickup.clone(true)
];
pistolGroundItems[0].position.set(976, 0.2, 1000);
pistolGroundItems[1].position.set(1024, 0.2, 1001.8);
pistolGroundItems.forEach((item) => {
  item.visible = true;
  scene.add(item);
});
pistolPickup.visible = false;

let hasPistol = false;
let pistolEquipped = false;
let pistolAvailable = true;
let pistolPickupPending = false;

function grantPistolToLocalPlayer() {
  hasPistol = true;
  scene.remove(pistolPickup);
  pistolPickup.visible = false;
  pickupPistolButton.style.display = "none";

  const pistolIcon = secondItemSlot.querySelector("span");
  pistolIcon.innerHTML =
    '<img src="images/pistol-icon.png" alt="" style="display:block;width:28px;height:28px;object-fit:contain;margin:0 auto;position:relative" />';
  pistolIcon.style.cssText = "display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:0;opacity:1";
  secondItemSlot.setAttribute("aria-label", "Slot 2: Pistola");
  secondItemSlot.style.borderColor = "#ffcc80";
}

function applyPistolAvailability(available, collectorId = null) {
  pistolAvailable = available;
  pistolPickupPending = false;

  if (!available && collectorId === multiplayerPlayerId && !hasPistol) {
    grantPistolToLocalPlayer();
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
const ammoGroundItems = [ammoBox, ammoBox.clone(true)];
ammoGroundItems[0].position.set(977, 0.18, 1002);
ammoGroundItems[1].position.set(1023, 0.18, 998.7);
scene.add(ammoGroundItems[1]);



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
      rig.visible = false; // Oculta o suporte e a câmera física visível.
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
        const extension = Math.max(0, cameraPhysicalDistance - 4.5);

        const base = [0, 1.08, 0.05];
        const joint1 = [0.04, 1.10, 0.18];
        const joint2 = [0.02, 1.27 + h * 0.35, 0.46 - f * 0.08 + extension * 0.25];
        const joint3 = [0.06, 1.47 + h * 0.75 - f * 0.25, 0.72 - f * 0.18 + extension * 0.50];
        const joint4 = [0.04, 1.65 + h * 0.90 - f * 0.42, 0.56 - f * 0.10 + extension * 0.75];
        const tip = [0.03, 1.87 + h - f * 0.65, 0.42 - f * 0.20 + extension];

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
  let remoteLeftHand = null;
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
    if (object.name === 'LeftHand') remoteLeftHand = object;
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
  let remoteMuzzleFlash = null;
  let remoteMuzzleLight = null;
  remotePistol.traverse((object) => {
    if (object.isMesh) object.castShadow = true;
    if (object.isMesh && object.geometry === muzzleFlash.geometry) {
      remoteMuzzleFlash = object;
      object.visible = false;
    }
    if (object.isLight && object.type === 'PointLight') {
      remoteMuzzleLight = object;
      object.visible = false;
    }
  });

  const remoteFlashlight = flashlightPickup.clone(true);
  remoteFlashlight.scale.copy(flashlightPickup.scale);
  const remoteFlashlightTarget = remoteFlashlight.getObjectByName('FlashlightTarget');
  const remoteFlashlightLight = remoteFlashlight.getObjectByProperty('type', 'SpotLight');
  if (remoteFlashlightLight && remoteFlashlightTarget) {
    remoteFlashlightLight.target = remoteFlashlightTarget;
  }
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
    positionBuffer: [],
    moving: false, running: false, crouching: false,
    hipsBone: remoteHipsBone,
    leftThighBone: remoteLeftThighBone,
    rightThighBone: remoteRightThighBone,
    leftShinBone: remoteLeftShinBone,
    rightShinBone: remoteRightShinBone,
    rightHand: remoteRightHand,
    leftHandBone: remoteLeftHand,
    leftUpperArmBone: remoteLeftUpperArm,
    rightUpperArmBone: remoteRightUpperArm,
    leftLowerArmBone: remoteLeftLowerArm,
    rightLowerArmBone: remoteRightLowerArm,
    pistolEquipped: false,
    aimPitch: 0,
    aimYaw: 0,
    pistol: remotePistol,
    muzzleFlash: remoteMuzzleFlash,
    muzzleLight: remoteMuzzleLight,
    flashlight: remoteFlashlight,
    flashlightTarget: remoteFlashlightTarget,
    flashlightLight: remoteFlashlightLight,
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


function playRemoteGunshotSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const audio = new AudioCtx();

    const playNoise = (duration, volume, frequency) => {
      const length = Math.floor(audio.sampleRate * duration);
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
      const source = audio.createBufferSource();
      const filter = audio.createBiquadFilter();
      const gain = audio.createGain();
      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
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

    playNoise(0.09, 0.45, 4200);
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(105, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(38, audio.currentTime + 0.18);
    gain.gain.setValueAtTime(0.4, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.2);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.2);
    setTimeout(() => {
      if (audio.state !== 'closed') playNoise(0.12, 0.10, 1600);
    }, 75);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      setTimeout(() => {
        if (audio.state !== 'closed') audio.close();
      }, 250);
    };
  } catch (error) {
    console.warn('Não foi possível reproduzir o disparo remoto.', error);
  }
}

function playRemoteShot(playerId) {
  const remote = remotePlayers.get(playerId);
  if (!remote) return;
  if (remote.muzzleFlash) remote.muzzleFlash.visible = true;
  if (remote.muzzleLight) remote.muzzleLight.visible = true;
  setTimeout(() => {
    if (remote.muzzleFlash) remote.muzzleFlash.visible = false;
    if (remote.muzzleLight) remote.muzzleLight.visible = false;
  }, 70);
  playRemoteGunshotSound();
}

function updateRemotePlayerState(playerId, state) {
  if (!playerId || playerId === multiplayerPlayerId || !state) return;
  if (![state.x, state.z].every(Number.isFinite)) return;

  const remote = createRemotePlayer(playerId);
  if (!remote) return;
  // Guarda uma amostra para interpolar o movimento remoto.
  const sampleTime = performance.now();
  const sampleRotation = Number.isFinite(state.rotationY)
    ? state.rotationY
    : remote.targetRotationY;

  remote.positionBuffer.push({
    time: sampleTime,
    position: new THREE.Vector3(
      state.x,
      Number.isFinite(state.y) ? state.y : 0,
      state.z
    ),
    rotationY: sampleRotation
  });

  // Limita a memória usada pelo buffer.
  if (remote.positionBuffer.length > 20) {
    remote.positionBuffer.shift();
  }


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
  remote.flashlightEquipped = flashlightOn;

  if (remote.flashlightLight) remote.flashlightLight.visible = flashlightOn;
  if (remote.flashlightBeam) remote.flashlightBeam.visible = false;

  // Mantém o foco remoto alinhado à mira sincronizada do outro jogador.
  if (flashlightOn && remote.flashlightTarget) {
    remote.flashlight.updateWorldMatrix(true, true);
    const direction = new THREE.Vector3(
      -Math.sin(remote.aimYaw) * Math.cos(remote.aimPitch),
      -Math.sin(remote.aimPitch),
      -Math.cos(remote.aimYaw) * Math.cos(remote.aimPitch)
    ).normalize();
    const worldPosition = new THREE.Vector3();
    remote.flashlight.getWorldPosition(worldPosition);
    remote.flashlightTarget.position.copy(
      remote.flashlight.worldToLocal(
        worldPosition.clone().addScaledVector(direction, 5)
      )
    );
  }

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
  <button id="runButton" aria-label="Correr"><img src="images/run-icon.jpg" alt="" draggable="false"></button>
  <button id="crouchButton" aria-label="Agachar"><img src="images/crouch-icon.jpg" alt="" draggable="false"></button>
  <button id="jumpButton" aria-label="Pular">↑</button>
  <button id="cameraSettingsButton" aria-label="Configuracoes">🔧</button>
  <div id="cameraSettingsPanel">
    <section id="hudSettingsColumn" aria-label="Configurações do HUD">
      <h3>INTERFACE</h3>
      <button id="editHudButton" type="button">EDITAR HUD</button>
      <div id="hudEditControls" style="display:none">
        <p>Arraste o controle para mudar sua posição.</p>
        <label for="hudElementSelect">Controle:</label>
        <select id="hudElementSelect">
          <option value="stickBase">Joystick</option>
          <option value="runButton">Correr</option>
          <option value="crouchButton">Agachar</option>
          <option value="jumpButton">Pular</option>
          <option value="shootButton">Disparar</option>
          <option value="reloadButton">Recarregar</option>
          <option value="playerHPPanel">Vida / HP</option>
          <option value="itemBar">Slots de itens</option>
        </select>
        <label for="hudSizeSlider">Tamanho individual:</label>
        <input id="hudSizeSlider" type="range" min="60" max="160" value="100" step="5">
        <div id="hudSizeValue">100%</div>
        <button id="saveHudButton" type="button">SALVAR HUD</button>
        <button id="cancelHudButton" type="button">CANCELAR</button>
        <button id="resetHudButton" type="button">RESTAURAR PADRÃO</button>
      </div>
    </section>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0">
      <label for="autoRunToggle">Corrida automática</label>
      <input id="autoRunToggle" type="checkbox" style="width:22px;height:22px;accent-color:#19b45a">
    </div>
    <strong>CONFIGURAÇÕES</strong>
    <p>Distância da câmera</p>
    <input id="cameraDistanceSlider" type="range" min="1" max="10" step="0.5" value="4.5">
    <div id="cameraDistanceValue">Normal</div>
    <p>Afastamento real da câmera</p>
    <input id="cameraPhysicalDistanceSlider" type="range" min="4.5" max="7" step="0.5" value="4.5">
    <div id="cameraPhysicalDistanceValue">4.5</div>

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
  <button id="shootButton" type="button" style="display:none" aria-label="Disparar"><img src="images/shoot-icon.jpg" alt="" draggable="false"></button>
  <button id="reloadButton" type="button" style="display:none" aria-label="Recarregar"><img src="images/reload-icon.jpg" alt="" draggable="false"></button>

  <button id="trainingButton" type="button" style="display:none" aria-hidden="true" tabindex="-1"></button>
  <button id="x1OpenButton" type="button">ABRIR PORTÃO</button>
  <div id="x1LoadingScreen" role="status" aria-live="polite">
    <div class="x1Loader"></div>
    <h2>CARREGANDO MAPA...</h2>
    <p>Preparando a arena X1</p>
    <div class="x1Progress"><div class="x1ProgressFill"></div></div>
  </div>
  <div id="x1Panel" role="dialog" aria-label="Modo X1">
    <h2>BLACK GATES <span>PvP</span></h2>
    <p id="x1GateStatus">PORTÃO FECHADO</p>
    <p class="x1Description">Abra o portão e entre na área de preparação.</p>
    <button id="x1OpenGateButton" type="button">ABRIR PORTÃO</button>
    <button id="x1ClosePanelButton" type="button">VOLTAR AO JOGO</button>
  </div>

  <div id="helpText">JOYSTICK: MOVER · ARRASTE À DIREITA: OLHAR</div>
`;
document.body.appendChild(ui);



// BLACKGATES_DEATH_DISINTEGRATION_V1
const deathDisintegrations = new Map();
const deathHiddenCharacters = new Map();

function restoreLocalCharacterAfterDeath() {
  for (const [key, root] of deathHiddenCharacters) {
    if (!root) continue;

    root.traverse(object => {
      if (object.isMesh && object.userData.deathOriginalVisible !== undefined) {
        object.visible = object.userData.deathOriginalVisible;
        delete object.userData.deathOriginalVisible;
      }
    });

    root.visible = true;
  }

  deathHiddenCharacters.clear();

  for (const [key, effect] of deathDisintegrations) {
    scene.remove(effect.particles);
    effect.geometry.dispose();
    effect.material.dispose();
    deathDisintegrations.delete(key);
  }
}


function startCharacterDisintegration(root, key) {
  if (root) deathHiddenCharacters.set(key, root);
  if (!root || deathDisintegrations.has(key)) return;

  const pieces = [];
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const count = Math.min(180, Math.max(70, Math.round(size.y * 65)));
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = center.x + (Math.random() - 0.5) * size.x;
    positions[i * 3 + 1] = box.min.y + Math.random() * size.y;
    positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * size.z;
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 1.8,
      0.45 + Math.random() * 2.1,
      (Math.random() - 0.5) * 1.8
    ));
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x8edcff,
    size: 0.055,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  root.traverse(object => {
    if (object.isMesh) {
      object.userData.deathOriginalVisible = object.visible;
      object.visible = false;
    }
  });
  root.visible = false;

  const startedAt = performance.now();
  deathDisintegrations.set(key, {
    root, particles, geometry, material, velocities, startedAt
  });
}

function updateDeathDisintegrations(delta) {
  const now = performance.now();

  for (const [key, effect] of deathDisintegrations) {
    const positions = effect.geometry.attributes.position.array;
    const elapsed = (now - effect.startedAt) / 1000;

    for (let i = 0; i < effect.velocities.length; i++) {
      const v = effect.velocities[i];
      positions[i * 3] += v.x * delta;
      positions[i * 3 + 1] += v.y * delta;
      positions[i * 3 + 2] += v.z * delta;
      v.y -= 1.25 * delta;
    }

    effect.geometry.attributes.position.needsUpdate = true;
    effect.material.opacity = Math.max(0, 1 - elapsed / 1.8);

    if (elapsed >= 1.8) {
      scene.remove(effect.particles);
      effect.geometry.dispose();
      effect.material.dispose();
      deathDisintegrations.delete(key);
    }
  }
}

function disintegrateLocalCharacter() {
  if (animatedCharacterModel) {
    startCharacterDisintegration(animatedCharacterModel, 'local');
  } else {
    startCharacterDisintegration(player, 'local');
  }
}

function disintegrateRemoteCharacter(playerId) {
  const remote = remotePlayers.get(playerId);
  if (remote) startCharacterDisintegration(remote.root, `remote:${playerId}`);
}


// BLACKGATES_PLAYER_HP_BAR_V1
const playerMaxHP = 100;
let playerHP = playerMaxHP;

const playerHPPanel = document.createElement("div");
playerHPPanel.id = "playerHPPanel";
playerHPPanel.style.cssText = [
  "position:fixed",
  "top:18px",
  "left:7%",
  "z-index:35",
  "width:min(230px,65vw)",
  "padding:10px 12px",
  "box-sizing:border-box",
  "background:rgba(8,14,24,0.88)",
  "border:1px solid rgba(0,207,255,0.65)",
  "border-radius:9px",
  "color:#fff",
  "font: bold 14px sans-serif",
  "pointer-events:none"
].join(";");

playerHPPanel.innerHTML = `
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
    <span style="color:#00cfff;letter-spacing:1px">HP</span>
    <span id="playerHPText">100/100</span>
  </div>
  <div style="height:10px;background:#27313c;border-radius:5px;overflow:hidden">
    <div id="playerHPFill" style="width:100%;height:100%;background:#35d07f;border-radius:5px;transition:width .18s,background .18s"></div>
  </div>
`;
document.body.appendChild(playerHPPanel);

function updatePlayerHPUI() {
  const text = document.getElementById("playerHPText");
  const fill = document.getElementById("playerHPFill");
  if (!text || !fill) return;

  const percent = Math.max(0, Math.min(100, playerHP / playerMaxHP * 100));
  text.textContent = `${playerHP}/${playerMaxHP}`;
  fill.style.width = `${percent}%`;
  fill.style.background =
    percent <= 25 ? "#ff394f" :
    percent <= 50 ? "#ffb52e" : "#35d07f";

  playerHPPanel.style.borderColor =
    percent <= 25 ? "#ff394f" : "rgba(0,207,255,0.65)";
}

// Chame esta função sempre que o jogador receber dano.
function damageLocalPlayer(amount) {
  const damage = Number(amount);
  if (!Number.isFinite(damage) || damage <= 0 || playerHP <= 0) return;

  playerHP = Math.max(0, playerHP - Math.round(damage));
  updatePlayerHPUI();

  if (playerHP === 0) {
    disintegrateLocalCharacter();
    if (multiplayerSocket && multiplayerSocket.readyState === WebSocket.OPEN) {
      multiplayerSocket.send(JSON.stringify({ type: 'playerDeath' }));
    }
  }
}

// Útil para futuro sistema de cura ou reinício de treino.
function restoreLocalPlayerHP() {
  playerHP = playerMaxHP;
  updatePlayerHPUI();
}

updatePlayerHPUI();


// BLACKGATES_X1_GATE_V1 — controles do painel
const x1Panel = document.getElementById('x1Panel');
document.getElementById('x1OpenButton').addEventListener('click', () => {
  if (x1ArenaActive || x1ArenaLoading) return;

  const entryButton = document.getElementById('x1OpenButton');
  if (entryButton) {
    entryButton.textContent = multiplayerRoomCode ? 'PRONTO' : 'ENTRAR NA ARENA';
  }

  if (!x1GateOpen) {
    setX1GateOpen(true);
    return;
  }

  const inEntryLane =
    player.position.x > -8.25 &&
    player.position.x < -4.35 &&
    player.position.z < -9.0;

  if (inEntryLane) {
    if (multiplayerRoomCode) {
      if (!multiplayerSocket ||
          multiplayerSocket.readyState !== WebSocket.OPEN) {
        const status = document.getElementById('x1GateStatus');
        if (status) status.textContent = 'MULTIPLAYER DESCONECTADO';
        return;
      }

      multiplayerSocket.send(JSON.stringify({ type: 'x1Ready' }));
      const status = document.getElementById('x1GateStatus');
      if (status) status.textContent = 'AGUARDANDO CONFIRMAÇÃO DOS JOGADORES...';
    } else {
      enterX1Arena();
    }
  } else {
    const status = document.getElementById('x1GateStatus');
    if (status) status.textContent = 'ENTRE PELA PASSAGEM PARA FICAR PRONTO';
  }
});
document.getElementById('x1ClosePanelButton').addEventListener('click', () => {
  x1Panel.classList.remove('open');
});
document.getElementById('x1OpenGateButton').addEventListener('click', () => {
  setX1GateOpen(!x1GateOpen);
});


const pistolCrosshair = document.createElement("div");
pistolCrosshair.id = "pistolCrosshair";
pistolCrosshair.setAttribute("aria-hidden", "true");
document.body.appendChild(pistolCrosshair);


// BLACKGATES_TRAINING_TARGET_V1
const trainingButton = document.getElementById("trainingButton");
const trainingRaycaster = new THREE.Raycaster();
let trainingTarget = null;
let trainingTargetHP = 100;
let trainingTargetActive = false;

const trainingHealthUI = document.createElement("div");
trainingHealthUI.id = "trainingHealthUI";
trainingHealthUI.style.cssText =
  "position:fixed;top:23%;left:50%;transform:translateX(-50%);" +
  "z-index:30;display:none;color:white;background:#101820;" +
  "border:1px solid #00cfff;border-radius:8px;padding:8px 14px;" +
  "font:bold 15px sans-serif;text-align:center;pointer-events:none";
document.body.appendChild(trainingHealthUI);

function updateTrainingHealthUI() {
  if (!trainingTargetActive) {
    trainingHealthUI.style.display = "none";
    return;
  }
  trainingHealthUI.style.display = "block";
  trainingHealthUI.textContent =
    trainingTargetHP > 0
      ? `ALVO DE TREINO: ${trainingTargetHP}/100 HP`
      : "ALVO ELIMINADO — TOQUE EM TREINO PARA REINICIAR";
}

function spawnTrainingTarget() {
  if (trainingTarget) {
    scene.remove(trainingTarget);
    trainingTarget.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        for (const mat of Array.isArray(obj.material)
          ? obj.material : [obj.material]) mat.dispose();
      }
    });
  }

  trainingTarget = new THREE.Group();
  trainingTarget.name = "BlackGatesTrainingTarget";

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xe23b45, roughness: 0.7
  });
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xf0c8a0, roughness: 0.8
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x202b38, roughness: 0.8
  });

  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.9, 0.35), bodyMat
  );
  torso.position.y = 1.15;
  torso.userData.trainingHitbox = true;
  trainingTarget.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 16, 12), headMat
  );
  head.position.y = 1.82;
  head.userData.trainingHitbox = true;
  trainingTarget.add(head);

  for (const x of [-0.42, 0.42]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.75, 0.22), bodyMat
    );
    arm.position.set(x, 1.18, 0);
    arm.userData.trainingHitbox = true;
    trainingTarget.add(arm);
  }

  for (const x of [-0.19, 0.19]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.75, 0.25), darkMat
    );
    leg.position.set(x, 0.42, 0);
    leg.userData.trainingHitbox = true;
    trainingTarget.add(leg);
  }

  // Coloca o alvo a quatro metros, na direção horizontal da câmera.
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 0.001) forward.set(0, 0, -1);
  forward.normalize();

  trainingTarget.position.set(
    player.position.x + forward.x * 4,
    0,
    player.position.z + forward.z * 4
  );

  // O alvo fica virado para o jogador.
  trainingTarget.rotation.y = Math.atan2(
    player.position.x - trainingTarget.position.x,
    player.position.z - trainingTarget.position.z
  );

  scene.add(trainingTarget);
  trainingTargetHP = 100;
  trainingTargetActive = true;
  updateTrainingHealthUI();
}

trainingButton.addEventListener("click", () => {
  if (x1ArenaActive || x1ArenaLoading) return;
  spawnTrainingTarget();
});

function damageTrainingTargetFromAim() {
  if (!trainingTargetActive || !trainingTarget || trainingTargetHP <= 0) return;

  // Disparo pelo centro da câmera: acompanha a mira.
  camera.updateMatrixWorld(true);
  trainingRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  trainingRaycaster.far = 100;

  const hitboxes = [];
  trainingTarget.traverse(obj => {
    if (obj.isMesh && obj.userData.trainingHitbox) hitboxes.push(obj);
  });

  const hits = trainingRaycaster.intersectObjects(hitboxes, false);
  if (!hits.length) return;

  const distance = camera.position.distanceTo(hits[0].point);

  let damage = 7;
  if (distance <= 1.5) damage = 17;
  else if (distance <= 2.0) damage = 9;

  trainingTargetHP = Math.max(0, trainingTargetHP - damage);
  updateTrainingHealthUI();

  if (trainingTargetHP === 0) {
    trainingTargetActive = false;
    updateTrainingHealthUI();
  }
}


const pickupFlashlightButton = document.getElementById("pickupFlashlightButton");
const firstItemSlot = document.querySelector("#itemBar .itemSlot");
const pickupPistolButton = document.getElementById("pickupPistolButton");
const secondItemSlot = document.querySelectorAll("#itemBar .itemSlot")[1];
const pickupAmmoButton = document.getElementById("pickupAmmoButton");

let flashlightAvailable = true;
let flashlightPickupPending = false;
let ammoAvailable = true;
let ammoPickupPending = false;

let flashlightItemAvailability = [true, true];
let pistolItemAvailability = [true, true];
let ammoItemAvailability = [true, true];

function nearestAvailableGroundItem(items, availability) {
  let nearest = null;

  for (let itemId = 0; itemId < items.length; itemId++) {
    const item = items[itemId];
    if (!availability[itemId] || !item || !item.parent) continue;

    const distance = Math.hypot(
      player.position.x - item.position.x,
      player.position.z - item.position.z
    );

    if (!nearest || distance < nearest.distance) {
      nearest = { itemId, distance };
    }
  }

  return nearest;
}

function syncGroundItemList(items, availability, incoming) {
  if (!Array.isArray(incoming) || incoming.length !== items.length) return;

  availability.splice(0, availability.length,
    ...incoming.map(value => value === true)
  );

  items.forEach((item, itemId) => {
    if (availability[itemId]) {
      if (!item.parent) scene.add(item);
      item.visible = true;
    } else {
      scene.remove(item);
      item.visible = false;
    }
  });
}

function syncGroundItemsFromRoom(message) {
  syncGroundItemList(
    flashlightGroundItems, flashlightItemAvailability,
    message.flashlightItems
  );
  syncGroundItemList(
    pistolGroundItems, pistolItemAvailability,
    message.pistolItems
  );
  syncGroundItemList(
    ammoGroundItems, ammoItemAvailability,
    message.ammoItems
  );

  flashlightAvailable = flashlightItemAvailability.some(Boolean);
  pistolAvailable = pistolItemAvailability.some(Boolean);
  ammoAvailable = ammoItemAvailability.some(Boolean);
}

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

  if (!available && collectorId === multiplayerPlayerId && !hasFlashlight) {
    grantFlashlightToLocalPlayer();
  }
}

function grantAmmoToLocalPlayer(itemId = 0) {
  const ammoToLoad = Math.min(50 - pistolMagazine, pistolReserve + 50);
  pistolMagazine += ammoToLoad;
  pistolReserve = Math.max(0, pistolReserve + 50 - ammoToLoad);

  const selectedBox = ammoGroundItems[itemId];
  if (selectedBox) {
    scene.remove(selectedBox);
    selectedBox.visible = false;
  }

  if (Number.isInteger(itemId) && itemId >= 0 && itemId < 2) {
    ammoItemAvailability[itemId] = false;
  }
  ammoAvailable = ammoItemAvailability.some(Boolean);
  ammoPickupPending = false;
  pickupAmmoButton.style.display = "none";
  updateAmmoUI();
}

function applyAmmoAvailability(available, collectorId = null) {
  ammoAvailable = available;
  ammoPickupPending = false;

  if (!available && collectorId === multiplayerPlayerId) {
    grantAmmoToLocalPlayer(0);
  }
}
const ammoCounter = document.getElementById("ammoCounter");
const shootButton = document.getElementById("shootButton");
const reloadButton = document.getElementById("reloadButton");

// MULTITOUCH_ITEM_ACTIVATION_ADAPTER
// Permite ativar botões por pointerdown enquanto outro dedo move o joystick,
// mantendo os handlers click existentes e chamadas programáticas como .click().
function enableItemMultitouch(element) {
  if (!element || element.dataset.multitouchEnabled === "1") return;
  element.dataset.multitouchEnabled = "1";

  let activatingFromPointer = false;
  let suppressClickUntil = 0;

  element.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.isPrimary === false && event.pointerType === "mouse") return;

    event.preventDefault();
    event.stopPropagation();

    activatingFromPointer = true;
    try {
      element.click();
    } finally {
      activatingFromPointer = false;
      suppressClickUntil = Date.now() + 700;
    }
  }, { passive: false });

  element.addEventListener("click", (event) => {
    if (activatingFromPointer) return;
    if (event.isTrusted && Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

[
  pickupAmmoButton,
  pickupFlashlightButton,
  pickupPistolButton,
  firstItemSlot,
  secondItemSlot,
  ...document.querySelectorAll("#itemBar .itemSlot")
].forEach(enableItemMultitouch);


function updateAmmoUI() {
  ammoCounter.textContent = `${pistolMagazine}/${pistolReserve}`;
  ammoCounter.style.display = pistolEquipped ? "block" : "none";
  shootButton.style.display = pistolEquipped ? "block" : "none";
  reloadButton.style.display = pistolEquipped ? "block" : "none";
}

function resetX1LocalLoadout() {
  hasPistol = false;
  pistolEquipped = false;
  pistolPickup.visible = false;
  scene.remove(pistolPickup);
  pistolCrosshair.style.display = "none";
  pistolMagazine = 50;
  pistolReserve = 50;
  pistolPickupPending = false;
  pickupPistolButton.style.display = "none";

  hasFlashlight = false;
  flashlightEquipped = false;
  flashlightPickup.visible = false;
  scene.remove(flashlightPickup);
  flashlightLight.visible = false;
  flashlightBeam.visible = false;
  flashlightPickupPending = false;
  pickupFlashlightButton.style.display = "none";

  const pistolIcon = secondItemSlot.querySelector("span");
  if (pistolIcon) pistolIcon.textContent = "+";
  secondItemSlot.setAttribute("aria-label", "Slot de item 2");
  secondItemSlot.style.borderColor = "rgba(190,210,235,.7)";

  const flashlightIcon = firstItemSlot.querySelector("span");
  if (flashlightIcon) flashlightIcon.textContent = "+";
  firstItemSlot.setAttribute("aria-label", "Slot de item 1");
  firstItemSlot.style.background = "rgba(12,19,31,.78)";
  firstItemSlot.style.borderColor = "rgba(190,210,235,.7)";

  ammoPickupPending = false;
  pickupAmmoButton.style.display = "none";
  updateAmmoUI();
}

pickupAmmoButton.addEventListener("click", () => {
  if (!ammoAvailable || ammoPickupPending) return;

  const nearest = nearestAvailableGroundItem(
    ammoGroundItems, ammoItemAvailability
  );
  if (!nearest || nearest.distance > 1.8) return;
  const itemId = nearest.itemId;

  if (multiplayerRoomCode) {
    if (!multiplayerSocket ||
        multiplayerSocket.readyState !== WebSocket.OPEN) {
      console.warn("Conexão multiplayer indisponível.");
      return;
    }
    try {
      multiplayerSocket.send(JSON.stringify({ type: "collectAmmo", itemId }));
      ammoPickupPending = true;
      pickupAmmoButton.style.display = "none";
    } catch (error) {
      console.error("Erro ao solicitar munição:", error);
    }
    return;
  }

  ammoItemAvailability[itemId] = false;
  scene.remove(ammoGroundItems[itemId]);
  ammoGroundItems[itemId].visible = false;
  ammoAvailable = ammoItemAvailability.some(Boolean);
  grantAmmoToLocalPlayer(itemId);
});

reloadButton.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
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

  // Vira o personagem para a direção horizontal da mira ao disparar.
  player.rotation.y = cameraYaw;

  pistolMagazine--;
  damageTrainingTargetFromAim();
  updateAmmoUI();
  if (multiplayerRoomCode && multiplayerSocket &&
      multiplayerSocket.readyState === WebSocket.OPEN) {
    multiplayerSocket.send(JSON.stringify({ type: 'shoot' }));
  }

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

  const nearest = nearestAvailableGroundItem(
    flashlightGroundItems, flashlightItemAvailability
  );
  if (!nearest || nearest.distance > 1.8) return;
  const itemId = nearest.itemId;

  if (multiplayerRoomCode) {
    if (!multiplayerSocket ||
        multiplayerSocket.readyState !== WebSocket.OPEN) {
      console.warn("Conexão multiplayer indisponível.");
      return;
    }
    try {
      multiplayerSocket.send(JSON.stringify({ type: "collectFlashlight", itemId }));
      flashlightPickupPending = true;
      pickupFlashlightButton.style.display = "none";
    } catch (error) {
      console.error("Erro ao solicitar lanterna:", error);
    }
    return;
  }

  flashlightItemAvailability[itemId] = false;
  scene.remove(flashlightGroundItems[itemId]);
  flashlightGroundItems[itemId].visible = false;
  flashlightAvailable = flashlightItemAvailability.some(Boolean);
  grantFlashlightToLocalPlayer();
});


// Coleta da pistola e inventário do slot 2.
pickupPistolButton.addEventListener("click", () => {
  if (hasPistol || !pistolAvailable || pistolPickupPending) return;

  const nearest = nearestAvailableGroundItem(
    pistolGroundItems, pistolItemAvailability
  );
  if (!nearest || nearest.distance > 1.8) return;
  const itemId = nearest.itemId;

  if (multiplayerRoomCode) {
    if (
      !multiplayerSocket ||
      multiplayerSocket.readyState !== WebSocket.OPEN
    ) {
      console.warn("Não foi possível coletar: conexão multiplayer indisponível.");
      return;
    }

    try {
      multiplayerSocket.send(JSON.stringify({ type: "collectPistol", itemId }));
      pistolPickupPending = true;
      pickupPistolButton.style.display = "none";
    } catch (error) {
      console.error("Erro ao solicitar a pistola:", error);
    }

    return;
  }

  pistolItemAvailability[itemId] = false;
  scene.remove(pistolGroundItems[itemId]);
  pistolGroundItems[itemId].visible = false;
  pistolAvailable = pistolItemAvailability.some(Boolean);
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
    width:76px; height:76px; padding:0; overflow:hidden;
    border-radius:50%; box-sizing:border-box;
    border:2px solid white; background:rgba(0,0,0,.88);
    color:white; font:bold 13px Arial,sans-serif;
    z-index:25; touch-action:none; user-select:none;
  }

  #shootButton img {
    position:absolute;
    left:50%;
    top:50%;
    transform:translate(-50%,-50%);
    width:48px;
    height:48px;
    object-fit:contain;
    pointer-events:none;
    user-select:none;
  }
  #reloadButton {
    display:none; position:fixed; right:22px; bottom:295px;
    width:64px; height:64px; padding:0; overflow:hidden;
    border-radius:50%; box-sizing:border-box;
    border:2px solid white; background:rgba(0,0,0,.88);
    color:white; font:bold 11px Arial,sans-serif;
    align-items:center; justify-content:center;
    text-align:center; z-index:25; touch-action:none;
  }
  #reloadButton img {
    display:block; width:44px; height:44px;
    object-fit:contain; pointer-events:none; user-select:none;
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
    width:64px; height:64px; padding:0;
    border-radius:50%; box-sizing:border-box;
    border:2px solid white; background:rgba(0,0,0,.88);
    color:white; font-weight:bold; font-size:11px;
    display:flex; align-items:center; justify-content:center;
    text-align:center; z-index:10; touch-action:none;
    overflow:hidden;
  }

  #runButton img {
    display:block;
    width:44px;
    height:44px;
    object-fit:contain;
    pointer-events:none;
    user-select:none;
  }
  #crouchButton {
    position:fixed; right:25px; bottom:125px;
    width:64px; height:64px; padding:0;
    border-radius:50%; box-sizing:border-box;
    border:2px solid white; background:rgba(0,0,0,.88);
    color:white; font-weight:bold; font-size:10px;
    display:flex; align-items:center; justify-content:center;
    text-align:center; z-index:10; touch-action:none;
    overflow:hidden;
  }

  #crouchButton img {
    display:block;
    width:44px;
    height:44px;
    object-fit:contain;
    pointer-events:none;
    user-select:none;
  }
  #jumpButton {
    position:fixed; right:100px; bottom:42px;
    width:64px; height:64px; padding:0;
    border-radius:50%; box-sizing:border-box;
    border:2px solid white; background:rgba(0,0,0,.88);
    color:white; font:bold 30px Arial,sans-serif;
    display:flex; align-items:center; justify-content:center;
    z-index:10; touch-action:none; user-select:none;
  }
  #jumpButton:active { background:rgba(55,135,235,.95); }
  #crouchButton.active { background:rgba(190,125,45,.95); }
  #runButton.active { background:rgba(25,180,90,.95); }

  #cameraSettingsButton {
    position:fixed; top:18px; right:18px; width:48px; height:48px;
    border-radius:14px; background:rgba(20,28,42,.9); color:white;
    font-size:25px; z-index:30;
  }
  #cameraSettingsPanel {
    display: none;
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    box-sizing: border-box;
    padding: 24px 0 calc(24px + env(safe-area-inset-bottom));
    border-radius: 0;
    background:
      linear-gradient(to right,
        transparent 65.9%,
        #526176 65.9%,
        #526176 66%,
        transparent 66%),
      rgba(17,23,34,.98);
    color: white;
    font: 16px Arial, sans-serif;
    z-index: 100;
  }
  #cameraSettingsPanel.open {
    display: grid;
    grid-template-columns: minmax(0, 66fr) minmax(0, 34fr);
    align-content: start;
  }
  #cameraSettingsPanel {
    max-width: 100vw;
    touch-action: pan-y;
  }


  #hudSettingsColumn {
    grid-column: 1;
    align-self: start;
    min-width: 0;
    margin: 24px;
    padding: 16px;
    box-sizing: border-box;
    border: 1px solid #28394d;
    border-radius: 12px;
    background: rgba(11,17,27,.72);
  }

  #hudSettingsColumn h3 {
    margin: 0 0 14px;
    color: #cbd7e5;
    font-size: 14px;
    letter-spacing: 1.5px;
  }

  #hudSettingsColumn button {
    width: 100%;
    min-height: 44px;
    margin: 6px 0;
    padding: 10px;
    border: 1px solid #40536a;
    border-radius: 8px;
    background: #283448;
    color: white;
    font-weight: 600;
    box-sizing: border-box;
  }

  #cameraSettingsPanel > * {
    max-width: 100%;
  }

  #cameraSettingsPanel > * { grid-column:2; min-width:0; margin-left:20px; margin-right:20px; }
  #cameraSettingsPanel > * {
    grid-column: 2;
    width: auto;
    max-width: 100%;
    min-width: 0;
    margin-left: 20px;
    margin-right: 20px;
    box-sizing: border-box;
  }

  /* O editor fica na coluna esquerda; as outras configurações ficam à direita. */
  #cameraSettingsPanel > #hudSettingsColumn {
    grid-column: 1;
    min-width: 0;
  }

  /* Durante a edição, o fundo do painel deixa os toques passarem para o jogo. */
  #cameraSettingsPanel.hud-editing {
    pointer-events: none;
  }

  #cameraSettingsPanel.hud-editing > * {
    pointer-events: auto;
  }

  /* Os controles editáveis ficam acima da camada visual do painel. */
  body.hud-editing #stickBase,
  body.hud-editing #runButton,
  body.hud-editing #crouchButton,
  body.hud-editing #jumpButton,
  body.hud-editing #shootButton,
  body.hud-editing #reloadButton,
  body.hud-editing #playerHPPanel,
  body.hud-editing #itemBar {
    z-index: 2000 !important;
    touch-action: none;
  }

  body.hud-editing #playerHPPanel {
    pointer-events: auto !important;
  }

  #cameraSettingsPanel svg,
  #cameraSettingsPanel input,
  #cameraSettingsPanel button {
    max-width: 100%;
    box-sizing: border-box;
  }

  #cameraSettingsPanel input[type="range"] {
    width: 100%;
    min-width: 0;
  }

  #cameraSettingsPanel #supportPreview {
    width: 100%;
    height: auto;
  }

  #cameraSettingsPanel button:not(#cameraSettingsClose) {
    min-height: 38px;
    padding: 8px 12px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 7px;
  }

  #cameraSettingsPanel #cameraSettingsClose {
    margin-top: 24px;
  }

  #cameraSettingsPanel #cameraSettingsClose {
    width: calc(100% - 40px);
    min-height: 44px;
    margin-top: 8px;
    border-radius: 9px;
    background: #283448;
    color: white;
    font-size: 16px;
  }

  #cameraDistanceSlider { width:100%; }
  #cameraDistanceValue { margin:10px 0; text-align:center; }
  #cameraSettingsClose {
    width:100%;
    padding:14px;
    border-radius:9px;
    background:#283448;
    color:white;
    font-size:16px;
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

  /* BLACKGATES_X1_GATE_V1 */
  #x1OpenButton {
    display: none; position: fixed; left: 50%; bottom: 110px;
    transform: translateX(-50%); z-index: 115;
    padding: 14px 22px; border: 1px solid #32c8ff;
    border-radius: 12px; background: rgba(5,24,39,.97);
    color: #eaf9ff; font: bold 14px Arial,sans-serif;
    letter-spacing: .5px; touch-action: manipulation;
    box-shadow: 0 0 18px rgba(0,157,255,.25);
  }
  #x1OpenButton.nearby { display: block; }
  #x1LoadingScreen {
    display: none; position: fixed; inset: 0; z-index: 999;
    align-items: center; justify-content: center; flex-direction: column;
    background: #f4f6f8; color: #17212b;
    font: bold 18px Arial,sans-serif; text-align: center;
  }
  #x1LoadingScreen.open { display: flex; }
  #x1LoadingScreen h2 { font-size: 20px; letter-spacing: 1px; }
  #x1LoadingScreen p { font-size: 13px; font-weight: normal; }
  .x1Loader {
    width: 42px; height: 42px; border-radius: 50%;
    border: 4px solid #c9d1d8; border-top-color: #168bc1;
    animation: x1Spin .8s linear infinite;
  }
  @keyframes x1Spin { to { transform: rotate(360deg); } }
  .x1Progress {
    width: min(260px, 72vw); height: 8px; margin-top: 12px;
    overflow: hidden; border-radius: 10px; background: #d5dce2;
  }
  .x1ProgressFill {
    width: 35%; height: 100%; border-radius: inherit;
    background: #168bc1;
    animation: x1ProgressMove 1s ease-in-out infinite alternate;
  }
  @keyframes x1ProgressMove {
    from { transform: translateX(0); }
    to { transform: translateX(185%); }
  }
  #x1Panel {
    display: none; position: fixed; z-index: 120;
    left: 50%; top: 50%; transform: translate(-50%,-50%);
    width: min(330px,calc(100vw - 32px)); box-sizing: border-box;
    padding: 22px; border: 1px solid #269ed4; border-radius: 17px;
    background: linear-gradient(145deg,rgba(13,28,45,.98),rgba(3,9,17,.99));
    box-shadow: 0 0 28px rgba(0,157,255,.22);
    color: #f1f7ff; font: 14px Arial,sans-serif; text-align: center;
  }
  #x1Panel.open { display: block; }
  #x1Panel h2 { margin: 0 0 18px; font-size: 21px; letter-spacing: 1px; }
  #x1Panel h2 span { color: #32c8ff; }
  #x1GateStatus { color: #65d5ff; font-weight: bold; }
  #x1Panel .x1Description { color: #c3d2df; line-height: 1.5; }
  #x1Panel button {
    display: block; width: 100%; margin-top: 12px; padding: 13px;
    border: 1px solid #2daee5; border-radius: 9px;
    background: #09253a; color: white; font-weight: bold;
    touch-action: manipulation;
  }
  #x1Panel #x1ClosePanelButton {
    border-color: #526171; background: #182330;
  }

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
const jumpButton = document.getElementById('jumpButton');
let crouching = false;
let jumpVelocity = 0;
let jumpGroundY = 0;
let jumpRequested = false;
let jumpStarted = false;
let jumpMoveX = 0;
let jumpMoveZ = -1;
let jumpHorizontalSpeed = 0;
const jumpImpulse = 6.5;
const jumpGravity = 18;
function requestJump() { jumpRequested = true; }

function setCrouching(value) {
  crouching = value;
  crouchButton.classList.toggle('active', value);
  crouchButton.textContent = value ? 'AGACHADO' : 'AGACHAR';
}

crouchButton.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  setCrouching(!crouching);
});

jumpButton.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  requestJump();
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

// Editor independente do HUD: posições e tamanhos são guardados localmente.
(() => {
  const editButton = document.getElementById('editHudButton');
  const controls = document.getElementById('hudEditControls');
  const saveButton = document.getElementById('saveHudButton');
  const cancelButton = document.getElementById('cancelHudButton');
  const resetButton = document.getElementById('resetHudButton');
  const select = document.getElementById('hudElementSelect');
  const sizeSlider = document.getElementById('hudSizeSlider');
  const sizeValue = document.getElementById('hudSizeValue');
  const panel = document.getElementById('cameraSettingsPanel');
  const storageKey = 'blackGatesHudLayoutV1';

  const elements = {
    stickBase: document.getElementById('stickBase'),
    runButton: document.getElementById('runButton'),
    crouchButton: document.getElementById('crouchButton'),
    jumpButton: document.getElementById('jumpButton'),
    shootButton: document.getElementById('shootButton'),
    reloadButton: document.getElementById('reloadButton'),
    playerHPPanel: document.getElementById('playerHPPanel'),
    itemBar: document.getElementById('itemBar')
  };

  if (!editButton || !controls || !saveButton || !cancelButton ||
      !resetButton || !select || !sizeSlider || !sizeValue ||
      Object.values(elements).some(el => !el)) {
    console.warn('Editor HUD: elementos necessários não encontrados.');
    return;
  }

  let editing = false;
  let dragTarget = null;
  let dragPointer = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let beforeEdit = null;
  const originalDisplays = {};

  function readLayout() {
    const result = {};
    for (const [id, el] of Object.entries(elements)) {
      const r = el.getBoundingClientRect();
      result[id] = {
        x: Math.max(0, Math.min(1, r.left / innerWidth)),
        y: Math.max(0, Math.min(1, r.top / innerHeight)),
        scale: Number(el.dataset.hudScale || 1)
      };
    }
    return result;
  }

  function applyLayout(layout) {
    for (const [id, el] of Object.entries(elements)) {
      const item = layout && layout[id];
      if (!item || !Number.isFinite(item.x) ||
          !Number.isFinite(item.y)) continue;

      el.style.left = `${Math.max(0, Math.min(1, item.x)) * 100}%`;
      el.style.top = `${Math.max(0, Math.min(1, item.y)) * 100}%`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';

      const scale = Math.max(0.6, Math.min(1.6, Number(item.scale) || 1));
      el.dataset.hudScale = String(scale);
      el.style.transform = `scale(${scale})`;
      el.style.transformOrigin = 'top left';
    }
  }

  function selectedElement() {
    return elements[select.value];
  }

  function refreshSize() {
    const el = selectedElement();
    const scale = Number(el.dataset.hudScale || 1);
    sizeSlider.value = String(Math.round(scale * 100));
    sizeValue.textContent = `${Math.round(scale * 100)}%`;
  }

  function beginEditing() {
    if (editing) return;
    editing = true;
    panel.classList.add('hud-editing');
    document.body.classList.add('hud-editing');
    beforeEdit = readLayout();

    for (const [id, el] of Object.entries(elements)) {
      originalDisplays[id] = el.style.display;
      if (id === 'shootButton' || id === 'reloadButton') {
        el.style.display = 'block';
      }
      el.style.outline = '2px dashed #ffd54a';
      el.style.outlineOffset = '3px';
    }

    controls.style.display = 'block';
    editButton.textContent = 'EDITANDO HUD';
    editButton.setAttribute('aria-pressed', 'true');
    if (typeof releaseStick === 'function') releaseStick();
    refreshSize();
  }

  function endEditing() {
    editing = false;
    dragTarget = null;
    dragPointer = null;
    panel.classList.remove('hud-editing');
    document.body.classList.remove('hud-editing');

    for (const [id, el] of Object.entries(elements)) {
      el.style.outline = '';
      el.style.outlineOffset = '';
      if (id in originalDisplays) el.style.display = originalDisplays[id];
    }

    controls.style.display = 'none';
    editButton.textContent = 'EDITAR HUD';
    editButton.setAttribute('aria-pressed', 'false');
  }

  editButton.addEventListener('click', () => {
    if (!editing) beginEditing();
  });

  select.addEventListener('change', refreshSize);

  sizeSlider.addEventListener('input', () => {
    if (!editing) return;
    const el = selectedElement();
    const scale = Number(sizeSlider.value) / 100;
    el.dataset.hudScale = String(scale);
    el.style.transform = `scale(${scale})`;
    el.style.transformOrigin = 'top left';
    sizeValue.textContent = `${sizeSlider.value}%`;
  });

  document.addEventListener('pointerdown', event => {
    if (!editing) return;
    const target = event.target.closest
      ? event.target.closest('#stickBase, #runButton, #crouchButton, #jumpButton, #shootButton, #reloadButton, #playerHPPanel, #itemBar')
      : null;
    if (!target || !Object.values(elements).includes(target)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    dragTarget = target;
    dragPointer = event.pointerId;
    const rect = target.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    try { target.setPointerCapture(event.pointerId); } catch (_) {}
  }, true);

  document.addEventListener('pointermove', event => {
    if (!editing || !dragTarget || event.pointerId !== dragPointer) return;
    event.preventDefault();
    event.stopPropagation();

    const width = dragTarget.offsetWidth * Number(dragTarget.dataset.hudScale || 1);
    const height = dragTarget.offsetHeight * Number(dragTarget.dataset.hudScale || 1);
    const x = Math.max(0, Math.min(innerWidth - Math.min(width, innerWidth),
      event.clientX - dragOffsetX));
    const y = Math.max(0, Math.min(innerHeight - Math.min(height, innerHeight),
      event.clientY - dragOffsetY));

    dragTarget.style.left = `${(x / innerWidth) * 100}%`;
    dragTarget.style.top = `${(y / innerHeight) * 100}%`;
    dragTarget.style.right = 'auto';
    dragTarget.style.bottom = 'auto';
  }, true);

  function stopDrag(event) {
    if (event && dragPointer !== null && event.pointerId !== dragPointer) return;
    dragTarget = null;
    dragPointer = null;
  }
  document.addEventListener('pointerup', stopDrag, true);
  document.addEventListener('pointercancel', stopDrag, true);

  saveButton.addEventListener('click', () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readLayout()));
      endEditing();
    } catch (error) {
      console.error('Não foi possível salvar o HUD:', error);
      alert('Não foi possível salvar o HUD neste aparelho.');
    }
  });

  cancelButton.addEventListener('click', () => {
    if (beforeEdit) applyLayout(beforeEdit);
    endEditing();
  });

  resetButton.addEventListener('click', () => {
    try { localStorage.removeItem(storageKey); } catch (_) {}
    for (const el of Object.values(elements)) {
      el.style.left = '';
      el.style.top = '';
      el.style.right = '';
      el.style.bottom = '';
      el.style.transform = '';
      el.style.transformOrigin = '';
      delete el.dataset.hudScale;
    }
    playerHPPanel.style.left = '7%';
    playerHPPanel.style.top = '18px';
    playerHPPanel.style.right = 'auto';
    playerHPPanel.style.bottom = 'auto';
    beforeEdit = readLayout();
    refreshSize();
  });

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) applyLayout(JSON.parse(saved));
  } catch (error) {
    console.warn('Layout salvo do HUD inválido; usando posições padrão.', error);
  }
})();


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

const supportStorageKey = 'blackGatesSupportSettingsV1';

supportSaveButton.addEventListener('click', () => {
  savedSupportSettings = {
    fold: Number(supportFoldSlider.value),
    height: Number(supportHeightSlider.value),
    tilt: Number(supportTiltSlider.value)
  };

  try {
    localStorage.setItem(supportStorageKey, JSON.stringify(savedSupportSettings));
    supportSaveButton.textContent = 'POSIÇÃO SALVA';
  } catch (error) {
    console.warn('Não foi possível salvar a posição do suporte.', error);
    supportSaveButton.textContent = 'ERRO AO SALVAR';
  }
});

function applySupportSettings(settings) {
  supportFoldSlider.value = settings.fold;
  supportHeightSlider.value = settings.height;
  supportTiltSlider.value = settings.tilt;
  updateSupportControls();
}

try {
  const stored = localStorage.getItem(supportStorageKey);
  if (stored) {
    const parsed = JSON.parse(stored);
    const valid =
      Number.isFinite(parsed.fold) && parsed.fold >= 0 && parsed.fold <= 100 &&
      Number.isFinite(parsed.height) && parsed.height >= -30 && parsed.height <= 30 &&
      Number.isFinite(parsed.tilt) && parsed.tilt >= -45 && parsed.tilt <= 45;

    if (valid) {
      savedSupportSettings = {
        fold: parsed.fold,
        height: parsed.height,
        tilt: parsed.tilt
      };
    }
  }
} catch (error) {
  console.warn('Configuração salva do suporte inválida; usando padrão.', error);
}

supportResetButton.addEventListener('click', () => {
  applySupportSettings(defaultSupportSettings);
  savedSupportSettings = { ...defaultSupportSettings };

  try {
    localStorage.setItem(supportStorageKey, JSON.stringify(defaultSupportSettings));
    supportSaveButton.textContent = 'SALVAR POSIÇÃO';
  } catch (error) {
    console.warn('Não foi possível salvar o padrão do suporte.', error);
  }
});

applySupportSettings(savedSupportSettings);



const editHudButton = document.getElementById('editHudButton');
const hudEditControls = document.getElementById('hudEditControls');
const saveHudButton = document.getElementById('saveHudButton');
const cancelHudButton = document.getElementById('cancelHudButton');

editHudButton.addEventListener('click', () => {
  hudEditControls.style.display = 'block';
});

saveHudButton.addEventListener('click', () => {
  hudEditControls.style.display = 'none';
});

cancelHudButton.addEventListener('click', () => {
  hudEditControls.style.display = 'none';
});

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
        restoreLocalPlayerHP();
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
      syncGroundItemsFromRoom(message);
      } else if (message.type === 'roomJoined') {
        multiplayerRoomCode = String(message.roomCode || message.code || joinRoomInput.value);
        restoreLocalPlayerHP();
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
      syncGroundItemsFromRoom(message);
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
  } else if (message.type === 'itemAvailability') {
        const itemType = message.itemType;
        const itemId = Number(message.itemId);
        const incoming = message.items;

        if (itemType === 'flashlight') {
          syncGroundItemList(
            flashlightGroundItems, flashlightItemAvailability, incoming
          );
          flashlightAvailable = flashlightItemAvailability.some(Boolean);
          flashlightPickupPending = false;

          if (message.playerId === multiplayerPlayerId && !hasFlashlight) {
            grantFlashlightToLocalPlayer();
          }
        } else if (itemType === 'pistol') {
          syncGroundItemList(
            pistolGroundItems, pistolItemAvailability, incoming
          );
          pistolAvailable = pistolItemAvailability.some(Boolean);
          pistolPickupPending = false;

          if (message.playerId === multiplayerPlayerId && !hasPistol) {
            grantPistolToLocalPlayer();
          }
        } else if (itemType === 'ammo') {
          syncGroundItemList(
            ammoGroundItems, ammoItemAvailability, incoming
          );
          ammoAvailable = ammoItemAvailability.some(Boolean);
          ammoPickupPending = false;

          if (message.playerId === multiplayerPlayerId) {
            grantAmmoToLocalPlayer(itemId);
          }
        }
      } else if (message.type === 'pickupRejected') {
        if (message.itemType === 'flashlight') {
          flashlightPickupPending = false;
        } else if (message.itemType === 'pistol') {
          pistolPickupPending = false;
        } else if (message.itemType === 'ammo') {
          ammoPickupPending = false;
        }
      } else if (message.type === 'playerHP') {
        const receivedHP = Number(message.hp);
        if (Number.isFinite(receivedHP)) {
          const wasAlive = playerHP > 0;
          playerHP = Math.max(0, Math.min(playerMaxHP, Math.round(receivedHP)));
          updatePlayerHPUI();

          if (playerHP === 0) {
            disintegrateLocalCharacter();
            multiplayerRoomInfo.textContent = 'Você foi derrotado!';

            if (wasAlive && multiplayerSocket &&
                multiplayerSocket.readyState === WebSocket.OPEN) {
              multiplayerSocket.send(JSON.stringify({ type: 'playerDeath' }));
            }
          }
        }

      } else if (message.type === 'playerDeath') {
        const deadId = message.playerId || message.id;
        if (deadId) disintegrateRemoteCharacter(deadId);
      } else if (message.type === 'shoot') {
        playRemoteShot(message.playerId || message.id);
      } else if (message.type === 'x1ReadyUpdate') {
        const readyCount = Array.isArray(message.readyPlayers)
          ? message.readyPlayers.length
          : 0;
        const status = document.getElementById('x1GateStatus');
        if (status) {
          status.textContent = message.message ||
            `X1: ${readyCount}/2 JOGADORES PRONTOS`;
        }
        multiplayerRoomInfo.textContent = message.message ||
          `X1: ${readyCount}/2 jogadores prontos.`;
      } else if (message.type === 'x1Start') {
        const spawn = message.spawns?.[multiplayerPlayerId];
        if (spawn) {
          enterX1Arena({
            confirmedByServer: true,
            spawn
          });
        } else {
          const status = document.getElementById('x1GateStatus');
          if (status) status.textContent = 'ERRO: POSIÇÃO X1 NÃO RECEBIDA';
        }
      } else if (message.type === 'x1RoundState') {
        updateX1RoundHUD(message);
        if (message.phase === 'countdown') {
          restoreLocalCharacterAfterDeath();
        }
        if (message.phase === 'countdown' && Number(message.round) > 0 &&
            Number(message.round) !== x1LastLoadoutResetRound) {
          x1LastLoadoutResetRound = Number(message.round);
          resetX1LocalLoadout();
        }
        const spawn = message.spawns?.[multiplayerPlayerId];
        if (spawn && x1ArenaActive) {
          player.position.set(spawn.x, spawn.y || 0, spawn.z);
          player.rotation.y = multiplayerPlayerId === Object.keys(message.spawns)[0]
            ? Math.PI / 2 : -Math.PI / 2;
          restoreLocalPlayerHP();
          restoreLocalCharacterAfterDeath();
        }
      } else if (message.type === 'x1RoundEnd') {
        updateX1RoundHUD({
          phase: 'intermission',
          scores: message.scores
        });
        multiplayerRoomInfo.textContent = message.matchOver
          ? 'Partida decidida!'
          : 'Rodada encerrada! Próxima rodada em instantes.';
      } else if (message.type === 'x1MatchEnd') {
        x1MatchFinished = true;
        updateX1RoundHUD({
          phase: 'finished',
          scores: message.scores
        });
        multiplayerRoomInfo.textContent =
          message.winnerId === multiplayerPlayerId
            ? 'VOCÊ VENCEU O X1!'
            : 'Você perdeu o X1.';
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

const cameraDistanceStorageKey = 'blackGatesCameraDistanceV1';
const cameraPhysicalDistanceSlider = document.getElementById('cameraPhysicalDistanceSlider');
const cameraPhysicalDistanceValue = document.getElementById('cameraPhysicalDistanceValue');
const cameraPhysicalDistanceStorageKey = 'blackGatesCameraPhysicalDistanceV1';
let cameraPhysicalDistance = 4.5;

function applyCameraPhysicalDistance(value) {
  cameraPhysicalDistance = THREE.MathUtils.clamp(Number(value), 4.5, 7);
  cameraPhysicalDistanceSlider.value = String(cameraPhysicalDistance);
  cameraPhysicalDistanceValue.textContent = cameraPhysicalDistance.toFixed(1);

  const rig = player.userData.backCameraRig;
  if (rig && rig.userData.rebuildSupport) {
    rig.userData.rebuildSupport(
      (rig.userData.supportFold ?? 0.35) * 100,
      (rig.userData.supportHeight ?? 0) * 100
    );
  }
}

cameraPhysicalDistanceSlider.addEventListener('input', () => {
  applyCameraPhysicalDistance(cameraPhysicalDistanceSlider.value);
});

cameraPhysicalDistanceSlider.addEventListener('change', () => {
  try {
    localStorage.setItem(cameraPhysicalDistanceStorageKey, String(cameraPhysicalDistance));
  } catch (error) {
    console.warn('Não foi possível salvar o afastamento da câmera.', error);
  }
});

try {
  const storedPhysicalDistance = localStorage.getItem(cameraPhysicalDistanceStorageKey);
  applyCameraPhysicalDistance(
    storedPhysicalDistance !== null ? storedPhysicalDistance : 4.5
  );
} catch (error) {
  console.warn('Não foi possível restaurar o afastamento da câmera.', error);
  applyCameraPhysicalDistance(4.5);
}

function applyCameraDistance(value) {
  const distance = THREE.MathUtils.clamp(Number(value), 1, 10);
  cameraDistanceSlider.value = String(distance);
  camera.fov = THREE.MathUtils.clamp(defaultCameraFov * (4.5 / distance), 25, 95);
  camera.updateProjectionMatrix();
  cameraDistanceValue.textContent =
    distance < 3 ? 'Perto' : distance > 6.5 ? 'Longe' : 'Normal';
}

cameraDistanceSlider.addEventListener('input', () => {
  applyCameraDistance(cameraDistanceSlider.value);
});

cameraDistanceSlider.addEventListener('change', () => {
  try {
    localStorage.setItem(
      cameraDistanceStorageKey,
      String(Number(cameraDistanceSlider.value))
    );
  } catch (error) {
    console.warn('Não foi possível salvar a distância da câmera.', error);
  }
});

try {
  const storedDistance = localStorage.getItem(cameraDistanceStorageKey);
  if (storedDistance !== null) {
    const distance = Number(storedDistance);
    if (Number.isFinite(distance) && distance >= 1 && distance <= 10) {
      applyCameraDistance(distance);
    } else {
      applyCameraDistance(4.5);
    }
  } else {
    applyCameraDistance(cameraDistanceSlider.value);
  }
} catch (error) {
  console.warn('Não foi possível restaurar a distância da câmera.', error);
  applyCameraDistance(cameraDistanceSlider.value);
}


let stickX = 0;
let stickY = 0;
let stickPointer = null;
let running = false;
const autoRunToggle = document.getElementById('autoRunToggle');
const autoRunStorageKey = 'blackGatesAutoRunV1';
let autoRunEnabled = false;
let autoRunActive = false;

try {
  autoRunEnabled = localStorage.getItem(autoRunStorageKey) === 'true';
  autoRunToggle.checked = autoRunEnabled;
} catch (error) {
  console.warn('Não foi possível restaurar a corrida automática.', error);
}

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

  if (autoRunActive && Math.hypot(stickX, stickY) > 0.15) {
    autoRunActive = false;
    setRunning(false);
  }

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

autoRunToggle.addEventListener('change', () => {
  autoRunEnabled = autoRunToggle.checked;

  if (!autoRunEnabled) {
    autoRunActive = false;
    setRunning(false);
  }

  try {
    localStorage.setItem(autoRunStorageKey, String(autoRunEnabled));
  } catch (error) {
    console.warn('Não foi possível salvar a configuração de corrida.', error);
  }
});

setRunning(false);

runButton.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();

  if (autoRunEnabled) {
    autoRunActive = !autoRunActive;
    setRunning(autoRunActive);
  } else {
    setRunning(!running);
  }
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
    cameraPitch + dy * 0.006, -0.75, 0.75
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
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    requestJump();
  }
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
  // Mostrar o botão apenas quando o jogador estiver perto da entrada X1.
  const x1Distance = Math.hypot(
    player.position.x - (-6.3),
    player.position.z - (x1GateOpen ? -10.0 : -8.45)
  );
  const x1Button = document.getElementById('x1OpenButton');
  if (x1Button) {
    const inEntryLane =
      player.position.x > -8.25 &&
      player.position.x < -4.35 &&
      player.position.z < -9.0;

    const shouldShow =
      !x1ArenaActive &&
      !x1ArenaLoading &&
      x1Distance < 2.7 &&
      (!x1GateOpen || inEntryLane);

    x1Button.textContent = x1GateOpen ? 'PRONTO' : 'ABRIR PORTÃO';
    x1Button.classList.toggle('nearby', shouldShow);
  }

  const delta = Math.min(clock.getDelta(), 0.05);

  jumpStarted = false;

  if (jumpRequested) {
    if (player.position.y <= jumpGroundY + 0.001 && jumpVelocity <= 0) {
      jumpVelocity = jumpImpulse;
      jumpStarted = true;
    }
    jumpRequested = false;
  }

  const jumping = player.position.y > jumpGroundY || jumpVelocity > 0;

  if (jumping) {
    if (!crouching) setCrouching(true);
    jumpVelocity -= jumpGravity * delta;
    player.position.y += jumpVelocity * delta;

    if (player.position.y <= jumpGroundY) {
      player.position.y = jumpGroundY;
      jumpVelocity = 0;
      if (crouching) setCrouching(false);
    }
  }

  let forward = autoRunActive ? 1 : -stickY;
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

  if (jumpStarted) {
    const launchLength = Math.hypot(moveX, moveZ);

    if (launchLength > 0.01) {
      jumpMoveX = moveX / launchLength;
      jumpMoveZ = moveZ / launchLength;
      jumpHorizontalSpeed = speed;
    } else {
      jumpMoveX = 0;
      jumpMoveZ = 0;
      jumpHorizontalSpeed = 0;
    }
  }

  if (jumping) {
    player.position.x += jumpMoveX * jumpHorizontalSpeed * delta;
    player.position.z += jumpMoveZ * jumpHorizontalSpeed * delta;
  } else {
    player.position.x += moveX * speed * delta;
    player.position.z += moveZ * speed * delta;
  }

  const limit = x1ArenaActive ? 24.35 : roomSize / 2 - 0.65;
  const movementCenter = x1ArenaActive ? x1ArenaCenter : 0;
  player.position.x = THREE.MathUtils.clamp(
    player.position.x,
    movementCenter - limit,
    movementCenter + limit
  );
  // BLACKGATES_X1_GATE_COLLISION_V1
  // A passagem só fica liberada quando o portão está aberto.
  const x1InGateLane =
    player.position.x > -8.25 &&
    player.position.x < -4.35;

  const x1CrossingWall =
    !x1ArenaActive &&
    x1InGateLane &&
    player.position.z < -9.0;

  // Com o portão fechado, impede atravessar a parede pelo vão.
  if (!x1GateOpen && x1CrossingWall) {
    player.position.z = -9.0;
  }

  const x1InsideOpening =
    !x1ArenaActive &&
    x1GateOpen &&
    x1InGateLane &&
    player.position.z < -9.0;

  // Mantém a passagem externa acessível após abrir o portão.
  const x1AlreadyOutside =
    !x1ArenaActive &&
    x1GateOpen &&
    player.position.z < -10.05;

  const zLimit = x1ArenaActive
    ? 24.35
    : ((x1InsideOpening || x1AlreadyOutside) ? 15.0 : limit);

  if (x1AlreadyOutside) {
    player.position.x = THREE.MathUtils.clamp(
      player.position.x, -8.25, -4.35
    );
  }

  player.position.z = THREE.MathUtils.clamp(
    player.position.z,
    movementCenter - zLimit,
    movementCenter + zLimit
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
    if (!jumping) {
      player.rotation.y = Math.atan2(-moveX, -moveZ);
    }
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

    // Mantém o suporte alinhado com a órbita horizontal e vertical da câmera.
    cameraRig.rotation.y = cameraYaw - player.rotation.y;
  }

  const physicalCamera = player.userData.backCameraLens;

  if (physicalCamera) {
    physicalCamera.updateWorldMatrix(true, false);

    // Aproxima suavemente a câmera apenas ao olhar de baixo para cima.
    const orbitTargetY =
      player.position.y + 1.8 -
      (crouching ? 0.45 : 0);

    const orbitDistance = cameraPhysicalDistance;
    const cameraTargetHeight = orbitTargetY;

    cameraTarget.set(
      player.position.x,
      cameraTargetHeight,
      player.position.z
    );

    if (pistolEquipped) {
      cameraTarget.x += Math.cos(cameraYaw) * 0.9;
      cameraTarget.z -= Math.sin(cameraYaw) * 0.9;
    }

    cameraPosition.set(
      player.position.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * orbitDistance,
      orbitTargetY + Math.sin(cameraPitch) * orbitDistance,
      player.position.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * orbitDistance
    );

    // Mantém a câmera física dentro dos limites do cenário sem limitar a rotação.
    const physicalCameraLimit = x1ArenaActive ? 24.5 : roomSize / 2 - 0.5;
    const physicalCameraCenter = x1ArenaActive ? x1ArenaCenter : 0;

    cameraPosition.x = THREE.MathUtils.clamp(
      cameraPosition.x,
      physicalCameraCenter - physicalCameraLimit,
      physicalCameraCenter + physicalCameraLimit
    );
    cameraPosition.z = THREE.MathUtils.clamp(
      cameraPosition.z,
      physicalCameraCenter - physicalCameraLimit,
      physicalCameraCenter + physicalCameraLimit
    );

    const physicalCameraSmoothing = 1 - Math.exp(-7 * delta);
    camera.position.lerp(cameraPosition, physicalCameraSmoothing);



    // Impede a câmera de atravessar o chão.
    camera.position.y = Math.max(0.3, camera.position.y);

    camera.lookAt(cameraTarget);
  } else {
    const crouchCameraOffset = crouching ? 0.55 : 0;
    cameraTarget.set(
      player.position.x,
      player.position.y + 1.35 - crouchCameraOffset,
      player.position.z
    );

    cameraPosition.set(
      player.position.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * cameraPhysicalDistance,
      player.position.y + 1.35 - crouchCameraOffset + Math.sin(cameraPitch) * cameraPhysicalDistance,
      player.position.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * cameraPhysicalDistance
    );

    // Mantém a câmera dentro dos limites da sala ou da arena X1.
    const cameraLimit = x1ArenaActive ? 24.5 : roomSize / 2 - 0.5;
    const cameraCenter = x1ArenaActive ? x1ArenaCenter : 0;
    cameraPosition.x = THREE.MathUtils.clamp(
      cameraPosition.x, cameraCenter - cameraLimit, cameraCenter + cameraLimit
    );
    cameraPosition.z = THREE.MathUtils.clamp(
      cameraPosition.z, cameraCenter - cameraLimit, cameraCenter + cameraLimit
    );

    camera.position.lerp(cameraPosition, 1 - Math.exp(-7 * delta));
    camera.lookAt(cameraTarget);
  }


  const nearestFlashlight = nearestAvailableGroundItem(
    flashlightGroundItems, flashlightItemAvailability
  );
  pickupFlashlightButton.style.display =
    !hasFlashlight && !flashlightPickupPending &&
    nearestFlashlight && nearestFlashlight.distance < 1.8
      ? "block" : "none";

  const nearestPistol = nearestAvailableGroundItem(
    pistolGroundItems, pistolItemAvailability
  );
  pickupPistolButton.style.display =
    !hasPistol && !pistolPickupPending &&
    nearestPistol && nearestPistol.distance < 1.8
      ? "block" : "none";

  const nearestAmmo = nearestAvailableGroundItem(
    ammoGroundItems, ammoItemAvailability
  );
  pickupAmmoButton.style.display =
    !ammoPickupPending && nearestAmmo && nearestAmmo.distance < 1.8
      ? "block" : "none";

  // Suaviza a movimentação dos personagens remotos.
  updateDeathDisintegrations(delta);

  for (const remote of remotePlayers.values()) {
    const buffer = remote.positionBuffer;
    const renderTime = performance.now() - 50;

    // Mantém no buffer apenas as amostras necessárias.
    while (
      buffer.length > 2 &&
      buffer[1].time <= renderTime
    ) {
      buffer.shift();
    }

    let interpolated = false;

    if (buffer.length >= 2) {
      const a = buffer[0];
      const b = buffer[1];

      if (renderTime >= a.time && renderTime <= b.time) {
        const span = b.time - a.time;
        const alpha = span > 0
          ? THREE.MathUtils.clamp((renderTime - a.time) / span, 0, 1)
          : 1;

        remote.root.position.lerpVectors(
          a.position,
          b.position,
          alpha
        );

        const angleDifference = Math.atan2(
          Math.sin(b.rotationY - a.rotationY),
          Math.cos(b.rotationY - a.rotationY)
        );

        remote.root.rotation.y =
          a.rotationY + angleDifference * alpha;

        interpolated = true;
      } else if (renderTime < a.time) {
        remote.root.position.copy(a.position);
        remote.root.rotation.y = a.rotationY;
        interpolated = true;
      }
    } else if (buffer.length === 1 && renderTime < buffer[0].time) {
      remote.root.position.copy(buffer[0].position);
      remote.root.rotation.y = buffer[0].rotationY;
      interpolated = true;
    }

    // Se não houver amostras suficientes ou a rede atrasar,
    // continua seguindo a última posição conhecida suavemente.
    if (!interpolated) {
      remote.root.position.lerp(
        remote.targetPosition,
        1 - Math.exp(-12 * delta)
      );

      const rotationDifference = Math.atan2(
        Math.sin(remote.targetRotationY - remote.root.rotation.y),
        Math.cos(remote.targetRotationY - remote.root.rotation.y)
      );

      remote.root.rotation.y +=
        rotationDifference * (1 - Math.exp(-12 * delta));
    }
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

      // Faz o braco esquerdo acompanhar a mao direita.
      const leftHand = remote.leftHandBone;
      const leftUpper = remote.leftUpperArmBone;
      const leftLower = remote.leftLowerArmBone;
      const rightHand = remote.rightHand;

      if (leftHand && leftHand.parent && leftUpper && rightHand) {
        remote.model.updateWorldMatrix(true, true);

        const rightHandWorld = new THREE.Vector3();
        rightHand.getWorldPosition(rightHandWorld);

        const handOffset = new THREE.Vector3(-0.12, 0, 0);
        const rootWorldQuaternion = remote.root.getWorldQuaternion(
          new THREE.Quaternion()
        );
        handOffset.applyQuaternion(rootWorldQuaternion);
        rightHandWorld.add(handOffset);

        const upperParent = leftUpper.parent;
        upperParent.updateWorldMatrix(true, false);

        const shoulderWorld = new THREE.Vector3();
        leftUpper.getWorldPosition(shoulderWorld);

        const targetInParent = upperParent.worldToLocal(
          rightHandWorld.clone()
        );
        const shoulderInParent = upperParent.worldToLocal(
          shoulderWorld.clone()
        );
        const armDirection = targetInParent
          .sub(shoulderInParent)
          .normalize();

        leftUpper.quaternion.setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),
          armDirection
        );

        remote.model.updateWorldMatrix(true, true);

        if (leftLower) {
          const lowerParent = leftLower.parent;
          lowerParent.updateWorldMatrix(true, false);

          const elbowWorld = new THREE.Vector3();
          leftLower.getWorldPosition(elbowWorld);

          const targetLower = lowerParent.worldToLocal(
            rightHandWorld.clone()
          );
          const elbowLower = lowerParent.worldToLocal(
            elbowWorld.clone()
          );

          leftLower.quaternion.setFromUnitVectors(
            new THREE.Vector3(1, 0, 0),
            targetLower.sub(elbowLower).normalize()
          );
        }

        if (!leftHand.userData.remotePistolHandBasePosition) {
          leftHand.userData.remotePistolHandBasePosition =
            leftHand.position.clone();
        }

        leftHand.parent.updateWorldMatrix(true, false);
        leftHand.position.copy(
          leftHand.parent.worldToLocal(rightHandWorld.clone())
        );
      }
    } else if (remote.flashlightEquipped) {
      // Pose fixa da lanterna, igual à do personagem local.
      const arm = remote.rightLowerArmBone;

      if (arm) {
        if (!arm.userData.remoteFlashlightPoseBase) {
          arm.userData.remoteFlashlightPoseBase = arm.rotation.clone();
        }

        const base = arm.userData.remoteFlashlightPoseBase;
        arm.rotation.set(
          base.x - Math.PI / 4,
          base.y + Math.PI / 3,
          base.z + Math.PI / 6
        );
      }

    } else {
      // RESTORE_REMOTE_PISTOL_POSE
      const leftHand = remote.leftHandBone;
      const handBase = leftHand?.userData.remotePistolHandBasePosition;

      if (leftHand && handBase) {
        leftHand.position.copy(handBase);
        delete leftHand.userData.remotePistolHandBasePosition;
      }

      for (const bone of [
        remote.leftUpperArmBone,
        remote.rightUpperArmBone,
        remote.leftLowerArmBone,
        remote.rightLowerArmBone
      ]) {
        const pistolBase = bone?.userData.remotePistolPoseBase;
        if (pistolBase) {
          bone.rotation.copy(pistolBase);
          delete bone.userData.remotePistolPoseBase;
        }

        const flashlightBase = bone?.userData.remoteFlashlightPoseBase;
        if (flashlightBase) {
          bone.rotation.copy(flashlightBase);
          delete bone.userData.remoteFlashlightPoseBase;
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

function resizeGameCanvas() {
  const viewport = window.visualViewport;
  const viewportWidth = Math.round(
    viewport && viewport.width ? viewport.width : window.innerWidth
  );
  const width = viewportWidth;
  const height = Math.round(
    viewport && viewport.height ? viewport.height : window.innerHeight
  );

  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.right = '0';
  renderer.domElement.style.bottom = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resizeGameCanvas);
window.addEventListener('orientationchange', () => {
  requestAnimationFrame(() => requestAnimationFrame(resizeGameCanvas));
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resizeGameCanvas);
}
resizeGameCanvas();

// BLACKGATES_PLAYER_HP_HUD_EDIT_V1
