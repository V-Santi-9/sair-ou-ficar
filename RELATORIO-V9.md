# Relatório v9: Ascensão e queda

Implementação offline das sete proxies mensuráveis de *The Rise and Fall of Nations*, Ruchir Sharma (2016). Sem consulta ao livro, sem rede, sem Chromium, sem commit e sem push. Os arquivos de entrada já existentes foram preservados.

## Resultado principal

**0 de 7 regras passaram pelo critério de confirmação.** Isso se refere às proxies e à especificação deste estudo, não a uma refutação integral do livro. Nenhuma direção foi invertida para melhorar o resultado.

O painel contém **4,454 país-anos em 153 economias**, entre 1990 e 2020. A base original tem 217 economias e séries de 1980 a 2025, mas não são 45 anos independentes de previsão. Foram excluídos país-anos com população de 15 a 64 anos inferior a 1 milhão ou alguma taxa futura ausente. Download WDI: 2026-11-09.

Treino: anos-base 1990 a 2005. Validação: 2006 a 2020. Resultado: média aritmética das taxas de crescimento real do PIB per capita de t+1 a t+5. O teste mede crescimento, não a diferença entre crescimento futuro e passado.

## Regras e cortes

Todos os sinais são orientados para que um valor maior corresponda à direção considerada boa. O corte usa o melhor acerto balanceado no treino, em uma grade de percentis de 20 a 80, passo 5. A faixa neutra usa os percentis imediatamente anterior e posterior ao escolhido. Os cortes numéricos são nossos, não do autor.

| Regra | Corte do sinal | Acerto balanceado no treino | Na validação | Spearman na validação (IC 95%) | Q5 menos Q1, p.p. (IC 95%) |
|---|---:|---:|---:|---|---|
| Gente importa | 0,451838 | 47,4% | 47,4% | -0,135 (-0,249 a -0,018) | -1,619 (-2,421 a -0,776) |
| Perigos do Estado | 0,398593 | 51,3% | 52,5% | 0,063 (0,000 a 0,128) | 0,468 (-0,013 a 0,977) |
| Geografia | 79,428729 | 57,7% | 53,4% | 0,080 (-0,033 a 0,191) | 0,710 (-0,103 a 1,472) |
| Fábricas primeiro | 1,600460 | 56,3% | 54,8% | 0,061 (-0,019 a 0,134) | 0,232 (-0,284 a 0,730) |
| Preço da cebola | -9,150228 | 49,1% | 45,5% | -0,092 (-0,204 a 0,021) | -0,003 (-0,906 a 0,999) |
| Barato é bom | -1,136775 | 53,2% | 48,7% | -0,012 (-0,133 a 0,112) | 0,204 (-0,749 a 1,100) |
| O beijo da dívida | -4,556903 | 52,1% | 50,5% | 0,060 (-0,030 a 0,158) | 0,579 (-0,112 a 1,291) |

Falharam no critério completo: **Gente importa, Perigos do Estado, Geografia, Fábricas primeiro, Preço da cebola, Barato é bom e O beijo da dívida**. O site escreve “Esta regra não se confirmou nos dados” em cada caso.

Os cortes de Gente importa, Preço da cebola e Barato é bom não mantiveram a separação esperada na validação. Os outros quatro mantiveram a direção do corte, mas falharam em pelo menos um intervalo de confiança exigido. Em Perigos do Estado, por exemplo, a correlação foi positiva, mas o intervalo da diferença entre quintis incluiu zero. O resultado de Gente importa foi contrário à direção prevista na especificação adotada.

A confirmação exige acerto balanceado do corte acima de 50%, diferença positiva entre grupos e limites inferiores acima de zero para os ICs de Spearman e Q5 menos Q1, tanto no resultado bruto quanto no resíduo de convergência. Não houve correção por testes múltiplos; o estudo é exploratório. Não passar não prova ausência de qualquer relação.

## Nota composta

Nota = soma de +1, 0 e −1, com pelo menos cinco sinais. As regras que falharam continuam na composição, evitando escolher retrospectivamente só as melhores. Ausências não viram zero. Nota >0 prevê crescimento acima da mediana do treino; nota ≤0 prevê abaixo ou igual.

Mediana congelada do treino: **2,285860% ao ano**.

