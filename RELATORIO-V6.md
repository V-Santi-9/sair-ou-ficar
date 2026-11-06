# Sair ou Ficar v6

Redesenho visual local concluído em 5 de novembro de 2026. Arquivo: `index.html`. Sem commit, publicação ou Chromium.

## 1. Sistema visual

- Papel claro como padrão: fundo `#F6F3EC`, tinta `#1B1A17`, apoio `#686258`, filetes `#D9D3C7` e acento bordô `#9A2D1F`.
- Tema escuro por escolha explícita no rodapé: grafite quente `#1C1B18`, tinta `#F2EEE5` e acento `#D3B47C`. A escolha é salva. A preferência escura do sistema não altera o padrão claro.
- Source Serif 4 nos títulos e no texto corrido; IBM Plex Sans na interface e nos dados. Números tabulares. Big Shoulders restrita à marca, aos grandes números da capa e aos rótulos do mapa. IBM Plex Mono retirada do carregamento.
- Quatro níveis principais de títulos, com variação responsiva. Colunas de leitura de até 66 caracteres; composição com proporções de 12 colunas e espaço lateral para notas, datas e metadados.
- Links em tinta, com sublinhado fino. Botão principal sólido com raio de 2 px; secundários sublinhados. Filtros com linha inferior.
- Fontes em notas numeradas por bloco. Sinais de procedência: ● oficial, ○ imprensa e ◌ a conferir. Legenda em Fontes e versão curta no rodapé. Rótulos de status e procedência sem caixas.
- Alertas com filete lateral em tinta, sem preenchimento colorido. Sombra apenas no menu Estudo em desktop.
- Retiradas a animação de entrada do mapa, a contagem animada dos totais e a transição de giro dos mitos. Transições curtas de interação; reduced motion desativa transições e animações.
- Foco de teclado preservado. Títulos focados programaticamente usam outline apenas em `:focus-visible`. Linhas de casos usam `details/summary`, com abertura nativa por teclado.

## 2. Página por página

### Capa

Manchete em serifa, sem eyebrow. Mapa em tons neutros e faixa de números preservada. Os seis setores viraram índice tipográfico de duas colunas, com filetes, contagem e exemplo em itálico. Normas em observação permanecem em lista, com pequenos sinais de status. Números complementares e citações têm composições diferentes para variar o ritmo.

### Diagnóstico: abertura e perguntas

Abertura em duas colunas: título, frase, duas escolhas por rádio e botão Começar; ao lado, prévia estática com os oito eixos em cinza. Retomada de respostas salvas mantida.

Nas perguntas, progresso e informação de salvamento ocupam a margem no desktop. Afirmações em serifa. A escala tem cinco segmentos contíguos, com rótulos dos extremos e nomes acessíveis em cada opção. Atalhos, voltar, pular, condições das perguntas e persistência foram mantidos.

### Diagnóstico: resultado

Cabeçalho “Seu retrato”, nome do principal caminho, frase com o segundo caminho e data. Os oito eixos formam pequenos gráficos em duas colunas, com marcadores neutros e leitura por palavras. Valores inteiros em atributos acessíveis e em Como calculamos; o cálculo conserva a precisão original. A metodologia explica os intervalos usados apenas para a apresentação verbal.

Gráfico horizontal único com caminhos ordenados, valores inteiros e destaque somente no primeiro. Há sete caminhos possíveis; os vetados continuam excluídos, conforme as regras originais. Apenas os dois primeiros recebem texto e link abaixo do gráfico. Todas as regras aplicadas continuam visíveis, reunidas em “Antes de seguir”.

Casos próximos em linhas expansíveis, com descrição da semelhança em palavras. Os textos completos, fontes e ressalvas estão nas fichas. O aviso extenso da biblioteca foi substituído no resultado por uma referência aos limites da base em Casos. Conta do dono, setor e próximos passos preservados, com títulos sem numeração.

### Casos

Aviso uma vez, logo abaixo do título. Três destaques: empresas brasileiras, destino da produção e exportações. Os outros quatro agregados aparecem em linhas. Todos os valores e detalhes originais permanecem.

Tabela editorial filtrável com 34 linhas expansíveis, organizada em Empresa, Setor, Destino, Quando, Investimento e Resultado. No celular, as linhas se empilham com rótulos. A ficha aberta traz metadados à esquerda e narrativa à direita, intertítulos discretos, citação e notas de fonte. Sem breadcrumb dentro da ficha.

Links `#caso-...` continuam funcionando, limpam filtros incompatíveis e abrem a ficha correspondente. Zero elementos com as antigas classes `case-card` e `aggregate-strip` na marcação gerada de Casos, contra 34 fichas em caixa e uma grade de agregados na v5.

