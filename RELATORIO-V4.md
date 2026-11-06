# Sair ou Ficar v4

Implementado em `index.html`, usando apenas a v3 e `data/estudo-v4.json`. A pesquisa foi incorporada integralmente ao único script da página. O teste compara o objeto incorporado com o JSON original. Nenhuma consulta externa, publicação ou commit foi feito. Nenhum Chromium foi executado.

## 1. Rotas e conteúdo

| Rota | Conteúdo |
| --- | --- |
| `#normas` | Monitor das 28 normas. Contadores, legenda, pontos de atenção, filtros por país/status/impacto/tema, busca textual, linhas expansíveis e fontes por tipo. |
| `#norma-<id>` | Âncora de cada norma, como `#norma-br-15270`. Abre o monitor, limpa filtros que poderiam ocultar a norma, expande a linha e posiciona o foco. |
| `#mudancas` | Linha do tempo alimentada pelas 28 normas. Preserva ano, mês, dia ou datas compostas exatamente na precisão da base. |
| `#pais-brasil` | Obrigações e efeitos para quem sai do Brasil. |
| `#pais-paraguai` | Residência, tributação, números de Migraciones, normas, experiências e materiais do Paraguai. |
| `#pais-portugal` | Residência, impostos, nacionalidade, nova Lei de Estrangeiros, relatos e materiais de Portugal. |
| `#pais-eua` | Condições de entrada, impostos, norma de investidor e registros dos EUA. |
| `#pais-uruguai` | Regime de 2026, ressalvas, números e materiais do Uruguai. |
| `#pais-emirados` | Impostos, residência, norma empresarial e experiências nos Emirados. |
| `#pais-espanha` | Entrada, Beckham, fim do golden visa e riscos da Espanha. |
| `#pais-italia` | Cidadania, impostos e flat tax italiana. |
| `#relatos` | 16 registros, incluindo análises. Citações, contexto, resultado, fonte e confiança. Filtros por destino e resultado. |
| `#biblioteca` | 15 vídeos e 18 reportagens/materiais. Filtros por destino e tipo. Vídeos com quadro CSS e play em SVG; links comuns para o YouTube. |
| `#fontes` | Fontes de todas as coleções da pesquisa, agrupadas por tipo, sete lacunas novas e referências/metodologia anteriores. |

Todos os dossiês têm sete partes: resumo em três parágrafos, números, entrada/residência/impostos, normas, relatos por resultado, vídeos/reportagens e riscos. Ausências aparecem como lacunas da base. O menu entre dossiês inclui os oito países. Mapa, comparador e tabela ligam aos dossiês disponíveis. Canadá conserva a indicação de ausência de perfil tributário; os outros destinos da v3 permanecem no comparador.

Na capa, foram preservados o mapa, a composição editorial e os números anteriores. Entraram seis normas em observação, dois números oficiais de residências do Paraguai e três citações com fonte. Normas, Relatos e Biblioteca entraram no menu principal.

## 2. Correções de dados: antes e depois

| Antes | Depois |
| --- | --- |
| Uruguai: “11 anos sem imposto sobre renda estrangeira ou 7%”, apresentado como regra atual. | Regra histórica até 2025. Para novos residentes desde 1 de janeiro de 2026, consultar Ley 20.446 e Decreto 188/026, com ressalvas de conferência. Atualizados comparador, resumo do mapa, painel, diagnóstico e artigo de dividendos. |
| Hint uruguaio: 0% por 11 anos, alternativa de 7%, “Conferido”. | 0% é premissa editável. Hint explica 2025/2026, inclui selo “Conferir” e liga à norma. Alíquota, crédito e fórmulas não mudaram. |
| Capa sem os números oficiais de residências paraguaias da pesquisa nova. | 2025: 40.600, incluindo 23.526 brasileiros. Primeiro trimestre de 2026: 14.275, incluindo 9.195 brasileiros. Fontes Migraciones. Dossiê inclui os demais números paraguaios da base e seus selos. |
| Portugal concentrado na Lei 61/2025 e nacionalidade. | Incluída `pt-estr2026`, sobre estrangeiros e asilo. Comparador e dossiê mencionam a mudança. Número e data de publicação continuam explicitamente a conferir. |
| Linha do tempo com 12 resumos próprios. | 28 registros derivados de `normas`, com data, vigência, efeito, status e link permanente. |