| Amostra comum | Casos | Acerto da nota | Acerto ingênuo | Classe majoritária |
|---|---:|---:|---:|---:|
| Treino | 1709 | 52,6% | 62,2% | 51,6% |
| Validação 2006 a 2020 | 1941 | 52,6% | 71,0% | 60,0% |
| Checagem 2011 a 2020 | 1305 | 52,3% | 71,3% | 63,0% |

**A nota ficou abaixo do modelo ingênuo e da classificação majoritária na validação.** O modelo ingênuo prevê que a média dos cinco anos anteriores se repetirá. As duas classificações usam exatamente os mesmos casos e a mesma mediana do treino. A comparação não usa a mediana futura para decidir a previsão.

| Faixa | Média no treino | Média na validação | Casos na validação |
|---|---:|---:|---:|
| −7 a −3 | 2,27% a.a. | 1,89% a.a. | 323 |
| −2 a 0 | 2,55% a.a. | 1,64% a.a. | 883 |
| 1 a 3 | 2,63% a.a. | 1,66% a.a. | 597 |
| 4 a 7 | 3,05% a.a. | 2,23% a.a. | 138 |

A referência de crescimento mostrada para cada país é a média da sua faixa **no treino**. Ela não usa a validação para calibrar a previsão. A página mostra separadamente a média observada na validação, que não é monotônica. Trata-se de referência experimental, sem intervalo de previsão individual ou promessa de crescimento.

## Aplicação atual

| País | Ano-base | Nota | Sinais | Referência da faixa, treino |
|---|---:|---:|---:|---:|
| Brasil | 2025 | -4 | 7/7 | 2,27% a.a. |
| Paraguai | 2025 | 4 | 7/7 | 3,05% a.a. |
| Uruguai | 2025 | -3 | 7/7 | 2,27% a.a. |
| Portugal | 2025 | 3 | 6/7 | 2,63% a.a. |
| Espanha | 2025 | 3 | 6/7 | 2,63% a.a. |
| Itália | 2025 | 2 | 6/7 | 2,63% a.a. |
| EUA | 2024 | -1 | 6/7 | 2,55% a.a. |
| Emirados | 2024 | indisponível | 2/7 | indisponível |
| Argentina | 2025 | 2 | 6/7 | 2,63% a.a. |
| Chile | 2025 | 0 | 7/7 | 2,55% a.a. |
| México | 2025 | 3 | 7/7 | 2,63% a.a. |
| Colômbia | 2025 | 0 | 7/7 | 2,55% a.a. |

Brasil em 2025: Gente importa -1; Perigos do Estado +1; Geografia -1; Fábricas primeiro -1; Preço da cebola 0; Barato é bom -1; O beijo da dívida -1. Soma: **-4**.

Escolha do ano: 2025 se houver população elegível e cinco sinais; senão 2024. Não se mistura o último valor de anos diferentes. Os EUA usam 2024. Os Emirados têm somente dois sinais em 2024 e ficam sem nota nem previsão. Portugal, Espanha e Itália não têm crédito para o sinal de 2025; nos EUA falta indústria de transformação; na Argentina falta inflação na janela exigida. Câmbio real é componente auxiliar: sua ausência não invalida a média de conta corrente. A página detalha cada ausência.

## Decisões e limitações importantes

- A regressão de convergência foi estimada apenas no treino: crescimento = 3,962426 -0,188329 × log do PIB per capita inicial. Coeficientes congelados nos demais períodos. ICs dos resíduos condicionais a essa estimação, sem refazer OLS em cada réplica.
- Bootstrap em blocos de país: 1.000 réplicas, semente 2016 e derivações fixas por regra/período; preserva todos os anos dos países sorteados. Spearman recalcula os postos e os empates em cada réplica. Quintis fixos dentro do período, ICs condicionais a seus limites.
- O fim do treino usa resultados até 2010 e se sobrepõe aos resultados do começo da validação. A checagem 2011 a 2020 elimina essa sobreposição. Nem mesmo ela é uma simulação com dados disponíveis em tempo real: o WDI atual inclui revisões e não temos versões históricas.
- Choques globais geram dependência entre países que esse bootstrap não corrige. Janelas de cinco anos se sobrepõem. A composição das amostras muda por regra e período. Notas com cinco e sete sinais têm informação diferente.
- Estado: variação do consumo público com sinal invertido, nível como contexto. Geografia: abertura atual mais sua variação, pesos unitários. Fábricas: média das variações do investimento e da indústria; níveis apresentados como contexto.
- Inflação: penaliza inflação positiva, duas vezes o módulo da negativa e volatilidade. Conta corrente: média de cinco anos; câmbio real aparece apenas como variação no próprio país, pois base 2010 não mede sobrevalorização comparável entre países.
- Dívida: usa a variação do crédito invertida. É uma proxy parcial, sem identificação específica da retomada após desalavancagem. Essas decisões são hipóteses de operacionalização, não limites recuperados do livro.
- Regras 2 (ciclo político), 3 (bilionários) e 10 (euforia da mídia) ficam fora da nota e têm explicação qualitativa na página.
- Correlação não é causalidade. As notas não alteram o diagnóstico nem as fórmulas fiscais. Crescimento nacional não substitui custos, visto, mercado, segurança e impostos.

