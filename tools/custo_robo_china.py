#!/usr/bin/env python3
"""Conta de importação e custo por hora de robôs humanoides chineses no Brasil.

Uso: python3 tools/custo_robo_china.py
Os resultados alimentam o artigo artigo-china-robos (index.html). Premissas marcadas
com HIPOTESE não têm fonte oficial e estão escritas assim no artigo.
"""

PTAX = 5.7446          # US$ venda, Banco Central, 26/11/2026
USD_CNY = 6.6602       # BCE via frankfurter.app, 26/11/2026

# Preços de referência (US$, FOB)
UBT_RECEITA_UNID = 590.3e6 / 921 / USD_CNY   # receita de humanoides grandes / unidades, 1º sem. 2026
PRECOS = {
    "Walker S2, preço implícito na China": UBT_RECEITA_UNID,
    "AgiBot G2, varejo EUA (RobotShop)": 145_000,
    "Walker S2, varejo EUA (RobotShop)": 246_600,
    "Unitree G1, versão básica (site Unitree)": 13_500,
}

FRETE_USD = 3_000      # HIPOTESE: marítimo China-Santos, um robô embalado
SEGURO = 0.005         # HIPOTESE: 0,5% do FOB
AFRMM = 0.08           # 8% do frete marítimo (Lei 10.893/2004)
SISCOMEX = 185.0       # taxa de registro da DI, R$ (aprox.)
DESPESAS_BR = 10_000   # HIPOTESE: despachante, armazenagem, frete até a fábrica, R$
PIS, COFINS = 0.021, 0.0965
ICMS_SP = 0.18         # alíquota interna geral SP; 8,8% se o NCM estiver no Convênio 52/91 (não confirmado)

SALARIO = 2_037        # operador de produção, média nacional CAGED (Portal Salário, 12 meses até mai/2026)
ENCARGOS = 1.8         # multiplicador usado no simulador do site
HORAS_MES = 44 * 52 / 12
VIDA_ANOS = 5          # HIPOTESE: vida útil econômica
MANUT = 0.10           # HIPOTESE: manutenção e peças, % do preço ao ano
HORAS_ROBO_ANO = 16 * 300  # dois turnos, 300 dias
PROD = (0.30, 0.50)    # produtividade relativa ao humano declarada pela UBTech


def importa(fob_usd, ii=0.0, icms=ICMS_SP):
    cif = (fob_usd + FRETE_USD + fob_usd * SEGURO) * PTAX
    v_ii = cif * ii
    v_pis, v_cof = cif * PIS, cif * COFINS
    afrmm = FRETE_USD * AFRMM * PTAX
    base = (cif + v_ii + v_pis + v_cof + SISCOMEX + afrmm) / (1 - icms)
    v_icms = base * icms
    total = cif + v_ii + v_pis + v_cof + v_icms + SISCOMEX + afrmm + DESPESAS_BR
    recuperavel = v_pis + v_cof + v_icms   # indústria no lucro real
    return dict(cif=cif, ii=v_ii, pis=v_pis, cofins=v_cof, icms=v_icms, total=total,
                liquido=total - recuperavel)


def custo_hora(preco_liq):
    anual = preco_liq / VIDA_ANOS + preco_liq * MANUT
    return anual / HORAS_ROBO_ANO


if __name__ == "__main__":
    humano_h = SALARIO * ENCARGOS / HORAS_MES
    print(f"Humano: R$ {SALARIO*ENCARGOS:,.0f}/mês, R$ {humano_h:.2f}/h")
    for nome, fob in PRECOS.items():
        for ii in (0.0, 0.126):
            r = importa(fob, ii)
            h = custo_hora(r["liquido"])
            print(f"{nome} | FOB US$ {fob:,.0f} | II {ii:.1%} | total R$ {r['total']:,.0f} | "
                  f"líquido de créditos R$ {r['liquido']:,.0f} | robô R$ {h:.0f}/h | "
                  f"por hora-humano R$ {h/PROD[1]:.0f} a {h/PROD[0]:.0f}")
    # Preço FOB máximo para empatar com o humano (II 0%, créditos recuperados, produtividade 50%)
    lo, hi = 0, 300_000
    for _ in range(60):
        mid = (lo + hi) / 2
        if custo_hora(importa(mid)["liquido"]) / PROD[1] > humano_h:
            hi = mid
        else:
            lo = mid
    print(f"Empate com 50% de produtividade: FOB até US$ {lo:,.0f}")
    for p in PROD:
        lo, hi = 0, 300_000
        for _ in range(60):
            mid = (lo + hi) / 2
            if custo_hora(importa(mid)["liquido"]) / p > humano_h:
                hi = mid
            else:
                lo = mid
        print(f"  produtividade {p:.0%}: FOB até US$ {lo:,.0f}")
