#!/usr/bin/env python3
"""Baixa indicadores do Banco Mundial (WDI) para todos os países, 1980 em diante.
Saída: data/bruto/wdi.json = {indicador: {ISO3: {ano: valor}}} + metadados. Só biblioteca padrão."""
import json, urllib.request, time, datetime, pathlib
IND = {
 "SP.POP.1564.TO": "população de 15 a 64 anos",
 "NY.GDP.MKTP.KD.ZG": "crescimento do PIB real (%)",
 "NY.GDP.PCAP.KD.ZG": "crescimento do PIB per capita real (%)",
 "NY.GDP.PCAP.KD": "PIB per capita, US$ constantes de 2015",
 "NE.GDI.TOTL.ZS": "investimento (formação bruta de capital, % do PIB)",
 "NV.IND.MANF.ZS": "indústria de transformação (% do PIB)",
 "FP.CPI.TOTL.ZG": "inflação ao consumidor (%)",
 "BN.CAB.XOKA.GD.ZS": "saldo em conta corrente (% do PIB)",
 "PX.REX.REER": "câmbio real efetivo (2010=100)",
 "FS.AST.PRVT.GD.ZS": "crédito ao setor privado (% do PIB)",
 "NE.CON.GOVT.ZS": "consumo do governo (% do PIB)",
 "NE.TRD.GNFS.ZS": "comércio exterior (% do PIB)",
}
out = {"fonte": "Banco Mundial, World Development Indicators (api.worldbank.org/v2)",
       "baixado_em": datetime.date.today().isoformat(), "indicadores": IND, "dados": {}, "paises": {}}
meta = json.load(urllib.request.urlopen("https://api.worldbank.org/v2/country?format=json&per_page=400", timeout=60))
for c in meta[1]:
    if c["region"]["value"] != "Aggregates":
        out["paises"][c["id"]] = {"nome": c["name"], "renda": c["incomeLevel"]["value"], "regiao": c["region"]["value"]}
for code in IND:
    url = f"https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&date=1980:2025&per_page=20000"
    for tent in range(3):
        try: d = json.load(urllib.request.urlopen(url, timeout=120)); break
        except Exception as e: print("retry", code, e); time.sleep(5)
    serie = {}
    for r in d[1] or []:
        iso = r["countryiso3code"]
        if iso in out["paises"] and r["value"] is not None:
            serie.setdefault(iso, {})[r["date"]] = r["value"]
    out["dados"][code] = serie
    print(code, len(serie), "países")
p = pathlib.Path(__file__).resolve().parent.parent / "data" / "bruto" / "wdi.json"
p.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
print("ok", p, p.stat().st_size // 1024, "KB")
