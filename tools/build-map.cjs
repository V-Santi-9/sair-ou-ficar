// Offline build. Natural Earth 110m / world-atlas 2.0.2 (public domain).
// Runtime has no dependency on vendor/, D3 or TopoJSON.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const d3 = require('../vendor/d3.min.js');
const topojson = require('../vendor/topojson-client.min.js');
const world = JSON.parse(fs.readFileSync(path.join(root, 'vendor/countries-110m.json')));
const countries = topojson.feature(world, world.objects.countries);
const projection = d3.geoNaturalEarth1().fitExtent([[8, 32], [752, 370]], countries);
const geoPath = d3.geoPath(projection).digits(1);
const stops = [
  { id:'us', label:'EUA', volume:11943, point:[-100,39], labelAt:[55,150], bend:[170,180] },
  { id:'ca', label:'Canadá', volume:2930, point:[-105,57], labelAt:[90,48], bend:[175,130] },
  { id:'pt', label:'Portugal', volume:8825, point:[-8,39.5], labelAt:[405,55], bend:[292,100] },
  { id:'ae', label:'Emirados', volume:null, point:[54,24], labelAt:[580,193], bend:[365,120] },
  { id:'py', label:'Paraguai', volume:null, point:[-58,-23], labelAt:[88,280], bend:[269,225] },
  { id:'uy', label:'Uruguai', volume:null, point:[-56,-33], labelAt:[340,330], bend:[315,255] }
];
const round = n => Number(n.toFixed(1));
const [bx, by] = projection([-48,-15]).map(round);
let svg = '<svg viewBox="0 0 760 400" role="group" aria-labelledby="mapTitle mapDesc"><title id="mapTitle">Destinos selecionados das saídas definitivas do Brasil</title><desc id="mapDesc">Mapa geográfico em projeção Natural Earth. EUA: 11.943 declarações; Portugal: 8.825; Canadá: 2.930. Paraguai, Uruguai e Emirados sem volume divulgado. Linhas proporcionais ao volume divulgado, não trajetos de viagem. Use Tab e Enter para consultar os destinos.</desc>';
svg += '<g class="map-geography" aria-hidden="true">';
for (const c of countries.features) svg += '<path class="map-land'+(c.id==='076'?' map-brazil':'')+'" d="'+geoPath(c)+'"/>';
svg += '</g><g aria-hidden="true">';
for (const s of stops) {
  const [x,y] = projection(s.point).map(round);
  svg += `<path id="arc-${s.id}" class="map-route ${s.volume?'known':'unknown'}" d="M${bx},${by}Q${s.bend.join(',')},${x},${y}" pathLength="100" stroke-width="${s.volume?s.volume/2500:0.7}"/>`;
}
svg += `<circle class="map-origin" cx="${bx}" cy="${by}" r="4"/><text class="origin-label" x="${bx+12}" y="${by+6}">Brasil</text></g>`;
for (const s of stops) {
  const [x,y] = projection(s.point).map(round), [lx,ly] = s.labelAt;
  const volume = s.volume?s.volume.toLocaleString('pt-BR'):'Não divulgado';
  svg += `<g class="map-node" role="button" tabindex="0" aria-pressed="false" aria-controls="mapCard" aria-label="${s.label}: ${volume}${s.volume?' declarações':''}" data-map="${s.id}"><circle class="node-hit" cx="${x}" cy="${y}" r="16"/><circle class="node-core" cx="${x}" cy="${y}" r="3.5"/><g class="map-label"><path class="map-leader" d="M${x},${y}L${lx+25},${ly+9}"/><rect class="label-hit" x="${lx-8}" y="${ly-17}" width="115" height="48"/><text x="${lx}" y="${ly}">${s.label}</text><text class="map-count" x="${lx}" y="${ly+18}">${volume}</text></g></g>`;
}
svg += '</svg><div class="map-touch-controls" role="group" aria-label="Destinos do mapa">';
for (const s of stops) svg += `<button type="button" data-map="${s.id}" aria-pressed="false" aria-controls="mapCard"><span>${s.label}</span><span>${s.volume?s.volume.toLocaleString('pt-BR'):'Não divulgado'}</span></button>`;
svg += '</div>';
const file = path.join(root,'index.html');
const html = fs.readFileSync(file,'utf8');
const start = '<!-- MAP:START -->', end = '<!-- MAP:END -->';
if (!html.includes(start) || !html.includes(end)) throw Error('Missing map build markers');
fs.writeFileSync(file,html.slice(0,html.indexOf(start)+start.length)+'\n'+svg+'\n'+html.slice(html.indexOf(end)));
console.log(`Map: ${countries.features.length} countries; Natural Earth projection; ${Buffer.byteLength(svg).toLocaleString('en-US')} bytes; 6 destinations.`);
