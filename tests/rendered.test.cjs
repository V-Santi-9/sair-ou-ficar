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
const context = createContext({fmtBRL:v=>'R$ '+Math.round(v).toLocaleString('pt-BR'),setTimeout,el:node, document:{querySelectorAll:()=>[],getElementById:node,body:node('body')}, css:()=> '#555555'});
for (const name of ['articles','dests','simDests','costs']) runInContext(declaration(name,'\n  ];'),context);
for (const name of ['myths','countries']) runInContext(declaration(name,'\n  ];'),context);
for (const name of ['editorialTitles','portaTxt','mapStops','exits','resultLabels','statusShapes']) runInContext(declaration(name,';'),context);
for (const name of ['readingTime','longDates','articleTitle','articleIndex','showArticle','irpfmRate','stayTax','goTax','profileResult','profileReasons','showMapCard','renderCompare','buildMyths','drawExits']) runInContext(functionSource(name),context);
runInContext(script.split('\n').find(line=>line.startsWith('  var study = ')),context);
const v4Functions=['esc','dateText','copy','sourceLink','statusBadge','dossierLink','countryOf','countryItems','selectFilter','unique','emptyText','attentionNorms','normReferences','filterNorms','normRow','renderNorms','renderTimeline','storyMarkup','storyGroups','renderStories','videoMarkup','mediaMarkup','renderLibrary','numberMarkup','renderCountry','sourceGroups','renderSources','buildStudy'];
for (const name of v4Functions) runInContext(functionSource(name),context);
for(const name of ['axesData','caseData'])runInContext(script.split('\n').find(line=>line.startsWith('  var '+name+' = ')),context);
const v5Functions=['applicable','diagnosticQuestions','ruleMatches','calculateDiagnostic','sectorMembership','caseRecords','compatibleSize','similarCases','sectorName','resultName','caseCard','caseTable','aggregatesMarkup','sectorMarkup','renderCases','renderSector','ownerAccount','calculationMarkup','signed','pathNextSteps','diagnosticReport','ruleMarkup','persistDiagnostic','readDiagnostic','diagnosticIntro','renderDiagnostic','saveDiagnosticAnswer','advanceDiagnostic','closeNavigation','updateTopButton','buildV5'];
for(const name of v5Functions)runInContext(functionSource(name),context);
for(const name of ['materials'])runInContext(script.split('\n').find(line=>line.startsWith('  var '+name+' = ')),context);
const v7Functions=['materialMatches','materialImage','materialFigure','materialsMarkup','openMaterial','closeMaterial','restoreMaterialFocus','materialFailure','scenarioSVG','scenarioSources','scenarioScreen','aggregate','aggregateSource','scenarioAccount','dividendFlow','flowMarkup','updateScenarioFlow','payrollAccount','factoryDrawing','gaugeSVG','productionMap','factoryPictograms','person','ownerDrawing','pharmaSymbol','residenceData','dotGroup','residenceDots','scenariosMarkup','milestoneDate','timelineMilestones','milestoneMarkup','miniTimelineMarkup','homeScenariosMarkup','focusScenario','buildV7'];
for(const name of v7Functions)runInContext(functionSource(name),context);
context.pendingScenarioJump='';context.diagnosticState=null;context.diagnosticSaved=null;context.diagnosticStorage=true;
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
test('Rapid uses only applicable core questions; complete respects all conditional branches',()=>{
  for(const industria of ['sim','terceiro','nao',null])for(const familia of ['so','casal','filhos','ninguem',null])for(const setor of context.caseData.setores.map(s=>s.id))for(const mode of ['rapido','completo']){
    const facts={industria,familia,setor};const actual=Array.from(context.diagnosticQuestions(mode,facts),q=>q.id);
    const expected=[...context.axesData.fatos.filter(q=>mode==='completo'||q.nucleo),...context.axesData.afirmacoes.filter(q=>(mode==='completo'||q.nucleo)&&(!q.se||Object.entries(q.se).every(([key,options])=>options.includes(facts[key]))))].map(q=>q.id);
    assert.deepEqual(actual,expected);assert.ok(actual.length<=78);if(mode==='rapido')assert.equal(actual.length,21);
  }
  assert.equal(context.diagnosticQuestions('completo',{industria:'sim',familia:'filhos',setor:'farma'}).length,78);
  assert.ok(context.diagnosticQuestions('completo',{industria:'nao',familia:'so',setor:'varejo'}).length<78);
});
const scenarios=require('./v5-scenarios.cjs');
test('Three hand-worked profiles produce exact axes, expected paths, alerts and unchanged owner arithmetic',()=>{
  for(const scenario of scenarios){
    const result=context.calculateDiagnostic(scenario.state);
    for(const [id,value]of Object.entries(scenario.expected))assert.ok(Math.abs(result.axes[id].value-value)<1e-9,scenario.name+' '+id);
    assert.equal(result.paths[0].id,scenario.top,scenario.name);
    if(scenario.rule)assert.ok(result.rules.some(r=>r.id===scenario.rule));
    const account=context.ownerAccount(scenario.state.facts,result.paths[0]);assert.ok(Math.abs(account.stayAll-scenario.stay)<1e-7);assert.ok(Math.abs(account.goAll-scenario.go)<1e-7);
    const report=context.diagnosticReport(scenario.state);fragments.push(['scenario-'+scenario.top,report]);assert.match(report,/Como calculamos/);assert.match(report,/Próximos passos/);assert.equal((report.match(/class="axis-track"/g)||[]).length,8);
    for(const p of result.paths){const ids=Object.keys(p.ideal);const distance=Math.sqrt(ids.reduce((sum,id)=>sum+(scenario.expected[id]-p.ideal[id]*50)**2,0));const expected=Math.min(100,100-100*distance/(200*Math.sqrt(ids.length))+10*p.notes.filter(r=>r.tipo==='reforco').length);assert.ok(Math.abs(p.affinity-expected)<1e-9);}
  }
});
test('Veto v1 removes maquila without a factory; v2 flags pharmaceuticals and REG threshold uses /50',()=>{
  const state={mode:'rapido',facts:{industria:'nao',setor:'varejo'},answers:{}};
  let result=context.calculateDiagnostic(state);assert.ok(result.rules.some(r=>r.id==='v1'));assert.ok(!result.paths.some(p=>p.id==='maquila'));
  assert.match(context.diagnosticReport(state),/data-rule="v1"/);
  for(const industry of ['sim','terceiro','nao']){result=context.calculateDiagnostic({...state,facts:{industria:industry,setor:'farma'}});assert.ok(result.rules.some(r=>r.id==='v2'));}
  assert.ok(context.calculateDiagnostic({...state,facts:{industria:'sim',setor:'textil'},answers:{r1:1}}).rules.some(r=>r.id==='v2'));
  assert.ok(!context.calculateDiagnostic({...state,facts:{industria:'sim',setor:'textil'},answers:{r1:0}}).rules.some(r=>r.id==='v2'));
});
test('Safe rule parser covers precedence, missing values, lists and rejects execution',()=>{
  const values={industria:'nao',setor:'varejo',REG:1,MOB:2,REND:-1,dividendos:80000,cidadania:'ue',familia:'casal',capital:null,regime:'real'};
  for(const id of ['v1','v2','v3','v7','v8'])assert.equal(context.ruleMatches(context.axesData.regras.find(r=>r.id===id).se,values),true,id);
  for(const id of ['v4','v5','v6'])assert.equal(context.ruleMatches(context.axesData.regras.find(r=>r.id===id).se,values),false,id);
  assert.equal(context.ruleMatches("REG == 1 || MOB == 0 && REND == 0",values),true);
  assert.equal(context.ruleMatches("(REG == 1 || MOB == 0) && REND == 0",values),false);
  for(const expression of ['constructor.constructor(1)','REG >= 1; process.exit()','REG >= 1 rubbish',"setor in ['varejo'",'MISSING == 0'])assert.equal(context.ruleMatches(expression,values),false);
});
test('Skipped questions are zero but missing axes are marked; hidden answers never affect score',()=>{
  const blank={mode:'completo',facts:{industria:'nao',familia:'so',setor:'textil'},answers:{}};
  const a=context.calculateDiagnostic(blank),b=context.calculateDiagnostic({...blank,answers:{m2:2,r2:2,p3:2,p4:2}});
  assert.deepEqual(JSON.parse(JSON.stringify(a.axes)),JSON.parse(JSON.stringify(b.axes)));
  assert.ok(Object.values(context.calculateDiagnostic({mode:'completo',facts:{},answers:{}}).axes).every(x=>x.noData&&x.value===0));
  const neutral=context.calculateDiagnostic({mode:'rapido',facts:{},answers:{c5:0}});assert.equal(neutral.axes.INS.noData,false);assert.equal(neutral.axes.INS.value,0);
  const partial=context.calculateDiagnostic({mode:'rapido',facts:{},answers:{m1:2}});assert.equal(partial.axes.MERC.value,50);assert.equal(partial.axes.MERC.denominator,4);
});
test('Pharma report preserves c9 caveat and both regulatory sources',()=>{
  const report=context.diagnosticReport({...scenarios[0].state,facts:{...scenarios[0].state.facts,setor:'farma'}});
  assert.match(report,/Não achamos caso do seu setor|Blink Bioscience/);assert.match(report,/Não é medicamento humano/);assert.match(report,/Fontes regulatórias do setor farmacêutico/);assert.match(report,/data-rule="v2"/);
  for(const source of context.caseData.fontes_regulatorias_farma)assert.ok(report.includes(source.u));fragments.push(['pharma-report',report]);
});
test('Similarity scores use supplied evidence, stable ordering and at most five cases',()=>{
  const s=scenarios[0].state,result=context.calculateDiagnostic(s),matches=context.similarCases(s.facts,result.paths[0]);assert.equal(matches.length,5);assert.equal(matches[0].record.id,'c1');assert.equal(matches[0].score,7);
  for(const m of matches)assert.equal(m.score,m.reasons.reduce((a,r)=>a+r[1],0));
  for(const m of context.similarCases(scenarios[2].state.facts,context.calculateDiagnostic(scenarios[2].state).paths[0]))if(m.record.relato)assert.ok(m.reasons.every(r=>r[0]!=='Modelo do caminho'&&r[0]!=='Porte compatível'));
});
test('All 34 records have canonical anchors, all 13 sectors only contain linked records; filters combine and reset',()=>{
  for(const k of ['setor','destino','modelo','resultado'])node('case-'+k).value='';context.renderCases();capture('all-cases','caseList');
  const markup=node('caseList').innerHTML;assert.equal((markup.match(/id="caso-/g)||[]).length,34);
  for(const record of context.caseRecords())assert.equal((markup.match(new RegExp('id="caso-'+record.id+'"','g'))||[]).length,1);
  for(const sector of context.caseData.setores){context.renderSector(sector.id);const actual=Array.from(node('sectorReport').innerHTML.matchAll(/data-case="([^"]+)"/g),m=>m[1]);const expected=Array.from(context.caseRecords().filter(c=>c.sectors.includes(sector.id)),c=>c.id);assert.deepEqual(actual,expected);capture('sector-'+sector.id,'sectorReport');}
  for(const [key,value]of [['setor','textil'],['destino','Paraguai'],['modelo','terceirizacao'],['resultado','em_operacao']]){node('case-'+key).value=value;context.renderCases();}
  assert.match(node('caseList').innerHTML,/data-case="c3"/);assert.equal((node('caseList').innerHTML.match(/data-case=/g)||[]).length,1);
  node('case-destino').value='Portugal';context.renderCases();assert.match(node('caseList').innerHTML,/Nenhum caso/);assert.match(node('caseList').innerHTML,/Limpar filtros/);capture('empty-cases','caseList');
  for(const k of ['setor','destino','modelo','resultado'])node('case-'+k).value='';
});
test('Every applicable question renders; localStorage denial, malformed data and resume are safe',()=>{
  context.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert.doesNotThrow(()=>context.diagnosticIntro());capture('intro-denied','diagnosticApp');
  assert.doesNotThrow(()=>context.persistDiagnostic());assert.match(node('diagnosticSave').textContent,/não permitiu/);
  const state={version:5,mode:'completo',facts:{...scenarios[0].state.facts,setor:'farma',familia:'filhos'},answers:{},step:0};context.diagnosticState=state;
  for(let i=0;i<78;i++){state.step=i;context.renderDiagnostic(false);capture('v5-question-'+i,'diagnosticApp');}
  context.localStorage={getItem:()=>'{broken'};assert.equal(context.readDiagnostic(),null);
  context.localStorage={getItem:()=>JSON.stringify({...state,step:999,facts:{setor:'farma',industria:'bad',dividendos:-1},answers:{c5:2,m1:999,unknown:2}})};
  const saved=context.readDiagnostic();assert.equal(saved.facts.setor,'farma');assert.equal(saved.facts.industria,undefined);assert.equal(saved.facts.dividendos,undefined);assert.equal(saved.answers.m1,undefined);assert.equal(saved.answers.c5,2);assert.ok(saved.step<78);
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
test('Real UI handlers start, skip, go back, persist, resume, use keyboard and transfer exact inputs to simulator',()=>{
  const memory=new Map();context.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  context.document.addEventListener=()=>{};context.window.addEventListener=()=>{};
  context.document.documentElement={scrollHeight:2000};context.window.innerHeight=800;
  context.buildV5();capture('v5-home-sectors','homeSectors');capture('v5-aggregates','caseAggregates');capture('v5-filters','caseFilters');
  const app=node('diagnosticApp');const click=(key,value)=>app.listeners.click[0]({target:{closest:selector=>selector==='[data-diag-'+key+']'?{dataset:{[key==='mode'?'diagMode':'diagAction']:value}}:null}});
  app.querySelector=selector=>{assert.equal(selector,'input[name=diagnosticMode]:checked');return {value:'rapido'};};
  click('action','start');assert.equal(context.diagnosticState.step,0);assert.equal(context.diagnosticState.mode,'rapido');
  click('action','skip');assert.equal(context.diagnosticState.facts.setor,null);assert.equal(context.diagnosticState.step,1);
  node('diagnosticForm').querySelector=()=>null;click('action','back');assert.equal(context.diagnosticState.step,0);
  const form=node('diagnosticForm');form.querySelector=()=>({value:'textil'});app.listeners.submit[0]({target:{id:'diagnosticForm'},preventDefault(){}});assert.equal(context.diagnosticState.facts.setor,'textil');assert.equal(context.diagnosticState.step,1);
  // Persist numeric changes without blur. Invalid numbers do not advance.
  context.diagnosticState.step=6;context.renderDiagnostic(false);node('diagnosticAmount').value='80000';app.listeners.input[0]({target:{id:'diagnosticAmount'}});assert.equal(context.diagnosticState.facts.dividendos,80000);
  node('diagnosticAmount').value='-1';app.listeners.submit[0]({target:{id:'diagnosticForm'},preventDefault(){}});assert.equal(context.diagnosticState.step,6);assert.match(node('diagnosticError').textContent,/Valores/);
  node('diagnosticAmount').value='80000';app.listeners.submit[0]({target:{id:'diagnosticForm'},preventDefault(){}});node('diagnosticAmount').value='20000';app.listeners.submit[0]({target:{id:'diagnosticForm'},preventDefault(){}});
  context.diagnosticState.step=10;context.renderDiagnostic(false);const radios=[2,1,0,-1,-2].map(v=>({value:String(v),focus(){},checked:false}));form.querySelectorAll=()=>radios;form.querySelector=()=>radios.find(r=>r.checked)||null;
  app.listeners.keydown[0]({key:'5',target:{matches:()=>true},preventDefault(){}});assert.equal(context.diagnosticState.answers.m1,-2);
  app.listeners.keydown[0]({key:'Enter',target:{matches:()=>true},preventDefault(){}});assert.equal(context.diagnosticState.step,11);
  context.diagnosticIntro();click('action','resume');assert.equal(context.diagnosticState.step,11);assert.equal(context.diagnosticState.facts.dividendos,80000);
  while(!context.diagnosticState.done)click('action','skip');assert.match(app.innerHTML,/>Seu retrato</);assert.match(app.innerHTML,/sem dados/);
  const saved=JSON.parse(memory.get('sair-ficar-diagnostico-v5'));assert.equal(saved.done,true);
  context.sel={value:''};let applied=0;context.applyDest=()=>applied++;context.location={hash:'#perfil'};click('action','simulator');assert.equal(node('divMes').value,80000);assert.equal(node('invExt').value,20000);assert.equal(node('corpRate').value,15);assert.equal(node('custoVida').value,0);assert.equal(applied,1);assert.equal(context.location.hash,'simulador');
  app.querySelector=()=>node('dummy');
  click('action','restart');assert.equal(context.diagnosticState,null);assert.equal(memory.has('sair-ficar-diagnostico-v5'),false);
  // Changing a fact drops now-hidden answers, without retaining their score.
  context.diagnosticState={version:5,mode:'completo',step:1,facts:{industria:'sim'},answers:{m2:2,c2:2,c8:2,r3:2}};form.querySelector=()=>({value:'nao'});context.saveDiagnosticAnswer(false,true);assert.deepEqual(Object.keys(context.diagnosticState.answers),[]);
  context.localStorage={getItem:()=>JSON.stringify(saved),removeItem(){throw Error('denied');},setItem(){throw Error('denied');}};click('action','restart');assert.doesNotMatch(app.innerHTML,/Continuar de onde parou/);
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
test('V6 cover has no eyebrow and intro shows eight neutral axes with a radio choice and one start action',()=>{
  const home=html.split('id="v-inicio"')[1].split('<!-- PERFIL -->')[0];
  assert.doesNotMatch(home,/class="eyebrow"|Residência fiscal e negócios/);
  context.diagnosticIntro(true);const intro=node('diagnosticApp').innerHTML;
  assert.equal((intro.match(/class="preview-track"/g)||[]).length,8);
  assert.equal((intro.match(/name="diagnosticMode"/g)||[]).length,2);
  assert.equal((intro.match(/data-diag-action="start"/g)||[]).length,1);
  assert.doesNotMatch(intro,/class="mode-card"/);
});
test('V6 reports use words on axes, integer accessible scores and one sorted bar chart',()=>{
  for(const scenario of scenarios){
    const result=context.calculateDiagnostic(scenario.state),report=context.diagnosticReport(scenario.state);
    const axes=report.split('<div class="axes-grid">')[1].split('<details class="calculation">')[0];
    const text=axes.replace(/<[^>]*>/g,'');
    assert.doesNotMatch(text,/[+-]?\d+[,.]\d+/);
    assert.equal((axes.match(/class="axis-reading"/g)||[]).length,8);
    for(const axis of context.axesData.eixos)assert.ok(axes.includes(context.esc(axis.nome+': '+Math.round(result.axes[axis.id].value))));
    assert.match(text,/com força|moderado|de leve|equilibrado|sem dados/);
    const paths=Array.from(report.matchAll(/class="path-bar(?: primary-path)?" data-path="([^"]+)"/g),m=>m[1]);
    assert.deepEqual(paths,Array.from(result.paths,p=>p.id));
    assert.equal((report.match(/class="path-bar primary-path"/g)||[]).length,1);
    assert.equal((report.match(/>Ler o dossiê</g)||[]).length,Math.min(2,result.paths.length));
    assert.doesNotMatch(report,/<h2>\d+\.|Semelhança: \d|class="path-card"/);
    for(const rule of result.rules)assert.equal((report.match(new RegExp('data-rule="'+rule.id+'"','g'))||[]).length,1);
  }
});
test('V6 cases replace boxed cards with 34 expandable rows and preserve every narrative and source',()=>{
  for(const key of ['setor','destino','modelo','resultado'])node('case-'+key).value='';context.renderCases();
  const markup=node('caseList').innerHTML+context.aggregatesMarkup();
  // V5: 34 .case-card boxes and one .aggregate-strip grid; V6: none.
  assert.doesNotMatch(markup,/class="(?:case-card|aggregate-strip|sector-tile|match-note)\b/);
  assert.equal((markup.match(/<details class="case-entry"/g)||[]).length,34);
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
  const routes=new Set(['inicio','perfil','cenarios','destinos','simulador','custos','artigos','fontes','mudancas','mitos','normas','relatos','biblioteca',...Array.from(context.articles,a=>a.id),...Array.from(context.study.normas,n=>'norma-'+n.id),...Array.from(context.countries,c=>'pais-'+c.slug),'casos',...Array.from(context.caseData.setores,s=>'setor-'+s.id),...Array.from(context.caseRecords(),c=>'caso-'+c.id)]);
  for(const [,markup]of fragments)for(const match of markup.matchAll(/href=["']#([^"']+)/g))assert.ok(routes.has(match[1]),match[1]);
});

test('Generated HTML is balanced, with no duplicate IDs within each rendered surface',()=>{
  const code = `import json,sys\nsys.dont_write_bytecode=True\nsys.path.insert(0,'tests')\nfrom validate_html import Validator\nfor name,html in json.load(sys.stdin):\n v=Validator(name);v.feed(html);v.finish(check_refs=False)\n`;
  const result=spawnSync('python3',['-c',code],{cwd:root,input:JSON.stringify(fragments),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.ok(fragments.length>=36);
});
