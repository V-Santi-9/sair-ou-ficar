# Sair ou Ficar v7

Implementação local concluída em 5 de novembro de 2026. Sem commit, publicação ou Chromium. A alteração preexistente de `.gitignore` foi preservada; as dez imagens e `indice.json` fornecidos foram utilizados sem alteração.

## 1. O que mudou por página

### Sistema visual e navegação

- Escuro como padrão no HTML e no teste de tema. Sem escolha salva, com valor salvo inválido ou com armazenamento indisponível, abre escuro. Escolhas explícitas de claro ou escuro continuam salvas; o seletor permanece no rodapé.
- Grafite quente: fundo `#141311`, superfície `#1C1B18`, texto `#EDE8DF`, apoio `#A39C90`, filetes `#34312C`. Acento âmbar `#D9A441`; comparação de dados em azul-acinzentado `#7FA3B8`. No claro, o segundo tom é `#42667B`.
- Mantidos títulos em serifa, notas numeradas por bloco, tabelas e composição editorial da v6. Nenhuma animação nova.
- Nova rota `#cenarios`, entre Diagnóstico e Casos no menu principal, com título de página e navegação por hash. Os links das miniaturas levam à tela correspondente depois da troca de rota, com foco no título.
- Contraste de texto sobre fundo, superfície e superfície de acento: mínimo de 4,89:1 no claro e 5,90:1 no escuro, incluindo o novo token de dados.

### Capa

Mapa original e números preservados. Depois dos números, a faixa “A conta, desenhada” traz três desenhos reais reduzidos: fluxo de dividendos, metade da fábrica no Paraguai e mapa da produção. Ao lado de “Normas em observação”, mini-linha do tempo com os seis marcos mais recentes. As demais seções da capa foram mantidas.

### Cenários

Seis telas verticais, cada uma com título, frase, número destacado, SVG acessível, notas de fonte e link para aprofundamento. Diagramas de comparação e metades da fábrica se empilham no celular. O processo farmacêutico vira uma sequência vertical. Os SVGs novos usam traço de 1,5 px, com exceção das larguras proporcionais dos fluxos do mapa; sem gradientes, imagens externas ou clip-art. Texto de SVG usa 14 unidades e viewBox de 300; símbolos pequenos sem texto recebem rótulos em HTML. As composições têm quebras responsivas para evitar redução excessiva.

### Marcos e avanços (`#mudancas`)

A cronologia antiga foi substituída por 50 marcos: 28 normas datadas, 18 casos empresariais datados e quatro marcos adicionais (lei de 1997, composição das maquiladoras em 31/12/2025, recorde de exportações em 2025 e missão ABIMO em 30/03/2026). A reforma de 2025 já entra pelas normas, com benefício por até 20 anos renováveis e maquila de serviços.

Ano grande na margem, data por extenso com a precisão original, título, descrição, tipo, país, fontes numeradas e materiais cuja URL corresponde às fontes. Filtros de tipo e país combináveis, contagem de resultados e botão para limpar.

Ordenação decrescente. Datas compostas de normas usam o último marco; intervalos de casos usam o início. O caso Dass usa a notícia datada de 18 de maio de 2026, mantendo o período original no texto. Datas sem mês ou dia não recebem precisão inventada. “Antes de” preserva a ressalva e usa o ano citado como limite de ordenação. “Decisão” reúne também atos e orientações administrativos.

### Fontes

Nova faixa “Os documentos”, com as dez imagens locais, título, órgão ou veículo, data e link original. O conteúdo de `indice.json` está incorporado ao HTML; não há fetch.

### Casos e setores

Fichas de caso recebem materiais com a mesma URL das fontes. Páginas de setor também associam imagens aos números, citações e fontes extras; o farmacêutico mostra 1000 Noticias, ABC Color e Anvisa. As narrativas, fontes, filtros e links diretos anteriores permanecem.

### Diálogo de documentos

`<dialog>` nativo com nome acessível, botão Fechar, imagem grande, legenda e “Ler no original”. Esc usa o fechamento nativo; o evento de fechamento devolve o foco ao botão que abriu o documento. Todas as imagens têm `alt` descritivo, `loading="lazy"`, dimensões declaradas, moldura e legenda. Em caso de falha da imagem, o código mantém legenda e fonte e mostra uma mensagem no lugar da imagem.

### Demais páginas

