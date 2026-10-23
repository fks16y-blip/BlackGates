from pathlib import Path

p = Path("public/js/main.js")
s = p.read_text()

marker = "// DETALHES EXTRAS DA POLIDA LOW POLY"
if marker in s:
    print("Os detalhes extras ja foram aplicados.")
    raise SystemExit(0)

anchor = "// Bracos com mangas, cotovelos, antebracos e dedos"
if anchor not in s:
    anchor = "// Bracos com mangas, cotovelos, antebracos e dedos"
if anchor not in s:
    raise SystemExit("Nao encontrei o ponto certo. Nenhuma alteracao aplicada.")

details = r'''// DETALHES EXTRAS DA POLIDA LOW POLY

// Cinto discreto e fivela
box(player, pantsLight, 0.29, 0.045, 0.025, 0, 0.925, -0.157);
box(player, soleMat, 0.055, 0.035, 0.012, 0, 0.925, -0.174);

// Bolso no peito e pequena etiqueta
box(player, shirtDark, 0.078, 0.082, 0.014, 0.125, 1.405, -0.174);
box(player, shirtLight, 0.078, 0.012, 0.016, 0.125, 1.445, -0.183);
box(player, shirtLight, 0.018, 0.028, 0.008, 0.125, 1.405, -0.185);

// Costuras e reforcos da camisa
box(player, shirtDark, 0.012, 0.17, 0.009, -0.155, 1.36, -0.157);
box(player, shirtLight, 0.012, 0.13, 0.009, 0.16, 1.37, -0.151);

// Franja facetada para dar mais volume ao cabelo
ball(player, hairLight, 0, 1.875, -0.083, 0.09, 0.038, 0.045, 0);
ball(player, hairMat, -0.065, 1.86, -0.076, 0.045, 0.035, 0.035, 0);

// Pequeno detalhe no pescoco
box(player, shirtDark, 0.105, 0.025, 0.09, 0, 1.575, 0.005);

// Detalhes dos tenis: lingueta e faixa lateral
box(player, pantsLight, 0.065, 0.018, 0.025, -0.105, 0.105, -0.145);
box(player, pantsLight, 0.065, 0.018, 0.025, 0.105, 0.105, -0.145);

'''
s = s.replace(anchor, details + anchor, 1)
p.write_text(s)
print("Polida visual aplicada: roupa, cinto, cabelo e tenis.")