### Setores

Abertura com o texto da pesquisa, faixa de números, “Por que vai” e “O que trava” lado a lado, citações destacadas e tabela de casos. As ressalvas e fontes regulatórias do setor farmacêutico foram mantidas integralmente.

### Normas e cronologia

Serifa nos títulos, status sem moldura, filtros leves e detalhes sem fundos de alerta. Fontes numeradas nas fichas. Filtros, critérios de atenção, datas e links das 28 normas mantidos.

### Relatos

Citações maiores em serifa, identificação em corpo pequeno, datas e destino na margem. Sem caixas. Resultados negativos, retornos e análises de especialistas preservados.

### Biblioteca

Listas com filetes e títulos em serifa. Retiradas as molduras e o ícone que simulavam um player de vídeo. Links, títulos, notas e filtros dos 15 vídeos e 18 materiais mantidos.

### Dossiês, artigos e fontes

Sistema compartilhado de títulos, notas e filetes. Casos dos países usam as mesmas linhas expansíveis. Artigos usam margem para metadados no desktop. Página Fontes explica os sinais e mantém referências, metodologia e lacunas.

### Destinos, custos e simulador

Dados em IBM Plex Sans, controles leves, tabelas empilhadas no celular e paleta neutra. Visão geral de destinos segue o tema escolhido. Simulador mantém contas, controles e comparações, com resultados imediatos e alerta sem fundo colorido. Gráfico conserva áreas e curvas; a legenda acompanha a nova paleta.

### Navegação

Menu Estudo com duas colunas de links e uma descrição por item. Menu móvel, Escape, fechamento, foco e rotas preservados. Tema permanece no rodapé.

## 3. Validação e saída dos testes

Todos os quatro comandos solicitados terminaram com código 0. São 18 testes de simulador e 29 de renderização, sem falhas.

Novas verificações cobrem: padrão claro mesmo com preferência escura do sistema; ausência do eyebrow; ausência de decimais visíveis nos eixos; ausência das antigas classes de caixa em Casos. Também conferem prévia, rádios, ordenação do gráfico, fontes e narrativas completas nas fichas, e abertura dos links diretos.

Os seletores e a interação de início foram atualizados para o novo botão Começar e o grupo de rádios. As verificações anteriores de cálculo, fontes, filtros, armazenamento e navegação foram mantidas.

`v5-scenarios.cjs` é um módulo de dados de teste: executado diretamente, termina sem imprimir saída. Seus três cenários são efetivamente calculados e verificados dentro de `rendered.test.cjs`.

Comparação adicional com HEAD: 12 funções de cálculo/seleção de dados, as três bases incorporadas (`study`, `axesData`, `caseData`) e a lista de rotas permanecem idênticas byte a byte. O simulador também mantém sua verificação de hashes de dados e funções tributárias. `git diff --check` passou.

Contraste dos tokens de texto, incluindo superfícies de apoio: mínimo de 4,89:1 no claro e 6,51:1 no escuro.

### `node tests/simulator.test.cjs`

Código de saída: 0.

```text
✔ Single principal script parses without syntax errors (2.112333ms)
✔ R$ 30 mil/mês: ficar R$ 0; sair R$ 36.000 (0.097875ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 15%: ficar R$ 57.600 (0.045333ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 34%: ficar R$ 0 (0.050291ms)
✔ R$ 200 mil/mês, IRPJ+CSLL 15%: ficar R$ 240.000 (0.04575ms)
✔ IR mínimo boundaries and withholding differ from final tax (0.045584ms)
✔ Destination tax credit is capped at the Brazilian withholding (0.043292ms)
✔ Default investment scenario: ficar R$ 87.600; sair R$ 96.000; difference R$ 8.400 (0.039083ms)
✔ Dividend-only departure never beats staying across thresholds and company rates (0.095083ms)
✔ Exporting company: investigate maquila, without requiring owner departure (0.139916ms)
✔ No actual move: recommend staying even with foreign income or passport priority (0.047875ms)
✔ Tax priority: insufficient foreign income favors staying, sufficient income opens territorial investigation (0.046084ms)
✔ Nonfiscal priorities: Portugal for passport, Uruguay for proximity, no invented safety ranking (0.035666ms)
✔ Zero dividends still permits a foreign investment comparison (0.038042ms)
✔ Unchanged data arrays and all three tax functions retain original SHA-256 hashes (0.649417ms)
✔ Opinion reasons follow the same fiscal threshold as the recommendation (0.163417ms)
✔ Opinion explains nonfiscal choices without claiming a safety ranking (0.041834ms)
✔ All simulator destination rates and credit defaults are unchanged; Uruguay hint covers 2026 (0.605417ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7.338292
```

### `node tests/rendered.test.cjs`

