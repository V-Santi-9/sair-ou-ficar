# Sair ou Ficar v5

Entrega local em 5 de novembro de 2026. Sem commit, publicação ou Chromium. Conteúdo novo limitado a `data/perguntas-v5.json`, `data/casos-v5.json` e ao conteúdo já incorporado na v4. As bases recebidas não foram alteradas.

## 1. O que mudou por página

- **Capa (`#inicio`)**: diagnóstico como entrada principal, indicação dos dois modos e faixa com seis setores, contagem de casos/relatos e exemplo. Mantidos mapa, números, série histórica, normas, depoimentos e artigos. Atualizada a chamada antiga de cinco perguntas.
- **Diagnóstico (`#perfil`)**: abertura com escolha de modo; fatos antes das afirmações; uma pergunta por tela; condições `se`; escala com cinco opções, teclado 1 a 5 e Enter; voltar, pular, progresso por bloco e geral. Persistência com validação do conteúdo salvo e tratamento de armazenamento bloqueado. Retomada e recomeço explícitos.
- **Relatório do diagnóstico**: primeiro e segundo caminhos, oito barras bipolares, afinidades, vetos, alertas e reforços. Explicação aberta por “Como calculamos”, com todas as contribuições por eixo em ordem de peso absoluto. Até cinco casos próximos, setor, agregados pertinentes, conta do dono e próximos passos derivados dos textos da base. Valores enviados ao simulador pelo botão correspondente.
- **Casos (`#casos`)**: 15 casos de empresas e os 16 registros de relatos/análises da v4. Sete agregados, aviso da base, filtros combináveis por setor, destino, modelo e resultado. Estado vazio com limpeza de filtros. Fichas com motivos, mudança de valor, desafios, citação, autoria, fontes e confiança. Os campos ausentes ficam explicitamente sem informação.
- **Âncoras (`#caso-c1` etc.)**: todos os 31 registros têm endereço próprio. Abrir o endereço limpa filtros anteriores, mostra a biblioteca e leva o foco à ficha.
- **Setores (`#setor-textil`, `#setor-farma` etc.)**: 13 páginas com presença, razões, entraves e os registros ligados pela base. Farmacêutico destaca o entrave regulatório e as duas fontes regulatórias; o caso c9 preserva a ressalva de nutrição animal, sem tratá-lo como medicamento humano.
- **Dossiês (`#pais-…`)**: mantidas as sete seções da v4 e acrescentada lista de empresas do país. Os relatos próprios de cada país continuam na seção já existente.
- **Destinos, Normas, Custos, Relatos, Biblioteca, Mitos, Artigos e O que mudou**: conteúdo e rotas preservados; acesso pela nova navegação e breadcrumbs.
- **Fontes**: também reúne as referências dos casos, agregados e fontes regulatórias farmacêuticas.
- **Simulador**: fórmulas e alíquotas preservadas. Recebe dividendos e renda externa do diagnóstico, além do destino/premissas explicitados no relatório.
- **Navegação global**: cinco itens principais e painel Estudo em duas colunas; menu de tela cheia no celular; Esc fecha e devolve foco; Tab fica dentro do menu aberto. Marca leva à capa. Botão de topo aparece depois de rolar páginas longas. Temas, foco visível e movimento reduzido preservados. Fichas, escalas e grades adaptadas para telas estreitas.
- **Segurança e distribuição**: dados v5 embutidos no único script do HTML. CSP bloqueia conexões, frames e objetos. Sem busca externa, execução dinâmica, imagens remotas ou dependência de `data/` e `vendor/` em tempo de execução. Fontes tipográficas remotas da v4 foram mantidas, com fallbacks locais.

## 2. Como o cálculo funciona

Para cada eixo, as afirmações aplicáveis contribuem com resposta × peso. A escala do arquivo é +2, +1, 0, −1, −2. Cada fato com mapa de eixo usa o valor da opção, com peso unitário.

`eixo = 100 × soma das contribuições / soma de (2 × |peso|)`

O denominador considera as perguntas que aparecem naquele modo e nas condições informadas. Pular contribui zero, sem ser contado como resposta com dados. Uma resposta neutra explícita é uma resposta válida. Um eixo sem respostas válidas vale zero e recebe “sem dados”. Respostas a perguntas que deixaram de ser aplicáveis são descartadas.

Os vetores ideais são multiplicados por 50. Em cada caminho, n é a quantidade de eixos do seu ideal:

`afinidade = 100 − 100 × distância euclidiana / (200 × √n)`

Requisitos não atendidos excluem o caminho. O avaliador de regras aceita somente literais, identificadores, comparações, listas, parênteses, `&&` e `||`. Não executa código. Usa os eixos normalizados divididos por 50. Vetos excluem; alertas permanecem junto do caminho; reforços somam 10 pontos. A interface limita a afinidade a 0–100. Empates seguem a ordem do arquivo.

