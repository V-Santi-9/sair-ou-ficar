"""Structural checks without a browser. Run: python3 tests/validate_html.py
Accepts extra HTML fragment paths for checking generated markup as well.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
import math
import json

ROOT = Path(__file__).resolve().parent.parent
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Validator(HTMLParser):
    def __init__(self, name):
        super().__init__(convert_charrefs=True)
        self.name, self.stack, self.ids, self.refs = name, [], set(), []
        self.errors, self.labels, self.script_count = [], [], 0
    def error(self, message):
        self.errors.append(f'{self.name}:{self.getpos()[0]}: {message}')
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids: self.error('duplicate id: '+a['id'])
            self.ids.add(a['id'])
        if tag=='label': self.labels.append([len(self.stack),0])
        if tag in {'input','select','textarea','button'} and self.labels:
            self.labels[-1][1]+=1
            if self.labels[-1][1]>1: self.error('multiple labelable controls inside one label')
        if tag=='form' and any(t=='form' for t,_ in self.stack): self.error('nested form')
        if tag=='a' and any(t=='a' for t,_ in self.stack): self.error('nested anchor')
        for attribute in ['for','aria-controls','aria-labelledby','aria-describedby']:
            if attribute in a: self.refs.extend(a[attribute].split())
        if tag=='script':
            self.script_count+=1
            if a.get('src'): self.error('external script: '+a['src'])
        if tag=='iframe': self.error('iframe prohibited')
        if tag=='img':
            if not re.fullmatch(r'img/materiais/[^/]+\.webp',a.get('src','')): self.error('image outside local materials')
            for key in ['alt','width','height']:
                if not a.get(key): self.error('image missing '+key)
            if a.get('loading')!='lazy': self.error('image missing lazy loading')
        if any(k.startswith('on') for k in a): self.error('inline handler')
        if tag not in VOID: self.stack.append((tag,self.getpos()[0]))
    def handle_endtag(self, tag):
        if tag in VOID: self.error('closing void tag: '+tag); return
        if not self.stack: self.error('unexpected closing tag: '+tag); return
        previous, line=self.stack.pop()
        if previous!=tag: self.error(f'closing {tag}, expected {previous} from line {line}')
        if tag=='label' and self.labels: self.labels.pop()
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def finish(self, check_refs=True):
        for tag,line in self.stack: self.error(f'unclosed {tag} from line {line}')
        if check_refs:
            for ref in self.refs:
                if ref not in self.ids: self.error('missing referenced id: '+ref)
        if self.errors: raise AssertionError('\n'.join(self.errors))
        return len(self.ids)

def main():
    html=(ROOT/'index.html').read_text()
    v=Validator('index.html'); v.feed(html); count=v.finish()
    assert v.script_count==1, 'Expected one principal script'
    assert not re.search(r'\b(?:fetch|XMLHttpRequest|alert|confirm|prompt)\s*\(|window\.open\s*\(',html), 'Prohibited browser API'
    assert 'prefers-reduced-motion' in html and '<html lang="pt-BR" data-theme="dark">' in html and ':root[data-theme="dark"]' in html
    assert '<section class="view on" id="v-inicio"' in html, 'Initial home must be visible'
    assert '—' not in html, 'Unexpected em dash'
    assert len(html.encode())<700_000, 'Page exceeds size budget'
    routes=set(re.findall(r'data-route="([^"]+)"',html))|set(re.findall(r'id: "(artigo-[^"]+)"',html))
    study=json.loads(re.search(r'  var study = (.*);',html).group(1))
    routes |= {'norma-'+n['id'] for n in study['normas']}
    routes |= {'pais-'+slug for slug in re.findall(r"slug:'([^']+)'",html)}
    for href in re.findall(r'href="#([^"\']+)"',html.split('<script>')[0]):
        assert href in routes or href in v.ids, f'Unknown hash: {href}'
    assert not re.search(r'\beval\s*\(|\bnew\s+Function\b', html), 'Dynamic code execution prohibited'
    # WCAG AA text contrast of the actual theme tokens, including highlighted surfaces.
    def luminance(hex_color):
        channels=[int(hex_color[i:i+2],16)/255 for i in (1,3,5)]
        channels=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in channels]
        return sum(a*b for a,b in zip(channels,[0.2126,0.7152,0.0722]))
    minima=[]
    for label,pattern in [('light',r':root \{(.*?)\}'),('dark',r':root\[data-theme="dark"\] \{(.*?)\}')]:
        tokens=dict(re.findall(r'--([\w-]+):(#[0-9a-f]{6})',' '.join(re.findall(pattern,html,re.S))))
        ratios=[]
        for foreground in ['ink','muted','accent','good','bad','warn','data']:
            for background in ['bg','surface','accent-soft']:
                low,high=sorted([luminance(tokens[foreground]),luminance(tokens[background])])
                ratio=(high+0.05)/(low+0.05)
                assert ratio>=4.5, f'{label}: {foreground}/{background} below AA: {ratio}'
                ratios.append(ratio)
        minima.append(f'{label} {min(ratios):.2f}:1')
    print('PASS: AA text theme tokens; minimum contrast '+', '.join(minima))
    # The map is static, geographically sourced, keyboard accessible, and scale-correct.
    map_markup=html.split('<!-- MAP:START -->')[1].split('<!-- MAP:END -->')[0]
    svg=ET.fromstring(map_markup[:map_markup.index('</svg>')+6])
    lands=[p for p in svg.iter('path') if 'map-land' in p.get('class','').split()]
    assert len(lands)==177, 'Expected all Natural Earth 110m countries'
    assert all(p.get('d') and 'NaN' not in p.get('d') for p in lands)
    paths={p.get('id'):p for p in svg.iter('path') if p.get('id','').startswith('arc-')}
    for name,volume in [('us',11943),('pt',8825),('ca',2930)]:
        assert math.isclose(float(paths['arc-'+name].get('stroke-width'))/volume,1/2500)
    for name in ['py','uy','ae']:
        assert float(paths['arc-'+name].get('stroke-width'))<float(paths['arc-ca'].get('stroke-width'))
    controls=[g for g in svg.iter('g') if g.get('data-map')]
    assert len(controls)==6 and all(g.get('tabindex')=='0' and g.get('aria-controls')=='mapCard' for g in controls)
    boxes=[tuple(float(r.get(k)) for k in ['x','y','width','height']) for r in svg.iter('rect') if r.get('class')=='label-hit']
    for i,(x,y,w,h) in enumerate(boxes):
        assert 0<=x and 0<=y and x+w<=760 and y+h<=400
        for xx,yy,ww,hh in boxes[i+1:]:
            assert x+w<=xx or xx+ww<=x or y+h<=yy or yy+hh<=y, 'Overlapping map label boxes'
    assert len(re.findall(r'class="eyebrow"',html))<=2, 'Too many eyebrows'
    header=html.split('<header')[1].split('</header>')[0]
    assert 'themeToggle' not in header and 'themeToggle' in html.split('<footer>')[1].split('</footer>')[0]
    assert not re.search(r'(?:src|href)=["\'][^"\']*vendor/',html), 'Runtime depends on vendor/'
    assert not re.search(r'Check-in|CHECK-IN|boarding-pass|Voo cancelado|Emitir meu cartão|[↗→←]',html)
    print('PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes')
    print('PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime')
    print(f'PASS: balanced HTML; {count} unique static IDs; references and hashes resolve')
    print('PASS: one principal script; no remote images, external scripts or prohibited APIs')
    print('PASS: light/dark tokens; reduced motion; initially visible home; no em dashes')
    print(f'PASS: page {len(html.encode()):,} bytes < 700,000 bytes')
    for name in sys.argv[1:]:
        fragment=Validator(name);fragment.feed(Path(name).read_text());fragment.finish(check_refs=False)
        print(f'PASS: generated markup {name}')
if __name__=='__main__': main()
