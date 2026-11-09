#!/usr/bin/env python3
"""Teste offline das proxies de Sharma. Apenas biblioteca padrão; nenhuma requisição.

Importar este módulo não executa o estudo. sinais(base, iso, t) é uma função pura
que só lê observações <= t. Estatísticas usam a precisão original; só a saída é
arredondada. Bootstrap em blocos de país, com postos recalculados por réplica.
"""
import argparse
import csv
import hashlib
import json
import math
import random
import statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = 2016
REPLICAS = 1000
POP = 'SP.POP.1564.TO'
GDP = 'NY.GDP.PCAP.KD'
GROWTH = 'NY.GDP.MKTP.KD.ZG'
PER_CAPITA = 'NY.GDP.PCAP.KD.ZG'
MIDDLE_INCOME = {'Lower middle income', 'Upper middle income'}
RULES = [
    dict(id='gente', numero=1, nome='Gente importa', livro='Uma população em idade ativa crescendo favorece a expansão.', indicador='SP.POP.1564.TO', formula='100 × [(população em t / população em t−5)^(1/5) − 1]', unidade='% ao ano'),
    dict(id='estado', numero=4, nome='Perigos do Estado', livro='O aumento do peso do Estado é um sinal ruim.', indicador='NE.CON.GOVT.ZS', formula='Menos a variação do consumo do governo / PIB entre t−5 e t. O nível é mostrado como contexto.', unidade='p.p., sinal invertido'),
    dict(id='geografia', numero=5, nome='Geografia', livro='A abertura ao comércio favorece o crescimento.', indicador='NE.TRD.GNFS.ZS', formula='Abertura em t + variação entre t−5 e t, com pesos unitários. Proxy de abertura, não da localização física.', unidade='índice de abertura'),
    dict(id='fabricas', numero=6, nome='Fábricas primeiro', livro='Investimento e indústria em expansão favorecem o crescimento.', indicador='NE.GDI.TOTL.ZS; NV.IND.MANF.ZS', formula='Média das variações em p.p. do investimento / PIB e da indústria de transformação / PIB entre t−5 e t.', unidade='p.p.'),
    dict(id='cebola', numero=7, nome='Preço da cebola', livro='Inflação baixa e estável é boa; deflação também é ruim.', indicador='FP.CPI.TOTL.ZG', formula='Menos [média da inflação positiva ou duas vezes o módulo da negativa + desvio padrão populacional], em t−4 a t. Penalização da deflação e pesos são escolhas nossas.', unidade='índice de estabilidade'),
    dict(id='barato', numero=8, nome='Barato é bom', livro='Déficit externo grande e moeda cara são sinais ruins.', indicador='BN.CAB.XOKA.GD.ZS; PX.REX.REER (contexto)', formula='Média da conta corrente / PIB em t−4 a t. Variação do câmbio real em 5 anos é contexto, sem entrar na nota: índice base 2010 não compara moedas caras entre países.', unidade='% do PIB'),
    dict(id='divida', numero=9, nome='O beijo da dívida', livro='Alta rápida do crédito avisa freada; estabilização após desalavancagem pode antecipar retomada.', indicador='FS.AST.PRVT.GD.ZS', formula='Menos a variação do crédito privado / PIB entre t−5 e t. Proxy parcial: não distingue crédito parado de retomada após desalavancagem.', unidade='p.p., sinal invertido'),
]
IDS = [r['id'] for r in RULES]
CURRENT = [('BRA','Brasil','brasil'), ('PRY','Paraguai','paraguai'), ('URY','Uruguai','uruguai'), ('PRT','Portugal','portugal'), ('ESP','Espanha','espanha'), ('ITA','Itália','italia'), ('USA','EUA','eua'), ('ARE','Emirados','emirados'), ('ARG','Argentina',None), ('CHL','Chile',None), ('MEX','México',None), ('COL','Colômbia',None)]


def value(base, code, iso, year):
    x = base['dados'].get(code, {}).get(iso, {}).get(str(year))
    return x if isinstance(x, (int, float)) and math.isfinite(x) else None


