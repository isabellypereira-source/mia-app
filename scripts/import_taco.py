import os
from PyPDF2 import PdfReader

PDF_PATH = r"C:\Users\isabe\Downloads\taco_4_edicao_ampliada_e_revisada.pdf"
OUTPUT_MD = os.path.join(os.path.dirname(__file__), "..", "knowledge-base", "taco-dados-completo.md")

if not os.path.exists(PDF_PATH):
    raise FileNotFoundError(f"PDF not found: {PDF_PATH}")

reader = PdfReader(PDF_PATH)

with open(OUTPUT_MD, "w", encoding="utf-8") as f:
    f.write("# TACO - Texto extraído (4ª edição ampliada e revisada)\n")
    f.write("Fonte: C:\\Users\\isabe\\Downloads\\taco_4_edicao_ampliada_e_revisada.pdf\n")
    f.write("\n")

    # A partir da página 26 do PDF em índice de tabelas, estas páginas contém composição centesimal
    start_page = 25  # índice 0-based
    end_page = len(reader.pages)

    for i in range(start_page, end_page):
        page = reader.pages[i]
        text = page.extract_text() or ""
        if not text.strip():
            continue

        f.write(f"## Página {i+1}\n\n")
        # Substitui várias quebras de linha por uma para evitar linhas muito longas sem contexto
        # mas preserva blocos legíveis
        lines = text.splitlines()
        for line in lines:
            if line.strip() == "":
                f.write("\n")
            else:
                f.write(line.rstrip() + "\n")
        f.write("\n---\n\n")

print(f"Export completo em: {OUTPUT_MD}")