## Entrega e validação

- `tools/regras_sharma.py`: biblioteca padrão, sem rede; função pura de sinais, painel, treino, validação, regressão, bootstrap e aplicação.
- `data/regras-sharma.json`: 78078 bytes, abaixo de 80.000; inclui método, fontes e limitações.
- `data/bruto/painel-sharma.csv`: sinais em precisão integral, resultado, log do PIB inicial, resíduos, previsão ingênua, pontos e nota por país-ano. Os componentes originais continuam auditáveis no WDI de entrada.
- `index.html` e `tools/embed.py`: rota `#ascensao`, menu depois de Destinos, matriz acessível, valores por país, sete gráficos de quintis, série do Brasil em dois painéis e notas nos oito dossiês.
- Layout: tabelas com rolagem horizontal contida e acessível por teclado; regras em uma coluna abaixo de 800 px; SVG do Brasil com viewBox de 390 px; tokens de claro/escuro existentes. Não foi feito teste visual em navegador, conforme a restrição de Chromium.
- `tests/sharma.test.cjs`: estatísticas, país sintético que bloqueia leitura futura, ausências, população mínima, empates e reamostragem, regressão e cortes conhecidos, treino congelado, CSV, soma do Brasil, rota real, markup acessível, embed e determinismo integral de JSON e CSV.

Validação concluída:

```sh
python3 tools/embed.py
node --test tests/simulator.test.cjs tests/rendered.test.cjs tests/v8-scenarios.cjs tests/sharma.test.cjs
python3 tests/validate_html.py
git diff --check
```

**82 testes aprovados, zero falhas**, em aproximadamente 86 segundos. A execução integral com 1.000 réplicas reproduziu JSON e CSV byte a byte. Após o último ajuste de apresentação para exibir “Sem referência” sem sufixo percentual nos países sem previsão, o embed foi executado novamente; os dois testes de rota/embed e o validador Python passaram novamente.

HTML final: **629.186 bytes**, abaixo de 700.000. Estrutura balanceada, 114 IDs estáticos únicos, referências resolvidas e nenhum travessão. Contraste mínimo dos tokens de texto: **4,89:1 no tema claro e 5,90:1 no escuro**. `git diff --check` sem erros. As fórmulas fiscais e seus hashes originais passaram nos testes existentes. Nenhum commit, push, acesso de rede ou Chromium foi executado.


## Apêndice v9b

Mudança de especificação: a primeira versão usava PIB per capita e confirmou 0 de 7 regras. Trocamos para PIB real total, a medida de crescimento do livro, e confirmamos 0 de 7. A troca foi feita depois de ver o primeiro resultado; por isso os dois aparecem. O crescimento per capita incorpora o denominador populacional, o que pode penalizar mecanicamente a regra Gente importa.

Este apêndice substitui os resultados principais acima; o corpo v9 foi preservado como registro da especificação original. Nenhuma fonte foi baixada novamente.

Resultado principal: média do crescimento real do PIB **total**, `NY.GDP.MKTP.KD.ZG`, em t+1 a t+5. Painel: **4454 país-anos, 153 economias**. Treino 1990 a 2005, validação 2006 a 2020 e checagem 2011 a 2020. O controle continua sendo o resíduo da regressão no log do PIB per capita inicial, estimada só no treino.

### Tabela principal nova

