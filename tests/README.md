# Validação do Sair ou Ficar v9c

Execute na pasta do site:

```sh
python3 tools/embed.py
node tests/simulator.test.cjs
node tests/rendered.test.cjs
node tests/v8-scenarios.cjs
node tests/sharma.test.cjs
python3 tests/validate_html.py
```

Os testes Node executam funções extraídas do próprio `index.html`. Não há dependências npm nem execução de Chromium.

- `simulator.test.cjs`: 18 testes. Contas, limites, crédito, premissas da triagem anterior e hashes SHA-256 originais das três funções fiscais, `exits` e `costs`. Alíquotas, créditos padrão e ressalva uruguaia continuam verificados.
- `rendered.test.cjs`: 43 testes. Preserva as verificações do restante do site e cobre perguntas concretas, condições, quatro perfis manuais, oito eixos, sete afinidades, veredictos independentes, regras de destino, todas as faixas de custos, valores ausentes, fontes, matriz, contrafactuais, 34 âncoras de casos e 13 setores. Exercita os handlers reais de início, voltar, pular, avanço automático, cancelamento de timer, teclado, atalhos monetários, persistência, retomada, recomeço, reduced motion e transferência ao simulador com objetos mínimos de interface.
- A revisão v8b acrescenta quatro testes de redação, artigos dos sete destinos, data por extenso, justificativas fiscais, contrafactuais recalculados, matriz sem rótulos duplicados, painel parcial e capa alimentada por `axesData`. As opções agora são objetos `{id, t, curta}`; os IDs salvos continuam compatíveis com a v8.
- `v8-scenarios.cjs`: quatro perfis com valores calculados à mão nos comentários e um quinto teste de matriz acessível e contrafactuais. Executável diretamente; também exporta os perfis para `rendered.test.cjs`.
- `validate_html.py`: estrutura estática, IDs, ARIA, hashes, mapa, temas, movimento reduzido, recursos e execução dinâmica proibidos, limite de 700.000 bytes. Calcula contraste AA dos tokens de texto sobre os três fundos nos dois temas.

O manifesto `v1-integrity.json` permanece intacto. As fórmulas fiscais continuam protegidas pelos hashes originais.

A página usa somente `index.html` no navegador. As bases em `data/` são incorporadas por `tools/embed.py` e conferidas nos testes. `vendor/` serve à reconstrução do mapa por `node tools/build-map.cjs`.

Os objetos mínimos de interface não substituem um DOM real nem verificam layout. A revisão visual deve incluir 380 px, 820 px e desktop; temas claro e escuro; movimento reduzido; menu e painel Estudo com Tab e Esc; diagnóstico completo, retomada e filtros; links de casos, setores e países. Nenhum Chromium foi executado.

Consulte `RELATORIO-V8.md` para perguntas, contas, resultados e pendências.

## Estudo econômico v9c

Para recalcular o estudo, sem rede e apenas com a biblioteca padrão:

```sh
python3 tools/regras_sharma.py
python3 tools/embed.py
```

`sharma.test.cjs` tem 16 testes, incluindo a rota real, HTML gerado, estatísticas por período, controle de convergência, soma da nota, ausências, população mínima, postos com empates, corte e regressão conhecidos, painel CSV e um país sintético que lança erro se algum sinal tentar ler depois do ano-base. Uma nova execução integral com 1.000 réplicas compara JSON e CSV byte a byte com os arquivos entregues; este teste leva alguns minutos. A base de entrada é `data/bruto/wdi.json`; o coletor não é executado.

A suíte completa atual tem 18 testes de simulador, 45 de renderização, 11 de cenários e 16 do estudo Sharma, além do validador Python. O JSON econômico deve ter menos de 90.000 bytes. A validação estrutural e de tokens não substitui inspeção visual em um navegador; nenhum Chromium foi utilizado.

A v9b usa PIB real total como resultado principal e como modelo ingênuo. Os testes adicionais verificam as três variantes de robustez, cortes e convergência estimados no treino de cada variante, médias futuras e passadas, ausência de vazamento e OLS da nota controlando pelo passado na validação e na checagem desde 2011.

A v9c preserva a análise v9b e acrescenta seis testes: níveis calculados pelos dois intervalos (incluindo zero, sinais opostos e precisão antes do arredondamento); crescimento recente do WDI com janela completa e sem futuro; lede que responde a mudanças no JSON; termos técnicos restritos ao método final recolhido; tabela ordenada e cartões para até 600 px; botão que abre os números da regra no método e move o foco. O HTML gerado também passa pelo validador estrutural. CSS e eventos são conferidos sem navegador; não houve inspeção visual em Chromium.