def window(base, code, iso, start, end):
    xs = [value(base, code, iso, y) for y in range(start, end + 1)]
    return xs if all(x is not None for x in xs) else None


def sinais(base, iso, t):
    """Todos os componentes e ausências, sem imputação nem leitura futura."""
    def v(code, year=t):
        return value(base, code, iso, year)
    def delta(code):
        a, b = v(code), v(code, t-5)
        return a-b if a is not None and b is not None else None
    def entry(x, components):
        return dict(valor=x, componentes=components, ausentes=[k for k,vv in components.items() if vv is None])
    p, old = v(POP), v(POP,t-5)
    gov, trade, inv, man, cred = [delta(c) for c in ['NE.CON.GOVT.ZS','NE.TRD.GNFS.ZS','NE.GDI.TOTL.ZS','NV.IND.MANF.ZS','FS.AST.PRVT.GD.ZS']]
    infl = window(base,'FP.CPI.TOTL.ZG',iso,t-4,t)
    ca = window(base,'BN.CAB.XOKA.GD.ZS',iso,t-4,t)
    reer, rold = v('PX.REX.REER'),v('PX.REX.REER',t-5)
    opening = v('NE.TRD.GNFS.ZS')
    return {
        'gente':entry(100*((p/old)**.2-1) if p is not None and old is not None and old>0 and p>0 else None, {'populacao_t':p,'populacao_t_menos_5':old}),
        'estado':entry(-gov if gov is not None else None, {'governo_pct_pib':v('NE.CON.GOVT.ZS'),'variacao_pp':gov}),
        'geografia':entry(opening+trade if opening is not None and trade is not None else None, {'abertura_pct_pib':opening,'variacao_pp':trade}),
        'fabricas':entry((inv+man)/2 if inv is not None and man is not None else None, {'investimento_pct_pib':v('NE.GDI.TOTL.ZS'),'investimento_variacao_pp':inv,'industria_pct_pib':v('NV.IND.MANF.ZS'),'industria_variacao_pp':man}),
        'cebola':entry(-(st.mean(max(x,0)+2*max(-x,0) for x in infl)+st.pstdev(infl)) if infl else None, {'inflacao_media_pct':st.mean(infl) if infl else None,'inflacao_desvio_pp':st.pstdev(infl) if infl else None}),
        'barato':entry(st.mean(ca) if ca else None, {'conta_corrente_media_pct_pib':st.mean(ca) if ca else None,'cambio_real_variacao_pct':100*(reer/rold-1) if reer is not None and rold is not None and rold>0 else None}),
        'divida':entry(-cred if cred is not None else None, {'credito_pct_pib':v('FS.AST.PRVT.GD.ZS'),'variacao_pp':cred})
    }


def resultado(base, iso, t, growth=GROWTH):
    ys = window(base,growth,iso,t+1,t+5)
    return st.mean(ys) if ys else None


def crescimento_recente(base, iso, t):
    """Média das cinco taxas do PIB total até o ano-base; sem preencher lacunas."""
    ys = window(base, GROWTH, iso, t-4, t)
    return st.mean(ys) if ys else None


def nivel_relacao(stats):
    """Regra v9c, só na validação principal, antes de arredondar a saída."""
    intervals = [stats.get('ic_spearman'), stats.get('convergencia', {}).get('ic_spearman')]
    if not all(ci and len(ci) == 2 and all(x is not None for x in ci) for ci in intervals):
        return 'Sem relação clara'
    if all(ci[0] > 0 for ci in intervals):
        return 'Relação clara'
    if all(ci[1] < 0 for ci in intervals):
        return 'Relação contrária'
    return 'Sem relação clara'


def painel(base, variante='principal'):
    rows = []
    growth = PER_CAPITA if variante=='per_capita' else GROWTH
    for iso in sorted(base['paises']):
        if variante=='renda_media' and base['paises'][iso].get('renda') not in MIDDLE_INCOME:
            continue
        for t in range(1990,2021):
            pop, y = value(base,POP,iso,t), resultado(base,iso,t,growth)
            if pop is None or pop < 1_000_000 or y is None:
                continue
            initial = value(base,GDP,iso,t)
            past = window(base,growth,iso,t-4,t)
            if variante=='aceleracao':
                if past is None: continue
                y -= st.mean(past)
            rows.append(dict(iso=iso,ano=t,resultado=y,pib_inicial=initial,log_pib=math.log(initial) if initial is not None and initial>0 else None,ingenuo=st.mean(past) if past else None,**{k:v['valor'] for k,v in sinais(base,iso,t).items()}))
    return rows