Código de saída: 0.

```text
✔ All articles, destination summaries, comparisons, myths and timeline panels render (10.849334ms)
✔ Embedded research exactly matches the supplied JSON; 28 norms render with unique simple anchors (2.942666ms)
✔ Status, country, impact, theme and accent-insensitive text filters reduce the rendered norms correctly (0.921458ms)
✔ Attention criteria include every contested, pending, unverified and recent high-impact norm (0.07525ms)
✔ All eight dossiers contain only their own country records and all seven report sections (3.221834ms)
✔ Stories preserve quotes, negative outcomes and expert analysis; filters work (0.246875ms)
✔ Library renders all 15 videos and 18 materials; destination and type filters combine (0.294125ms)
✔ Dates retain source precision and sources without URLs never become links (0.941833ms)
✔ All study surfaces initialize even with denied localStorage, and home contains three exact quotes (1.330291ms)
✔ Simple hash routes open each norm despite stale filters, and preserve changes and country routes (11.584416ms)
✔ V5 embedded datasets exactly match the two provided files (1.806292ms)
✔ Rapid uses only applicable core questions; complete respects all conditional branches (4.217625ms)
✔ Three hand-worked profiles produce exact axes, expected paths, alerts and unchanged owner arithmetic (4.737625ms)
✔ Veto v1 removes maquila without a factory; v2 flags pharmaceuticals and REG threshold uses /50 (0.622542ms)
✔ Safe rule parser covers precedence, missing values, lists and rejects execution (0.110958ms)
✔ Skipped questions are zero but missing axes are marked; hidden answers never affect score (0.488292ms)
✔ Pharma report preserves c9 caveat and both regulatory sources (0.469875ms)
✔ Similarity scores use supplied evidence, stable ordering and at most five cases (0.312375ms)
✔ All 34 records have canonical anchors, all 13 sectors only contain linked records; filters combine and reset (3.28525ms)
✔ Every applicable question renders; localStorage denial, malformed data and resume are safe (1.679292ms)
✔ Case deep links clear stale filters, all sector hashes route and country dossiers include own companies (21.468875ms)
✔ Real UI handlers start, skip, go back, persist, resume, use keyboard and transfer exact inputs to simulator (2.214958ms)
✔ V6 defaults to light even under dark OS preference; explicit theme persists and toggles both ways (1.283833ms)
✔ V6 cover has no eyebrow and intro shows eight neutral axes with a radio choice and one start action (0.253875ms)
✔ V6 reports use words on axes, integer accessible scores and one sorted bar chart (1.620791ms)
✔ V6 cases replace boxed cards with 34 expandable rows and preserve every narrative and source (1.341333ms)
✔ No dynamic code execution; CSP blocks connections, frames and remote images (0.41825ms)
✔ No iframe or remote image in static or generated HTML; generated links all resolve (1.491916ms)
✔ Generated HTML is balanced, with no duplicate IDs within each rendered surface (87.8785ms)
ℹ tests 29
ℹ suites 0
ℹ pass 29
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 173.292583
```

### `node tests/v5-scenarios.cjs`

Código de saída: 0.

```text
(sem saída; módulo de cenários carregado com sucesso)\n```

### `python3 tests/validate_html.py`

Código de saída: 0.

```text
PASS: AA text theme tokens; minimum contrast light 4.89:1, dark 6.51:1
PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes
PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime
PASS: balanced HTML; 99 unique static IDs; references and hashes resolve
PASS: one principal script; no remote images, external scripts or prohibited APIs
PASS: light/dark tokens; reduced motion; initially visible home; no em dashes
PASS: page 433,475 bytes < 650,000 bytes
```

## 4. Tamanho final

`index.html`: **433.475 bytes**, aproximadamente **423,3 KiB**. Limite: 650.000 bytes. Acréscimo de 25.186 bytes sobre os 408.289 bytes encontrados no início.

Página única e autossuficiente para dados e scripts. Nenhuma dependência de execução adicionada em `data/` ou `vendor/`. CSP preservada: sem fetch externo, iframe, imagem remota, script externo ou eval. Fontes externas somente pelo Google Fonts já autorizado. Os arquivos de dados preexistentes continuam sendo usados exclusivamente pelos testes de integridade.

## 5. Pendências

- Conferência visual pelo Claude em desktop e em 380 px, nos dois temas, incluindo ficha aberta, escala, resultado e menu. Não foram feitas capturas nem usado Chromium.
- Os testes verificam HTML gerado, lógica de interação e tokens de contraste; não substituem uma inspeção de layout em navegador nem comprovam ausência de overflow em viewport real.
- Sem pendências conhecidas nos testes executados. Nenhum commit ou publicação realizado.