| Regra | Corte | Acerto balanceado treino / validação | Spearman validação (IC 95%) | Q5 − Q1, p.p. (IC 95%) | Spearman após convergência (IC 95%) | Q5 − Q1 após convergência (IC 95%) | Veredito |
|---|---:|---:|---|---|---|---|---|
| Gente importa | 1,697654 | 60,5% / 68,0% | 0,337 (0,236 a 0,429) | 1,649 (0,853 a 2,479) | 0,198 (0,096 a 0,291) | 0,771 (-0,017 a 1,552) | Não confirmada |
| Perigos do Estado | 0,711489 | 54,4% / 53,7% | 0,055 (-0,017 a 0,136) | 0,644 (0,086 a 1,257) | 0,060 (-0,008 a 0,135) | 0,607 (0,110 a 1,168) | Não confirmada |
| Geografia | 79,428729 | 57,0% / 46,5% | -0,043 (-0,155 a 0,070) | 0,065 (-0,786 a 0,923) | 0,037 (-0,080 a 0,149) | 0,687 (-0,118 a 1,557) | Não confirmada |
| Fábricas primeiro | 1,203118 | 57,9% / 60,8% | 0,146 (0,068 a 0,218) | 0,869 (0,237 a 1,468) | 0,100 (0,013 a 0,174) | 0,553 (-0,030 a 1,075) | Não confirmada |
| Preço da cebola | -31,087895 | 46,5% / 49,8% | -0,253 (-0,365 a -0,136) | -1,091 (-2,146 a 0,019) | -0,079 (-0,191 a 0,035) | 0,140 (-0,854 a 1,238) | Não confirmada |
| Barato é bom | -0,692186 | 50,5% / 48,3% | -0,058 (-0,170 a 0,067) | 0,171 (-0,686 a 1,133) | 0,111 (-0,000 a 0,232) | 1,150 (0,392 a 1,981) | Não confirmada |
| O beijo da dívida | -4,556903 | 56,7% / 52,6% | 0,086 (-0,001 a 0,178) | 0,716 (-0,024 a 1,473) | 0,060 (-0,035 a 0,154) | 0,593 (-0,110 a 1,351) | Não confirmada |

O critério continua exigindo acerto balanceado >50%, diferença positiva entre grupos do corte e limites inferiores dos ICs de Spearman e Q5 menos Q1 >0, antes e depois do controle de convergência. São 1.000 réplicas de bootstrap por país, com postos recalculados; os quintis e o ajuste de convergência ficam congelados como na v9. Não houve inversão de sinais ou seleção retrospectiva de regras para a nota.

Gente importa e Fábricas primeiro têm Spearman positivo com IC acima de zero, mas falham no IC da diferença entre quintis após convergência: os limites inferiores são −0,016720 e −0,030290 p.p., respectivamente. Por isso a correção muda bastante as associações, mas não a contagem final de confirmações.

### Tabela de robustez

Cada célula mostra Spearman na validação, IC 95% e veredito pelo critério completo, não apenas pelo IC de Spearman.

| Regra | PIB per capita (v9) | PIB total, renda média | Aceleração do PIB total |
|---|---|---|---|
| Gente importa | -0,135 (-0,249 a -0,018); não confirmada; n=2196 | 0,259 (0,128 a 0,374); não confirmada; n=1193 | -0,131 (-0,199 a -0,058); não confirmada; n=2188 |
| Perigos do Estado | 0,063 (0,000 a 0,128); não confirmada; n=1997 | 0,041 (-0,063 a 0,134); não confirmada; n=1062 | -0,066 (-0,143 a 0,012); não confirmada; n=1997 |
| Geografia | 0,080 (-0,033 a 0,191); não confirmada; n=2014 | 0,019 (-0,137 a 0,174); não confirmada; n=1094 | 0,007 (-0,056 a 0,074); não confirmada; n=2014 |
| Fábricas primeiro | 0,061 (-0,019 a 0,134); não confirmada; n=1879 | 0,152 (0,043 a 0,248); não confirmada; n=1014 | -0,159 (-0,225 a -0,090); não confirmada; n=1879 |
| Preço da cebola | -0,092 (-0,204 a 0,021); não confirmada; n=2053 | -0,133 (-0,275 a 0,016); não confirmada; n=1105 | 0,105 (0,032 a 0,163); confirmada; n=2048 |
| Barato é bom | -0,012 (-0,133 a 0,112); não confirmada; n=1976 | 0,088 (-0,053 a 0,234); não confirmada; n=1099 | 0,056 (-0,021 a 0,145); não confirmada; n=1975 |
| O beijo da dívida | 0,060 (-0,030 a 0,158); não confirmada; n=1766 | 0,020 (-0,127 a 0,157); não confirmada; n=929 | 0,180 (0,111 a 0,247); confirmada; n=1766 |

