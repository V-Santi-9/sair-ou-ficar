// Render the actual UI functions without a browser; validate their generated markup.
const {readFileSync} = require('node:fs');
const {createContext, runInContext} = require('node:vm');
const {spawnSync} = require('node:child_process');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const html = readFileSync(path.join(root,'index.html'),'utf8');
const STUDY = JSON.parse(readFileSync(path.join(root,'data/estudo-v4.json'),'utf8'));
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function functionSource(name) {
  const start = script.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, name);
  const end = script.indexOf('\n  }', start) + 4;
  // Single-line functions end before the next newline.
  const lineEnd = script.indexOf('\n', start);
  return script.slice(start, script.slice(start,lineEnd).trimEnd().endsWith('}') ? lineEnd : end);
}
function declaration(name, endToken) {
  const start = script.search(new RegExp('  var '+name+' ?='));
  assert.ok(start >= 0, name);
  return script.slice(start, script.indexOf(endToken,start)+endToken.length);
}
const nodes = new Map();
function node(id) {
  if (!nodes.has(id)) nodes.set(id, {listeners:{},innerHTML:'', textContent:'', hidden:false, dataset:{}, style:{},
    classList:{toggle(){},add(){},remove(){},contains(){return false;}}, setAttribute(){}, addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);}, focus(){context.document.activeElement=this;}, querySelector(){return node('dummy');},scrollIntoView(){}});
  return nodes.get(id);
}
const context = createContext({fmtBRL:v=>'R$ '+Math.round(v).toLocaleString('pt-BR'),setTimeout,clearTimeout,el:node, document:{querySelectorAll:()=>[],getElementById:node,body:node('body')}, css:()=> '#555555'});
for (const name of ['articles','dests','simDests','costs']) runInContext(declaration(name,'\n  ];'),context);
for (const name of ['myths','countries']) runInContext(declaration(name,'\n  ];'),context);
for (const name of ['editorialTitles','portaTxt','mapStops','exits','resultLabels','statusShapes']) runInContext(declaration(name,';'),context);
for (const name of ['readingTime','longDates','articleTitle','articleIndex','showArticle','irpfmRate','stayTax','goTax','profileResult','profileReasons','showMapCard','renderCompare','buildMyths','drawExits']) runInContext(functionSource(name),context);
runInContext(script.split('\n').find(line=>line.startsWith('  var study = ')),context);
const v4Functions=['esc','dateText','copy','sourceLink','statusBadge','dossierLink','countryOf','countryItems','selectFilter','unique','emptyText','attentionNorms','normReferences','filterNorms','normRow','renderNorms','renderTimeline','storyMarkup','storyGroups','renderStories','videoMarkup','mediaMarkup','renderLibrary','numberMarkup','renderCountry','sourceGroups','renderSources','buildStudy'];
for (const name of v4Functions) runInContext(functionSource(name),context);
for(const name of ['axesData','caseData'])runInContext(script.split('\n').find(line=>line.startsWith('  var '+name+' = ')),context);
const v5Functions=['factLabel','destinationPhrase','whyLine','destRate','ownerDestination','diagnosticDecision','axisAnswer','diagnosticChanges','diagnosticFacts','matrixMarkup','gainFormula','axesMarkup','cancelDiagnosticAdvance','queueDiagnosticAdvance','diagnosticPreviewMarkup','updateDiagnosticPreview','bindDiagnostic','applicable','diagnosticQuestions','ruleMatches','calculateDiagnostic','sectorMembership','caseRecords','compatibleSize','similarCases','sectorName','resultName','caseCard','caseTable','aggregatesMarkup','sectorMarkup','renderCases','renderSector','ownerAccount','calculationMarkup','signed','pathNextSteps','diagnosticReport','ruleMarkup','persistDiagnostic','validateDiagnostic','diagnosticNumberCode','encodeDiagnostic','decodeDiagnostic','shareDiagnostic','readDiagnostic','diagnosticIntro','renderDiagnostic','saveDiagnosticAnswer','advanceDiagnostic','closeNavigation','updateTopButton','buildV5'];
for(const name of v5Functions)runInContext(functionSource(name),context);
for(const name of ['sharmaData','materials'])runInContext(script.split('\n').find(line=>line.startsWith('  var '+name+' = ')),context);
const v7Functions=['sharmaNumber','sharmaCountryLine','materialMatches','materialImage','materialFigure','materialsMarkup','openMaterial','closeMaterial','restoreMaterialFocus','materialFailure','scenarioSVG','scenarioSources','scenarioScreen','aggregate','aggregateSource','scenarioAccount','dividendFlow','flowMarkup','updateScenarioFlow','payrollAccount','factoryDrawing','gaugeSVG','productionMap','factoryPictograms','person','ownerDrawing','pharmaSymbol','residenceData','dotGroup','residenceDots','scenariosMarkup','milestoneDate','timelineMilestones','milestoneMarkup','miniTimelineMarkup','homeScenariosMarkup','focusScenario','buildV7'];
for(const name of v7Functions)runInContext(functionSource(name),context);
context.pendingScenarioJump='';context.diagnosticState=null;context.diagnosticSaved=null;context.diagnosticStorage=true;context.diagnosticTimer=null;context.diagnosticPanelOpen=true;context.diagnosticShared=false;
const fragments = [];
function capture(name, id) {fragments.push([name,node(id).innerHTML]);}