O monitor apresenta 1 norma contestada, 11 recentes, 11 vigentes, 2 pendentes e 3 a conferir, conforme a classificação recebida. O bloco de atenção aplica exatamente o critério solicitado.

## 3. Saída dos testes

```text
node tests/simulator.test.cjs
ℹ tests 18
ℹ pass 18
ℹ fail 0

node tests/rendered.test.cjs
ℹ tests 13
ℹ pass 13
ℹ fail 0

python3 tests/validate_html.py
PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes
PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime
PASS: balanced HTML; 90 unique static IDs; references and hashes resolve
PASS: one principal script; no remote images, external scripts or prohibited APIs
PASS: light/dark tokens; reduced motion; initially visible home; no em dashes
PASS: page 318,925 bytes < 550,000 bytes

git diff --check
Sem erros.
```

Os testes novos verificam as 28 normas e âncoras, todos os filtros de status, combinação de filtros, busca sem acentos, isolamento dos oito países, rotas diretas com filtro anterior ativo, relatos e biblioteca, datas parciais, fontes sem URL, lacunas, localStorage indisponível, ausência de iframe e imagens remotas e hint uruguaio de 2026.

Os hashes SHA-256 originais das três funções fiscais continuam passando. As alíquotas e os créditos padrão de todos os destinos também são comparados explicitamente. O manifesto original não foi regravado. Os hashes das coleções `dests`, `simDests` e `articles` deixaram de ser exigidos, pois o pedido autoriza mudanças nos seus textos. `exits` e `costs` permanecem protegidos pelo manifesto original.

## 4. Tamanho e execução

`index.html`: **318.925 bytes**, aproximadamente **319 KB** ou **311,5 KiB**. Limite de validação: 550.000 bytes.

A página não depende de `data/`, `vendor/` nem de arquivos JavaScript adicionais em execução. Não usa iframe, fetch, imagem remota ou script externo. As fontes tipográficas remotas já existentes na v3 foram preservadas, com as famílias de fallback originais.

## 5. Pendências e interpretações

- A pesquisa foi incorporada sem nova verificação factual. As sete lacunas permanecem visíveis, sobretudo regime uruguaio, publicações portuguesas e julgamento das ADIs brasileiras.
- Os vídeos não foram assistidos pela pesquisa. O aviso integral aparece na biblioteca e nos dossiês que têm vídeos. As URLs não foram revalidadas.
- O placar preserva os cinco resultados existentes: 5 positivos, 2 mistos, 4 retornos ou intenção de retorno, 3 alertas de especialistas e 2 negativos. Os negativos têm grupo próprio; não foram convertidos em retornos ou análises.
- Relatos de especialistas são marcados como “Análise”. O caso empresarial dos EUA mantém a ressalva de expansão da empresa, sem afirmar mudança de residência do dono.
- `numeros` não contém campo de país. Foi usado um mapeamento explícito por índice, testado: Brasil inclui saídas e brasileiros no exterior; os demais registros vão ao país tratado pelo indicador. Nenhum número novo foi criado.
- Fontes com confiança “oficial” mas citadas via imprensa mantêm o rótulo e a atribuição recebidos. Não foi atribuída confiança aos vídeos sem informação na base.
- `uy-20446` mantém status “recente”, como recebido. O selo adicional “Conferir” nas ferramentas sinaliza a limitação dos detalhes de 2026.
- As seis normas da capa são uma seleção editorial de atenção: dividendos brasileiros, ITCMD, acordo Brasil–Paraguai, regime uruguaio, imposto empresarial nos Emirados e visto de investidor nos EUA. O monitor mostra todos os pontos de atenção solicitados.
- Na linha do tempo, datas compostas são ordenadas pelo primeiro marco informado e exibem ambos. Datas incompletas não ganharam dias fictícios.
- O layout mantém os tokens de tema da v3, usa linhas e filetes e tem regras para telas de até 380 px. Os testes verificam estrutura e HTML gerado com objetos mínimos de interface. Não substituem validação visual nem interação em um navegador real. Essa revisão visual permanece pendente.
