// Sem navegador, dependências npm ou rede. Testa Python real, dados e rota real.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync,mkdtempSync,rmSync}=require('node:fs');
const {spawnSync}=require('node:child_process');
const {createContext,runInContext}=require('node:vm');
const {tmpdir}=require('node:os');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const json=readFileSync(path.join(root,'data/regras-sharma.json'),'utf8');
const data=JSON.parse(json);
const html=readFileSync(path.join(root,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function source(name){
 const start=script.indexOf('  function '+name+'(');assert.ok(start>=0,name);
 const line=script.indexOf('\n',start),end=script.indexOf('\n  }',start)+4;
 return script.slice(start,script.slice(start,line).trimEnd().endsWith('}')?line:end);
}
function python(code){
 const p=spawnSync('python3',['-B','-c',code],{cwd:root,encoding:'utf8'});
 assert.equal(p.status,0,p.stdout+'\n'+p.stderr);return p.stdout;
}
const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',hidden:false,querySelector:()=>({setAttribute(){},focus(){}})});return nodes.get(id);}
const ctx=createContext({el:node,sharmaData:data});
for(const name of ['esc','longDates','dateText','sharmaNumber','sharmaPoint','sharmaRange','sharmaCountryLine','sharmaQuintiles','sharmaHistoryChart','sharmaUnit','sharmaPlain','sharmaMeasured','sharmaCountryValue','sharmaRuleNumbers','sharmaRuleMarkup','renderSharma'])runInContext(source(name),ctx);

test('Sete regras, validação, convergência, décadas e bootstrap presentes, JSON <90 KB',()=>{
 assert.ok(Buffer.byteLength(json)<90000);
 assert.deepEqual(data.regras.map(r=>r.numero),[1,4,5,6,7,8,9]);
 assert.equal(data.metodo.bootstrap.replicas,1000);
 for(const r of data.regras){
  for(const key of ['total','treino','fora_amostra','1990','2000','2010','2020']){
   const s=r.estatisticas[key];assert.ok(s.n>0&&s.paises>0);
   for(const v of [s,s.convergencia]){
    assert.ok(v.spearman>=-1&&v.spearman<=1);
    assert.equal(v.quintis.length,5);
    assert.equal(v.quintis.reduce((n,q)=>n+q.n,0),v.n);
    for(const ci of [v.ic_spearman,v.ic_diferenca])assert.ok(ci.length===2&&ci[0]<=ci[1]);
   }
  }
  assert.ok(r.cortes.neutro_min<=r.cortes.corte&&r.cortes.corte<=r.cortes.neutro_max);
  if(!r.confirmada)assert.equal(r.conclusao,'Esta regra não se confirmou nos dados.');
 }
 assert.equal(data.confirmadas,data.regras.filter(r=>r.confirmada).length);
});

test('País sintético: todos os sinais e componentes ignoram qualquer dado posterior ao ano-base',()=>{
 python(`import copy, math
from tools.regras_sharma import sinais, resultado, painel, POP, GDP, GROWTH
codes=[POP,GDP,GROWTH,'NE.CON.GOVT.ZS','NE.TRD.GNFS.ZS','NE.GDI.TOTL.ZS','NV.IND.MANF.ZS','FP.CPI.TOTL.ZG','BN.CAB.XOKA.GD.ZS','PX.REX.REER','FS.AST.PRVT.GD.ZS']
b={'paises':{'TST':{}},'dados':{}}
b['dados']={c:{'TST':{str(y):(2_000_000*1.02**(y-1980) if c==POP else 10000 if c==GDP else 10+(y-1980)*.2) for y in range(1980,2031)}} for c in codes}
s=sinais(b,'TST',2000)
assert all(v['valor'] is not None for v in s.values())
assert math.isclose(s['gente']['valor'],2,abs_tol=1e-10)
assert math.isclose(s['estado']['valor'],-1)
assert math.isclose(s['geografia']['valor'],15)
assert math.isclose(s['fabricas']['valor'],1)
assert math.isclose(s['barato']['valor'],13.6)
assert math.isclose(s['divida']['valor'],-1)
changed=copy.deepcopy(b)
for c in codes:
 for y in range(2001,2031): changed['dados'][c]['TST'][str(y)]=999999999
assert sinais(changed,'TST',2000)==s
assert resultado(changed,'TST',2000)!=resultado(b,'TST',2000)
# Até uma série que lança erro ao tentar ler o futuro funciona.
class NoFuture(dict):
 def get(self,key,default=None):
  assert int(key)<=2000,key
  return super().get(key,default)
for c in codes: changed['dados'][c]['TST']=NoFuture(changed['dados'][c]['TST'])
assert sinais(changed,'TST',2000)==s
# Sem preencher lacunas: média exige cinco valores; variação exige extremos.
missing=copy.deepcopy(b);del missing['dados']['FP.CPI.TOTL.ZG']['TST']['1997']
assert sinais(missing,'TST',2000)['cebola']['valor'] is None
missing=copy.deepcopy(b);del missing['dados'][GROWTH]['TST']['2003']
assert resultado(missing,'TST',2000) is None
assert not any(r['ano']==2000 for r in painel(missing))
small=copy.deepcopy(b);small['dados'][POP]['TST']['2000']=999999
assert not any(r['ano']==2000 for r in painel(small))
# Deflação recebe penalização mesmo se estável.
for y in range(1996,2001): b['dados']['FP.CPI.TOTL.ZG']['TST'][str(y)]=-2
assert sinais(b,'TST',2000)['cebola']['valor']==-4
`);
});

test('Postos com empates e multiplicidades equivalem a repetir países; OLS e cortes conhecidos',()=>{
 python(`import math
from tools.regras_sharma import rank_groups,weighted_ranks,correlation,spearman,fit_convergence,find_cut,grade,score,IDS,statistics_for
x=[1,1,3,4]; y=[4,2,2,1]; w=[2,1,0,3]
assert weighted_ranks(rank_groups(x),[1]*4)==[1.5,1.5,3,4]
xx=[a for a,n in zip(x,w) for _ in range(n)];yy=[a for a,n in zip(y,w) for _ in range(n)]
a=correlation(weighted_ranks(rank_groups(x),w),weighted_ranks(rank_groups(y),w),w)
assert math.isclose(a,spearman(xx,yy))
assert math.isclose(spearman([1,2,3],[3,2,1]),-1)
rr=[dict(iso=str(i//2),log_pib=i,resultado=5-2*i,gente=i) for i in range(20)]
fit=fit_convergence(rr);assert fit['intercepto']==5 and fit['inclinacao']==-2
rr=[dict(r,resultado=r['gente']) for r in rr]
c=find_cut(rr,'gente',9.5);assert c['corte']==9.5
assert grade(c['neutro_min'],c)==0 and grade(c['neutro_max'],c)==0
assert grade(None,c) is None
cuts={k:c for k in IDS};vals={k:20 for k in IDS}
assert score(vals,cuts)[0]==7
for k in IDS[:3]: vals[k]=None
assert score(vals,cuts)[0] is None
stats=statistics_for(rr,'gente','resultado',2016,100)
assert stats==statistics_for(rr,'gente','resultado',2016,100)
assert stats['spearman']==1 and stats['ic_spearman']==[1,1]
`);
});

test('Treino e corte não mudam com resultados de 2011 em diante; painel auditável e acertos conferem',()=>{
 python(`import json,csv,math,copy,statistics
from tools.regras_sharma import painel,find_cut,fit_convergence,classification,POP,GROWTH
b=json.load(open('data/bruto/wdi.json'));d=json.load(open('data/regras-sharma.json'))
rr=painel(b);train=[r for r in rr if r['ano']<=2005]
med=statistics.median(r['resultado'] for r in train)
for r in d['regras']:
 cut=find_cut(train,r['id'],med)
 assert abs(cut['corte']-r['cortes']['corte'])<.000001
# O treino termina em 2010 nos resultados, não em 2005.
changed=copy.deepcopy(b)
for series in changed['dados'][GROWTH].values():
 for year in list(series):
  if int(year)>=2011: series[year]=999
newtrain=[r for r in painel(changed) if r['ano']<=2005]
assert train==newtrain
assert fit_convergence(train)==fit_convergence(newtrain)
csvrows=list(csv.DictReader(open('data/bruto/painel-sharma.csv')))
assert len(csvrows)==len(rr)==d['metodo']['n']
for row in csvrows:
 assert 1990<=int(row['ano'])<=2020
 assert b['dados'][POP][row['iso']][row['ano']]>=1000000
 pts=[int(row['ponto_'+r['id']]) for r in d['regras'] if row['ponto_'+r['id']]!='']
 assert len(pts)==int(row['disponiveis'])
 assert (int(row['nota'])==sum(pts)) if len(pts)>=5 else row['nota']==''
test=[r for r in csvrows if int(r['ano'])>=2006 and r['nota']!='' and r['ingenuo']!='']
assert len(test)==d['composta']['fora_amostra']['n']
actual=sum((float(r['nota'])>0)==(float(r['resultado'])>med) for r in test)/len(test)
naive=sum((float(r['ingenuo'])>med)==(float(r['resultado'])>med) for r in test)/len(test)
assert abs(actual-d['composta']['fora_amostra']['nota']['acerto'])<.000001
assert abs(naive-d['composta']['fora_amostra']['ingenuo']['acerto'])<.000001
`);
});

test('Brasil soma os sinais; ausências não viram zero nem previsão; referências vêm do treino',()=>{
 assert.equal(data.atual.length,12);
 for(const c of data.atual){
  const vals=Object.values(c.sinais).map(s=>s.ponto).filter(v=>v!=null);
  assert.equal(c.disponiveis,vals.length);
  assert.equal(c.nota,vals.length>=5?vals.reduce((a,b)=>a+b,0):null);
  if(c.nota!=null){const f=data.composta.treino.faixas.find(f=>f.faixa===c.faixa);assert.equal(c.previsao_faixa,f.media);}
  else assert.equal(c.previsao_faixa,null);
  assert.ok([2024,2025].includes(c.ano));
 }
 const br=data.atual.find(c=>c.iso==='BRA');
 assert.equal(br.nota,data.brasil.find(r=>r.ano===br.ano).nota);
 assert.equal(data.brasil[0].ano,1990);
 assert.ok(data.brasil.filter(r=>r.ano>2020).every(r=>r.crescimento===null));
});

test('Rota real #ascensao renderiza tabelas e oito SVGs com texto; menu e dossiês ligados',()=>{
 const views=Array.from(html.matchAll(/<section class="view(?: on)?" id="v-([^"]+)" data-route="([^"]+)"/g),m=>({getAttribute:()=>m[2],classList:{toggle(k,v){this.on=v;}},route:m[2]}));
 Object.assign(ctx,{location:{hash:'#ascensao'},document:{querySelectorAll:s=>s==='section.view'?views:[],title:''},articles:[],study:{normas:[]},countries:[],caseData:{setores:[]},caseRecords:()=>[],closeNavigation(){},updateTopButton(){},first:true});
 runInContext(script.match(/  var routes = .*;/)[0],ctx);runInContext(source('route'),ctx);ctx.route();
 assert.equal(views.find(v=>v.classList.on).route,'ascensao');
 assert.match(ctx.document.title,/Ascensão e queda/);
 const markup=node('sharmaReport').innerHTML;
 assert.ok(markup.includes('Testamos '+data.regras.length+' das 10 regras do livro em '+data.metodo.paises+' países')); 
 assert.equal((markup.match(/<svg /g)||[]).length,8);
 for(const t of ['+1 Bom','0 Neutro','−1 Ruim','? Ausente','sharma-brazil','Método e limites','modelo ingênuo','Correlação não é causalidade','Mudança de especificação','Robustez: três variantes','coeficiente da nota','PIB total'])assert.ok(markup.includes(t),t);
 assert.doesNotMatch(markup,/NaN|undefined|Infinity|sem dado%|—/);
 assert.match(html,/<a href="#destinos">Destinos<\/a>\s*<a href="#ascensao">/);
 for(const c of data.atual.filter(c=>c.slug))assert.match(ctx.sharmaCountryLine(c.slug),/href="#ascensao"/);
 assert.match(source('renderCountry'),/sharmaCountryLine\(c.slug\)/);
 const p=spawnSync('python3',['-B','-c',"import sys;sys.path.insert(0,'tests');from validate_html import Validator;v=Validator('ascensao');v.feed(sys.stdin.read());v.finish()"],{cwd:root,input:markup,encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);
});

test('Embed idêntico à base, sem travessão; tabelas limitam rolagem à própria região',()=>{
 const embedded=JSON.parse(script.match(/  var sharmaData = (.*);/)[1]);assert.deepEqual(embedded,data);
 assert.doesNotMatch(json+source('renderSharma')+source('sharmaRuleMarkup'),/—/);
 assert.match(html,/\.sharma-scroll\s*\{[^}]*max-width:100%[^}]*overflow-x:auto/);
 assert.match(html,/@media\(max-width:800px\)[^{]*\{\s*\.sharma-rule\s*\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
});

test('Execução integral determinística: 1.000 réplicas reproduzem JSON e CSV byte a byte', {timeout:900000},()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'sharma-v9-'));
 try {
  const p=spawnSync('python3',['-B','tools/regras_sharma.py','--saida',path.join(temp,'resultado.json'),'--painel',path.join(temp,'painel.csv')],{cwd:root,encoding:'utf8',timeout:890000});
  assert.equal(p.status,0,p.stdout+'\n'+p.stderr);
  assert.equal(readFileSync(path.join(temp,'resultado.json'),'utf8'),json);
  assert.equal(readFileSync(path.join(temp,'painel.csv'),'utf8'),readFileSync(path.join(root,'data/bruto/painel-sharma.csv'),'utf8'));
 } finally {rmSync(temp,{recursive:true,force:true});}
});

test('v9b: resultado principal e ingênuo usam PIB total; robustez tem exatamente três variantes auditáveis',()=>{
 assert.equal(data.metodo.indicador_resultado,'NY.GDP.MKTP.KD.ZG');
 assert.deepEqual(data.robustez.map(v=>v.id),['per_capita','renda_media','aceleracao']);
 assert.ok(data.metodo.mudanca_especificacao.includes(data.robustez[0].confirmadas+' de 7'));
 assert.ok(data.metodo.mudanca_especificacao.includes(data.confirmadas+' de 7'));
 for(const v of data.robustez){
  assert.deepEqual(v.regras.map(r=>r.id),data.regras.map(r=>r.id));
  assert.equal(v.confirmadas,v.regras.filter(r=>r.confirmada).length);
  for(const r of v.regras){
   assert.equal(r.confirmada,r.acerto_balanceado>.5&&r.diferenca>0&&[r.ic_spearman,r.ic_diferenca,r.ic_spearman_residuo,r.ic_diferenca_residuo].every(ci=>ci[0]>0));
  }
 }
 python(`import json,math,statistics as st,copy
from tools.regras_sharma import GROWTH,PER_CAPITA,GDP,POP,resultado,painel,prepare,spearman,classification,MIDDLE_INCOME
assert GROWTH=='NY.GDP.MKTP.KD.ZG' and GDP=='NY.GDP.PCAP.KD'
b=json.load(open('data/bruto/wdi.json'));d=json.load(open('data/regras-sharma.json'))
for r in painel(b):
 iso,t=r['iso'],r['ano']
 expected=st.mean(b['dados'][GROWTH][iso][str(y)] for y in range(t+1,t+6))
 assert r['resultado']==expected
 past=[b['dados'][GROWTH][iso].get(str(y)) for y in range(t-4,t+1)]
 assert r['ingenuo']==(st.mean(past) if all(x is not None for x in past) else None)
assert resultado(b,'BRA',2006)!=resultado(b,'BRA',2006,PER_CAPITA)
for v in d['robustez']:
 rows=painel(b,v['id']);train,test,median,conv,cuts=prepare(rows)
 assert abs(median-v['mediana_treino'])<1e-6
 for k in ['intercepto','inclinacao']: assert abs(conv[k]-v['regressao_convergencia'][k])<1e-6
 for r in rows:
  iso,t=r['iso'],r['ano']
  if v['id']=='renda_media': assert b['paises'][iso]['renda'] in MIDDLE_INCOME
  if v['id']=='per_capita': assert r['resultado']==resultado(b,iso,t,PER_CAPITA)
  if v['id']=='aceleracao': assert r['resultado']==resultado(b,iso,t)-r['ingenuo']
 for s in v['regras']:
  rr=[r for r in test if r[s['id']] is not None]
  assert len(rr)==s['n']
  assert abs(spearman([r[s['id']] for r in rr],[r['resultado'] for r in rr])-s['spearman'])<1e-6
  assert abs(cuts[s['id']]['corte']-s['corte'])<1e-6
  c=classification(test,s['id'],cuts[s['id']]['corte'],median)
  assert abs(c['acerto_balanceado']-s['acerto_balanceado'])<1e-6
 changed=copy.deepcopy(b)
 for code in [GROWTH,PER_CAPITA]:
  for series in changed['dados'][code].values():
   for year in list(series):
    if int(year)>=2011: series[year]=999
 newtrain,_,newmed,newconv,newcuts=prepare(painel(changed,v['id']))
 assert train==newtrain and median==newmed and conv==newconv and cuts==newcuts
# Janelas da aceleração exigem todos os cinco valores passados.
missing=copy.deepcopy(b);del missing['dados'][GROWTH]['BRA']['2004']
assert any(r['iso']=='BRA' and r['ano']==2006 for r in painel(missing))
assert not any(r['iso']=='BRA' and r['ano']==2006 for r in painel(missing,'aceleracao'))
`);
});

test('v9b: regressão da nota controla o passado, reestima por país e usa a amostra reservada',()=>{
 python(`import json,csv,math
from tools.regras_sharma import fit_incremental,incremental
rr=[dict(iso=str(i//4),nota=i%4,ingenuo=i//4,resultado=2+3*(i%4)-.5*(i//4)) for i in range(40)]
f=fit_incremental(rr)
assert math.isclose(f['intercepto'],2) and math.isclose(f['coeficiente_nota'],3) and math.isclose(f['coeficiente_passado'],-.5)
g=incremental(rr,100)
assert all(math.isclose(x,3) for x in g['ic_coeficiente_nota']) and g['acrescenta_positivo']
assert g==incremental(rr,100)
# Ponderar países equivale a repetir todos os seus anos.
w=[1+i//4%3 for i in range(40)]
f=fit_incremental(rr,w);ff=fit_incremental([r for r,n in zip(rr,w) for _ in range(n)])
assert all(math.isclose(f[k],ff[k]) for k in f)
assert fit_incremental([dict(r,ingenuo=r['nota']) for r in rr]) is None
zero=[dict(r,resultado=2-.5*r['ingenuo']) for r in rr]
assert math.isclose(fit_incremental(zero)['coeficiente_nota'],0,abs_tol=1e-12)
d=json.load(open('data/regras-sharma.json'))
rows=list(csv.DictReader(open('data/bruto/painel-sharma.csv')))
for key,start in [('fora_amostra',2006),('desde_2011',2011)]:
 rr=[dict(iso=r['iso'],**{k:float(r[k]) for k in ['nota','ingenuo','resultado']}) for r in rows if int(r['ano'])>=start and r['nota']!='' and r['ingenuo']!='']
 f=fit_incremental(rr);g=d['composta'][key]['regressao_incremental']
 assert g['n']==len(rr)==d['composta'][key]['n']
 assert g['paises']==len({r['iso'] for r in rr})
 for k in f: assert abs(f[k]-g[k])<1e-6
 assert g['replicas_validas']==1000
 assert g['ic_coeficiente_nota'][0]<=g['ic_coeficiente_nota'][1]
 assert g['acrescenta_positivo']==(g['ic_coeficiente_nota'][0]>0)
`);
});

test('v9c: nível segue os dois intervalos de Spearman, sem alterar o critério estrito',()=>{
 for(const r of data.regras){
  const s=r.estatisticas.fora_amostra,cs=[s.ic_spearman,s.convergencia.ic_spearman];
  assert.equal(r.nivel,cs.every(ci=>ci[0]>0)?'Relação clara':cs.every(ci=>ci[1]<0)?'Relação contrária':'Sem relação clara');
  const cut=r.teste_corte.fora_amostra;
  assert.equal(r.confirmada,cut.acerto_balanceado>.5&&cut.diferenca>0&&[s.ic_spearman,s.ic_diferenca,s.convergencia.ic_spearman,s.convergencia.ic_diferenca].every(ci=>ci[0]>0));
 }
 assert.deepEqual(data.regras.filter(r=>r.nivel==='Relação clara').map(r=>r.id),['gente','fabricas']);
 assert.equal(data.regras.filter(r=>r.nivel==='Sem relação clara').length,5);
 python(`from tools.regras_sharma import nivel_relacao
for a,b,expected in [([.1,.2],[.01,.4],'Relação clara'),([-.4,-.1],[-.2,-.01],'Relação contrária'),([0,.2],[.1,.3],'Sem relação clara'),([-.2,0],[-.3,-.1],'Sem relação clara'),([.1,.2],[-.3,-.1],'Sem relação clara'),([-.2,.3],[.1,.4],'Sem relação clara'),([1e-9,.1],[1e-9,.2],'Relação clara'),(None,[.1,.2],'Sem relação clara')]:
 assert nivel_relacao({'ic_spearman':a,'convergencia':{'ic_spearman':b}})==expected
`);
});

test('v9c: crescimento recente vem das cinco taxas WDI até o ano-base, sem preencher lacunas',()=>{
 python(`import json,statistics as st,math
from tools.regras_sharma import crescimento_recente,GROWTH
b=json.load(open('data/bruto/wdi.json'));d=json.load(open('data/regras-sharma.json'))
for c in d['atual']:
 ys=[b['dados'][GROWTH].get(c['iso'],{}).get(str(y)) for y in range(c['ano']-4,c['ano']+1)]
 expected=st.mean(ys) if all(x is not None for x in ys) else None
 assert c['crescimento_recente']==(round(expected,6) if expected is not None else None)
class NoFuture(dict):
 def get(self,key,default=None):
  assert int(key)<=2020
  return super().get(key,default)
s=NoFuture({str(y):y-2015 for y in range(2016,2021)})
b={'dados':{GROWTH:{'TST':s}}}
assert crescimento_recente(b,'TST',2020)==3
s['2018']=None
assert crescimento_recente(b,'TST',2020) is None
`);
});

test('v9c: lede em três frases acompanha números e níveis do JSON',()=>{
 ctx.renderSharma();
 const lede=()=>node('sharmaReport').innerHTML.match(/<p class="lede">([^<]+)<\/p>/)[1];
 assert.equal(lede(),'Testamos 7 das 10 regras do livro em 153 países, de 1990 a 2020. Duas têm relação clara com o crescimento dos cinco anos seguintes: população em idade ativa crescendo e investimento subindo. As outras cinco não mostraram relação útil, e somar as sete prevê pior do que olhar o crescimento recente (60% contra 71% de acerto).');
 const changed=structuredClone(data);
 changed.metodo.paises=99;changed.metodo.anos_base=[1992,2018];
 changed.composta.fora_amostra.nota.acerto=.42;changed.composta.fora_amostra.ingenuo.acerto=.83;
 changed.regras.find(r=>r.id==='fabricas').nivel='Sem relação clara';
 ctx.sharmaData=changed;
 try {
  ctx.renderSharma();
  assert.match(lede(),/99 países, de 1992 a 2018/);
  assert.match(lede(),/Uma tem relação clara/);
  assert.match(lede(),/outras seis/);
  assert.match(lede(),/42% contra 83%/);
  assert.doesNotMatch(lede(),/investimento subindo/);
 } finally {ctx.sharmaData=data;ctx.renderSharma();}
});

test('v9c: termos técnicos só no método final recolhido; sete detalhes preservam os testes',()=>{
 ctx.renderSharma();
 const markup=node('sharmaReport').innerHTML;
 const boundary=markup.indexOf('<details class="sharma-section sharma-method" id="sharmaMethod">');
 assert.ok(boundary>0);
 const outside=markup.slice(0,boundary),method=markup.slice(boundary);
 assert.doesNotMatch(outside,/\b(?:Spearman|ICs?|intervalo de confiança|quintil|quintis|proxy|bootstrap|OLS|resíduo)\b|\bp\.p\./i);
 assert.doesNotMatch(outside,/Mudança de especificação|Robustez: três variantes|NY\.|SP\.POP\.|NE\.|FS\.AST\./);
 for(const text of ['Mudança de especificação','Robustez: três variantes','coeficiente da nota','Corte binário','Acerto balanceado','Critério exploratório'])assert.ok(method.includes(text),text);
 assert.equal((method.match(/<summary>Números do teste<\/summary>/g)||[]).length,7);
 assert.equal((outside.match(/Critério estrito: não passou em todo o critério\./g)||[]).length,7);
 assert.ok(method.endsWith('</details>'));
 assert.match(outside,/A relação foi contrária só sem controle e desapareceu ao descontar a renda inicial/);
 for(const r of data.regras){
  const card=ctx.sharmaRuleMarkup(r),qs=r.estatisticas.fora_amostra.quintis;
  assert.ok(card.includes(ctx.sharmaNumber(qs[4].media)+'% ao ano'));
  assert.ok(card.includes(ctx.sharmaNumber(qs[0].media)+'%.'));
  assert.ok(card.includes('Crescimento anual nos 5 anos seguintes, países agrupados do sinal mais fraco ao mais forte'));
 }
});

test('v9c: tabela prioriza regras claras, troca referência por crescimento recente e tem cartões ≤600 px',()=>{
 ctx.renderSharma();const markup=node('sharmaReport').innerHTML;
 const matrix=markup.match(/<table class="sharma-table sharma-matrix">([\s\S]*?)<\/table>/)[1];
 const header=matrix.split('</thead>')[0];
 const expected=['Gente importa','Fábricas primeiro','Perigos do Estado','Geografia','Preço da cebola','Barato é bom','O beijo da dívida'];
 assert.deepEqual([...header.matchAll(/<th scope="col" class="[^"]+">\d+\. ([^<]+)<\/th>/g)].map(m=>m[1]),expected);
 assert.match(header,/colspan="5" class="sharma-secondary">Sem relação clara nos dados/);
 assert.match(header,/Crescimento médio dos últimos 5 anos \(PIB total\)/);
 assert.doesNotMatch(markup,/Referência da faixa/);
 assert.ok(markup.includes('A nota soma as sete regras. Ela não previu melhor que o crescimento recente.'));
 assert.match(html,/\.sharma-secondary\s*\{\s*color:var\(--muted\)/);
 assert.match(html,/@media\(max-width:600px\)\s*\{\s*\.sharma-desktop\s*\{\s*display:none;\s*\}\s*\.sharma-cards\s*\{\s*display:grid;\s*grid-template-columns:minmax\(0,1fr\)/);
 const cards=[...markup.matchAll(/<article class="sharma-country-card[^"]*">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 assert.equal(cards.length,data.atual.length);assert.match(cards[0],/^<h3>Brasil /);
 for(const [i,c] of data.atual.entries()){
  assert.ok(cards[i].includes(c.nome));
  assert.ok(cards[i].includes(c.crescimento_recente==null?'sem dado':ctx.sharmaNumber(c.crescimento_recente)+'% ao ano'));
  const [visible,other]=cards[i].split('<details');
  for(const id of ['gente','fabricas'])assert.ok(visible.includes(ctx.sharmaNumber(c.sinais[id].valor==null?null:Math.abs(c.sinais[id].valor))));
  assert.match(visible,/Nota:/);assert.match(other,/Sem relação clara nos dados \(5 regras\)/);
  assert.equal((other.match(/<dt>/g)||[]).length,5);
 }
});

test('v9c: botão da regra abre método e detalhe correspondente e leva o foco aos números',()=>{
 ctx.renderSharma();
 let focused=false,scrolled=false;
 node('sharma-test-gente').querySelector=()=>({focus(){focused=true;}});
 node('sharma-test-gente').scrollIntoView=()=>{scrolled=true;};
 node('sharmaReport').onclick({target:{closest:()=>({getAttribute:()=> 'gente'})}});
 assert.equal(node('sharmaMethod').open,true);assert.equal(node('sharma-test-gente').open,true);
 assert.ok(focused&&scrolled);
 node('sharmaReport').onclick({target:{closest:()=>null}});
});