test('All articles, destination summaries, comparisons, myths and timeline panels render',()=>{
  for (const a of context.articles) {
    context.showArticle(a.id);capture(a.id,'artFull');
    assert.doesNotMatch(node('artFull').innerHTML,/\b\d{2}\/\d{2}\/\d{4}\b/);
    fragments.push(['index-'+a.id,context.articleIndex(a)]);
  }
  for (const id of context.mapStops) {context.showMapCard(id);capture('map-'+id,'mapCard');}
  context.showMapCard('ca'); assert.match(node('mapCard').innerHTML,/não traz perfil tributário/);
  for (const selected of [['pt','us'],['py','pt','uy']]) {
    context.compareSelected=selected;context.renderCompare();capture('compare-'+selected.length,'compareCards');
  }
  context.buildMyths();capture('myths','mythCards');
  context.renderTimeline();capture('timeline','normTimeline');
  context.drawExits();capture('chart','chartExits');assert.match(node('chartExits').innerHTML,/46,6/);
});
test('Embedded research exactly matches the supplied JSON; all norms render with unique simple anchors',()=>{
  const expected=JSON.parse(readFileSync(path.join(root,'data/estudo-v4.json'),'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(context.study)),expected);
  for(const key of ['pais','status','impacto','tema','q'])node('norm-'+key).value='';
  context.renderNorms();capture('norms-all','normList');
  const markup=node('normList').innerHTML;
  assert.equal((markup.match(/<details /g)||[]).length,STUDY.normas.length);
  for(const n of expected.normas){
    assert.match(n.id,/^[a-z0-9-]+$/);
    assert.equal((markup.match(new RegExp('id="norma-'+n.id+'"','g'))||[]).length,1);
    assert.ok(markup.includes('href="#norma-'+n.id+'"'));
  }
  assert.equal((node('normTimeline').innerHTML.match(/data-timeline-norma=/g)||[]).length,STUDY.normas.length);
});
test('Status, country, impact, theme and accent-insensitive text filters reduce the rendered norms correctly',()=>{
  for(const status of Object.keys(context.study.legenda_status)){
    node('norm-status').value=status;context.renderNorms();capture('norms-'+status,'normList');
    const ids=Array.from(node('normList').innerHTML.matchAll(/data-norma="([^"]+)"/g),m=>m[1]);
    const expected=context.study.normas.filter(n=>n.status===status).map(n=>n.id);
    assert.deepEqual(ids,Array.from(expected));assert.ok(ids.length<STUDY.normas.length);
  }
  node('norm-status').value='recente';node('norm-pais').value='Portugal';context.renderNorms();
  assert.equal((node('normList').innerHTML.match(/data-norma=/g)||[]).length,3);
  node('norm-impacto').value='médio';context.renderNorms();
  assert.deepEqual(Array.from(node('normList').innerHTML.matchAll(/data-norma="([^"]+)"/g),m=>m[1]),Array.from(context.study.normas.filter(n=>n.pais==='Portugal'&&n.status==='recente'&&n.impacto==='médio').map(n=>n.id)));
  for(const k of ['pais','status','impacto','tema','q'])node('norm-'+k).value='';
  node('norm-q').value='solvencia';context.renderNorms();assert.match(node('normList').innerHTML,/data-norma="py-dnm407"/);
  node('norm-q').value='sem resultado inexistente';context.renderNorms();assert.doesNotMatch(node('normList').innerHTML,/<details /);assert.match(node('normCount').textContent,new RegExp('0 de '+STUDY.normas.length));
  node('norm-q').value='';node('norm-tema').value='Nacionalidade';context.renderNorms();assert.match(node('normList').innerHTML,/data-norma="pt-nac"/);
  node('norm-tema').value='';
});
test('Attention criteria include every contested, pending, unverified and recent high-impact norm',()=>{
  const actual=Array.from(context.attentionNorms(),n=>n.id);
  const expected=Array.from(context.study.normas.filter(n=>['contestada','pendente','conferir'].includes(n.status)||(n.status==='recente'&&n.impacto==='alto')),n=>n.id);
  assert.deepEqual(actual,expected);
});
test('All eight dossiers contain only their own country records and all seven report sections',()=>{
  for(const country of context.countries){
    context.renderCountry(country.slug);capture('country-'+country.slug,'countryReport');
    const markup=node('countryReport').innerHTML;
    assert.equal((markup.match(/class="report-section"/g)||[]).length,7);
    const marked=Array.from(markup.matchAll(/data-country="([^"]+)"/g),m=>m[1]);
    assert.ok(marked.length);assert.ok(marked.every(name=>name===country.nome));
    for(const n of context.study.normas)assert.equal(markup.includes('href="#norma-'+n.id+'"'),n.pais===country.nome,n.id+' in '+country.nome);
    for(const r of context.study.relatos)assert.equal(markup.includes('data-story="'+r.id+'"'),context.countryOf(r)===country.nome,r.id);
    for(const i of country.numbers)assert.ok(markup.includes(context.esc(context.study.numeros[i].v)));
    const own=Array.from(country.numbers);for(let i=0;i<context.study.numeros.length;i++)if(!own.includes(i))assert.ok(!markup.includes(context.copy(context.study.numeros[i].t)));
    assert.doesNotMatch(markup,/\b\d{2}\/\d{2}\/\d{4}\b/);
  }
});
test('Stories preserve quotes, negative outcomes and expert analysis; filters work',()=>{
  context.renderStories();capture('stories','storyList');
  assert.equal((node('storyList').innerHTML.match(/data-story=/g)||[]).length,16);
  for(const r of context.study.relatos){const markup=context.storyMarkup(r);if(r.citacao)assert.ok(markup.includes(context.esc(r.citacao)));if(r.perfil==='especialista')assert.match(markup,/>Análise<\/span>/);}
  node('story-destino').value='Portugal';node('story-resultado').value='negativo';context.renderStories();assert.match(node('storyList').innerHTML,/data-story="r10"/);assert.equal((node('storyList').innerHTML.match(/data-story=/g)||[]).length,1);
  node('story-destino').value='';node('story-resultado').value='';
});
test('Library renders all 15 videos and 18 materials; destination and type filters combine',()=>{
  context.renderLibrary();capture('library','libraryList');
  assert.equal((node('libraryList').innerHTML.match(/class="video-item"/g)||[]).length,15);
  assert.equal((node('libraryList').innerHTML.match(/class="media-row"/g)||[]).length,18);
  node('library-destino').value='Paraguai';node('library-tipo').value='relato';context.renderLibrary();assert.equal((node('libraryList').innerHTML.match(/class="video-item"/g)||[]).length,3);assert.doesNotMatch(node('libraryList').innerHTML,/class="media-row"/);
  node('library-tipo').value='reportagem';context.renderLibrary();assert.equal((node('libraryList').innerHTML.match(/class="media-row"/g)||[]).length,7);assert.doesNotMatch(node('libraryList').innerHTML,/class="video-item"/);
  node('library-destino').value='';node('library-tipo').value='';
});
test('Dates retain source precision and sources without URLs never become links',()=>{
  assert.equal(context.dateText('2026'),'2026');assert.equal(context.dateText('2026-08'),'agosto de 2026');assert.equal(context.dateText('2026-08-31'),'31 de agosto de 2026');assert.equal(context.dateText('2025-12 / 2026-08'),'dezembro de 2025 / agosto de 2026');
  assert.match(context.dateText('pedidos a partir de 2026-07-06'),/6 de julho de 2026/);
  assert.doesNotMatch(context.sourceLink({t:'Fonte sem endereço',u:'',tipo:'oficial'}),/<a /);
  context.renderSources();capture('sources','studySources');
  for(const gap of context.study.lacunas)assert.ok(node('studySources').innerHTML.includes(context.copy(gap)));
  for(const source of context.sourceGroups())if(source.u)assert.ok(node('studySources').innerHTML.includes(context.esc(source.u)));
});
test('All study surfaces initialize even with denied localStorage, and home contains three exact quotes',()=>{
  context.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
  assert.doesNotThrow(()=>context.buildStudy());
  capture('home-study','homeStudy');capture('norm-summary','normSummary');capture('norm-attention','normAttention');capture('norm-filters','normFilters');capture('story-filters','storyFilters');capture('library-filters','libraryFilters');capture('country-nav','countryNav');
  assert.equal((node('homeStudy').innerHTML.match(/<blockquote>/g)||[]).length,3);
  assert.match(node('homeStudy').innerHTML,/40.600/);assert.match(node('homeStudy').innerHTML,/14.275/);
  assert.equal(node('videoWarning').textContent,context.study.videos_aviso);
});
test('Simple hash routes open each norm despite stale filters, and preserve changes and country routes',()=>{
  const views=Array.from(html.matchAll(/<section class="view(?: on)?" id="v-([^"]+)" data-route="([^"]+)"/g),m=>({getAttribute:()=>m[2],classList:{toggle(k,v){this.on=v;}},route:m[2]}));
  context.document.querySelectorAll=selector=>selector==='section.view'?views:[];
  context.window={scrollTo(){},scrollY:0,innerHeight:800};context.document.documentElement={scrollHeight:2000};context.location={hash:''};context.first=true;context.mapHasPlayed=true;
  for(const id of ['normFilters','v-normas','v-mudancas','v-pais']){node(id).querySelector=()=>({setAttribute(){},focus(){}});}
  for(const n of context.study.normas){node('norma-'+n.id).scrollIntoView=()=>{};node('norma-'+n.id).querySelector=()=>({focus(){}});}
  runInContext(declaration('routes',';'),context);runInContext(functionSource('route'),context);
  for(const n of context.study.normas){node('norm-status').value='vigente';context.location.hash='#norma-'+n.id;context.route();assert.equal(node('norma-'+n.id).open,true);assert.equal(node('norm-status').value,'');assert.equal(views.find(v=>v.classList.on).route,'normas');}
  context.location.hash='#mudancas';context.route();assert.equal(views.find(v=>v.classList.on).route,'mudancas');
  for(const c of context.countries){context.location.hash='#pais-'+c.slug;context.route();assert.equal(views.find(v=>v.classList.on).route,'pais');assert.match(node('countryReport').innerHTML,new RegExp('data-dossier="'+c.slug+'"'));}
  context.document.querySelectorAll=()=>[];
});
test('V5 embedded datasets exactly match the two provided files',()=>{
  for(const [name,file] of [['axesData','perguntas-v5.json'],['caseData','casos-v5.json']])assert.deepEqual(JSON.parse(JSON.stringify(context[name])),JSON.parse(readFileSync(path.join(root,'data',file),'utf8')));
});
test('Rapid uses the exact 15 core questions; complete respects all conditional branches',()=>{
 const core=['setor','industria','porte','regime','export','folha','energia','regulacao','familia','presenca','cidadania','dividendos','rend_ext','motivo','risco'];
 assert.deepEqual(Array.from(context.axesData.fatos.filter(q=>q.nucleo),q=>q.id),core);
 for(const industria of ['sim','terceiro','nao',null])for(const familia of ['so','casal','filhos','ninguem',null])for(const setor of context.caseData.setores.map(s=>s.id))for(const mode of ['rapido','completo']){
  const facts={industria,familia,setor},actual=Array.from(context.diagnosticQuestions(mode,facts),q=>q.id);
  const expected=context.axesData.fatos.filter(q=>(mode==='completo'||q.nucleo)&&Object.entries(q.se).every(([key,options])=>options.includes(facts[key]))).map(q=>q.id);
  assert.deepEqual(actual,Array.from(expected));assert.ok(actual.length<=39);if(mode==='rapido')assert.equal(actual.length,['sim','terceiro'].includes(industria)?15:12);
 }
 assert.equal(context.diagnosticQuestions('completo',{industria:'sim',familia:'filhos'}).length,39);
 for(const q of context.axesData.fatos){assert.ok(q.porque);assert.ok(q.eixo);assert.ok(q.se);if(q.tipo==='escolha'&&q.id!=='setor')assert.ok(q.opcoes.length>=3&&q.opcoes.length<=5);}
});
const scenarios=require('./v8-scenarios.cjs');

test('Four hand-worked profiles produce exact axes, decisions, alerts and unchanged owner arithmetic',()=>{
 for(const scenario of scenarios){
  const r=context.calculateDiagnostic(scenario.state),d=r.decision,a=context.ownerAccount(scenario.state.facts);
  for(const [id,v]of Object.entries(scenario.expected))assert.ok(Math.abs(r.axes[id].value-v)<1e-9,scenario.name+' '+id);
  assert.equal(r.recommended[0].id,scenario.top);assert.equal(d.cell,scenario.cell);assert.ok(r.rules.some(x=>x.id===scenario.rule));
  assert.equal(a.stayAll,scenario.stay);assert.ok(Math.abs(a.goAll-scenario.go)<1e-7);
  const report=context.diagnosticReport(scenario.state);fragments.push(['scenario-'+scenario.name,report]);assert.match(report,/Como chegamos aqui/);assert.match(report,/Próximos passos/);assert.equal((report.match(/class="axis-track"/g)||[]).length,8);
  for(const p of r.paths){const ids=Object.keys(p.ideal),distance=Math.sqrt(ids.reduce((sum,id)=>sum+(scenario.expected[id]-p.ideal[id]*50)**2,0));assert.ok(Math.abs(p.affinity-(100-100*distance/(200*Math.sqrt(ids.length))))<1e-9);}
 }
});

test('Explicit business rules veto retail maquila and lower the sanitary verdict exactly one level',()=>{
 let r=context.calculateDiagnostic({mode:'rapido',facts:{industria:'nao',setor:'varejo'}});assert.ok(r.rules.some(x=>x.id==='v1'));assert.equal(r.paths.find(p=>p.id==='maquila').eligible,false);
 assert.match(context.diagnosticReport({mode:'rapido',facts:{industria:'nao',setor:'varejo'}}),/data-rule="v1"/);
 for(const sector of ['farma','textil','alimentos']){r=context.calculateDiagnostic({...scenarios[3].state,facts:{...scenarios[3].state.facts,setor:sector}});assert.equal(r.decision.company.rawLevel,2);assert.equal(r.decision.company.level,1);assert.ok(r.rules.some(x=>x.id==='v2'));}
 assert.ok(!context.calculateDiagnostic({...scenarios[0].state,facts:{...scenarios[0].state.facts,setor:'farma'}}).rules.some(x=>x.id==='v2'));
});

test('Safe rule parser covers precedence, missing values, lists and rejects execution',()=>{
  const values={industria:'nao',setor:'varejo',REG:1,MOB:2,REND:-1,dividendos:80000,cidadania:'ue',familia:'casal',capital:null,regime:'real',regulacao:'sanitaria',motivo:'imposto',custo_sair:96000,custo_ficar:57600,destino:'us'};
  for(const id of ['v1','v2','v3','v8'])assert.equal(context.ruleMatches(context.axesData.regras.find(r=>r.id===id).se,values),true,id);
  for(const id of ['v4','v5','v6','v7'])assert.equal(context.ruleMatches(context.axesData.regras.find(r=>r.id===id).se,values),false,id);
  assert.equal(context.ruleMatches("REG == 1 || MOB == 0 && REND == 0",values),true);
  assert.equal(context.ruleMatches("(REG == 1 || MOB == 0) && REND == 0",values),false);
  for(const expression of ['constructor.constructor(1)','REG >= 1; process.exit()','REG >= 1 rubbish',"setor in ['varejo'",'MISSING == 0'])assert.equal(context.ruleMatches(expression,values),false);
});
test('Skipped questions mark missing data; conditional facts never affect hidden axes or estimates',()=>{
 const blank={mode:'completo',facts:{industria:'nao',familia:'so',setor:'textil'}},a=context.calculateDiagnostic(blank),b=context.calculateDiagnostic({...blank,facts:{...blank.facts,folha:'60',energia:'mais',conjuge:'0',escola_idioma:'0'}});
 assert.deepEqual(JSON.parse(JSON.stringify(a.axes)),JSON.parse(JSON.stringify(b.axes)));assert.equal(b.decision.company.gain,null);
 const empty=context.calculateDiagnostic({mode:'completo',facts:{}});assert.ok(Object.values(empty.axes).every(x=>x.noData&&x.value===0));assert.equal(empty.decision.cell,null);
 const neutral=context.calculateDiagnostic({mode:'rapido',facts:{industria:'sim',energia:'ns'}});assert.equal(neutral.axes.INS.noData,false);assert.equal(neutral.axes.INS.value,0);assert.equal(neutral.decision.company.gain,null);
 const partial=context.calculateDiagnostic({mode:'rapido',facts:{export:'90'}});assert.equal(partial.axes.MERC.value,100);assert.equal(partial.axes.MERC.denominator,2);
});

test('Pharma report preserves c9 caveat and both regulatory sources',()=>{
  const report=context.diagnosticReport(scenarios[3].state);
  assert.match(report,/Não achamos caso do seu setor|Blink Bioscience/);assert.match(report,/Não é medicamento humano/);assert.match(report,/Fontes regulatórias do setor farmacêutico/);assert.match(report,/data-rule="v2"/);
  for(const source of context.caseData.fontes_regulatorias_farma)assert.ok(report.includes(source.u));fragments.push(['pharma-report',report]);
});
test('Similarity scores use supplied evidence, stable ordering and at most five cases',()=>{
  const s=scenarios[0].state,result=context.calculateDiagnostic(s),matches=context.similarCases(s.facts,result.recommended[0]);assert.equal(matches.length,5);assert.equal(matches[0].record.id,'c1');assert.equal(matches[0].score,7);
  for(const m of matches)assert.equal(m.score,m.reasons.reduce((a,r)=>a+r[1],0));
  for(const m of context.similarCases(scenarios[2].state.facts,context.calculateDiagnostic(scenarios[2].state).recommended[0]))if(m.record.relato)assert.ok(m.reasons.every(r=>r[0]!=='Modelo do caminho'&&r[0]!=='Porte compatível'));
});
test('All records have canonical anchors, all 13 sectors only contain linked records; filters combine and reset',()=>{
  for(const k of ['setor','destino','modelo','resultado'])node('case-'+k).value='';context.renderCases();capture('all-cases','caseList');
  const markup=node('caseList').innerHTML;assert.equal((markup.match(/id="caso-/g)||[]).length,context.caseRecords().length);
  for(const record of context.caseRecords())assert.equal((markup.match(new RegExp('id="caso-'+record.id+'"','g'))||[]).length,1);
  for(const sector of context.caseData.setores){context.renderSector(sector.id);const actual=Array.from(node('sectorReport').innerHTML.matchAll(/data-case="([^"]+)"/g),m=>m[1]);const expected=Array.from(context.caseRecords().filter(c=>c.sectors.includes(sector.id)),c=>c.id);assert.deepEqual(actual,expected);capture('sector-'+sector.id,'sectorReport');}
  for(const [key,value]of [['setor','textil'],['destino','Paraguai'],['modelo','terceirizacao'],['resultado','em_operacao']]){node('case-'+key).value=value;context.renderCases();}
  assert.match(node('caseList').innerHTML,/data-case="c3"/);assert.equal((node('caseList').innerHTML.match(/data-case=/g)||[]).length,1);
  node('case-destino').value='Portugal';context.renderCases();assert.match(node('caseList').innerHTML,/Nenhum caso/);assert.match(node('caseList').innerHTML,/Limpar filtros/);capture('empty-cases','caseList');
  for(const k of ['setor','destino','modelo','resultado'])node('case-'+k).value='';
});
test('Every applicable question renders; storage denial, malformed data, legacy state and resume are safe',()=>{
 context.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert.doesNotThrow(()=>context.diagnosticIntro());capture('intro-denied','diagnosticApp');
 assert.doesNotThrow(()=>context.persistDiagnostic());assert.match(node('diagnosticSave').textContent,/não permitiu/);
 const state={version:8,mode:'completo',facts:{...scenarios[0].state.facts,setor:'farma',familia:'filhos'},answers:{},step:0};context.diagnosticState=state;
 for(let i=0;i<context.diagnosticQuestions(state.mode,state.facts).length;i++){state.step=i;context.renderDiagnostic(false);capture('v8-question-'+i,'diagnosticApp');assert.match(node('diagnosticApp').innerHTML,/id="diagnosticWhy"/);assert.doesNotMatch(node('diagnosticApp').innerHTML,/scale-options/);}
 context.localStorage={getItem:()=>'{broken'};assert.equal(context.readDiagnostic(),null);
 context.localStorage={getItem:k=>k.endsWith('v5')?JSON.stringify({version:5,facts:{setor:'farma'}}):null};context.diagnosticIntro();assert.equal(context.diagnosticSaved,null);assert.match(node('diagnosticApp').innerHTML,/Suas respostas antigas não valem/);
 context.localStorage={getItem:()=>JSON.stringify({...state,step:999,facts:{setor:'farma',industria:'bad',dividendos:-1,energia:'mais'},answers:{c5:2,unknown:2}})};
 const saved=context.readDiagnostic();assert.equal(saved.facts.setor,'farma');assert.equal(saved.facts.industria,undefined);assert.equal(saved.facts.dividendos,undefined);assert.equal(saved.facts.energia,undefined);assert.deepEqual(Object.keys(saved.answers),[]);assert.ok(saved.step<39);
 context.diagnosticIntro();assert.match(node('diagnosticApp').innerHTML,/Continuar de onde parou/);assert.match(node('diagnosticApp').innerHTML,/Recomeçar/);
});

test('Case deep links clear stale filters, all sector hashes route and country dossiers include own companies',()=>{
  const views=Array.from(html.matchAll(/<section class="view(?: on)?" id="v-([^"]+)" data-route="([^"]+)"/g),m=>({getAttribute:()=>m[2],classList:{toggle(k,v){this.on=v;}},route:m[2]}));
  context.document.querySelectorAll=selector=>selector==='section.view'?views:[];context.window={scrollTo(){},scrollY:0,innerHeight:800};context.document.documentElement={scrollHeight:2000};context.location={hash:''};context.first=true;
  for(const c of context.caseRecords()){node('case-setor').value='outro';context.location.hash='#caso-'+c.id;context.route();assert.equal(views.find(v=>v.classList.on).route,'casos');assert.equal(node('case-setor').value,'');assert.ok(node('caseList').innerHTML.includes('id="caso-'+c.id+'"'));assert.equal(node('caso-'+c.id).open,true);}
  for(const s of context.caseData.setores){context.location.hash='#setor-'+s.id;context.route();assert.equal(views.find(v=>v.classList.on).route,'setor');assert.ok(node('sectorReport').innerHTML.includes(context.esc(s.nome)));}
  for(const country of context.countries){context.renderCountry(country.slug);const ids=Array.from(node('countryReport').innerHTML.matchAll(/data-case="([^"]+)"/g),m=>m[1]);assert.deepEqual(ids,Array.from(context.caseData.casos.filter(c=>c.destino===country.nome),c=>c.id));}
  context.document.querySelectorAll=()=>[];
});
test('Real UI handlers: auto advance, cancellation, keyboard, amounts, resume and exact simulator transfer',()=>{
 const memory=new Map();context.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 context.document.addEventListener=()=>{};context.window.addEventListener=()=>{};context.window.matchMedia=()=>({matches:false});context.document.documentElement={scrollHeight:2000};context.window.innerHeight=800;
 let pending=null,delay;context.setTimeout=(fn,ms)=>{pending=fn;delay=ms;return 1;};context.clearTimeout=()=>pending=null;
 context.buildV5();capture('v8-home-sectors','homeSectors');capture('v8-aggregates','caseAggregates');capture('v8-filters','caseFilters');
 const app=node('diagnosticApp'),form=node('diagnosticForm');const click=(action)=>app.listeners.click[0]({target:{closest:s=>s==='[data-diag-action]'?{dataset:{diagAction:action}}:null}});
 const submit=()=>app.listeners.submit[0]({target:{id:'diagnosticForm'},preventDefault(){}});
 app.querySelector=()=>({value:'rapido'});click('start');assert.equal(context.diagnosticState.version,8);assert.equal(context.diagnosticState.step,0);
 form.querySelector=()=>null;click('skip');assert.equal(context.diagnosticState.facts.setor,null);click('back');assert.equal(context.diagnosticState.step,0);
 form.querySelector=()=>({value:'textil'});app.listeners.change[0]({target:{matches:()=>true}});assert.equal(delay,250);assert.equal(context.diagnosticState.step,0);assert.equal(context.diagnosticState.facts.setor,'textil');pending();assert.equal(context.diagnosticState.step,1);
 form.querySelector=()=>({value:'sim'});app.listeners.change[0]({target:{matches:()=>true}});assert.ok(pending);click('back');assert.equal(pending,null);assert.equal(context.diagnosticState.step,0);
 context.diagnosticState.facts={...scenarios[0].state.facts};context.diagnosticState.step=11;context.renderDiagnostic(false);node('diagnosticAmount').value='80000';app.listeners.input[0]({target:{id:'diagnosticAmount'}});assert.equal(context.diagnosticState.facts.dividendos,80000);
 node('diagnosticAmount').value='-1';submit();assert.equal(context.diagnosticState.step,11);assert.match(node('diagnosticError').textContent,/Valores/);
 app.listeners.click[0]({target:{closest:s=>s==='[data-diag-amount]'?{dataset:{diagAmount:'50000'}}:null}});assert.equal(context.diagnosticState.facts.dividendos,50000);assert.equal(context.diagnosticState.step,11);
 node('diagnosticAmount').value='80000';submit();node('diagnosticAmount').value='20000';submit();assert.equal(context.diagnosticState.step,13);
 const radios=['imposto','seguranca','escola','instabilidade','producao'].map(value=>({value,focus(){},checked:false}));form.querySelectorAll=()=>radios;form.querySelector=()=>radios.find(r=>r.checked)||null;
 app.listeners.keydown[0]({key:'5',target:{matches:()=>false},preventDefault(){}});assert.equal(context.diagnosticState.facts.motivo,'producao');assert.ok(pending);
 app.listeners.keydown[0]({key:'Enter',target:{matches:()=>true},preventDefault(){}});assert.equal(context.diagnosticState.step,14);assert.equal(pending,null);
 context.diagnosticIntro();click('resume');assert.equal(context.diagnosticState.step,14);assert.equal(context.diagnosticState.facts.dividendos,80000);click('skip');assert.equal(context.diagnosticState.done,true);assert.match(app.innerHTML,/Empresa e dono: duas decisões/);
 assert.equal(JSON.parse(memory.get('sair-ficar-diagnostico-v8')).done,true);
 context.sel={value:''};let applied=0;context.applyDest=()=>applied++;context.location={hash:'#perfil'};click('simulator');assert.equal(node('divMes').value,80000);assert.equal(node('invExt').value,20000);assert.equal(node('corpRate').value,34);assert.equal(node('custoVida').value,0);assert.equal(context.sel.value,'py');assert.equal(applied,1);assert.equal(context.location.hash,'simulador');
 context.diagnosticState=scenarios[2].state;click('simulator');assert.equal(context.sel.value,'es');assert.equal(node('corpRate').value,15);
 app.querySelector=()=>node('dummy');click('restart');assert.equal(context.diagnosticState,null);assert.equal(memory.has('sair-ficar-diagnostico-v8'),false);
 context.diagnosticState={version:8,mode:'completo',step:1,facts:{industria:'sim',folha:'60',energia:'mais',regulacao:'sanitaria'},answers:{old:2}};form.querySelector=()=>({value:'nao'});context.saveDiagnosticAnswer(false,true);assert.equal(context.diagnosticState.facts.folha,undefined);assert.equal(context.diagnosticState.facts.regulacao,undefined);assert.deepEqual(Object.keys(context.diagnosticState.answers),[]);
 context.window.matchMedia=()=>({matches:true});context.diagnosticState.step=0;form.querySelector=()=>({value:'servicos'});app.listeners.change[0]({target:{matches:()=>true}});assert.equal(context.diagnosticState.step,1);assert.equal(pending,null);
 context.localStorage={getItem:()=>JSON.stringify({version:8,mode:'rapido'}),removeItem(){throw Error('denied');},setItem(){throw Error('denied');}};click('restart');assert.doesNotMatch(app.innerHTML,/Continuar de onde parou/);
 context.setTimeout=setTimeout;context.clearTimeout=clearTimeout;
});

test('V7 defaults to dark without saved preference; explicit theme persists and toggles both ways',()=>{
  assert.match(html,/<html[^>]*data-theme="dark"/);
  assert.doesNotMatch(html,/@media\s*\(prefers-color-scheme\s*:\s*dark\)/);
  const themeCode=script.slice(script.indexOf('  function themeLabel('),script.indexOf('  /* ---------- mapa geográfico'));
  for(const saved of [null,'dark','light','invalid','denied']){
    let theme='dark',handler,stored=saved;
    const toggle={textContent:'',addEventListener(event,fn){assert.equal(event,'click');handler=fn;}};
    const ctx=createContext({el:()=>toggle,document:{documentElement:{getAttribute:()=>theme,setAttribute:(key,value)=>{theme=value;},removeAttribute:()=>{theme=null;}}},window:{matchMedia:()=>({matches:true})},localStorage:{getItem(){if(saved==='denied')throw Error('denied');return saved;},setItem:(key,value)=>stored=value}});
    runInContext(themeCode,ctx);
    const expected=saved==='light'?'light':'dark';assert.equal(theme,expected);assert.equal(toggle.textContent,'Tema: '+(expected==='dark'?'escuro':'claro'));
    handler();assert.equal(theme,expected==='dark'?'light':'dark');assert.equal(stored,theme);
    handler();assert.equal(theme,expected);assert.equal(stored,theme);
  }
});
test('V8 intro preserves two modes and one start action, with an accessible neutral matrix',()=>{
 const home=html.split('id="v-inicio"')[1].split('<!-- PERFIL -->')[0];assert.doesNotMatch(home,/class="eyebrow"|Residência fiscal e negócios/);
 context.diagnosticIntro(true);const intro=node('diagnosticApp').innerHTML;assert.equal((intro.match(/data-cell=/g)||[]).length,4);assert.doesNotMatch(intro,/matrix-selected/);
 assert.match(intro,/<svg[^>]*role="img"[^>]*aria-label=/);assert.equal((intro.match(/name="diagnosticMode"/g)||[]).length,2);assert.equal((intro.match(/data-diag-action="start"/g)||[]).length,1);
 assert.match(intro,/15 perguntas · 4 minutos/);assert.match(intro,/cerca de 40 perguntas · 12 minutos/);assert.doesNotMatch(intro,/class="mode-card"|preview-track/);
});

test('V8 reports lead with two verdicts, accessible matrix and integer numbers; axes and ranking are collapsed',()=>{
 for(const scenario of scenarios){
  const result=context.calculateDiagnostic(scenario.state),report=context.diagnosticReport(scenario.state),header=report.split('</header>')[0];
  assert.match(header,/empresa|Empresa|produzir|Produzir/);assert.match(header,/Você/);assert.doesNotMatch(header,/afinidade|axis-track|[0-9],[0-9]/);
  assert.match(report,/<svg[^>]*role="img"[^>]*aria-label="[^"]+"/);assert.equal((report.match(/class="matrix-selected"/g)||[]).length,1);
  assert.ok(report.indexOf('A empresa</h2>')<report.indexOf('O que mudaria'));assert.ok(report.indexOf('Você</h2>')<report.indexOf('O que mudaria'));
  assert.match(report,/<details class="calculation diagnostic-section"><summary>Seu retrato em 8 eixos/);assert.match(report,/<details class="calculation diagnostic-section"><summary>Como chegamos aqui/);
  const axes=report.split('<div class="axes-grid">')[1].split('</details>')[0],text=axes.replace(/<[^>]*>/g,'');assert.doesNotMatch(text,/[+-]?\d+[,.]\d+/);assert.equal((axes.match(/class="axis-reading"/g)||[]).length,8);
  for(const axis of context.axesData.eixos)assert.ok(axes.includes(context.esc(axis.nome+': '+Math.round(result.axes[axis.id].value))));
  const paths=Array.from(report.matchAll(/class="path-bar(?: primary-path)?" data-path="([^"]+)"/g),m=>m[1]);assert.deepEqual(paths,Array.from(result.paths,p=>p.id));assert.equal(paths.length,7);assert.equal((report.match(/class="path-bar primary-path"/g)||[]).length,1);
  for(const rule of result.rules)assert.equal((report.match(new RegExp('data-rule="'+rule.id+'"','g'))||[]).length,1);
  // Financial decimals are restricted to the explanatory account notes, across the entire report.
  const decision=report.replace(/<p class="[^"]*account-note[^"]*">[\s\S]*?<\/p>/g,'').replace(/<[^>]*>/g,'');assert.doesNotMatch(decision,/\d+,\d+/);
 }
 for(const scenario of scenarios.slice(0,2)){const changes=context.diagnosticChanges(scenario.state);assert.ok(changes.length>=1);for(const change of changes)assert.ok(context.diagnosticReport(scenario.state).replace(/<[^>]*>/g,'').includes(context.esc(change.text)));}
});

test('V8 destination gates, tax threshold, no-move veto, filial and combined paths use explicit facts',()=>{
 const run=changes=>context.calculateDiagnostic({version:8,mode:'completo',facts:{...scenarios[1].state.facts,...changes}});
 let r=run({rend_ext:299999});assert.equal(r.decision.owner.account.destination.id,'py');
 r=run({rend_ext:300000});assert.equal(r.decision.owner.account.destination.id,'uy');assert.equal(r.recommended[0].id,'patrimonio');assert.equal(r.decision.owner.moves,true);
 r=run({rend_ext:300000,familia:'ninguem'});assert.equal(r.decision.owner.moves,false);assert.equal(r.recommended[0].id,'ficar');assert.ok(r.rules.some(x=>x.id==='v4'));
 r=run({rend_ext:300000,motivo:'producao'});assert.equal(r.decision.owner.moves,false);
 r=run({motivo:'instabilidade',rend_ext:0,cidadania:'ue'});assert.equal(r.decision.owner.account.destination.id,'pt');
 r=run({motivo:'instabilidade',rend_ext:300000});assert.equal(r.decision.owner.account.destination.id,'uy');
 for(const motivo of ['escola','seguranca']){
  r=run({motivo,capital:'1000',idioma:'ingles'});assert.equal(r.recommended[0].id,'eua');assert.equal(r.decision.owner.account.destination.id,'us');
  r=run({motivo,capital:'1000',idioma:'espanhol'});assert.equal(r.decision.owner.account.destination.id,'pt');
  r=run({motivo,capital:'100',idioma:'ingles',cidadania:'ue'});assert.equal(r.decision.owner.account.destination.id,'es');assert.ok(r.rules.some(x=>x.id==='v6'));assert.ok(r.rules.some(x=>x.id==='v7'));
  r=run({motivo,capital:'1000',idioma:'ambos',cidadania:'ue'});assert.ok(r.rules.some(x=>x.id==='v8'));
 }
 for(const exp of ['60','90']){r=run({export:exp});assert.equal(r.recommended[0].id,'filial_ext');assert.equal(r.decision.company.branch,true);assert.equal(r.decision.company.outside,false);}
 r=run({export:'30'});assert.equal(r.decision.company.branch,false);
 r=run({industria:'sim',folha:'45',energia:'8',motivo:'imposto',rend_ext:300000});assert.deepEqual(Array.from(r.recommended,p=>p.id),['maquila','dono_py']);assert.equal(r.decision.cell,'fora/muda');
 r=run({dividendos:100000,rend_ext:0});assert.equal(r.decision.owner.gap,0);assert.equal(r.decision.owner.moves,false);assert.match(r.decision.owner.verdict,/economia de imposto é R\$ 0/);
});
test('V8 all cost bands, unknown estimates and sanitary floor follow only the published formula',()=>{
 const payroll={'10':.10,'25':.22,'45':.40,'60':.60,'ns':.25},energy={'3':.02,'8':.055,'15':.11,'mais':.20,'ns':.05};
 for(const [folha,p]of Object.entries(payroll))for(const [energia,e]of Object.entries(energy))for(const regulacao of ['nota','sanitaria']){
  const d=context.diagnosticDecision({...scenarios[0].state.facts,folha,energia,regulacao}),expected=p*5/18+e*72/113,raw=expected>=.1?2:expected>=.05?1:0;
  assert.ok(Math.abs(d.company.gain-expected)<1e-12);assert.equal(d.company.rawLevel,raw);assert.equal(d.company.level,regulacao==='sanitaria'?Math.max(0,raw-1):raw);
 }
 const missing=context.diagnosticDecision({...scenarios[0].state.facts,energia:null});assert.equal(missing.company.gain,null);assert.equal(missing.cell,null);
 for(const industry of ['nao',undefined]){const d=context.diagnosticDecision({...scenarios[0].state.facts,industria:industry});assert.equal(d.company.gain,null);}
});
test('V8 live preview updates both decisions; matrix examples match documented company models',()=>{
 let markup=context.diagnosticPreviewMarkup({mode:'rapido',facts:{}});assert.match(markup,/Empresa: ainda sem dados/);assert.match(markup,/Você: ainda sem dados/);assert.doesNotMatch(markup,/matrix-selected/);
 markup=context.diagnosticPreviewMarkup(scenarios[0].state);assert.match(markup,/ganho estimado de 15%/);assert.match(markup,/Você fica/);assert.match(markup,/matrix-preview matrix-mini/);assert.match(markup,/data-cell="fora\/fica" class="matrix-selected"/);
 fragments.push(['v8-live-panel',markup]);
 for(const cell of context.axesData.parametros.matriz){if(cell.caso){const c=context.caseData.casos.find(c=>c.id===cell.caso);assert.ok(c);assert.equal(c.modelo,cell.modelo);}else assert.equal(cell.modelo,null);}
 assert.equal(context.axesData.parametros.matriz.find(c=>c.id==='fora/muda').caso,'c19');
 // The method cannot change a decision merely by changing an affinity weight.
 const before=context.calculateDiagnostic(scenarios[0].state).decision,q=context.axesData.fatos.find(q=>q.id==='risco'),old=q.eixo.RISCO.sim;q.eixo.RISCO.sim=-2;
 assert.deepEqual(JSON.parse(JSON.stringify(context.calculateDiagnostic(scenarios[0].state).decision)),JSON.parse(JSON.stringify(before)));q.eixo.RISCO.sim=old;
});

test('V8b report uses destination articles, full dates and natural reasons without arrows or empty case labels',()=>{
 const expected={py:'para o Paraguai',uy:'para o Uruguai',pt:'para Portugal',es:'para a Espanha',it:'para a Itália',us:'para os EUA',ae:'para os Emirados'};
 for(const [id,text] of Object.entries(expected))assert.equal(context.destinationPhrase(id),text);
 for(const q of context.axesData.fatos)for(const option of q.opcoes){assert.ok(option.curta, q.id);assert.equal(option.curta[0],option.curta[0].toLocaleLowerCase('pt-BR'));assert.equal(context.factLabel(q.id,option.id,true),option.curta);}
 for(const scenario of scenarios){
  const report=context.diagnosticReport(scenario.state);fragments.push(['v8b-'+scenario.name,report]);
  assert.doesNotMatch(report,/→|&rarr;|&#(?:8594|x2192);|Sem caso documentado|Você respondeu:|Se a resposta a “/i);
  const date=report.match(/<time datetime="([^"]+)">([^<]+)<\/time>/);assert.ok(date);assert.match(date[2],/^\d{1,2} de [a-zç]+ de \d{4}$/);
  const reasons=Array.from(report.matchAll(/<h3>Por que<\/h3>([\s\S]*?)<p class="note account-note">/g),m=>m[1]);assert.equal(reasons.length,2);
  for(const reason of reasons)for(const line of reason.matchAll(/<p>([\s\S]*?)<\/p>/g))assert.match(line[1],/^Você respondeu <strong>.+<\/strong>\. [A-ZÁÉÍÓÚ]/);
 }
 const real=context.diagnosticReport(scenarios[0].state),presumed=context.diagnosticReport(scenarios[1].state);
 assert.match(real,/Mudar para o Paraguai/);assert.match(real,/Sair para o Paraguai/);assert.match(real,/Você respondeu <strong>ninguém se mudaria<\/strong>\./);
 assert.match(real,/No Lucro Real a empresa já paga 34% de IRPJ e CSLL, e o redutor zera o IR mínimo de quem fica\./);
 assert.match(real,/data-rule="v4"><strong>Mudar de país sai da conta:<\/strong>/);
 assert.match(presumed,/Você respondeu <strong>só clientes no Brasil<\/strong>\./);assert.match(presumed,/Você respondeu <strong>você e o cônjuge se mudariam<\/strong>\./);
 for(const regime of ['presumido','simples'])assert.match(context.diagnosticReport({...scenarios[1].state,facts:{...scenarios[1].state.facts,regime}}),/Usamos 15% como premissa conservadora/);
});

test('V8b counterfactuals use short phrases, lowercase verdicts and the recalculated tax difference',()=>{
 const company=context.diagnosticReport(scenarios[0].state),owner=context.diagnosticReport(scenarios[1].state);
 assert.match(company,/Se a folha fosse menos de R\$ 15 em cada R\$ 100, a empresa passaria a <strong>pode valer<\/strong>\./);
 assert.match(owner,/Se o motivo fosse segurança, mudar valeria pela qualidade de vida, e o imposto subiria R\$ 211\.200 por ano\./);
 for(const scenario of scenarios)for(const change of context.diagnosticChanges(scenario.state)){
  const next=context.diagnosticDecision(context.diagnosticFacts({mode:scenario.state.mode,facts:{...scenario.state.facts,[change.id]:change.value}}));
  assert.deepEqual(JSON.parse(JSON.stringify(change.decision)),JSON.parse(JSON.stringify(next)));
  if(change.verdict)assert.equal(change.verdict.charAt(0),change.verdict.charAt(0).toLocaleLowerCase('pt-BR'));
  assert.doesNotMatch(change.text,/passaria a a /);
 }
});

test('V8b matrix keeps row labels outside the cells and shows only paths, documented cases and selection',()=>{
 const expected=['Reorganizar no Brasil','Mudar de país','Fábrica no Paraguai','Fábrica e dono no Paraguai'];
 for(const mini of [false,true]){
  const markup=context.matrixMarkup(context.diagnosticDecision(scenarios[0].state.facts),false,mini);
  assert.match(markup,/>Você fica<\/text>/);assert.match(markup,/>Você se muda<\/text>/);
  assert.equal((markup.match(/class="matrix-row-label"/g)||[]).length,2);
  const cells=Array.from(markup.matchAll(/<g data-cell="([^"]+)"[^>]*>([\s\S]*?)<\/g>/g));assert.equal(cells.length,4);
  cells.forEach((cell,i)=>{
   const text=cell[2].replace(/<\/tspan><tspan[^>]*>/g,' ').replace(/<[^>]*>/g,'');assert.ok(text.includes(expected[i]));
   assert.doesNotMatch(cell[2],/Empresa fica|Empresa produz fora|Produz fora|matrix-row-label|Sem caso documentado/);
   const nome=context.axesData.parametros.matriz[i].nome;if(!nome)assert.doesNotMatch(cell[2],/matrix-case/);else assert.ok(cell[2].includes('class="matrix-case"')&&cell[2].includes('>'+nome.replace(/&/g,'&amp;')+'<'));
  });
  assert.equal((markup.match(/Seu resultado/g)||[]).length,1);
 }
});

test('V8b partial panel identifies missing energy and income; cover reads both modes from axesData',()=>{
 const preview=facts=>context.diagnosticPreviewMarkup({mode:'rapido',facts});
 assert.match(preview({industria:'sim',folha:'45'}),/Empresa: falta a energia/);
 assert.match(preview({industria:'sim',energia:'8'}),/Empresa: falta a folha/);
 assert.match(preview({industria:'sim'}),/Empresa: faltam a folha e a energia/);
 assert.match(preview({familia:'casal',motivo:'imposto'}),/Você: falta a renda/);
 assert.match(preview({familia:'ninguem',dividendos:80000}),/Você: falta a renda/);
 assert.doesNotMatch(preview(scenarios[0].state.facts),/falta a renda|falta a energia/);
 context.buildV5();assert.equal(node('homeDiagnosticTiming').textContent,context.axesData.modos.rapido+' · '+context.axesData.modos.completo);
 assert.match(node('homeDiagnosticTiming').textContent,/15 perguntas/);assert.match(node('homeDiagnosticTiming').textContent,/cerca de 40 perguntas/);
 assert.doesNotMatch(html.split('id="v-inicio"')[1].split('<!-- PERFIL -->')[0],/20 perguntas|78 no modo/);
});


test('V8c shared hash opens the report and active navigation without writing localStorage',()=>{
 const key='sair-ficar-diagnostico-v8',saved=JSON.stringify({...scenarios[2].state,done:true}),memory=new Map([[key,saved]]);let writes=0;
 context.localStorage={getItem:k=>memory.get(k)||null,setItem(){writes++;},removeItem(){writes++;}};
 const views=['inicio','perfil'].map(route=>({getAttribute:()=>route,classList:{toggle(k,v){this.on=v;}},route}));
 const nav={getAttribute:()=>'#perfil',setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];}};
 context.document.querySelectorAll=selector=>selector==='section.view'?views:selector==='nav.main a'?[nav]:[];
 const code=context.encodeDiagnostic(scenarios[0].state);context.location={href:'https://example.test/diagnostico/#perfil',hash:'#perfil/r='+code};
 context.route();const markup=node('diagnosticApp').innerHTML;fragments.push(['v8c-shared',markup]);
 assert.equal(views.find(v=>v.classList.on).route,'perfil');assert.equal(nav['aria-current'],'page');assert.equal(context.diagnosticState.done,true);
 assert.match(markup,/Resultado compartilhado\. As respostas são de quem enviou o link\./);assert.match(markup,/data-diag-action="fresh">Fazer o meu/);
 assert.match(markup,/Calculado com os dados do site em \d{1,2} de [a-zç]+ de \d{4}/);
 assert.match(markup,/O link contém suas respostas, inclusive os valores/);
 assert.ok(markup.indexOf('Copiar link do resultado')<markup.indexOf('>Refazer'));
 assert.doesNotMatch(context.diagnosticReport(scenarios[0].state),/Resultado compartilhado|Calculado com os dados do site/);
 context.persistDiagnostic();assert.equal(writes,0);assert.equal(memory.get(key),saved);
 const click=action=>node('diagnosticApp').listeners.click[0]({target:{closest:s=>s==='[data-diag-action]'?{dataset:{diagAction:action}}:null}});
 for(const action of ['fresh','restart']){
  context.location.hash='#perfil/r='+code;context.route();click(action);assert.equal(context.location.hash,'perfil/fresh');context.route();
  assert.equal(context.diagnosticState,null);assert.equal(context.diagnosticShared,false);assert.doesNotMatch(node('diagnosticApp').innerHTML,/Continuar de onde parou|Resultado compartilhado/);assert.equal(writes,0);
 }
 for(const hash of ['#perfil/r=7.bad','#perfil/r=','#perfil/r='+code.slice(0,-2),'#perfil/r=%E0%A4%A']){
  context.location.hash=hash;assert.doesNotThrow(()=>context.route());assert.match(node('diagnosticApp').innerHTML,/Este link é de uma versão anterior do diagnóstico ou está incompleto\. Refaça o teste\./);assert.equal(context.diagnosticState,null);assert.equal(writes,0);
 }
 context.location.hash='#perfil/r='+code;context.route();context.location.hash='#perfil';context.route();
 assert.match(node('diagnosticApp').innerHTML,/Continuar de onde parou/);assert.equal(memory.get(key),saved);
 context.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};context.location.hash='#perfil/r='+code;assert.doesNotThrow(()=>context.route());assert.match(node('diagnosticApp').innerHTML,/Resultado compartilhado/);
 context.document.querySelectorAll=()=>[];context.diagnosticIntro(true);
});

test('V8c share handler copies, selects fallback, invokes native mobile share and handles cancellation',async()=>{
 context.diagnosticState={...scenarios[0].state,done:true};context.location={href:'https://example.test/?origem=teste#perfil'};
 const url='https://example.test/?origem=teste#perfil/r='+context.encodeDiagnostic(context.diagnosticState),status=node('diagnosticShareStatus'),input=node('diagnosticShareLink');let selected=false,copied='',shared;
 input.select=()=>selected=true;context.window.matchMedia=()=>({matches:false});context.navigator={clipboard:{async writeText(value){copied=value;}}};
 const click=()=>node('diagnosticApp').listeners.click[0]({target:{closest:s=>s==='[data-diag-action]'?{dataset:{diagAction:'share'}}:null}});
 await click();assert.equal(copied,url);assert.equal(status.textContent,'Link copiado.');assert.equal(input.hidden,true);
 for(const navigator of [{},{clipboard:{async writeText(){throw Error('denied');}}}]){
  selected=false;context.navigator=navigator;await click();assert.equal(input.value,url);assert.equal(input.hidden,false);assert.equal(selected,true);assert.equal(context.document.activeElement,input);assert.doesNotMatch(status.textContent,/Link copiado/);
 }
 context.window.matchMedia=()=>({matches:true});copied='';context.navigator={async share(value){shared=value;},clipboard:{async writeText(value){copied=value;}}};
 await click();assert.equal(shared.url,url);assert.equal(shared.title,context.calculateDiagnostic(context.diagnosticState).decision.headline);assert.equal(copied,'');assert.equal(input.hidden,true);
 context.navigator.share=async()=>{throw Object.assign(Error('cancelled'),{name:'AbortError'});};await click();assert.equal(copied,'');assert.equal(status.textContent,'');
 context.navigator.share=async()=>{throw Error('unavailable');};await click();assert.equal(copied,url);assert.equal(status.textContent,'Link copiado.');
 context.window.matchMedia=()=>({matches:false});context.diagnosticIntro(true);
});

test('V6 cases replace boxed cards with one expandable row per record and preserve every narrative and source',()=>{
  for(const key of ['setor','destino','modelo','resultado'])node('case-'+key).value='';context.renderCases();
  const markup=node('caseList').innerHTML+context.aggregatesMarkup();
  // V5: 34 .case-card boxes and one .aggregate-strip grid; V6: none.
  assert.doesNotMatch(markup,/class="(?:case-card|aggregate-strip|sector-tile|match-note)\b/);
  assert.equal((markup.match(/<details class="case-entry"/g)||[]).length,context.caseRecords().length);
  assert.equal((markup.match(/class="aggregate-lead"/g)||[]).length,3);
  assert.equal((markup.match(/class="aggregate-line"/g)||[]).length,4);
  for(const c of context.caseRecords()){
    const row=context.caseCard(c,true);
    for(const key of ['motivo','mudanca_valor','desafios','resumo'])if(c[key])assert.ok(row.includes(context.copy(c[key])));
    if(c.citacao)assert.ok(row.includes(context.esc(c.citacao)));
    for(const source of c.fontes)if(source.u)assert.ok(row.includes(context.esc(source.u)));
    assert.doesNotMatch(row,/class="breadcrumb"/);
    assert.match(row,/<summary>/);assert.match(row,/class="case-detail"/);
  }
});

test('V7 scenarios route renders six accessible, sourced screens and three real cover drawings',()=>{
  const markup=context.scenariosMarkup();fragments.push(['v7-scenarios',markup]);
  const screens=markup.split('<section class="scenario-screen"').slice(1);
  assert.equal(screens.length,6);
  for(const screen of screens){
    assert.match(screen,/<h2>/);assert.match(screen,/class="scenario-note"/);assert.match(screen,/class="source-note"/);
    assert.match(screen,/<svg[^>]+role="img"[^>]+aria-label="[^"]+"/);
    for(const svg of screen.matchAll(/<svg\b[^>]*>/g)){assert.match(svg[0],/role="img"/);assert.match(svg[0],/aria-label="[^"]+"/);}
  }
  assert.match(markup,/conta ilustrativa|Conta ilustrativa/);assert.doesNotMatch(markup,/linearGradient|radialGradient|<image\b/);
  const cover=context.homeScenariosMarkup();fragments.push(['v7-cover',cover]);
  assert.equal((cover.match(/<svg\b/g)||[]).length,3);assert.equal((cover.match(/data-scenario-jump=/g)||[]).length,3);
  assert.ok(html.indexOf('id="homeScenarios"')>html.indexOf('class="tiles"'));
  assert.match(html,/<a href="#perfil">Diagnóstico<\/a><a href="#cenarios">Cenários<\/a><a href="#casos">/);
  const views=Array.from(html.matchAll(/<section class="view(?: on)?" id="v-([^"]+)" data-route="([^"]+)"/g),m=>({getAttribute:()=>m[2],classList:{toggle(k,v){this.on=v;}},route:m[2]}));
  const original=context.document.querySelectorAll;context.document.querySelectorAll=s=>s==='section.view'?views:[];
  node('v-cenarios').querySelector=()=>({setAttribute(){},focus(){}});context.location.hash='#cenarios';context.route();
  assert.equal(views.find(v=>v.classList.on).route,'cenarios');assert.match(context.document.title,/Cenários explicados/);
  let jumped=false,focused=false;node('cenario-fabrica').scrollIntoView=()=>{jumped=true;};node('cenario-fabrica').querySelector=()=>({setAttribute(){},focus(){focused=true;}});
  context.pendingScenarioJump='fabrica';context.route();assert.equal(jumped,true);assert.equal(focused,true);assert.equal(context.pendingScenarioJump,'');context.document.querySelectorAll=original;
});
test('V7 flow uses stayTax/goTax for 30, 80 and 200 thousand under both corporate rates; slider redraws',()=>{
  const expected={30000:[0,0],80000:[57600,0],200000:[240000,0]};
  for(const monthly of [30000,80000,200000])for(const [i,corp] of [.15,.34].entries()){
    const a=context.scenarioAccount(monthly,corp);
    assert.equal(a.stayTax,context.stayTax(monthly,corp).total);assert.equal(a.goTax,context.goTax(monthly,0,true).total);
    assert.equal(a.stayTax,expected[monthly][i]);assert.equal(a.goTax,monthly*1.2);
    assert.equal(a.stayNet,monthly-a.stayTax/12);assert.equal(a.goNet,monthly*.9);
    const flow=context.flowMarkup(monthly);assert.ok(flow.includes(context.fmtBRL(a.stayNet)));assert.ok(flow.includes(context.fmtBRL(a.goNet)));
    node('scenarioMonthly').value=String(monthly);context.updateScenarioFlow();assert.equal(node('scenarioFlow').innerHTML,flow);assert.match(node('scenarioFlowSummary').textContent,/líquidos por mês/);
    fragments.push(['flow-'+monthly+'-'+corp,flow]);
  }
  assert.notEqual(context.flowMarkup(30000),context.flowMarkup(200000));
  assert.match(context.flowMarkup(100000),/Empate/);assert.match(context.flowMarkup(100000),/R\$ 10\.000 a mais/);
});
test('V7 payroll calculation produces the specified ranges from aggregate a5',()=>{
  const account=context.payrollAccount(3000);
  assert.deepEqual(Array.from(account.br),[4800,6000]);assert.deepEqual(Array.from(account.py),[3750,4050]);
  assert.deepEqual(Array.from(account.brRates),[60,100]);assert.deepEqual(Array.from(account.pyRates),[25,35]);
  const markup=context.scenariosMarkup();assert.match(markup,/3\.000 × 1,60/);assert.match(markup,/pode superar esse patamar/);
});
test('V7 sector pictograms and residency dot fractions preserve all source counts',()=>{
  for(const n of [89,47,30])assert.equal((context.factoryPictograms(n,'setor').match(/data-factory="1"/g)||[]).length,n);
  for(const [i,total,brazil] of [[1,40600,23526],[2,14275,9195]]){
    const d=context.residenceData(i);assert.equal(d.total,total);assert.equal(d.brazil,brazil);
    const dots=context.residenceDots(d,'período');assert.equal(Array.from(dots.matchAll(/data-people="(\d+)"/g),m=>Number(m[1])).reduce((a,b)=>a+b,0),total);
    const brazilDots=context.dotGroup(d.brazil,'var(--data)',10);assert.equal(Array.from(brazilDots.matchAll(/data-people="(\d+)"/g),m=>Number(m[1])).reduce((a,b)=>a+b,0),brazil);
  }
});
test('V7 timeline includes every dated norm and case, sorts dates, preserves precision and combines filters',()=>{
  const all=Array.from(context.timelineMilestones());assert.ok(all.length>=STUDY.normas.filter(n=>/\d{4}/.test(n.data)).length);
  for(const n of context.study.normas.filter(n=>n.data))assert.equal(all.filter(m=>m.norma===n.id).length,1);
  for(const c of context.caseData.casos.filter(c=>/\d{4}/.test(c.quando)))assert.ok(all.some(m=>m.id==='caso-'+c.id));
  for(let i=1;i<all.length;i++)assert.ok(all[i-1].sortDate.padEnd(10,'-00')>=all[i].sortDate.padEnd(10,'-00'));
  assert.equal(all.find(m=>m.id==='caso-c2').sortDate,'2026-05-18');assert.equal(all.find(m=>m.id==='caso-c17').sortDate,'2011');
  assert.equal(all.find(m=>m.norma==='uy-20446').date,'2025-12 / 2026-08');
  for(const id of ['maquila-1997','maquiladoras-2025','exportacoes-2025','abimo-2026'])assert.ok(all.some(m=>m.id===id));
  for(const type of ['lei','decisão','empresa','número'])for(const country of ['','Brasil','Paraguai']){
    node('timeline-type').value=type;node('timeline-country').value=country;context.renderTimeline();
    const ids=Array.from(node('normTimeline').innerHTML.matchAll(/data-milestone="([^"]+)"/g),m=>m[1]);
    assert.deepEqual(ids,all.filter(m=>m.type===type&&(!country||m.country===country)).map(m=>m.id));
  }
  node('timeline-type').value='';node('timeline-country').value='';context.renderTimeline();capture('v7-timeline','normTimeline');
  assert.equal((context.miniTimelineMarkup().match(/<li>/g)||[]).length,6);
  assert.match(node('normTimeline').innerHTML,/até 20 anos renováveis/);assert.match(node('normTimeline').innerHTML,/US\$ 1,26 bilhão/);
});
test('V7 material manifest is embedded exactly; all local images carry descriptive metadata and match source URLs',()=>{
  assert.deepEqual(JSON.parse(JSON.stringify(context.materials)),JSON.parse(readFileSync(path.join(root,'img/materiais/indice.json'),'utf8')));
  assert.equal(context.materials.length,JSON.parse(readFileSync(path.join(root,"img/materiais/indice.json"),"utf8")).length);context.renderSources();capture('v7-documents','sourceMaterials');
  for(const m of context.materials){assert.ok(readFileSync(path.join(root,'img/materiais',m.arquivo)).length>0);assert.ok(node('sourceMaterials').innerHTML.includes(m.arquivo));}
  for(const m of context.timelineMilestones()){
    const images=context.materialMatches(m.sources),markup=context.milestoneMarkup(m);
    for(const image of images){assert.ok(m.sources.some(s=>s.u===image.u));assert.ok(markup.includes(image.arquivo));}
  }
  for(const c of context.caseRecords())for(const image of context.materialMatches(c.fontes))assert.ok(context.caseCard(c,true).includes(image.arquivo));
  context.renderSector('farma');capture('v7-pharma-materials','sectorReport');for(const name of ['anvisa.webp'])assert.ok(node('sectorReport').innerHTML.includes(name));
  const combined=fragments.map(f=>f[1]).join('\n');const images=Array.from(combined.matchAll(/<img\b[^>]*>/g),m=>m[0]);assert.ok(images.length>=context.materials.length);
  for(const img of images){assert.match(img,/src="img\/materiais\/[^"/]+\.webp"/);assert.match(img,/alt="Recorte de [^"]+"/);assert.match(img,/width="[1-9]\d*"/);assert.match(img,/height="[1-9]\d*"/);assert.match(img,/loading="lazy"/);}
  assert.doesNotMatch(combined,/<img[^>]*src="http/);
});
test('V7 actual UI handlers open/close accessible material dialog, restore focus and keep captions on failed images',()=>{
  const events={},oldAdd=context.document.addEventListener;context.document.addEventListener=(event,fn)=>events[event]=fn;
  context.buildV7();assert.ok(events.click);assert.ok(events.error);assert.ok(node('scenarioMonthly').listeners.input.includes(context.updateScenarioFlow));
  let open=false,focused=false;const opener={dataset:{material:'anvisa.webp'},isConnected:true,focus(){focused=true;}};
  node('materialDialog').showModal=()=>{open=true;};node('materialDialog').close=()=>{open=false;node('materialDialog').listeners.close.forEach(fn=>fn());};
  events.click({target:{closest:s=>s==='[data-material]'?opener:null}});assert.equal(open,true);assert.match(node('materialContent').innerHTML,/anvisa\.webp/);assert.match(node('materialContent').innerHTML,/Ler no original/);
  fragments.push(['v7-dialog',node('materialContent').innerHTML]);node('materialClose').listeners.click[0]();assert.equal(open,false);assert.equal(focused,true);
  assert.match(html,/<dialog id="materialDialog" aria-labelledby="materialTitle">/);assert.doesNotMatch(functionSource('buildV7'),/cancel.*preventDefault/);
  let fallback;const oldCreate=context.document.createElement;context.document.createElement=()=>({});const img={tagName:'IMG',hidden:false,after(element){fallback=element;}};
  events.error({target:img});assert.equal(img.hidden,true);assert.match(fallback.textContent,/legenda e a fonte continuam/);
  context.document.createElement=oldCreate;context.document.addEventListener=oldAdd;
});

test('No dynamic code execution; CSP blocks connections, frames and remote images',()=>{
  assert.doesNotMatch(html,/\beval\s*\(|\bnew\s+Function\b|<iframe\b|<img\b[^>]*src=["']http/i);
  assert.match(html,/connect-src 'none'/);assert.match(html,/frame-src 'none'/);assert.match(html,/img-src 'self' data:/);
});

test('No iframe or remote image in static or generated HTML; generated links all resolve',()=>{
  const combined=html+'\n'+fragments.map(f=>f[1]).join('\n');
  assert.doesNotMatch(combined,/<iframe\b/i);assert.doesNotMatch(combined,/<img\b[^>]*\bsrc\s*=\s*["']?https?:/i);
  const routes=new Set(['inicio','perfil','cenarios','destinos','ascensao','simulador','custos','artigos','fontes','mudancas','mitos','normas','relatos','biblioteca',...Array.from(context.articles,a=>a.id),...Array.from(context.study.normas,n=>'norma-'+n.id),...Array.from(context.countries,c=>'pais-'+c.slug),'casos',...Array.from(context.caseData.setores,s=>'setor-'+s.id),...Array.from(context.caseRecords(),c=>'caso-'+c.id)]);
  for(const [,markup]of fragments)for(const match of markup.matchAll(/href=["']#([^"']+)/g))assert.ok(routes.has(match[1]),match[1]);
});

test('Generated HTML is balanced, with no duplicate IDs within each rendered surface',()=>{
  const code = `import json,sys\nsys.dont_write_bytecode=True\nsys.path.insert(0,'tests')\nfrom validate_html import Validator\nfor name,html in json.load(sys.stdin):\n v=Validator(name);v.feed(html);v.finish(check_refs=False)\n`;
  const result=spawnSync('python3',['-c',code],{cwd:root,input:JSON.stringify(fragments),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.ok(fragments.length>=36);
});
