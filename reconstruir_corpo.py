from pathlib import Path
import re, shutil, time

p = Path("public/js/main.js")
s = p.read_text()
start = s.find("// BLACK GATES - ANDROIDE BRANCO MODULAR")
if start < 0:
    start = s.find("// BLACK GATES - ANDROIDE BRANCO ARTICULADO")
end = s.find("// INTERFACE MOBILE", start)

if start < 0 or end < 0:
    raise SystemExit("ERRO: nao encontrei o bloco do personagem. Nada alterado.")

backup = p.with_name("main.js.backup-corpo-profissional-" + str(int(time.time())))
shutil.copy2(p, backup)

block = r'''// BLACK GATES - SILHUETA HUMANA 3D
const player = new THREE.Group();
scene.add(player);

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

'''

p.write_text(s[:start] + block + "\n" + s[end:])
print("Novo corpo aplicado.")
print("Backup:", backup)