A seleção de casos soma setor +3, modelo +2, porte +1 e destino +1. Só aparecem registros com pontuação positiva, no máximo cinco. Campos ausentes não pontuam. Análises de especialistas estão disponíveis na biblioteca, mas não são apresentadas como experiências pessoais semelhantes.

### Três cenários calculados à mão

Os testes armazenam entradas e resultados esperados em `tests/v5-scenarios.cjs`, independentemente da implementação do cálculo. Todos os cenários usam o modo rápido, com 21 perguntas.

| Fato | Industrial têxtil que fica | Dono de dividendos que quer mudar | Família com cidadania europeia |
|---|---|---|---|
| Setor | Têxtil | Serviços | Tecnologia |
| Fábrica | Própria | Não | Não |
| Porte | 201 a 1.000 | Até 10 | 11 a 50 |
| Regime | Lucro Real | Lucro Presumido | Lucro Presumido |
| Exportação | Nada | Nada | 10% a 30% |
| Folha | Mais de 50% | Menos de 15% | 15% a 30% |
| Dividendos mensais | R$ 80.000 | R$ 80.000 | R$ 30.000 |
| Investimentos fora, renda anual | R$ 0 | R$ 0 | R$ 20.000 |
| Família | Não pretende mudar | Casal | Filhos |
| Cidadania | Não | Não | União Europeia |

Respostas às 11 afirmações de núcleo, na escala −2 a +2:

| Afirmação | Industrial | Dividendos | Família UE |
|---|---:|---:|---:|
| m1: clientes fora | −1 | −2 | 0 |
| c1: encargos | +2 | 0 | −2 |
| c5: energia | +2 | −2 | 0 |
| r1: registro/licença | −1 | 0 | 0 |
| p1: disposição para mudar | −2 | +2 | +2 |
| p2: gestão a distância | 0 | +2 | +2 |
| f1: renda da empresa brasileira | +2 | +2 | 0 |
| f2: investimentos fora | −2 | −2 | 0 |
| o1: motivo tributário | +2 | +2 | −2 |
| o2: segurança | −2 | −2 | +2 |
| k1: risco de resultado pior | +1 | 0 | 0 |

Os denominadores são MERC 4, TRAB 4, INS 2, REG 2, MOB 7, REND 6, PRIO 7 e RISCO 4. Exemplos de conta manual: no industrial, MOB = 100 × (−2 − 3 + 0) / 7 = −71,4286; no dono de dividendos, REND = 100 × (−3 − 3) / 6 = −100; na família UE, PRIO = 100 × (1 + 3 + 3) / 7 = +100.

| Eixo | Industrial | Dividendos | Família UE |
|---|---:|---:|---:|
| MERC | −75 | −100 | 0 |
| TRAB | +100 | −50 | −75 |
| INS | +100 | −100 | 0 |
| REG | −50 | 0 | 0 |
| MOB | −71,4286 | +85,7143 | +85,7143 |
| REND | −100 | −100 | 0 |
| PRIO | −100 | −85,7143 | +100 |
| RISCO | +37,5 | +25 | +25 |

1. **Industrial têxtil que fica:** maquila 92,12/100; ficar 73,08/100. Regra v4 exclui os quatro caminhos de mudança pessoal. Na comparação hipotética da pessoa física: ficar R$ 57.600/ano e sair para o Paraguai R$ 96.000/ano. Abrir fábrica sem sair mantém o dono no cenário de ficar. Lupo aparece primeiro entre os casos próximos, com 7 pontos.
2. **Dono de dividendos que quer mudar:** dono_py 61,72/100; EUA 47,79/100. O alerta v3 mostra que afinidade pessoal não é economia fiscal. A regra v1 veta maquila. Ficar custa R$ 57.600/ano e a hipótese de sair para o Paraguai R$ 96.000/ano, diferença de R$ 38.400 a favor de ficar.
3. **Família com cidadania europeia e segurança como motivo:** vida_europa 100/100, após o reforço v7 e o limite de 100; EUA 88,06/100, com v8. Ficar custa R$ 3.000/ano; hipótese de Portugal R$ 106.400/ano. Os valores fiscais não entram na afinidade dos caminhos.

A conta do dono chama `stayTax` e `goTax`, mantendo a composição do simulador: 15% sobre renda de investimentos no exterior ao ficar; no destino, alíquota do preset. A carga efetiva de IRPJ+CSLL usada é 15%, sem custo extra de vida. O relatório informa essas premissas e a ressalva do preset antes de abrir o simulador.

