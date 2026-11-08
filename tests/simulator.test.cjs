// Run: node --test tests/simulator.test.cjs
// Executes the actual functions from index.html, not copies of the formulas.
const { readFileSync } = require('node:fs');
const { Script, createContext, runInContext } = require('node:vm');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const html = readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function source(name) {
  const start = script.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing function ${name}`);
  let i = script.indexOf('{', start), depth = 1;
  for (let j = i + 1; j < script.length; j++) {
    if (script[j] === '{') depth++;
    if (script[j] === '}' && --depth === 0) return script.slice(start, j + 1);
  }
  throw Error(`Unclosed function ${name}`);
}
const context = createContext({});
for (const name of ['irpfmRate', 'stayTax', 'goTax', 'profileResult', 'profileReasons', 'readingTime']) runInContext(source(name), context);
const { irpfmRate, stayTax, goTax, profileResult } = context;
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < .000001, `${actual} !== ${expected}`);

test('Single principal script parses without syntax errors', () => {
  assert.equal((html.match(/<script\b/g) || []).length, 1);
  assert.doesNotThrow(() => new Script(script));
});
test('R$ 30 mil/mês: ficar R$ 0; sair R$ 36.000', () => {
  close(stayTax(30000, .15).total, 0);
  close(goTax(30000, 0, true).total, 36000);
});
test('R$ 80 mil/mês, IRPJ+CSLL 15%: ficar R$ 57.600', () => close(stayTax(80000, .15).total, 57600));
test('R$ 80 mil/mês, IRPJ+CSLL 34%: ficar R$ 0', () => close(stayTax(80000, .34).total, 0));
test('R$ 200 mil/mês, IRPJ+CSLL 15%: ficar R$ 240.000', () => close(stayTax(200000, .15).total, 240000));
test('IR mínimo boundaries and withholding differ from final tax', () => {
  close(irpfmRate(600000), 0); close(irpfmRate(960000), .06); close(irpfmRate(1200000), .1);
  close(stayTax(50000, .15).retido, 0);
  close(stayTax(80000, .15).retido, 96000);
  close(stayTax(80000, .15).total, 57600);
});
test('Destination tax credit is capped at the Brazilian withholding', () => {
  close(goTax(80000, .28, true).total, 268800);
  close(goTax(80000, .28, false).total, 364800);
  close(goTax(80000, .07, true).total, 96000);
});
test('Default investment scenario: ficar R$ 87.600; sair R$ 96.000; difference R$ 8.400', () => {
  const stay = stayTax(80000, .15).total + 200000 * .15;
  const go = goTax(80000, 0, true).total + 200000 * 0;
  close(stay, 87600); close(go, 96000); close(go - stay, 8400);
});
test('Dividend-only departure never beats staying across thresholds and company rates', () => {
  for (const monthly of [0, 30000, 50000, 50001, 80000, 100000, 200000, 1000000]) {
    for (const corp of [0, .15, .25, .34]) {
      assert.ok(stayTax(monthly, corp).total <= goTax(monthly, 0, true).total + .000001);
    }
  }
});
const baseProfile = { exporter: 'no', moving: 'yes', monthly: 80000, investments: 0, priority: 'tax' };
test('Exporting company: investigate maquila, without requiring owner departure', () => {
  const r = profileResult({ ...baseProfile, exporter: 'yes', moving: 'no' });
  assert.equal(r.id, 'py'); assert.equal(r.link, 'artigo-maquila'); assert.match(r.text, /não exige/);
});
test('No actual move: recommend staying even with foreign income or passport priority', () => {
  const r = profileResult({ ...baseProfile, moving: 'no', investments: 1200000, priority: 'passport' });
  assert.equal(r.code, 'BR'); assert.match(r.title, /Permanência no Brasil/);
});
test('Tax priority: insufficient foreign income favors staying, sufficient income opens territorial investigation', () => {
  assert.equal(profileResult({ ...baseProfile, investments: 200000 }).code, 'BR');
  assert.equal(profileResult({ ...baseProfile, investments: 1200000 }).code, 'PY');
  assert.equal(profileResult({ ...baseProfile, monthly: 200000 }).code, 'BR');
});
test('Nonfiscal priorities: Portugal for passport, Uruguay for proximity, no invented safety ranking', () => {
  assert.equal(profileResult({ ...baseProfile, priority: 'passport' }).id, 'pt');
  const r = profileResult({ ...baseProfile, priority: 'safety' });
  assert.equal(r.id, 'uy'); assert.match(r.text, /não tem uma comparação de segurança/);
});
test('Zero dividends still permits a foreign investment comparison', () => {
  close(stayTax(0, .15).total + 200000 * .15, 30000);
  close(goTax(0, 0, true).total, 0);
  assert.equal(profileResult({ ...baseProfile, monthly: 0, investments: 200000 }).code, 'PY');
});
test('Unchanged data arrays and all three tax functions retain original SHA-256 hashes', () => {
  const manifest = JSON.parse(readFileSync(new URL('./v1-integrity.json', `file://${__filename}`), 'utf8'));
  for (const [name, expected] of Object.entries(manifest)) {
    // v4 explicitly updates these editorial fields; numeric defaults are checked below.
    if (['dests','simDests','articles'].includes(name)) continue;
    let value;
    if (['irpfmRate', 'stayTax', 'goTax'].includes(name)) value = source(name);
    else {
      const start = script.indexOf(`  var ${name} = `);
      const end = name === 'exits' ? script.indexOf(';', start) + 1 : script.indexOf('\n  ];', start) + 5;
      value = script.slice(start, end);
    }
    assert.equal(createHash('sha256').update(value).digest('hex'), expected, `${name} changed`);
  }
});

