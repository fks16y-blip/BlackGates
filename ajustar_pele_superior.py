from pathlib import Path
from datetime import datetime
import shutil
import sys

p = Path("public/js/main.js")
s = p.read_text()

old = "  // Tronco e quadril: volumes sobrepostos formam uma so superficie."
marker = "  // Ombros, bracos, antebracos e maos acompanham as articulacoes."

if old not in s or marker not in s:
    print("Não encontrei os marcadores da pele. Nada foi alterado.")
    sys.exit(1)

backup = Path(
    "public/js/main.js.backup-superior-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)

start = s.index(old)
end = s.index(marker, start)

# Superficie superior mais estreita, com volumes menores no peito e cintura.
replacement = """  // Tronco superior mais ajustado ao corpo
  addSkinBall(0, 1.47, 0, 1.35);
  addSkinBall(0, 1.36, 0, 1.55);
  addSkinBall(0, 1.24, 0, 1.50);
  addSkinBall(0, 1.12, 0, 1.35);
  addSkinBall(0, 1.00, 0, 1.25);
  addSkinBall(0, 0.91, 0, 1.20);

"""

s = s[:start] + replacement + s[end:]
p.write_text(s)

print("Tronco, peito e cintura ajustados.")
print("Backup:", backup)