Diagnóstico, destinos, custos, simulador, artigos, normas, relatos, biblioteca, mitos e dossiês mantêm os conteúdos e os comportamentos da v6, com o tema escuro como padrão. Dossiês e resultados que reutilizam fichas também passam a mostrar os materiais dessas fichas. Fórmulas tributárias e bases de pesquisa originais permanecem intactas.

## 2. As seis telas e seus números

| Tela | Dados e leitura principal |
| --- | --- |
| Dividendos | Controle entre R$ 30 mil e R$ 300 mil/mês, inicial em R$ 100 mil. Com IRPJ+CSLL de 15%, ficam R$ 90 mil/mês tanto no Brasil quanto no Paraguai. Com 34%, ficam R$ 100 mil no Brasil e R$ 90 mil no Paraguai: R$ 10 mil/mês a mais ao ficar. |
| Fábrica | Energia: Brasil US$ 113/MWh, Paraguai US$ 41/MWh. Encargos: Brasil 60% a mais de 100%; Paraguai 25% a 35%. Maquila: 1%, com a ressalva legal do maior valor entre valor agregado e fatura de exportação. Salário de R$ 3.000: R$ 4.800–6.000 no Brasil e R$ 3.750–4.050 no Paraguai. |
| Produção | 64% a 67% vai ao Brasil. As duas setas representam extremos da faixa, não fluxos somáveis. 89 pequenas fábricas de confecção e tecidos, 47 de plásticos e 30 de alumínio: 166 pictogramas, um por empresa. |
| Dono e empresa | Empresa no exterior e mudança do sócio são decisões separadas. Dono não residente: 10% na fonte sobre qualquer dividendo brasileiro. Dono residente: IR mínimo de 0% a 10%, com redutor. Maquila industrial tem outra base tributável. |
| Farmacêutico | Perto de US$ 100 milhões exportados/ano, cerca de US$ 50 milhões pela maquila. Cinco etapas: fábrica, encomenda, empresa com registro no Brasil, Anvisa e farmácia. Certificação por planta e registro por produto. Caneta sem registro aparece no caminho riscado. |
| Residências | Em 2025: 40.600 concessões, 23.526 a brasileiros, 58%. No 1º trimestre de 2026: 14.275 concessões, 9.195 a brasileiros, 64%. Cada ponto completo representa 100 pessoas; frações preservam os totais exatos. |

O título sobre pedidos de residência é acompanhado da correção explícita: os números disponíveis são de **concessões**, não de pedidos. Residência migratória não equivale a saída fiscal. Os períodos de um ano e de um trimestre são identificados e não tratados como períodos de mesma duração.

Contas ilustrativas visíveis:

- Dividendos: líquido mensal = dividendo mensal − imposto anual do simulador ÷ 12. `scenarioAccount` chama diretamente `stayTax` e `goTax`, com as premissas do Paraguai em `simDests`. IRPJ+CSLL serve ao redutor, sem nova dedução sobre o dividendo distribuível.
- Folha: custo = salário × (1 + encargos ÷ 100), com taxas extraídas de a5 e arredondamento em centavos. Brasil: 3.000 × 1,60 e × 2,00; Paraguai: × 1,25 e × 1,35. O limite de 100% é ilustrativo, pois a base admite encargos maiores.

Verificação do fluxo, valores líquidos mensais:

| Dividendo | Brasil, IRPJ+CSLL 15% | Brasil, IRPJ+CSLL 34% | Paraguai |
| --- | --- | --- | --- |
| R$ 30.000 | R$ 30.000 | R$ 30.000 | R$ 27.000 |
| R$ 80.000 | R$ 75.200 | R$ 80.000 | R$ 72.000 |
| R$ 200.000 | R$ 180.000 | R$ 200.000 | R$ 180.000 |

Ressalvas preservadas: a2 usa 232 empresas desde 2007; a1 conta 339 maquiladoras ativas em 31/12/2025, das quais 231 brasileiras. O marco de exportações usa a7 (US$ 1,26 bilhão) e explicita a divergência com `numeros` (US$ 1,31 bilhão). O caminho farmacêutico é atribuído à ALIFAR e acompanhado dos limites regulatórios da base.

## 3. Saída dos testes

Os quatro comandos terminaram com código 0. Total: **54 testes Node aprovados**, sendo 18 do simulador e 36 de renderização. O módulo `v5-scenarios.cjs` carrega sem saída; os três cenários são exercitados pelos testes de renderização.