test('Opinion reasons follow the same fiscal threshold as the recommendation', () => {
  for (const monthly of [0, 30000, 80000, 200000]) {
    for (const investments of [0, 200000, 1200000]) {
      const q = { ...baseProfile, monthly, investments };
      const reasons = context.profileReasons(q);
      assert.ok(reasons.length >= 2);
      assert.match(reasons[0], profileResult(q).code === 'BR' ? /não identifica economia/ : /rendimentos no exterior/);
      assert.match(reasons.join(' '), /15%.*0%.*nenhum custo extra/);
    }
  }
});
test('Opinion explains nonfiscal choices without claiming a safety ranking', () => {
  assert.match(context.profileReasons({ ...baseProfile, moving: 'no' }).join(' '), /continuar vivendo no Brasil/);
  assert.match(context.profileReasons({ ...baseProfile, exporter: 'yes' }).join(' '), /não exige a saída fiscal/);
  assert.match(context.profileReasons({ ...baseProfile, priority: 'safety' }).join(' '), /não compara a segurança/);
  assert.match(context.profileReasons({ ...baseProfile, priority: 'passport' }).join(' '), /elegibilidade exige análise/);
});

 test('All simulator destination rates and credit defaults are unchanged; Uruguay hint covers 2026', () => {
  const start = script.indexOf('  var simDests = ');
  const defaults = runInContext(script.slice(start, script.indexOf('\n  ];',start)+5)+';simDests;', createContext({}));
  assert.deepEqual(JSON.parse(JSON.stringify(defaults.map(d=>[d.id,d.rate,d.credit]))), [['py',0,true],['uy',0,true],['ae',0,true],['pt',28,true],['es',23,true],['us',18,true],['xx',0,true]]);
  const hint=defaults.find(d=>d.id==='uy').hint;
  assert.match(hint,/2026/);assert.match(hint,/2025/);
  const s2=script.indexOf('  function destRate(');const ctx2=createContext({});runInContext(script.slice(start, script.indexOf('\n  ];',start)+5)+';'+script.slice(s2,script.indexOf('\n  }',s2)+4),ctx2);
  // Espanha: R$ 960 mil / 6,1317 = € 156.564; 6000×19% + 44000×21% + 106564×23% = 34.890 → 22,3%.
  assert.equal(runInContext('destRate(simDests.find(d=>d.id==="es"),960000)',ctx2),22.3);
  // EUA: US$ 174.504 − 16.100 = 158.404; 1240 + 4560 + 12166 + 12648,96 = 30.614,96 → 17,5%.
  assert.equal(runInContext('destRate(simDests.find(d=>d.id==="us"),960000)',ctx2),17.5);
  assert.equal(runInContext('destRate(simDests.find(d=>d.id==="pt"),960000)',ctx2),28);assert.match(hint,/conferir/i);assert.doesNotMatch(hint,/Conferido/);
});