def quantile(xs, p):
    xs = sorted(xs)
    if not xs: return None
    pos = (len(xs)-1)*p
    i = int(pos)
    return xs[i]+(xs[min(i+1,len(xs)-1)]-xs[i])*(pos-i)


def rank_groups(xs):
    order = sorted(range(len(xs)), key=xs.__getitem__)
    groups = []
    for i in order:
        if not groups or xs[i] != xs[groups[-1][0]]: groups.append([])
        groups[-1].append(i)
    return groups


def weighted_ranks(groups, weights):
    ranks = [0.0]*len(weights)
    total = 0
    for group in groups:
        n = sum(weights[i] for i in group)
        rank = total+(n+1)/2
        for i in group: ranks[i] = rank
        total += n
    return ranks


def correlation(x, y, weights):
    n = sum(weights)
    if not n: return None
    mx = sum(a*w for a,w in zip(x,weights))/n
    my = sum(a*w for a,w in zip(y,weights))/n
    xx = yy = xy = 0.0
    for a,b,w in zip(x,y,weights):
        dx,dy = a-mx,b-my
        xx += w*dx*dx; yy += w*dy*dy; xy += w*dx*dy
    return xy/math.sqrt(xx*yy) if xx>0 and yy>0 else None


def spearman(x, y):
    w = [1]*len(x)
    return correlation(weighted_ranks(rank_groups(x),w),weighted_ranks(rank_groups(y),w),w)


def fit_convergence(rows):
    rr = [r for r in rows if r['log_pib'] is not None]
    mx,my = st.mean(r['log_pib'] for r in rr),st.mean(r['resultado'] for r in rr)
    slope = sum((r['log_pib']-mx)*(r['resultado']-my) for r in rr)/sum((r['log_pib']-mx)**2 for r in rr)
    return dict(intercepto=my-slope*mx,inclinacao=slope,n=len(rr))


def statistics_for(rows, key, target, seed, replicas=REPLICAS):
    rr = [r for r in rows if r.get(key) is not None and r.get(target) is not None]
    if len(rr)<10: return dict(n=len(rr),paises=len({r['iso'] for r in rr}),spearman=None,ic_spearman=None,diferenca_quintis=None,ic_diferenca=None,quintis=[])
    xs,ys = [r[key] for r in rr],[r[target] for r in rr]
    # Empates não são quebrados por país ou pelo resultado.
    bounds = [quantile(xs,p/5) for p in range(1,5)]
    bins = [sum(x>b for b in bounds) for x in xs]
    cohorts = [[i for i,b in enumerate(bins) if b==q] for q in range(5)]
    means = [st.mean(ys[i] for i in ids) if ids else None for ids in cohorts]
    countries = sorted({r['iso'] for r in rr})
    ci = {c:i for i,c in enumerate(countries)}
    country_ids = [ci[r['iso']] for r in rr]
    gx,gy = rank_groups(xs),rank_groups(ys)
    rng = random.Random(seed)
    boots_r,boots_d = [],[]
    # Quintis são definidos na amostra do período; o IC é condicional a esses limites.
    low = [(sum(ys[i] for i in cohorts[0] if country_ids[i]==c),sum(country_ids[i]==c for i in cohorts[0])) for c in range(len(countries))]
    high = [(sum(ys[i] for i in cohorts[4] if country_ids[i]==c),sum(country_ids[i]==c for i in cohorts[4])) for c in range(len(countries))]
    for _ in range(replicas):
        counts = [0]*len(countries)
        for __ in countries: counts[rng.randrange(len(countries))] += 1
        weights = [counts[c] for c in country_ids]
        rho = correlation(weighted_ranks(gx,weights),weighted_ranks(gy,weights),weights)
        if rho is not None: boots_r.append(rho)
        ln = sum(n*w for (_,n),w in zip(low,counts)); hn = sum(n*w for (_,n),w in zip(high,counts))
        if ln and hn:
            boots_d.append(sum(s*w for (s,_),w in zip(high,counts))/hn-sum(s*w for (s,_),w in zip(low,counts))/ln)
    return dict(n=len(rr),paises=len(countries),spearman=spearman(xs,ys),ic_spearman=[quantile(boots_r,.025),quantile(boots_r,.975)],diferenca_quintis=means[4]-means[0] if means[4] is not None and means[0] is not None else None,ic_diferenca=[quantile(boots_d,.025),quantile(boots_d,.975)],quintis=[dict(quintil=q+1,n=len(ids),media=means[q]) for q,ids in enumerate(cohorts)],limites_quintis=bounds)