Cobertura adicional da v7:

- (a) Padrão escuro, preferências explícitas preservadas, valor inválido e armazenamento negado.
- (b) Rota Cenários, seis telas com SVG acessível e fontes; três desenhos na capa e foco na tela escolhida.
- (c) Fluxos para R$ 30 mil, R$ 80 mil e R$ 200 mil em ambas as alíquotas empresariais, comparados às funções reais e aos valores esperados; atualização do controle.
- (d) Faixas do salário de R$ 3.000.
- (e) Todas as normas e casos datados, quatro marcos extras, ordenação e combinação dos filtros.
- (f) Manifesto incorporado idêntico ao arquivo; imagens locais existentes, metadados obrigatórios e correspondência por URL.
- (g) Ausência de imagens remotas em HTML estático e gerado.
- Contagens dos pictogramas; soma exata dos pontos e suas frações; eventos de abertura e fechamento do diálogo, foco e falha de imagem.
- Validação estrutural dos fragmentos novos e anteriores; integridade das bases e fórmulas; contraste AA dos tokens; CSP; navegação existente.

`git diff --check` também passou, sem saída.

### `node tests/simulator.test.cjs`

Código de saída: 0.

```text
✔ Single principal script parses without syntax errors (2.127833ms)
✔ R$ 30 mil/mês: ficar R$ 0; sair R$ 36.000 (0.084416ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 15%: ficar R$ 57.600 (0.044375ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 34%: ficar R$ 0 (0.042709ms)
✔ R$ 200 mil/mês, IRPJ+CSLL 15%: ficar R$ 240.000 (0.053708ms)
✔ IR mínimo boundaries and withholding differ from final tax (0.048834ms)
✔ Destination tax credit is capped at the Brazilian withholding (0.041ms)
✔ Default investment scenario: ficar R$ 87.600; sair R$ 96.000; difference R$ 8.400 (0.04025ms)
✔ Dividend-only departure never beats staying across thresholds and company rates (0.097ms)
✔ Exporting company: investigate maquila, without requiring owner departure (0.128125ms)
✔ No actual move: recommend staying even with foreign income or passport priority (0.046042ms)
✔ Tax priority: insufficient foreign income favors staying, sufficient income opens territorial investigation (0.045875ms)
✔ Nonfiscal priorities: Portugal for passport, Uruguay for proximity, no invented safety ranking (0.038209ms)
✔ Zero dividends still permits a foreign investment comparison (0.046208ms)
✔ Unchanged data arrays and all three tax functions retain original SHA-256 hashes (0.626791ms)
✔ Opinion reasons follow the same fiscal threshold as the recommendation (0.154625ms)
✔ Opinion explains nonfiscal choices without claiming a safety ranking (0.041084ms)
✔ All simulator destination rates and credit defaults are unchanged; Uruguay hint covers 2026 (0.589292ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7.167875
```

### `node tests/rendered.test.cjs`

Código de saída: 0.