## 3. Saída dos testes

Todos os três comandos terminaram com sucesso. As funções fiscais continuam com os mesmos hashes SHA-256. Os testes usam as funções e renderizadores reais do HTML com objetos mínimos de interface, sem navegador.

### `node tests/simulator.test.cjs`

```text
✔ Single principal script parses without syntax errors (1.936583ms)
✔ R$ 30 mil/mês: ficar R$ 0; sair R$ 36.000 (0.09125ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 15%: ficar R$ 57.600 (0.054541ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 34%: ficar R$ 0 (0.04825ms)
✔ R$ 200 mil/mês, IRPJ+CSLL 15%: ficar R$ 240.000 (0.0475ms)
✔ IR mínimo boundaries and withholding differ from final tax (0.045708ms)
✔ Destination tax credit is capped at the Brazilian withholding (0.040959ms)
✔ Default investment scenario: ficar R$ 87.600; sair R$ 96.000; difference R$ 8.400 (0.04ms)
✔ Dividend-only departure never beats staying across thresholds and company rates (0.099625ms)
✔ Exporting company: investigate maquila, without requiring owner departure (0.136125ms)
✔ No actual move: recommend staying even with foreign income or passport priority (0.048708ms)
✔ Tax priority: insufficient foreign income favors staying, sufficient income opens territorial investigation (0.047542ms)
✔ Nonfiscal priorities: Portugal for passport, Uruguay for proximity, no invented safety ranking (0.038583ms)
✔ Zero dividends still permits a foreign investment comparison (0.044625ms)
✔ Unchanged data arrays and all three tax functions retain original SHA-256 hashes (0.634167ms)
✔ Opinion reasons follow the same fiscal threshold as the recommendation (0.164167ms)
✔ Opinion explains nonfiscal choices without claiming a safety ranking (0.045792ms)
✔ All simulator destination rates and credit defaults are unchanged; Uruguay hint covers 2026 (0.580042ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7.05225
```

### `node tests/rendered.test.cjs`

```text
✔ All articles, destination summaries, comparisons, myths and timeline panels render (9.538125ms)
✔ Embedded research exactly matches the supplied JSON; 28 norms render with unique simple anchors (2.543042ms)
✔ Status, country, impact, theme and accent-insensitive text filters reduce the rendered norms correctly (0.867291ms)
✔ Attention criteria include every contested, pending, unverified and recent high-impact norm (0.084708ms)
✔ All eight dossiers contain only their own country records and all seven report sections (2.812333ms)
✔ Stories preserve quotes, negative outcomes and expert analysis; filters work (0.24125ms)
✔ Library renders all 15 videos and 18 materials; destination and type filters combine (0.181375ms)
✔ Dates retain source precision and sources without URLs never become links (0.858167ms)
✔ All study surfaces initialize even with denied localStorage, and home contains three exact quotes (1.133083ms)
✔ Simple hash routes open each norm despite stale filters, and preserve changes and country routes (10.008459ms)
✔ V5 embedded datasets exactly match the two provided files (1.305417ms)
✔ Rapid uses only applicable core questions; complete respects all conditional branches (4.038833ms)
✔ Three hand-worked profiles produce exact axes, expected paths, alerts and unchanged owner arithmetic (2.791291ms)
✔ Veto v1 removes maquila without a factory; v2 flags pharmaceuticals and REG threshold uses /50 (0.801792ms)
✔ Safe rule parser covers precedence, missing values, lists and rejects execution (0.101125ms)
✔ Skipped questions are zero but missing axes are marked; hidden answers never affect score (0.452209ms)
✔ Pharma report preserves c9 caveat and both regulatory sources (0.640208ms)
✔ Similarity scores use supplied evidence, stable ordering and at most five cases (0.196375ms)
✔ All 31 records have canonical anchors, all 13 sectors only contain linked records; filters combine and reset (2.507041ms)
✔ Every applicable question renders; localStorage denial, malformed data and resume are safe (1.555792ms)
✔ Case deep links clear stale filters, all sector hashes route and country dossiers include own companies (13.872417ms)
✔ Real UI handlers start, skip, go back, persist, resume, use keyboard and transfer exact inputs to simulator (2.017667ms)
✔ No dynamic code execution; CSP blocks connections, frames and remote images (0.6635ms)
✔ No iframe or remote image in static or generated HTML; generated links all resolve (1.344375ms)
✔ Generated HTML is balanced, with no duplicate IDs within each rendered surface (69.154459ms)
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 132.733334
```

### `python3 tests/validate_html.py`

