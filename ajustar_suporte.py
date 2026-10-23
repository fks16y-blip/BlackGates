from pathlib import Path

p = Path("public/js/main.js")
s = p.read_text()

old = """        rig.add(bar);
      }

      function addSupportJoint(position, radius) {"""

new = """        rig.add(bar);
        rig.userData.supportParts.push(bar);
      }

      function addSupportJoint(position, radius) {"""

if old not in s:
    raise SystemExit("Não encontrei a função addSupportBar.")

s = s.replace(old, new, 1)

old = """        joint.castShadow = true;
        rig.add(joint);
      }

      // Suporte dobrado"""

new = """        joint.castShadow = true;
        rig.add(joint);
        rig.userData.supportParts.push(joint);
      }

      // Suporte dobrado"""

if old not in s:
    raise SystemExit("Não encontrei a função addSupportJoint.")

s = s.replace(old, new, 1)

old = """      function addSupportBar(start, end, radius) {"""

new = """      rig.userData.supportParts = [];

      function addSupportBar(start, end, radius) {"""

if old not in s:
    raise SystemExit("Não encontrei o início da função addSupportBar.")

s = s.replace(old, new, 1)

p.write_text(s)
print("Preparação aplicada: as hastes agora podem ser identificadas para atualização.")
