from pathlib import Path
import re

p = Path("public/js/main.js")
s = p.read_text()

start = s.find("// BLACK GATES - ANDROIDE BRANCO ARTICULADO")
if start < 0:
    start = s.find("// BLACK GATES - MANEQUIM ANATOMICO ESCULPIDO")
end = s.find("// INTERFACE MOBILE", start)

if start < 0 or end < 0:
    raise SystemExit("ERRO: bloco do personagem nao encontrado; arquivo intacto.")

# Confirma que o bloco atual contém os rigs esperados.
old = s[start:end]
required = [
    "const leftArm", "const rightArm",
    "const leftElbow", "const rightElbow",
    "const leftLeg", "const rightLeg",
    "const leftKnee", "const rightKnee"
]
missing = [name for name in required if name not in old]
if missing:
    raise SystemExit("ERRO: faltam nomes de articulacao: " + ", ".join(missing))

# Cria geometria facetada por secções, sem SphereGeometry ou CylinderGeometry.
block = r'''// BLACK GATES - ANDROIDE BRANCO MODULAR
const player = new THREE.Group();
scene.add(player);

const bodyWhite = new THREE.MeshStandardMaterial({
  color: 0xe9edf0, roughness: 0.42, metalness: 0.12
});
const bodyLight = new THREE.MeshStandardMaterial({
  color: 0xffffff, roughness: 0.36, metalness: 0.1
});
const jointMat = new THREE.MeshStandardMaterial({
  color: 0x303840, roughness: 0.55, metalness: 0.25
});
const jointLight = new THREE.MeshStandardMaterial({
  color: 0x87919a, roughness: 0.45, metalness: 0.2
});

function meshY(parent, mat, sections, sides=16, exponent=0.72) {
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
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(v,3));
  g.setIndex(ind);
  g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);
  m.castShadow=true;m.receiveShadow=true;parent.add(m);
  return m;
}
function part(parent,mat,sections,x=0,y=0,z=0,sides=16,exponent=0.72){
  const m=meshY(parent,mat,sections,sides,exponent);
  m.position.set(x,y,z);return m;
}

// Tronco, cintura e quadril formam uma única silhueta.
part(player,bodyWhite,[
 [0,0,0,.11,.075],[.05,0,0,.15,.10],[.12,0,0,.145,.10],
 [.20,0,0,.15,.105],[.28,0,0,.18,.115],[.36,0,0,.21,.115],
 [.43,0,0,.225,.11],[.49,0,0,.20,.10],[.54,0,0,.14,.08],
 [.56,0,0,.07,.06]
],0,.89,0,24,.72);

// Peça traseira integrada ao tronco.
part(player,bodyLight,[
 [0,0,0,.09,.016],[.06,0,0,.13,.018],
 [.13,0,0,.14,.018],[.20,0,0,.13,.016],[.25,0,0,.10,.014]
],0,1.17,.09,20,.8);

// Pescoço.
part(player,jointMat,[
 [0,0,0,.045,.04],[.02,0,0,.055,.046],
 [.08,0,0,.05,.043],[.11,0,0,.043,.038]
],0,1.43,0,16,.8);

// Cabeça com testa, maxilar, laterais e queixo angulares.
part(player,bodyLight,[
 [0,0,0,.045,.05],[.012,0,0,.065,.065],
 [.032,0,0,.083,.076],[.065,0,0,.096,.085],
 [.12,0,0,.10,.087],[.16,0,0,.09,.08],
 [.185,0,0,.065,.06],[.198,0,0,.025,.025]
],0,1.60,0,20,.58);

// Visor liso escuro, sem rosto humano.
part(player,jointMat,[
 [0,0,0,.052,.009],[.015,0,0,.07,.011],
 [.05,0,0,.073,.011],[.075,0,0,.055,.009]
],0,1.665,-.077,16,.65);

// Ombros, braços, cotovelos, antebraços, mãos e dedos.
function makeArm(x){
 const upper=new THREE.Group();
 upper.position.set(x,1.405,0);player.add(upper);

 part(upper,bodyWhite,[
  [.05,0,0,.035,.033],[.03,0,0,.065,.06],
  [0,0,0,.08,.07],[-.035,0,0,.075,.067],
  [-.07,0,0,.055,.052],[-.09,0,0,.04,.04]
 ],0,0,0,18,.72);

 part(upper,bodyLight,[
  [-.045,0,0,.05,.046],[-.075,0,0,.059,.052],
  [-.12,0,0,.055,.049],[-.16,0,0,.047,.043],
  [-.205,0,0,.037,.035],[-.235,0,0,.03,.029]
 ],0,0,0,18,.72);

 const elbow=new THREE.Group();
 elbow.position.set(0,-.238,0);upper.add(elbow);
 part(elbow,jointMat,[
  [.03,0,0,.032,.03],[.014,0,0,.044,.04],
  [-.014,0,0,.043,.039],[-.033,0,0,.03,.029]
 ],0,0,0,16,.75);

 part(elbow,bodyWhite,[
  [-.018,0,0,.034,.032],[-.045,0,0,.045,.041],
  [-.08,0,0,.046,.042],[-.12,0,0,.04,.038],
  [-.16,0,0,.03,.03],[-.19,0,0,.023,.024]
 ],0,0,0,18,.72);

 const hand=new THREE.Group();
 hand.position.set(0,-.20,0);elbow.add(hand);
 // Palma com contorno próprio.
 part(hand,bodyLight,[
  [.012,0,0,.022,.018],[0,0,0,.031,.023],
  [-.025,0,0,.033,.02],[-.047,0,0,.027,.016],
  [-.058,0,0,.02,.013]
 ],0,0,0,16,.72);

 // Quatro dedos, cada um como peça estreita com falanges.
 for(let i=0;i<4;i++){
  const fx=(i-1.5)*.014;
  const L=[.039,.049,.047,.037][i];
  part(hand,bodyWhite,[
   [-.043,fx,0,.0065,.0065],
   [-.043-L*.35,fx,0,.006,.006],
   [-.043-L*.72,fx,0,.0055,.0055],
   [-.043-L,fx,0,.003,.0035]
  ],0,0,-.002,8,.9);
 }
 // Polegar lateral segmentado.
 const thumb=new THREE.Group();
 thumb.position.set(x<0?.027:-.027,-.015,-.002);
 thumb.rotation.z=x<0?-.45:.45;hand.add(thumb);
 part(thumb,bodyWhite,[
  [.012,0,0,.009,.009],[0,0,0,.012,.01],
  [-.018,0,0,.01,.009],[-.034,0,0,.005,.006]
 ],0,0,0,10,.85);
 return {upper,elbow};
}
const leftArmRig=makeArm(-.245);
const rightArmRig=makeArm(.245);
const leftArm=leftArmRig.upper,rightArm=rightArmRig.upper;
const leftElbow=leftArmRig.elbow,rightElbow=rightArmRig.elbow;

// Coxas, joelhos, canelas, tornozelos e pés.
function makeLeg(x){
 const upper=new THREE.Group();
 upper.position.set(x,.86,0);player.add(upper);
 part(upper,bodyWhite,[
  [.035,0,0,.058,.057],[.005,0,0,.078,.07],
  [-.05,0,0,.082,.074],[-.11,0,0,.074,.068],
  [-.17,0,0,.062,.059],[-.23,0,0,.05,.049],
  [-.29,0,0,.04,.04],[-.325,0,0,.034,.034]
 ],0,0,0,20,.72);

 const knee=new THREE.Group();
 knee.position.set(0,-.34,0);upper.add(knee);
 part(knee,jointMat,[
  [.03,0,0,.034,.032],[.014,0,0,.047,.042],
  [-.016,0,0,.044,.04],[-.036,0,0,.031,.03]
 ],0,0,0,16,.75);

 part(knee,bodyWhite,[
  [-.02,0,0,.033,.032],[-.05,0,0,.043,.04],
  [-.09,0,0,.042,.039],[-.135,0,0,.035,.034],
  [-.18,0,0,.028,.029],[-.22,0,0,.023,.026]
 ],0,0,0,18,.72);

 // Tornozelo e pé com bico e sola definidos.
 part(knee,jointMat,[
  [-.21,0,0,.024,.026],[-.23,0,0,.029,.029],
  [-.245,0,0,.024,.025]
 ],0,0,0,14,.8);
 part(knee,bodyLight,[
  [-.23,0,-.005,.023,.03],[-.245,0,-.018,.033,.045],
  [-.268,0,-.033,.042,.066],[-.29,0,-.038,.04,.068],
  [-.305,0,-.034,.03,.054],[-.312,0,-.028,.017,.032]
 ],0,0,0,18,.68);
 part(knee,jointMat,[
  [-.299,0,-.035,.032,.055],[-.306,0,-.034,.033,.058],
  [-.31,0,-.03,.02,.04]
 ],0,0,0,16,.75);
 return {upper,knee};
}
const leftLegRig=makeLeg(-.095);
const rightLegRig=makeLeg(.095);
const leftLeg=leftLegRig.upper,rightLeg=rightLegRig.upper;
const leftKnee=leftLegRig.knee,rightKnee=rightLegRig.knee;
'''

# Só cria backup adicional depois de confirmar os marcadores.
backup = p.with_name("main.js.backup-antes-androide-completo")
backup.write_text(s)
p.write_text(s[:start] + block + "\n" + s[end:])
print("Modelo atualizado. Backup salvo em:", backup)