```text
✔ All articles, destination summaries, comparisons, myths and timeline panels render (11.0435ms)
✔ Embedded research exactly matches the supplied JSON; 28 norms render with unique simple anchors (2.247417ms)
✔ Status, country, impact, theme and accent-insensitive text filters reduce the rendered norms correctly (1.060625ms)
✔ Attention criteria include every contested, pending, unverified and recent high-impact norm (0.086125ms)
✔ All eight dossiers contain only their own country records and all seven report sections (3.266125ms)
✔ Stories preserve quotes, negative outcomes and expert analysis; filters work (0.246083ms)
✔ Library renders all 15 videos and 18 materials; destination and type filters combine (0.197375ms)
✔ Dates retain source precision and sources without URLs never become links (1.024417ms)
✔ All study surfaces initialize even with denied localStorage, and home contains three exact quotes (1.723125ms)
✔ Simple hash routes open each norm despite stale filters, and preserve changes and country routes (16.73125ms)
✔ V5 embedded datasets exactly match the two provided files (1.6365ms)
✔ Rapid uses only applicable core questions; complete respects all conditional branches (4.200375ms)
✔ Three hand-worked profiles produce exact axes, expected paths, alerts and unchanged owner arithmetic (4.617333ms)
✔ Veto v1 removes maquila without a factory; v2 flags pharmaceuticals and REG threshold uses /50 (0.65075ms)
✔ Safe rule parser covers precedence, missing values, lists and rejects execution (0.115959ms)
✔ Skipped questions are zero but missing axes are marked; hidden answers never affect score (0.563458ms)
✔ Pharma report preserves c9 caveat and both regulatory sources (0.533292ms)
✔ Similarity scores use supplied evidence, stable ordering and at most five cases (0.218458ms)
✔ All 34 records have canonical anchors, all 13 sectors only contain linked records; filters combine and reset (3.60075ms)
✔ Every applicable question renders; localStorage denial, malformed data and resume are safe (1.646708ms)
✔ Case deep links clear stale filters, all sector hashes route and country dossiers include own companies (29.65125ms)
✔ Real UI handlers start, skip, go back, persist, resume, use keyboard and transfer exact inputs to simulator (2.156709ms)
✔ V7 defaults to dark without saved preference; explicit theme persists and toggles both ways (1.370083ms)
✔ V6 cover has no eyebrow and intro shows eight neutral axes with a radio choice and one start action (0.261292ms)
✔ V6 reports use words on axes, integer accessible scores and one sorted bar chart (1.36475ms)
✔ V6 cases replace boxed cards with 34 expandable rows and preserve every narrative and source (1.527125ms)
✔ V7 scenarios route renders six accessible, sourced screens and three real cover drawings (1.574791ms)
✔ V7 flow uses stayTax/goTax for 30, 80 and 200 thousand under both corporate rates; slider redraws (1.153792ms)
✔ V7 payroll calculation produces the specified ranges from aggregate a5 (0.475542ms)
✔ V7 sector pictograms and residency dot fractions preserve all source counts (0.535833ms)
✔ V7 timeline includes every dated norm and case, sorts dates, preserves precision and combines filters (2.447375ms)
✔ V7 material manifest is embedded exactly; all local images carry descriptive metadata and match source URLs (5.177625ms)
✔ V7 actual UI handlers open/close accessible material dialog, restore focus and keep captions on failed images (1.379ms)
✔ No dynamic code execution; CSP blocks connections, frames and remote images (0.508167ms)
✔ No iframe or remote image in static or generated HTML; generated links all resolve (1.928ms)
✔ Generated HTML is balanced, with no duplicate IDs within each rendered surface (116.279916ms)
ℹ tests 36
ℹ suites 0
ℹ pass 36
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 227.613584
```

### `node tests/v5-scenarios.cjs`

Código de saída: 0.

```text
(sem saída; módulo carregado com sucesso)
```

### `python3 tests/validate_html.py`

Código de saída: 0.

```text
PASS: AA text theme tokens; minimum contrast light 4.89:1, dark 5.90:1
PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes
PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime
PASS: balanced HTML; 110 unique static IDs; references and hashes resolve
PASS: one principal script; no remote images, external scripts or prohibited APIs
PASS: light/dark tokens; reduced motion; initially visible home; no em dashes
PASS: page 474,584 bytes < 700,000 bytes
```

## 4. Tamanho

- `index.html`: **474,584 bytes** (463.5 KiB), abaixo de 700.000 bytes.
- Dez imagens WebP locais: **360,018 bytes** no total (351.6 KiB), carregadas sob demanda.
- Manifesto incorporado no HTML. Sem dependência de execução em `data/` ou `vendor/`, sem scripts externos e sem fetch, iframe ou eval.
- CSP permite imagens de origem própria e mantém `connect-src 'none'` e `frame-src 'none'`. Todos os `src` de imagens gerados apontam para `img/materiais/`.

## 5. Pendências

- Conferência visual pelo Claude em desktop e em 380 px, nos dois temas: fluxo com os extremos do controle, diagrama da fábrica empilhado, processo farmacêutico, pontos, filtros da linha do tempo, materiais e diálogo.
- Esc, contenção de foco nativa do diálogo e retorno ao acionador foram implementados com `<dialog>`; o retorno de foco e os handlers foram exercitados sem navegador. A interação nativa completa ainda deve ser conferida em navegador.
- Os testes de HTML e CSS não comprovam ausência de overflow, tamanho efetivamente renderizado dos textos ou carregamento de imagens sob CSP em navegador. Não houve Chromium nem capturas nesta execução.
- Sem falhas conhecidas nos testes executados. Sem commit ou publicação.