def classification(rows, key, cut, median):
    rr = [r for r in rows if r.get(key) is not None]
    if not rr: return dict(n=0,acerto=None,acerto_balanceado=None,diferenca=None,base_maioria=None)
    good = [r['resultado'] for r in rr if r[key]>cut]
    bad = [r['resultado'] for r in rr if r[key]<=cut]
    positive = [r for r in rr if r['resultado']>median]
    negative = [r for r in rr if r['resultado']<=median]
    tpr = sum(r[key]>cut for r in positive)/len(positive) if positive else 0
    tnr = sum(r[key]<=cut for r in negative)/len(negative) if negative else 0
    return dict(n=len(rr),acerto=sum((r[key]>cut)==(r['resultado']>median) for r in rr)/len(rr),acerto_balanceado=(tpr+tnr)/2,diferenca=st.mean(good)-st.mean(bad) if good and bad else None,base_maioria=max(len(positive),len(negative))/len(rr))


def find_cut(train, key, median):
    xs = [r[key] for r in train if r[key] is not None]
    # Direção fixada antes do teste. Nunca inverte uma regra para salvá-la.
    candidates = [(classification(train,key,quantile(xs,p/100),median)['acerto_balanceado'],p) for p in range(20,81,5)]
    _,p = max(candidates,key=lambda v:(v[0],-abs(v[1]-50),-v[1]))
    return dict(corte=quantile(xs,p/100),neutro_min=quantile(xs,(p-5)/100),neutro_max=quantile(xs,(p+5)/100),percentil=p)


def grade(x, cut):
    return None if x is None else 1 if x>cut['neutro_max'] else -1 if x<cut['neutro_min'] else 0


def score(signals, cuts):
    points = {k:grade(signals[k],cuts[k]) for k in IDS}
    available = sum(v is not None for v in points.values())
    return (sum(v for v in points.values() if v is not None) if available>=5 else None),points


def band(score_value):
    return None if score_value is None else 0 if score_value<=-3 else 1 if score_value<=0 else 2 if score_value<=3 else 3


def composite(rows, median):
    rr = [r for r in rows if r['nota'] is not None and r['ingenuo'] is not None]
    a = classification(rr,'nota',0,median)
    naive = classification(rr,'ingenuo',median,median)
    return dict(n=len(rr),nota=a,ingenuo=naive,faixas=[dict(faixa=label,n=len(group),media=st.mean(r['resultado'] for r in group) if group else None) for i,label in enumerate(['−7 a −3','−2 a 0','1 a 3','4 a 7']) for group in [[r for r in rows if band(r['nota'])==i]]])


def confirmation(outside, raw, adjusted):
    sustained = (outside['acerto_balanceado'] is not None and outside['acerto_balanceado']>.5
                 and outside['diferenca'] is not None and outside['diferenca']>0)
    confirmed = sustained and all(s[k] and s[k][0] is not None and s[k][0]>0
                                 for s in [raw,adjusted] for k in ['ic_spearman','ic_diferenca'])
    return sustained, bool(confirmed)


def prepare(rows):
    train = [r for r in rows if r['ano']<=2005]
    test = [r for r in rows if r['ano']>=2006]
    median = st.median(r['resultado'] for r in train)
    convergence = fit_convergence(train)
    for r in rows:
        r['residuo'] = r['resultado']-convergence['intercepto']-convergence['inclinacao']*r['log_pib'] if r['log_pib'] is not None else None
    cuts = {key:find_cut(train,key,median) for key in IDS}
    return train,test,median,convergence,cuts