Confirmadas por variante: PIB per capita (v9): **0/7**; PIB total, renda média: **0/7**; Aceleração do PIB total: **2/7**.

As variantes refazem mediana, cortes e convergência exclusivamente no respectivo treino. A variante per capita reproduz a especificação v9 e usa as mesmas sementes. Renda média inclui somente `Lower middle income` e `Upper middle income`, conforme `renda` do download WDI; essa classificação é estática, não histórica. Aceleração é a média de t+1 a t+5 menos a média de t−4 a t, ambas do PIB total; exige as dez taxas. O JSON compacto inclui os ICs e as condições que determinam cada veredito.

### Nota composta e informação adicional

Mediana do treino: **3,980979% ao ano** de PIB real total. Modelo ingênuo: repetir a média do crescimento total em t−4 a t.

| Amostra comum | Casos | Acerto nota | Acerto ingênuo | Classe majoritária |
|---|---:|---:|---:|---:|
| Treino | 1709 | 56,9% | 58,9% | 50,0% |
| Validação 2006 a 2020 | 1941 | 59,9% | 70,5% | 65,7% |
| Checagem 2011 a 2020 | 1305 | 57,9% | 73,9% | 70,5% |

Regressão OLS com intercepto: crescimento futuro = intercepto + β × nota + γ × crescimento passado. A nota usa cortes congelados no treino; a regressão é um diagnóstico estimado na amostra reservada, não um modelo de previsão calibrado no treino. Cada réplica reamostra países inteiros e refaz OLS; IC condicional à nota e aos cortes.

| Amostra | Países | β da nota, p.p. por ponto (IC 95%) | γ do passado | Intercepto |
|---|---:|---|---:|---:|
| 2006 a 2020 | 140 | 0,119 (0,041 a 0,199) | 0,343 | 1,724 |
| 2011 a 2020 | 138 | 0,047 (-0,029 a 0,138) | 0,372 | 1,633 |

Há associação positiva adicional da nota, mantendo o passado constante. Na checagem desde 2011, o IC inclui zero; portanto o acréscimo positivo não se sustenta pelo mesmo critério nessa subamostra. Isso não identifica efeito causal nem garante ganho de previsão individual.

A aplicação atual também foi recalculada: Brasil em 2025, nota **-3**, 7/7 sinais, referência da faixa no treino **3,04% a.a.** de PIB total. O CSV contém o novo resultado, ingênuo, resíduo, pontos e nota; JSON, gráficos e textos da página usam os resultados regenerados.

### Artefatos e validação v9b

O JSON tem **86.815 bytes**, abaixo do limite de 90.000; o HTML incorporado tem **640.427 bytes**, abaixo de 700.000. O embed foi regenerado após o cálculo. O validador estrutural passou, incluindo IDs, referências, hashes fiscais, ausência de recursos remotos e contraste dos temas. A implementação usa somente bibliotecas padrão e a base WDI local; sem rede, Chromium, commit ou push.

Comandos de validação:

```sh
python3 -B tools/embed.py
node --test tests/simulator.test.cjs tests/rendered.test.cjs tests/v8-scenarios.cjs tests/sharma.test.cjs
python3 -B tests/validate_html.py
git diff --check
```

**84 testes aprovados, zero falhas**, em aproximadamente 131 segundos. A execução integral com 1.000 réplicas reproduziu JSON e CSV byte a byte. Os dois testes novos verificam a série principal de PIB total, as três variantes, janelas completas, cortes e convergência sem vazamento, coeficientes OLS conhecidos, reamostragem por país e regressão na amostra reservada. O validador Python e `git diff --check` passaram.


## Apêndice v9c: “Ascensão e queda” para o dono de empresa

A apresentação passa a distinguir **Relação clara**, **Relação contrária** e **Sem relação clara**. A função Python `nivel_relacao` aplica a regra pré-declarada às sete regras na validação principal, PIB total, 2006 a 2020: os dois limites inferiores dos ICs de Spearman, bruto e após convergência, precisam superar zero para relação clara; os dois limites superiores precisam ficar abaixo de zero para relação contrária. Todo o restante fica sem relação clara. Zero não conta como positivo nem negativo; o cálculo ocorre antes do arredondamento. O resultado é salvo em `regras[].nivel`.

