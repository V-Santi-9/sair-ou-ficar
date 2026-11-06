# Validação do Sair ou Ficar v5

Execute na pasta do site:

```sh
node tests/simulator.test.cjs
node tests/rendered.test.cjs
python3 tests/validate_html.py
```

Os testes Node executam funções extraídas do próprio `index.html`. Não há dependências npm nem execução de Chromium.

- `simulator.test.cjs`: 18 testes. Contas, limites, crédito, premissas da triagem anterior e hashes SHA-256 originais das três funções fiscais, `exits` e `costs`. A triagem antiga não é chamada pela interface v5. Alíquotas, créditos padrão e ressalva uruguaia continuam verificados.
- `rendered.test.cjs`: 25 testes. Preserva a cobertura v4 e acrescenta igualdade das duas bases v5, modos e condições, três cenários manuais, regras, falta de dados, caso farmacêutico, pontuação de casos, 31 âncoras, 13 setores, integração aos países e HTML gerado. Executa os handlers reais de início, voltar, pular, envio, teclado, persistência, retomada, recomeço e transferência ao simulador usando objetos de interface mínimos.
- `v5-scenarios.cjs`: entradas fixas e valores esperados calculados à mão, independentes do algoritmo sob teste.
- `validate_html.py`: estrutura estática, IDs, ARIA, hashes, mapa, temas, movimento reduzido, recursos proibidos, execução dinâmica proibida e limite de 650.000 bytes. Calcula contraste AA dos tokens de texto sobre os três fundos nos dois temas.

O manifesto `v1-integrity.json` permanece intacto. Os hashes de `dests`, `simDests` e `articles` não são mais exigidos desde a v4, que alterou os textos dessas coleções. As fórmulas continuam protegidas pelos hashes originais.

A página usa somente `index.html`. As bases em `data/` são necessárias apenas para testes de igualdade. `vendor/` serve à reconstrução do mapa por `node tools/build-map.cjs`.

Os objetos mínimos de interface não substituem um DOM real nem verificam layout. A revisão visual deve incluir 380 px, 820 px e desktop; temas claro e escuro; movimento reduzido; menu e painel Estudo com Tab e Esc; diagnóstico completo, retomada e filtros; links de casos, setores e países. Nenhum Chromium foi executado.

Consulte `RELATORIO-V5.md` para resultados, contas, interpretações e pendências.