def robustness(base, replicas):
    variants = []
    for variant,name in [('per_capita','PIB per capita (v9)'),('renda_media','PIB total, renda média'),('aceleracao','Aceleração do PIB total')]:
        train,test,median,convergence,cuts = prepare(painel(base,variant))
        rules = []
        for j,key in enumerate(IDS):
            # Mesma semente da validação principal e da v9 para comparação.
            raw = statistics_for(test,key,'resultado',SEED+j*100+2,replicas)
            adjusted = statistics_for(test,key,'residuo',SEED+j*100+2,replicas)
            outside = classification(test,key,cuts[key]['corte'],median)
            _,confirmed = confirmation(outside,raw,adjusted)
            rules.append(dict(id=key,n=raw['n'],paises=raw['paises'],spearman=raw['spearman'],
                              ic_spearman=raw['ic_spearman'],confirmada=confirmed,
                              corte=cuts[key]['corte'],acerto_balanceado=outside['acerto_balanceado'],
                              diferenca=outside['diferenca'],ic_diferenca=raw['ic_diferenca'],
                              ic_spearman_residuo=adjusted['ic_spearman'],ic_diferenca_residuo=adjusted['ic_diferenca']))
        variants.append(dict(id=variant,nome=name,mediana_treino=median,regressao_convergencia=convergence,
                             confirmadas=sum(r['confirmada'] for r in rules),regras=rules))
        print('robustez',variant,'concluída',flush=True)
    return variants


def fit_incremental(rows, weights=None):
    """OLS com intercepto: resultado ~ nota + ingenuo; None se singular."""
    weights = [1]*len(rows) if weights is None else weights
    n = sum(weights)
    if not n: return None
    means = [sum(r[k]*w for r,w in zip(rows,weights))/n for k in ['nota','ingenuo','resultado']]
    xx = zz = xz = xy = zy = 0.0
    for r,w in zip(rows,weights):
        x,z,y = [r[k]-m for k,m in zip(['nota','ingenuo','resultado'],means)]
        xx += w*x*x; zz += w*z*z; xz += w*x*z; xy += w*x*y; zy += w*z*y
    det = xx*zz-xz*xz
    if xx<=0 or zz<=0 or det<=1e-12*xx*zz: return None
    beta = (xy*zz-zy*xz)/det
    past = (zy*xx-xy*xz)/det
    return dict(intercepto=means[2]-beta*means[0]-past*means[1],coeficiente_nota=beta,coeficiente_passado=past)


def incremental(rows, replicas=REPLICAS, seed=SEED+1000):
    rr = [r for r in rows if all(r.get(k) is not None for k in ['nota','ingenuo','resultado'])]
    countries = sorted({r['iso'] for r in rr})
    ids = {c:i for i,c in enumerate(countries)}
    rng = random.Random(seed)
    boots = []
    for _ in range(replicas):
        counts = [0]*len(countries)
        for __ in countries: counts[rng.randrange(len(countries))] += 1
        fit = fit_incremental(rr,[counts[ids[r['iso']]] for r in rr])
        if fit is not None: boots.append(fit['coeficiente_nota'])
    fit = fit_incremental(rr)
    ci = [quantile(boots,.025),quantile(boots,.975)]
    return dict(n=len(rr),paises=len(countries),**(fit or dict(intercepto=None,coeficiente_nota=None,coeficiente_passado=None)),
                ic_coeficiente_nota=ci,replicas_validas=len(boots),semente=seed,
                acrescenta_positivo=bool(ci[0] is not None and ci[0]>0))


def rounded(obj):
    if isinstance(obj,float): return round(obj,6) if math.isfinite(obj) else None
    if isinstance(obj,dict): return {k:rounded(v) for k,v in obj.items()}
    if isinstance(obj,list): return [rounded(v) for v in obj]
    return obj