```text
PASS: AA text theme tokens; minimum contrast light 4.59:1, dark 5.82:1
PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes
PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime
PASS: balanced HTML; 99 unique static IDs; references and hashes resolve
PASS: one principal script; no remote images, external scripts or prohibited APIs
PASS: light/dark tokens; reduced motion; initially visible home; no em dashes
PASS: page 400,873 bytes < 650,000 bytes
```

`git diff --check` também passou, sem erros de espaços ou conflitos.

## 4. Tamanho final

`index.html`: **400,873 bytes** (400.873 KB decimais; 391.48 KiB), abaixo de 650.000 bytes. Um único HTML, sem arquivos locais necessários para publicar.

## 5. Pendências e interpretações

- **Contagem do rápido:** o pedido menciona 21 afirmações de núcleo, mas o arquivo contém 11 afirmações de núcleo e 10 fatos de núcleo. A implementação segue o arquivo: 21 perguntas no rápido. O completo chega a 78 quando todas as condições aplicam. A capa preserva a formulação solicitada; a abertura informa o total exato do rápido e “até 78” no completo.
- **Normalização:** fatos com eixo receberam peso 1, pois a base fornece o mapa da opção sem outro peso. Perguntas puladas continuam no denominador, conforme o conjunto que apareceu. A falta de resposta não é confundida com neutralidade explícita na indicação “sem dados”.
- **Reforços:** afinidades são limitadas a 100 após os reforços, para preservar a escala visual. Valores iguais usam a ordem original da base. Nenhum ajuste foi feito para forçar um resultado desejado nos cenários.
- **Porte:** a base usa categorias qualitativas nos casos e faixas de funcionários nas perguntas. Foi adotada correspondência explícita: até 50 → pequeno/médio; 51–200 → pequeno/médio ou médio/grande; 201–1.000 → médio/grande ou grande; acima de 1.000 → grande. “Varia” e campos ausentes não pontuam. A aproximação aparece em “Como calculamos”.
- **Relatos:** setor vem dos vínculos em `setores[].casos`; o destino vem do relato v4. Modelo, porte e valores que não estão estruturados no relato não foram inventados. O resumo original permanece inteiro para preservar informações como investimento e empregos mencionadas em prosa. As fichas avisam quando um campo não foi detalhado separadamente.
- **Setores com sobreposição:** c5 pertence a plástico no campo principal e também foi ligado a metal pela base. A implementação respeita os dois vínculos e mostra os dois setores. Cada página só apresenta registros ligados a seu setor pela base. Registros sem setor não são atribuídos artificialmente a “Outro”.
- **Farmacêutico:** c9 é exibido com a ressalva explícita de nutrição animal. O diagnóstico não afirma ter encontrado uma farmacêutica brasileira de medicamentos humanos em maquila.
- **Agregados:** maquila mostra a1–a6 no relatório; outros caminhos que incluem Paraguai mostram a1 e a7 como contexto. A biblioteca mostra a1–a7. As bases e datas distintas de 231 e 232 empresas foram preservadas. Não são tratadas como uma única medição.
- **Próximos passos:** a base não contém uma lista própria de passos. Os passos foram redigidos como ações de estudo a partir do texto de cada caminho e complementados pelos textos das regras, sem acrescentar fatos ou requisitos.
- **Destino da conta:** maquila, ficar e dono_py usam Paraguai como comparação hipotética; filial_ext e vida_europa usam Portugal; eua usa EUA; patrimonio usa Uruguai. Esses destinos vêm dos caminhos e dos presets existentes. Não representam escolha final; o destino e as premissas podem ser alterados ao abrir o simulador. O alerta uruguaio continua visível.
- **Dados e lacunas:** fontes, citações, valores anunciados, valores não divulgados e resultados em estudo foram mantidos como fornecidos. Não houve pesquisa adicional. O caso c16 contém valores aproximados de área, investimento e preço por hectare que não coincidem aritmeticamente; o texto recebido foi preservado, sem tentar corrigi-lo sem fonte.
- **Armazenamento:** respostas e valores financeiros ficam no localStorage deste navegador, quando permitido. “Refazer/Recomeçar” apaga o registro salvo quando o navegador permite; mesmo com exclusão bloqueada, a interface permite começar novamente.
- **Revisão visual pendente:** nenhuma captura nem Chromium foi executado, conforme instruído. CSS contempla 380 px, temas e teclado; testes de contraste dos tokens passaram com mínimo de 4,59:1 no claro e 5,82:1 no escuro. Isso não substitui a conferência visual e de foco em um navegador real. As capturas do Claude devem confirmar quebras de linha, alturas, menu móvel, filtros e relatório longo.
- **Compatibilidade:** funções puras da antiga triagem permanecem apenas para os testes de regressão das premissas fiscais. A interface e os eventos da triagem antiga foram substituídos. Todas as rotas antigas continuam funcionando.
