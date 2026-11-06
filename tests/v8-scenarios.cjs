const base={setor:'textil',industria:'sim',porte:'201a1000',regime:'real',export:'0',folha:'45',energia:'8',regulacao:'nota',familia:'ninguem',presenca:'diretor',cidadania:'nao',dividendos:80000,rend_ext:0,motivo:'imposto',risco:'sim'};
const state=facts=>({version:8,mode:'rapido',facts:{...base,...facts},answers:{}});
// 1. G = .40*(1-1.30/1.80)+.055*(1-41/113)
// = .1111111111111111+.03504424778761062 = .1461553588987217.
// Real: stayTax(80000,.34)=0 (redutor); goTax(80000,0,true)=96000.
// 2. Sem fábrica: G não se aplica. Presumido: 960000*.06=57600;
// saída: 960000*.10=96000; diferença = 38400. Dono fica, alternativa dono_py.
// 3. Espanha: 360000*.28 + 20000*.28 = 106400; Brasil = 0+20000*.15=3000.
// Diferença = 103400. Escola justifica estudar mudança, sem prometer economia.
// 4. G = .60*(1-1.30/1.80)+.11*(1-41/113)
// = .1666666666666667+.07008849557522124=.2367551622418879.
// Nível bruto 2, sanitária reduz a 1. Impostos iguais ao cenário 1.
const scenarios=[
 {name:'Têxtil: fábrica fora, dono fica',state:state({}),gain:.1461553588987217,level:2,top:'maquila',cell:'fora/fica',stay:0,go:96000,rule:'v4',expected:{MERC:-100,TRAB:50,INS:-50,REG:-100,MOB:0,REND:-100,PRIO:-100,RISCO:100}},
 {name:'Serviços: sair custa mais',state:state({setor:'servicos',industria:'nao',regime:'presumido',familia:'casal'}),gain:null,level:null,top:'ficar',second:'dono_py',cell:'fica/fica',stay:57600,go:96000,rule:'v3',expected:{MERC:-100,TRAB:0,INS:0,REG:0,MOB:75,REND:-100,PRIO:-100,RISCO:100}},
 {name:'Tecnologia: escola e cidadania UE',state:state({setor:'tecnologia',industria:'nao',regime:'presumido',export:'30',familia:'filhos',cidadania:'ue',motivo:'escola',dividendos:30000,rend_ext:20000}),gain:null,level:null,top:'vida_europa',cell:'fica/muda',destination:'es',stay:3000,go:106400,rule:'v7',expected:{MERC:0,TRAB:0,INS:0,REG:0,MOB:75,REND:-25,PRIO:100,RISCO:100}},
 {name:'Farmacêutico: ganho alto, regulação reduz nível',state:state({setor:'farma',folha:'60',energia:'15',regulacao:'sanitaria'}),gain:.2367551622418879,level:1,top:'maquila',cell:'fora/fica',stay:0,go:96000,rule:'v2',expected:{MERC:-100,TRAB:100,INS:50,REG:100,MOB:0,REND:-100,PRIO:-100,RISCO:100}}
];
module.exports=scenarios;
if(require.main===module){
 const {test}=require('node:test'),assert=require('node:assert/strict'),{readFileSync}=require('node:fs'),{createContext,runInContext}=require('node:vm'),path=require('node:path');
 const html=readFileSync(path.join(__dirname,'../index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const ctx=createContext({fmtBRL:v=>'R$ '+Math.round(v).toLocaleString('pt-BR')});
 for(const name of ['axesData'])runInContext(script.split('\n').find(l=>l.startsWith('  var '+name+' = ')),ctx);
 runInContext(script.slice(script.indexOf('  var simDests = '),script.indexOf('\n  ];',script.indexOf('  var simDests = '))+5),ctx);
 for(const name of ['esc','irpfmRate','stayTax','goTax','applicable','diagnosticQuestions','factLabel','destinationPhrase','ownerDestination','ownerAccount','diagnosticDecision','axisAnswer','calculateDiagnostic','ruleMatches','diagnosticChanges','diagnosticFacts','matrixMarkup']){
  const a=script.indexOf('  function '+name+'('),lineEnd=script.indexOf('\n',a),b=script.slice(a,lineEnd).trimEnd().endsWith('}')?lineEnd:script.indexOf('\n  }',a)+4;runInContext(script.slice(a,b),ctx);
 }
 for(const s of scenarios)test(s.name,()=>{
  const r=ctx.calculateDiagnostic(s.state),d=r.decision,a=d.owner.account;
  assert.equal(d.cell,s.cell);assert.equal(r.recommended[0].id,s.top);if(s.second)assert.equal(r.recommended[1].id,s.second);
  assert.equal(d.company.level,s.level);if(s.gain===null)assert.equal(d.company.gain,null);else assert.ok(Math.abs(d.company.gain-s.gain)<1e-12);
  assert.ok(r.rules.some(r=>r.id===s.rule));assert.equal(a.stayAll,s.stay);assert.ok(Math.abs(a.goAll-s.go)<1e-8);
  assert.equal(a.stay.total,ctx.stayTax(a.monthly,a.corp).total);assert.equal(a.go.total,ctx.goTax(a.monthly,a.destination.rate/100,a.destination.credit).total);
  for(const [id,v]of Object.entries(s.expected))assert.equal(r.axes[id].value,v,id);
  if(s.destination)assert.equal(a.destination.id,s.destination);
 });
 test('5. Matriz acessível e contrafactuais recalculados nos cenários 1 e 2',()=>{
  for(const s of scenarios.slice(0,2)){
   const d=ctx.diagnosticDecision(s.state.facts),markup=ctx.matrixMarkup(d,false);assert.match(markup,/<svg[^>]*role="img"[^>]*aria-label="[^"]+"/);assert.equal((markup.match(/class="matrix-selected"/g)||[]).length,1);
   const changes=ctx.diagnosticChanges(s.state);assert.ok(changes.length>=1);for(const change of changes){const next=ctx.diagnosticDecision(ctx.diagnosticFacts({mode:s.state.mode,facts:{...s.state.facts,[change.id]:change.value}}));assert.deepEqual(JSON.parse(JSON.stringify(next)),JSON.parse(JSON.stringify(change.decision)));assert.ok(next.owner.verdict!==d.owner.verdict||next.company.verdict!==d.company.verdict);}
  }
 });
}