def build(base, replicas=REPLICAS):
    rows = painel(base)
    train,test,median,convergence,cuts = prepare(rows)
    periods = [('total',rows),('treino',train),('fora_amostra',test)]+[(str(y),[r for r in rows if y<=r['ano']<y+10]) for y in [1990,2000,2010,2020]]
    rules = []
    for j,rule in enumerate(RULES):
        key = rule['id']
        stats = {}
        for i,(name,rr) in enumerate(periods):
            stats[name] = statistics_for(rr,key,'resultado',SEED+j*100+i,replicas)
            stats[name]['convergencia'] = statistics_for(rr,key,'residuo',SEED+j*100+i,replicas)
        inside,outside = classification(train,key,cuts[key]['corte'],median),classification(test,key,cuts[key]['corte'],median)
        oos = stats['fora_amostra']
        # Critério explícito, exigente e fixo; sem selecionar pelo arredondamento.
        sustained,confirmed = confirmation(outside,oos,oos['convergencia'])
        rules.append(dict(**rule,nivel=nivel_relacao(oos),cortes=cuts[key],estatisticas=stats,teste_corte=dict(treino=inside,fora_amostra=outside,sustentou=sustained),confirmada=confirmed,conclusao='Associação positiva fora da amostra, inclusive após controle de convergência.' if confirmed else 'Esta regra não se confirmou nos dados.'))
        print(key, 'concluída', flush=True)
    for r in rows:
        r['nota'],points = score(r,cuts)
        r['disponiveis'] = sum(v is not None for v in points.values())
        r.update({'ponto_'+k:v for k,v in points.items()})
    composites = dict(treino=composite(train,median),fora_amostra=composite(test,median),desde_2011=composite([r for r in test if r['ano']>=2011],median))
    composites['fora_amostra']['regressao_incremental'] = incremental(test,replicas)
    composites['desde_2011']['regressao_incremental'] = incremental([r for r in test if r['ano']>=2011],replicas,SEED+1001)
    variants = robustness(base,replicas)
    current = []
    for iso,name,slug in CURRENT:
        candidates = []
        for year in [2025,2024]:
            ss = sinais(base,iso,year)
            nota,pts = score({k:v['valor'] for k,v in ss.items()},cuts)
            pop = value(base,POP,iso,year)
            if pop is None or pop<1_000_000: nota=None
            candidates.append((year,ss,nota,pts))
        # Ano mais recente com nota válida; se nenhum, mantém 2024 e explicita a falta.
        year,ss,nota,pts = next((c for c in candidates if c[2] is not None),candidates[-1])
        for key in IDS: ss[key].update(ponto=pts[key],cortes=cuts[key])
        b = band(nota)
        current.append(dict(iso=iso,nome=name,slug=slug,ano=year,nota=nota,crescimento_recente=crescimento_recente(base,iso,year),disponiveis=sum(p is not None for p in pts.values()),sinais=ss,faixa=composites['treino']['faixas'][b]['faixa'] if b is not None else None,previsao_faixa=composites['treino']['faixas'][b]['media'] if b is not None else None,observado_validacao=composites['fora_amostra']['faixas'][b]['media'] if b is not None else None))
    history=[]
    for year in range(1990,max(c['ano'] for c in current if c['iso']=='BRA')+1):
        ss=sinais(base,'BRA',year)
        nota,pts=score({k:v['valor'] for k,v in ss.items()},cuts)
        history.append(dict(ano=year,nota=nota,disponiveis=sum(p is not None for p in pts.values()),crescimento=resultado(base,'BRA',year),amostra='treino' if year<=2005 else 'validação' if year<=2020 else 'sem horizonte completo'))
    confirmed_count = sum(r['confirmada'] for r in rules)
    change = (f'Mudança de especificação: a primeira versão usava PIB per capita e confirmou {variants[0]["confirmadas"]} de 7 regras. '
              f'Trocamos para PIB real total, a medida de crescimento do livro, e confirmamos {confirmed_count} de 7. '
              'A troca foi feita depois de ver o primeiro resultado; por isso os dois aparecem. '
              'O crescimento per capita incorpora o denominador populacional, o que pode penalizar mecanicamente a regra Gente importa.')
    result = dict(versao='9c',metodo=dict(
        indicador_resultado=GROWTH,mudanca_especificacao=change,
        fonte=base['fonte'],baixado_em=base['baixado_em'],sha256_wdi=hashlib.sha256(json.dumps(base,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest(),
        fontes=[dict(titulo='Banco Mundial: World Development Indicators',url='https://databank.worldbank.org/source/world-development-indicators'),dict(titulo='Ruchir Sharma, The Rise and Fall of Nations (2016)',url=None),dict(titulo='Trading Terminology: resumo das dez regras',url='https://tradingterminology.blogspot.com/2016/12/rise-and-fall-of-nations-by-ruchir.html'),dict(titulo='Prospect: How poor nations become rich',url='https://www.prospectmagazine.co.uk/culture/42934/how-poor-nations-become-rich')],
        periodo_dados='1980 a 2025 (cobertura variável)',anos_base=[1990,2020],treino=[1990,2005],validacao=[2006,2020],n=len(rows),paises=len({r['iso'] for r in rows}),economias_base=len(base['paises']),mediana_treino=median,regressao_convergencia=convergence,bootstrap=dict(replicas=replicas,semente=SEED,unidade='país',ic='percentil de 95%'),
        decisoes=[
            'Níveis v9c, regra pré-declarada e aplicada às sete regras na validação principal (PIB total, 2006 a 2020): Relação clara exige IC 95% de Spearman acima de zero no bruto e após convergência; Relação contrária exige ambos abaixo de zero; Sem relação clara reúne o restante. O critério estrito de confirmação permanece separado e inalterado.',
            'Crescimento recente na tabela atual: média das cinco taxas anuais do PIB total em t−4 a t, no mesmo ano-base da nota; exige cinco valores WDI, sem imputação. As referências de faixa ficam apenas no método e no JSON para auditoria.',
            'Resultado principal: média aritmética das cinco taxas anuais de crescimento real do PIB total (NY.GDP.MKTP.KD.ZG), t+1 a t+5. Não é crescimento acumulado nem aceleração em relação ao passado.',
            'Robustez: PIB per capita (NY.GDP.PCAP.KD.ZG, especificação v9); PIB total só em Lower middle income e Upper middle income; aceleração do PIB total, média t+1 a t+5 menos t−4 a t. Cada variante refaz mediana, cortes e convergência só no seu treino, com o mesmo critério completo na validação. Renda é a classificação estática do download WDI, não a histórica de cada ano.',
            'Regressão incremental: OLS com intercepto do crescimento futuro na nota e no crescimento passado juntos, estimada na validação 2006 a 2020 e na checagem 2011 a 2020. Nota e cortes vêm do treino. Coeficiente em p.p. anuais por ponto da nota, mantendo o passado constante. Bootstrap refaz OLS por país; IC condicional aos cortes. Diagnóstico de associação na amostra reservada, não previsão ajustada no treino nem evidência causal. Acréscimo positivo exige limite inferior do IC >0.',
            'Excluídos país-anos com menos de 1 milhão de habitantes de 15 a 64 anos ou qualquer uma das cinco taxas futuras ausente. Sem interpolação. Médias exigem todos os cinco anos; variações usam os dois extremos.',
            'Todos os sinais crescem na direção considerada boa. As fórmulas, pesos e limites são nossos. Prospect menciona 2% ao ano como bônus demográfico; esse valor não foi imposto ao corte.',
            'Cortes candidatos: percentis de 20 a 80, passo 5, só no treino. Maximiza acerto balanceado da classe acima da mediana do crescimento do treino. Empates favorecem o percentil mais próximo de 50, depois o menor.',
            'Nota: +1 acima do percentil do corte +5, −1 abaixo do percentil do corte −5, 0 no intervalo fechado. Soma sem reponderação, mínimo 5 de 7 sinais. Ausência não equivale a zero. A direção nunca é invertida para salvar uma regra.',
            'Confirmação exige corte com acerto balanceado >50% e diferença positiva na validação, mais limites inferiores dos ICs de Spearman e da diferença entre quintis >0, no resultado bruto e no resíduo. Critério exploratório, sem correção por testes múltiplos.',
            'Convergência: OLS do crescimento no log do PIB per capita inicial, estimada só no treino e congelada para todos os períodos. Bootstrap do resíduo é condicional a essa regressão, sem reestimá-la.',
            'Bootstrap: reamostra países com reposição, preservando todos os seus anos e recalculando postos com empates médios em cada réplica. Os quintis ficam fixos dentro de cada período; seu IC é condicional aos limites. Cada país-ano pesa igualmente na estimativa pontual.',
            'Composta: nota >0 prevê crescimento acima da mediana do treino. Modelo ingênuo prevê a média dos 5 anos anteriores. Acertos comparados na mesma amostra, com resultado acima da mesma mediana congelada. Faixas incluem todas as notas válidas; previsões atuais usam apenas a média da faixa no treino.',
            'Aplicação: 2025 se houver ao menos cinco sinais e população elegível, senão 2024. Não mistura anos de indicadores na nota. Componentes auxiliares ausentes não invalidam o sinal principal. Valores e cortes publicados com seis casas; cálculo usa precisão integral.'
        ],limitacoes=[
            'O livro não está disponível. Os nomes e direções vêm das fontes abertas indicadas na tarefa, sem nova consulta de rede. Os limites numéricos e proxies não são atribuídos ao autor.',
            'Treino 1990 a 2005 usa resultados até 2010; validação 2006 a 2020 tem janelas sobrepostas no começo. A checagem desde 2011 elimina essa sobreposição de resultados. Não é simulação de previsões publicadas em tempo real.',
            'Dados baixados hoje incluem revisões e podem incluir estimativas. Ausência de dados futuros no sinal não elimina revisão histórica nem defasagem de divulgação. Não dispomos de vintages.',
            'Os 45 anos são a amplitude das séries, não 45 anos independentes de previsão. Anos-base vão de 1990 a 2020; a década de 2020 contém apenas o ano-base 2020.',
            'Janelas se sobrepõem e países sofrem choques globais. O bootstrap por país preserva dependência temporal interna, mas não corrige dependência entre países. Sete regras e vários períodos elevam o risco de achados ocasionais.',
            'Conta corrente não mede diretamente moeda barata; câmbio real só contextualiza apreciação no próprio país. A regra da dívida é parcial. Abertura não mede toda a geografia. Setor público e composição do investimento exigiriam dados melhores.',
            'Cobertura varia por regra, período e país; exclusões podem enviesar resultados. Notas com 5 e 7 sinais não têm a mesma informação. Brasil no passado usa cortes estimados no treino, não cortes conhecidos naquele momento.',
            'Média histórica da faixa é uma referência experimental, não previsão calibrada do país nem promessa de renda. Correlação não é causalidade; crescimento nacional não substitui visto, impostos, segurança, custos ou mercado do negócio.'
        ],fora_da_nota=[dict(numero=2,nome='Ciclo político',motivo='Mudança política e qualidade de reformas exigem avaliação qualitativa, ausente no WDI usado.'),dict(numero=3,nome='Bilionários bons e ruins',motivo='Sem dado oficial comparável sobre origem e concentração da riqueza nesta base.'),dict(numero=10,nome='Termômetro da euforia',motivo='Cobertura de mídia e entusiasmo coletivo não são medidos nesta base.')]),regras=rules,confirmadas=confirmed_count,robustez=variants,composta=composites,atual=current,brasil=history)
    return rounded(result),rows


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--saida',type=Path,default=ROOT/'data/regras-sharma.json')
    parser.add_argument('--painel',type=Path,default=ROOT/'data/bruto/painel-sharma.csv')
    args=parser.parse_args()
    base=json.loads((ROOT/'data/bruto/wdi.json').read_text())
    result,rows=build(base)
    text=json.dumps(result,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n'
    assert len(text.encode())<90_000, 'JSON acima do orçamento de 90 KB'
    args.saida.write_text(text,encoding='utf-8')
    with args.painel.open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]))
        writer.writeheader();writer.writerows(rows)
    print(f'{len(rows)} observações; {result["confirmadas"]}/7 confirmadas; JSON {len(text.encode())} bytes',flush=True)


if __name__=='__main__':
    main()
