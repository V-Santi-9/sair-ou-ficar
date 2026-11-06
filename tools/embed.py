#!/usr/bin/env python3
"""Copia as bases de data/ e img/materiais/indice.json para dentro do index.html.

Uso: python3 tools/embed.py
A rotina automática edita só os JSON; este script é a única forma de levar os dados ao HTML.
Também atualiza a data "Atualizado em" e o bloco de atualizações da capa a partir de
estudo-v4.json -> atualizacoes[0].
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto",
         "setembro", "outubro", "novembro", "dezembro"]


def load(p):
    return json.loads((ROOT / p).read_text(encoding="utf-8"))


def replace_var(h, name, value):
    marker = "var %s = " % name
    s = h.index(marker) + len(marker)
    end = {"{": "};\n", "[": "];\n"}[h[s]]
    e = h.index(end, s) + 1
    return h[:s] + json.dumps(value, ensure_ascii=False, separators=(",", ":")) + h[e:]


def por_extenso(iso):
    y, m, d = iso.split("-")
    return "%d de %s de %s" % (int(d), MESES[int(m) - 1], y)


def main():
    h = HTML.read_text(encoding="utf-8")
    study = load("data/estudo-v4.json")
    h = replace_var(h, "study", study)
    h = replace_var(h, "caseData", load("data/casos-v5.json"))
    h = replace_var(h, "axesData", load("data/perguntas-v5.json"))
    h = replace_var(h, "materials", load("img/materiais/indice.json"))

    upd = (study.get("atualizacoes") or [None])[0]
    if upd:
        iso = upd["data"]
        h = re.sub(r'<time datetime="\d{4}-\d{2}-\d{2}">[^<]*</time>',
                   '<time datetime="%s">%s</time>' % (iso, por_extenso(iso)), h)
        items = "".join("<li>%s</li>" % i for i in upd["itens"])
        origem = " Atualização automática, com fontes." if upd.get("automatica") else ""
        block = ('<section class="update-note" aria-labelledby="updTitle"><h2 id="updTitle" class="sec">%s</h2>'
                 '<p class="note">Atualização de %s.%s Fontes no <a href="#normas">monitor de normas</a> '
                 'e nos <a href="#destinos">dossiês</a>.</p><ul>%s</ul></section>') % (
                     upd["titulo"], por_extenso(iso), origem, items)
        a = h.index('<section class="update-note"')
        b = h.index("</section>", a) + len("</section>")
        h = h[:a] + block + h[b:]

    HTML.write_text(h, encoding="utf-8")
    print("embed ok:", len(study["normas"]), "normas,", len(study["numeros"]), "números")


if __name__ == "__main__":
    sys.exit(main())