| Regra | Nível v9c | Passou em todo o critério estrito? |
|---|---|---|
| Gente importa | Relação clara | Não |
| Fábricas primeiro | Relação clara | Não |
| Perigos do Estado | Sem relação clara | Não |
| Geografia | Sem relação clara | Não |
| Preço da cebola | Sem relação clara | Não |
| Barato é bom | Sem relação clara | Não |
| O beijo da dívida | Sem relação clara | Não |

Preço da cebola tem relação contrária apenas no resultado bruto; ela desaparece ao descontar a renda inicial. A página explica isso em uma frase. O veredito estrito permanece como segunda linha de cada regra e seu critério completo continua no método. Nenhum corte, sinal, peso, estatística, variante de robustez ou resultado da nota foi alterado.

### Abertura e leitura dos resultados

Título: **Ascensão e queda: o que as regras de Sharma acertam**. A lede usa os números do JSON: 7 de 10 regras, 153 países, anos-base de 1990 a 2020, duas relações claras, cinco sem relação clara e acertos arredondados de 60% para a nota e 71% para o crescimento recente. A contagem e os nomes dos sinais claros seguem `nivel`; um teste muda países, anos, acertos e classificação para conferir que o texto acompanha a base.

Cada regra mostra o que diz o livro, o que medimos em linguagem comum, o nível, o veredito estrito e o crescimento dos 20% com sinal mais forte e mais fraco. As barras usam os mesmos valores da v9b, com grupos numerados de 1 a 5 e legenda em linguagem comum. A nota sobre grupos esclarece que um mesmo país pode aparecer em diferentes anos. O bloco sobre a decisão de sair tem três frases: mercado de venda no destino, população ativa e investimento, e cautela com histórias de crescimento; mantém os links para `#perfil` e `#destinos`.

Todos os detalhes técnicos ficam no bloco final **Método e limites**, recolhido por padrão, incluindo mudança de especificação, robustez, comparação da nota, regressões, faixas, valores por país, fontes e limites. Cada regra tem um `<details>` **Números do teste** dentro desse bloco. O botão junto à leitura simples abre o método e o detalhe correspondente, move o foco para seu resumo e leva o leitor aos números. A mudança de especificação permanece visível assim que o método é aberto. Os termos proibidos não aparecem fora desse bloco, inclusive em descrições dos gráficos.

### Países e celular

As colunas Gente importa e Fábricas primeiro aparecem primeiro, destacadas. As outras cinco ficam sob **Sem relação clara nos dados**, usando `--muted`, token secundário já validado nos dois temas. As células mostram classificação e valor do sinal. A coluna **Referência da faixa** sai da tabela; seu lugar é ocupado por **Crescimento médio dos últimos 5 anos (PIB total)**. As referências antigas continuam nos dados e no método para auditoria.

A função Python `crescimento_recente` calcula a média aritmética das cinco taxas WDI de PIB total entre t−4 e t, no mesmo ano-base usado na nota, e salva `atual[].crescimento_recente`. Exige as cinco taxas, sem imputação nem consulta ao futuro. Para o Brasil, ano-base 2025, a média de 2021 a 2025 é **3,345203% ao ano**, exibida como **3,35% ao ano**. EUA e Emirados usam 2024; a janela de cada cartão é explícita.

Até 600 px, a tabela fica oculta e aparece um cartão por país, Brasil primeiro: nome e ano, crescimento recente, as duas regras claras com valor, nota e as outras cinco em um `<details>`. A nota de rodapé diz: “A nota soma as sete regras. Ela não previu melhor que o crescimento recente.”

### Preservação e validação

Uma comparação com a cópia da base v9b anterior à edição confirmou igualdade de todo o JSON depois de retirar apenas os novos campos `nivel` e `crescimento_recente`, a versão e as duas novas decisões documentais. O CSV permaneceu idêntico byte a byte. O JSON tem **87.988 bytes** e o HTML incorporado **647.340 bytes**, dentro dos limites de 90.000 e 700.000 bytes.

O embed foi regenerado com `python3 -B tools/embed.py`. Foram acrescentados seis testes de v9c, além do ajuste de texto da rota existente. Os testes exercitam classificação e fronteiras, dados WDI, lede dinâmica, isolamento de termos técnicos, agrupamento e cartões responsivos e abertura dos detalhes com foco. Sem rede, Chromium, commit ou push; a verificação de layout é estrutural e por CSS, sem inspeção visual em navegador.
