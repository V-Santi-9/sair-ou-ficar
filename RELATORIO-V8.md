# Relatório v8: Sair ou Ficar

Data: 6 de novembro de 2026.

Diagnóstico refeito em `data/perguntas-v5.json` e `index.html`. Estado `version: 8`, chave `sair-ficar-diagnostico-v8`. O arquivo de dados mantém o nome para a rotina diária. `var axesData` continua incorporada por `tools/embed.py`.

Sem commit, push ou Chromium. Nenhum serviço externo foi usado para testar a interface.

## 1. Perguntas finais

São 15 perguntas de núcleo. Folha, energia e regulação aparecem apenas para fábrica própria ou produção terceirizada: o modo rápido tem 15 perguntas para quem fabrica e 12 para os demais. O completo inclui as mesmas 15 e mais 24, até 39 conforme as condições.

As escolhas são linhas com o texto inteiro clicável. A seleção avança após 250 ms; com movimento reduzido, avança sem espera. Voltar, continuar, reiniciar e retomar cancelam avanços pendentes. Atalhos 1 a 5 selecionam as primeiras cinco opções. Os campos monetários têm atalhos, mas avançam ao confirmar. O setor conserva as 13 opções da base, conforme o pedido de manter essa pergunta.

Cada pergunta tem `t`, `opcoes`, `porque`, `eixo`, `se`, `nucleo`, `tipo` e `bloco`. Nos números, `opcoes` é vazia e `atalhos` contém os valores. Os eixos usam mapas por opção dentro de cada eixo; os números se enquadram em zero, positivo ou renda externa relevante.

### Modo rápido

**1. `setor` · Qual é o setor principal da empresa?**

Opções: Têxtil e confecção; Calçados; Plásticos e embalagens; Alumínio, metalurgia, esquadrias; Autopeças e componentes elétricos; Alimentos, frigorífico, laticínio; Farmacêutico, saúde, químico regulado; Transporte e logística; Varejo e comércio; Tecnologia e software; Serviços profissionais; Agronegócio; Outro.

Por que: O setor permite comparar seu negócio com casos reais e identificar limites de regulação.

**2. `industria` · A empresa fabrica o que vende?**

Opções: Sim, em fábrica própria; Sim, mas terceirizo a produção; Não: vendemos serviço ou revenda.

Por que: A conta de produzir fora só se aplica a quem fabrica. Revenda e serviço local não entram na maquila industrial.

**3. `porte` · Quantos funcionários a empresa tem?**

Opções: Até 10; De 11 a 50; De 51 a 200; De 201 a 1.000; Mais de 1.000.

Por que: O porte aproxima seu negócio dos casos da base; não aumenta o ganho estimado.

**4. `regime` · Qual é o regime tributário da empresa?**

Opções: Simples Nacional; Lucro Presumido; Lucro Real; Não sei.

Por que: O regime define a premissa de imposto da empresa na conta dos dividendos. No Simples, a carga já pode ser baixa.

**5. `export` · Onde estão os clientes que pagam a conta?**

Opções: Só no Brasil; Quase todos no Brasil (menos de 10% fora); Uma parte fora (10% a 30%); Boa parte fora (30% a 60%); A maioria fora (mais de 60%).

Por que: A empresa pode abrir uma filial para acompanhar o cliente sem mudar a fábrica ou a residência do dono.

**6. `folha` · De cada R$ 100 de custo, quanto é folha de pagamento com encargos?**

Opções: Menos de R$ 15; R$ 15 a R$ 30; R$ 30 a R$ 50; Mais de R$ 50; Não sei.

Por que: No Brasil os encargos somam de 60% a mais de 100% do salário; no Paraguai, de 25% a 35%.

Condição: industria em sim, terceiro.

**7. `energia` · E quanto é energia elétrica, em cada R$ 100 de custo?**

Opções: Menos de R$ 3; R$ 3 a R$ 8; R$ 8 a R$ 15; Mais de R$ 15; Não sei.

Por que: A base compara energia industrial de US$ 113/MWh no Brasil com US$ 41/MWh no Paraguai.

Condição: industria em sim, terceiro.

**8. `regulacao` · Para vender seu produto no Brasil, o que você precisa?**

Opções: Nada além de nota fiscal; Certificação técnica (Inmetro, norma ABNT); Registro sanitário por produto e inspeção da fábrica (Anvisa, MAPA); Licença, concessão ou contrato com governo.

Por que: Registro sanitário pode ser exigido por produto e por fábrica. A mudança de planta exige um estudo próprio.

Condição: industria em sim, terceiro.

**9. `familia` · Se a conta fechasse, quem se mudaria?**

Opções: Só eu; Eu e cônjuge; A família, com filhos na escola; Ninguém: não pretendo me mudar.

Por que: Sem mudança real de vida não há saída fiscal. Abrir uma empresa fora não muda sua residência.

**10. `presenca` · A empresa anda sem você no dia a dia?**

Opções: Não, eu sou a operação; Em parte: tenho gerentes, mas decido tudo; Sim: tenho sócio ou diretor que toca.

Por que: A operação precisa continuar no Brasil quando o dono se muda. Essa resposta mostra o esforço de gestão.

**11. `cidadania` · Você ou a família tem outra cidadania?**

Opções: Não; Portuguesa, italiana, espanhola ou outra da União Europeia; Americana; Em processo.

Por que: A cidadania europeia facilita a residência na Europa; algumas cidadanias também permitem pedir o visto E-2.

**12. `dividendos` · Quanto você retira de dividendos por mês da empresa brasileira?**

Campo: R$ por mês. Atalhos: R$ 20.000; R$ 50.000; R$ 100.000; R$ 200.000.

Por que: Dividendos brasileiros continuam sujeitos à retenção para quem sai. O simulador compara isso com o IR mínimo de quem fica.

**13. `rend_ext` · Quanto rendem por ano seus investimentos fora do Brasil?**

Campo: R$ por ano (zero se não tem). Atalhos: Zero; R$ 50.000; R$ 300.000; R$ 1.000.000.

Por que: A renda de fora tem tratamento diferente dos dividendos brasileiros. Separar as duas evita uma economia ilusória.

**14. `motivo` · Se tivesse que escolher um único motivo para sair, qual seria?**

Opções: Pagar menos imposto; Segurança; Escola e futuro dos filhos; Fugir da instabilidade política e jurídica; Não quero sair: quero produzir mais barato.

Por que: O motivo escolhe o destino a estudar. Qualidade de vida pode justificar uma mudança mesmo quando o imposto aumenta.

**15. `risco` · Você aceitaria dois anos de lucro menor para montar uma operação fora?**

Opções: Sim; Só com sócio local; Não.

Por que: Montar a operação exige tempo e capital antes de gerar economia. Os casos não garantem retorno.

### Perguntas adicionais do modo completo

O modo completo inclui todas as perguntas do modo rápido, além destas.

**1. `capital` · Quanto você poderia investir fora sem depender desse dinheiro?**

Opções: Menos de US$ 100 mil; Entre US$ 100 mil e US$ 500 mil; Entre US$ 500 mil e US$ 1 milhão; Mais de US$ 1 milhão.

Por que: Capital e inglês permitem considerar os EUA. O visto e a operação real ainda precisam ser verificados.

**2. `prazo` · Em quanto tempo você quer decidir?**

Opções: Nos próximos 12 meses; Em até 3 anos; Sem pressa, mais de 3 anos.

Por que: O prazo mostra quanto tempo existe para validar a mudança com a família e a operação.

**3. `idioma` · Em qual língua você consegue trabalhar?**

Opções: Falo inglês; Falo espanhol; Os dois; Nenhum.

Por que: O inglês é uma condição deste diagnóstico para considerar os EUA. O idioma também pesa na adaptação.

**4. `dependentes` · Quem depende do seu cuidado presencial no Brasil?**

Opções: Ninguém; Parentes com outro cuidador disponível; Parentes sem outro cuidador.

Por que: Cuidado presencial pode limitar a mudança real de residência.

**5. `conjuge` · Como seu cônjuge vê a mudança?**

Opções: Apoia e participa do plano; Ainda estamos decidindo; Não quer se mudar.

Por que: Uma decisão compartilhada reduz o risco de retorno por adaptação familiar.

Condição: familia em casal, filhos.

**6. `governo` · Quanto das vendas depende de contratos com governo?**

Opções: Nada; Uma parte; A maior parte.

Por que: Licitações e contratos podem exigir operação e presença no Brasil.

**7. `asia` · Você perdeu vendas para importados asiáticos no último ano?**

Opções: Não; Sim, em alguns pedidos; Sim, em clientes recorrentes.

Por que: Concorrência por preço ajuda a contextualizar os custos, mas não entra como economia automática.

Condição: industria em sim, terceiro.

**8. `frete` · De cada R$ 100 do preço final, quanto é frete?**

Opções: Menos de R$ 5; R$ 5 a R$ 15; Mais de R$ 15; Não sei.

Por que: Frete pode consumir o ganho de folha e energia. A conta ilustrativa não desconta esse custo.

Condição: industria em sim, terceiro.

**9. `imoveis` · O que pretende fazer com seus imóveis no Brasil?**

Opções: Não tenho imóveis; Manter e alugar; Manter para uso da família.

Por que: Patrimônio no Brasil exige gestão e pode manter obrigações mesmo depois de sair.

**10. `sucessao` · Existe um plano de sucessão para a empresa?**

Opções: Sim, formalizado; Está sendo preparado; Ainda não.

Por que: Sucessão é uma alternativa de reorganização no Brasil e merece estudo separado da residência.

**11. `holding` · Você já tem holding ou empresa no exterior?**

Opções: Não; Sim, apenas patrimonial; Sim, com operação e equipe.

Por que: Ter estrutura fora não prova residência fiscal. A finalidade da estrutura precisa ser conferida.

**12. `morou_fora` · Você já morou fora do Brasil?**

Opções: Nunca; Sim, por até seis meses; Sim, por mais de seis meses.

Por que: Experiência de moradia informa a adaptação; uma viagem não substitui mudança de vida.

**13. `abriu_empresa` · Você já abriu uma empresa do zero?**

Opções: Nunca; Sim, no Brasil; Sim, em outro país.

Por que: Experiência operacional ajuda a avaliar o risco de implantação.

**14. `mudanca_regra` · Se o destino mudar a regra de imposto, o que você faria?**

Opções: Voltaria ao Brasil; Reavaliaria com uma reserva de caixa; Manteria a mudança por outros motivos.

Por que: Regimes podem mudar. O Uruguai já exige conferir as condições para novos residentes em 2026.

**15. `importacao` · Quanto dos insumos vem de fora do Brasil?**

Opções: Nada; Menos da metade; Metade ou mais; Não sei.

Por que: Insumos importados aparecem nos casos industriais, mas seu benefício não entra na fórmula de ganho.

Condição: industria em sim, terceiro.

**16. `manual` · Como é a maior parte da produção?**

Opções: Automatizada; Mista: máquinas e trabalho manual; Manual ou linha de montagem.

Por que: Uma produção intensiva em trabalho sente mais a diferença de encargos.

Condição: industria em sim, terceiro.

**17. `energia_reserva` · Como a fábrica reage a uma queda de energia?**

Opções: Continua com gerador próprio; Para até a energia voltar; Não sei.

Por que: Os relatos citam falhas de fornecimento e investimentos em geradores no Paraguai.

Condição: industria em sim, terceiro.

**18. `cliente_fora` · Qual contato comercial você já tem fora?**

Opções: Nenhum; Conversas sem pedido; Pedidos ou contratos assinados.

Por que: Uma filial se sustenta melhor com cliente identificado do que com expectativa de mercado.

**19. `proximidade` · Como você atende o cliente brasileiro?**

Opções: Tudo a distância; Visitas periódicas; Presença diária.

Por que: A necessidade de proximidade ajuda a avaliar a mobilidade da operação.

**20. `venda_empresa` · Existe plano de vender a empresa?**

Opções: Não; Sim, sem negociação aberta; Sim, com negociação em andamento.

Por que: Venda de participação pede uma conta própria; não está incluída nos dividendos mensais.

**21. `renda_trabalho` · Você recebe por trabalho para uma empresa de fora?**

Opções: Não; Sim, como empregado; Sim, como prestador.

Por que: Renda de trabalho não é rendimento de investimento. Exige simulação separada.

**22. `rede` · Você tem parceiros de confiança no destino?**

Opções: Nenhum; Contatos sem trabalho conjunto; Sócio ou parceiro com quem já trabalhei.

Por que: Apoio local pode reduzir o risco de começar uma operação.

**23. `escola_idioma` · Como os filhos lidam com a língua da futura escola?**

Opções: Já estudam nessa língua; Estão aprendendo; Ainda não conhecem.

Por que: Idioma e escola fazem parte do custo de adaptação da família.

Condição: familia em filhos.

**24. `conselho` · Seu trabalho exige registro profissional no Brasil?**

Opções: Não; Sim, mas a equipe pode atender; Sim, depende do meu registro.

Por que: Exigência profissional pode manter a operação vinculada ao Brasil.

## 2. Lógica e fórmulas

### Empresa

A decisão operacional não depende dos oito eixos nem da afinidade.

```text
G = folha × (1 − 1,30/1,80) + energia × (1 − 41/113)
  = folha × 27,777…% + energia × 63,716…%
```

| Resposta sobre folha | Fração do custo |
| --- | --- |
| Menos de R$ 15 por R$ 100 | 0,10 |
| R$ 15 a R$ 30 | 0,22 |
| R$ 30 a R$ 50 | 0,40 |
| Mais de R$ 50 | 0,60 |
| Não sei | 0,25 |

| Resposta sobre energia | Fração do custo |
| --- | --- |
| Menos de R$ 3 por R$ 100 | 0,02 |
| R$ 3 a R$ 8 | 0,055 |
| R$ 8 a R$ 15 | 0,11 |
| Mais de R$ 15 | 0,20 |
| Não sei | 0,05 |

Fontes: os mesmos agregados `a5` (encargos) e `a4` (energia) da base, com referências numeradas ao lado da conta. O fator brasileiro 1,80 é a aproximação central da faixa de 60% a mais de 100%; 1,30 é o centro da faixa paraguaia de 25% a 35%. Os valores industriais são US$ 113/MWh e US$ 41/MWh.

G ≥ 10%: “Vale estudar a sério”. De 5% até menos de 10%: “Pode valer; depende de frete e escala”. Abaixo de 5%: “Pelo custo, não compensa”. Registro sanitário reduz exatamente um nível, com piso no nível mais baixo. Não muda o número G, pois a base não quantifica o custo de certificação.

A estimativa não inclui salário menor, frete, câmbio, imposto ou retorno do investimento. Responder “não sei” aplica a premissa declarada; pular deixa o ganho pendente. Sem fabricação, a operação fica no Brasil. Exportação nas faixas 30–60% ou acima de 60% abre o caminho `filial_ext`; é uma filial comercial, não produção no exterior.

As faixas, fatores, limiares, fontes, alíquotas e critérios de destino estão em `parametros`. Respostas condicionais ocultas são removidas ao editar ou retomar e não entram nos eixos ou nas decisões.

### Dono

Família = ninguém ou motivo = produzir mais barato: o dono fica, mesmo quando a hipótese fiscal de saída daria economia. Sem dinheiro informado, a conta fica pendente.

Escolha de destino:

- Imposto: Paraguai. Com renda externa a partir de R$ 300 mil/ano: Uruguai e caminho `patrimonio`.
- Segurança ou escola: Portugal. Cidadania UE: Espanha. Capital de pelo menos US$ 500 mil e inglês, inclusive “os dois”: EUA, com precedência sobre a cidadania europeia.
- Instabilidade: Uruguai com renda externa relevante; Portugal nos demais casos.
- Produção mais barata ou motivo ausente: Paraguai apenas como comparação hipotética, sem recomendar a mudança do dono.

O rápido não presume capital nem inglês. Uruguai conserva a ressalva do simulador sobre o regime de 2026. Espanha foi escolhida entre os destinos europeus permitidos porque já tem premissa no simulador. Não foi criada uma alíquota italiana.

```text
D = dividendos mensais
E = renda anual de investimentos no exterior
C = 0,34 no Lucro Real; 0,15 nos demais regimes, inclusive não informado
R = alíquota do destino em simDests

Ficar = stayTax(D, C).total + E × 0,15
Sair  = goTax(D, R, crédito do destino).total + E × R
Diferença = Sair − Ficar
```

As fórmulas originais continuam intactas:

```text
Anual = 12 × D
r = 0, se Anual ≤ 600.000
r = 0,10, se Anual ≥ 1.200.000
r = (Anual / 60.000 − 10) / 100, nos demais valores
Bruto = Anual × r
Redutor = min(Bruto, Anual × max(0, C + r − 0,34))
stayTax.total = Bruto − Redutor

goTax.br = Anual × 0,10
goTax.dest = Anual × R
Com crédito: goTax.total = goTax.br + max(0, goTax.dest − goTax.br)
Sem crédito: goTax.total = goTax.br + goTax.dest
```

Se o motivo é imposto, só há indicação de mudança se Sair < Ficar. Custo maior ou empate mantém o dono no Brasil. Se o motivo é qualidade de vida ou estabilidade, a mudança é uma hipótese coerente com o objetivo, com a piora ou melhora de imposto explicitada em reais por ano. O custo extra de vida fica em zero, como declarado na nota.

O botão “Abrir no simulador” transfere dividendos, renda externa, destino e 34% ou 15% conforme o regime. As alíquotas, créditos e funções do simulador não foram alterados.

### Matriz, regras, eixos e aprofundamento

| Combinação | Caminho principal |
| --- | --- |
| Empresa fica / dono fica | `ficar` |
| Produz fora / dono fica | `maquila` |
| Empresa fica / dono muda | `dono_py`, `vida_europa`, `eua` ou `patrimonio` |
| Produz fora / dono muda | `maquila` + `dono_py` |
| Filial comercial | `filial_ext` |

Para imposto desfavorável no Paraguai, `ficar` aparece primeiro e `dono_py` como alternativa a estudar. A afinidade não interfere nessa ordem. A célula provável usa cinza no teste e o acento no resultado. O SVG possui `role="img"` e `aria-label`; o texto também identifica a seleção, sem depender só da cor. Há desenho compacto no painel lateral e faixa recolhível no celular.

Regras v1 a v8:

- v1: veto à maquila em varejo/serviços sem fabricação.
- v2: alerta sanitário e rebaixamento de um nível, somente quando essa exigência foi informada.
- v3: alerta de dividendos quando há intenção de mudar por imposto e a saída custa mais.
- v4: sem mudança real da família, veto aos caminhos de residência.
- v5: alerta do Simples.
- v6: capital inferior a US$ 100 mil, com motivo de segurança/escola, alerta sobre vistos americanos.
- v7: cidadania UE e motivo de qualidade de vida/estabilidade reforçam a viabilidade migratória europeia.
- v8: cidadania UE com destino EUA traz a observação sobre E-2.

Os reforços são condições favoráveis explicadas, sem adicionar pontuação à decisão ou ao ranking.

```text
Eixo = 100 × soma dos pesos das opções / (2 × número de perguntas aplicáveis naquele eixo)
Ideal normalizado = ideal × 50
Afinidade = 100 − 100 × √Σ(eixo − ideal normalizado)² / (200 × √n)
```

Sem resposta válida, o eixo fica em zero e “sem dados”. Pular contribui zero no denominador das perguntas aplicáveis. Os sete caminhos permanecem no ranking recolhido; os vetados ou sem requisito aparecem como “não aplicável”. Não há bônus. Valores de eixo são arredondados só na apresentação. O retrato verbal usa módulo abaixo de 15 = equilibrado, abaixo de 30 = leve, abaixo de 60 = moderado e a partir de 60 = forte.

A seção “O que mudaria esta resposta” percorre opções e atalhos das perguntas aplicáveis, troca uma resposta de cada vez e chama novamente a mesma decisão. Mostra até três alternativas que alteram nível/saída da empresa, filial, mudança do dono ou destino de uma mudança. Quando nenhuma alternativa testada muda a decisão, informa “Nenhuma troca simples muda o resultado”. Não deriva sugestões do ranking.

Casos parecidos conservam a tabela, fontes, narrativas, critérios de semelhança e desempate. `caminhos`, inclusive todos os `texto` e `ideal`, ficaram idênticos a HEAD. A rotina diária pode apenas acrescentar frases aos textos; `tools/ROTINA.md` agora protege explicitamente `parametros`, perguntas e regras.

## 3. Cenários conferidos à mão

### 1. Têxtil, fábrica própria, Lucro Real, ninguém muda

Folha de R$ 30 a R$ 50; energia de R$ 3 a R$ 8 por R$ 100. Clientes só no Brasil, motivo imposto, dividendos de R$ 80 mil/mês, renda externa zero.

```text
G = 0,40 × (5/18) + 0,055 × (72/113)
  = 0,1461553588987217 = 14,6155…%
```

“Vale estudar a sério”. A interface mostra 15%, e a nota da conta mostra 14,6%. Dono fica, regra v4, caminho `maquila`, célula `fora/fica`. Ficar: R$ 0/ano, pois Lucro Real de 34% aplica o redutor integral; sair: R$ 96.000/ano. Não se usa R$ 57.600 neste cenário, valor que corresponderia à premissa empresarial de 15%.

Manchete: “Estude produzir no Paraguai. Você fica no Brasil.” Trocas calculadas incluem folha menor e registro sanitário, que reduzem o nível da empresa.

### 2. Serviços, sem fábrica, Presumido, casal, motivo imposto

Dividendos de R$ 80 mil/mês e renda externa zero. Empresa fica, destino hipotético Paraguai.

```text
Anual = 960.000
IR mínimo = 6%
Ficar = 960.000 × 6% = 57.600
Sair = 960.000 × 10% = 96.000
Diferença = 38.400 por ano
```

“Fique: sair custa R$ 38.400 a mais por ano”. Regra v3, além do veto industrial v1. Célula `fica/fica`, caminho `ficar`, alternativa `dono_py`. Trocar o motivo para segurança indica mudança de vida; trocar renda externa para R$ 300 mil/ano abre a hipótese patrimonial e altera a comparação fiscal.

Manchete: “Sua empresa fica. Você fica no Brasil.”

### 3. Tecnologia, sem fábrica, clientes 10–30% fora, filhos, cidadania UE, escola

Para concretizar a conta, fixture usa Presumido, R$ 30 mil/mês de dividendos e R$ 20 mil/ano de renda externa.

Destino Espanha pela regra explícita da cidadania UE. Empresa fica, dono pode mudar por qualidade de vida, regra v7, célula `fica/muda`, caminho `vida_europa`.

```text
Ficar = 0 + 20.000 × 15% = 3.000
Sair = 360.000 × 28% + 20.000 × 28% = 106.400
Piora do imposto = 103.400 por ano
```

Manchete: “Sua empresa fica. Você pode se mudar para Espanha.”

### 4. Farmacêutico, fábrica própria, registro sanitário

Folha acima de R$ 50 e energia de R$ 8 a R$ 15 por R$ 100. Demais fatos iguais ao cenário 1.

```text
G = 0,60 × (5/18) + 0,11 × (72/113)
  = 0,2367551622418879 = 23,6755…%
```

Ganho mostrado: 24%, com 23,7% na nota. Nível bruto 2, rebaixado para 1: “Pode valer; depende de frete e escala”. Alerta v2, célula `fora/fica`, caminho `maquila`. Ficar R$ 0/ano, sair R$ 96.000/ano. Permanecem a ressalva de Blink Bioscience e as fontes regulatórias da base.

Manchete: “Produzir fora depende de frete e escala. Você fica no Brasil.”

### 5. Leitura e estrutura do resultado

Os quatro relatórios foram renderizados pelas funções reais: manchete com empresa e dono, matriz acessível com uma célula marcada, números sem casas decimais fora das notas de conta, oito eixos e sete afinidades recolhidos. Há pelo menos uma alternativa recalculada nos cenários 1 e 2. Cada contrafactual também foi comparado com uma chamada direta do cálculo usando a resposta trocada.

Além dos cinco cenários, os testes cobrem todas as 25 combinações de folha/energia com e sem exigência sanitária, empate fiscal, falta de respostas, limiar de renda externa, cidadania, inglês, capital, filial e mudança conjunta. Alterar um peso de afinidade não muda os veredictos.

## 4. Saída dos testes

Todos os comandos abaixo terminaram com código 0. `tests/v5-scenarios.cjs` foi substituído por `tests/v8-scenarios.cjs`, inclusive nas instruções da rotina e dos testes. O validador HTML e os testes do simulador não foram enfraquecidos nem modificados.

### `python3 tools/embed.py`

```text
embed ok: 30 normas, 20 números
```

### `node tests/simulator.test.cjs`

```text
✔ Single principal script parses without syntax errors (2.285166ms)
✔ R$ 30 mil/mês: ficar R$ 0; sair R$ 36.000 (0.136958ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 15%: ficar R$ 57.600 (0.047417ms)
✔ R$ 80 mil/mês, IRPJ+CSLL 34%: ficar R$ 0 (0.058375ms)
✔ R$ 200 mil/mês, IRPJ+CSLL 15%: ficar R$ 240.000 (0.055875ms)
✔ IR mínimo boundaries and withholding differ from final tax (0.049542ms)
✔ Destination tax credit is capped at the Brazilian withholding (0.042208ms)
✔ Default investment scenario: ficar R$ 87.600; sair R$ 96.000; difference R$ 8.400 (0.039833ms)
✔ Dividend-only departure never beats staying across thresholds and company rates (0.096375ms)
✔ Exporting company: investigate maquila, without requiring owner departure (0.143209ms)
✔ No actual move: recommend staying even with foreign income or passport priority (0.049542ms)
✔ Tax priority: insufficient foreign income favors staying, sufficient income opens territorial investigation (0.049875ms)
✔ Nonfiscal priorities: Portugal for passport, Uruguay for proximity, no invented safety ranking (0.038959ms)
✔ Zero dividends still permits a foreign investment comparison (0.0445ms)
✔ Unchanged data arrays and all three tax functions retain original SHA-256 hashes (0.690042ms)
✔ Opinion reasons follow the same fiscal threshold as the recommendation (0.165625ms)
✔ Opinion explains nonfiscal choices without claiming a safety ranking (0.042041ms)
✔ All simulator destination rates and credit defaults are unchanged; Uruguay hint covers 2026 (0.627041ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7.714958
```

### `node tests/rendered.test.cjs`

```text
✔ All articles, destination summaries, comparisons, myths and timeline panels render (11.82025ms)
✔ Embedded research exactly matches the supplied JSON; all norms render with unique simple anchors (2.054917ms)
✔ Status, country, impact, theme and accent-insensitive text filters reduce the rendered norms correctly (1.117083ms)
✔ Attention criteria include every contested, pending, unverified and recent high-impact norm (0.081625ms)
✔ All eight dossiers contain only their own country records and all seven report sections (3.357917ms)
✔ Stories preserve quotes, negative outcomes and expert analysis; filters work (0.253458ms)
✔ Library renders all 15 videos and 18 materials; destination and type filters combine (0.192625ms)
✔ Dates retain source precision and sources without URLs never become links (1.153375ms)
✔ All study surfaces initialize even with denied localStorage, and home contains three exact quotes (2.050167ms)
✔ Simple hash routes open each norm despite stale filters, and preserve changes and country routes (12.993667ms)
✔ V5 embedded datasets exactly match the two provided files (1.010875ms)
✔ Rapid uses the exact 15 core questions; complete respects all conditional branches (4.129917ms)
✔ Four hand-worked profiles produce exact axes, decisions, alerts and unchanged owner arithmetic (6.828708ms)
✔ Explicit business rules veto retail maquila and lower the sanitary verdict exactly one level (0.929083ms)
✔ Safe rule parser covers precedence, missing values, lists and rejects execution (0.114958ms)
✔ Skipped questions mark missing data; conditional facts never affect hidden axes or estimates (0.415333ms)
✔ Pharma report preserves c9 caveat and both regulatory sources (0.659042ms)
✔ Similarity scores use supplied evidence, stable ordering and at most five cases (0.252417ms)
✔ All 34 records have canonical anchors, all 13 sectors only contain linked records; filters combine and reset (3.619041ms)
✔ Every applicable question renders; storage denial, malformed data, legacy state and resume are safe (1.755791ms)
✔ Case deep links clear stale filters, all sector hashes route and country dossiers include own companies (23.662083ms)
✔ Real UI handlers: auto advance, cancellation, keyboard, amounts, resume and exact simulator transfer (2.839959ms)
✔ V7 defaults to dark without saved preference; explicit theme persists and toggles both ways (1.382208ms)
✔ V8 intro preserves two modes and one start action, with an accessible neutral matrix (0.359625ms)
✔ V8 reports lead with two verdicts, accessible matrix and integer numbers; axes and ranking are collapsed (6.645292ms)
✔ V8 destination gates, tax threshold, no-move veto, filial and combined paths use explicit facts (1.201083ms)
✔ V8 all cost bands, unknown estimates and sanitary floor follow only the published formula (0.21075ms)
✔ V8 live preview updates both decisions; matrix examples match documented company models (0.211833ms)
✔ V6 cases replace boxed cards with 34 expandable rows and preserve every narrative and source (1.437ms)
✔ V7 scenarios route renders six accessible, sourced screens and three real cover drawings (1.606875ms)
✔ V7 flow uses stayTax/goTax for 30, 80 and 200 thousand under both corporate rates; slider redraws (1.1695ms)
✔ V7 payroll calculation produces the specified ranges from aggregate a5 (0.485333ms)
✔ V7 sector pictograms and residency dot fractions preserve all source counts (0.594083ms)
✔ V7 timeline includes every dated norm and case, sorts dates, preserves precision and combines filters (2.792208ms)
✔ V7 material manifest is embedded exactly; all local images carry descriptive metadata and match source URLs (3.3845ms)
✔ V7 actual UI handlers open/close accessible material dialog, restore focus and keep captions on failed images (1.127917ms)
✔ No dynamic code execution; CSP blocks connections, frames and remote images (0.872583ms)
✔ No iframe or remote image in static or generated HTML; generated links all resolve (1.787875ms)
✔ Generated HTML is balanced, with no duplicate IDs within each rendered surface (112.565458ms)
ℹ tests 39
ℹ suites 0
ℹ pass 39
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 224.910833
```

### `node tests/v8-scenarios.cjs`

```text
✔ Têxtil: fábrica fora, dono fica (10.022292ms)
✔ Serviços: sair custa mais (0.186709ms)
✔ Tecnologia: escola e cidadania UE (0.172667ms)
✔ Farmacêutico: ganho alto, regulação reduz nível (0.128792ms)
✔ 5. Matriz acessível e contrafactuais recalculados nos cenários 1 e 2 (1.33725ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 14.158708
```

### `python3 tests/validate_html.py`

```text
PASS: AA text theme tokens; minimum contrast light 4.89:1, dark 5.90:1
PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes
PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime
PASS: balanced HTML; 111 unique static IDs; references and hashes resolve
PASS: one principal script; no remote images, external scripts or prohibited APIs
PASS: light/dark tokens; reduced motion; initially visible home; no em dashes
PASS: page 507,043 bytes < 700,000 bytes
```

## 5. Tamanho e escopo

`index.html`: **507,043 bytes**, aproximadamente 507.0 KB, abaixo de 700.000 bytes.

`git diff --check`: passou. Pesquisa, casos, materiais, `simDests`, textos e ideais dos caminhos conferidos como idênticos a HEAD. As funções fiscais continuam com os hashes originais. CSP preservada. Nenhum fetch, iframe, imagem remota ou eval foi adicionado. O HTML das demais seções e o código anterior ao diagnóstico permanecem idênticos.

Arquivos alterados: `index.html`, `data/perguntas-v5.json`, `tests/rendered.test.cjs`, `tests/README.md`, `tools/ROTINA.md`; substituição de `tests/v5-scenarios.cjs` por `tests/v8-scenarios.cjs`; este relatório.

## 6. Pendências e limites explícitos

1. **Duas células sem caso empresarial documentado.** A base tem Lupo (`c1`, `fabrica_dono_fica`) e BOOS (`c19`, `dono_muda`). Não documenta uma empresa no modelo fica/fica nem uma em que a empresa fica e apenas o dono muda. Os relatos pessoais não têm esse `modelo` comprovado. Essas duas células mostram “Sem caso documentado”; não foi inventado ou reclassificado um caso para preencher a matriz. A conclusão pode ser calculada normalmente.
2. **Revisão visual pelo Claude.** Não foi executado Chromium, conforme pedido. Os testes de HTML, contraste dos tokens, estado, navegação e funções não substituem capturas e interação em navegador. Conferir 380 px, 820 px e desktop, nos dois temas, com teclado e movimento reduzido.
3. **Capa preservada conforme o escopo.** A chamada anterior na capa ainda menciona 20/78 perguntas. A abertura em `#perfil` já informa 15 e cerca de 40. Não foi alterada a capa, expressamente fora do escopo.
4. As ressalvas fiscais dos destinos, inclusive Uruguai em 2026, permanecem as da base. Este trabalho implementa a lógica solicitada; não atualiza a pesquisa jurídica ou jornalística.

Sem commit e sem push. Pronto para revisão do diff e capturas.

## Apêndice v8b

Data: 6 de novembro de 2026. Revisão de redação e matriz sobre a v8 já presente no workspace, preservando as alterações anteriores. Sem commit, push ou Chromium.

### Ajustes entregues

1. `parametros.destinos_com_preposicao` contém os sete destinos: para o Paraguai, para o Uruguai, para Portugal, para a Espanha, para a Itália, para os EUA e para os Emirados. Manchete, resumo, barras e explicação do destino consultam esse mapa.
2. A data do resultado usa dia, mês por extenso e ano em português, como “6 de novembro de 2026”.
3. A matriz continua em SVG acessível. Os rótulos “Empresa fica” e “Empresa produz fora” estão fora dos grupos das células, à esquerda quando há espaço e acima de cada linha no celular e nos painéis estreitos. As colunas são “Você fica” e “Você se muda”. As células mostram apenas Reorganizar no Brasil, Mudar de país, Fábrica no Paraguai ou Fábrica e dono no Paraguai; Lupo e BOOS em itálico onde documentados; e a marca de resultado. O título mais longo quebra em duas linhas. As células sem caso não mostram texto substituto; a nota abaixo permanece.
4. Todas as opções agora são objetos `{id, t, curta}`. Os IDs, textos das perguntas e opções originais, condições e pesos foram preservados. A leitura do estado salvo, seleção, teclado e navegação usam os mesmos IDs, mantendo compatibilidade com respostas salvas da v8. As justificativas seguem “Você respondeu <resposta curta em negrito>. <Consequência>.”, sem setas.
5. O “Por que” do dono explica o redutor no Lucro Real quando o IR mínimo dos dividendos é zero. Para os demais regimes, explicita a premissa conservadora de 15%, ajustável no simulador. As fórmulas e alíquotas continuam iguais.
6. Contrafactuais continuam recalculando uma resposta por vez. Usam `curta`, sem reproduzir a pergunta inteira. O veredito da empresa aparece em minúsculas e negrito. Exemplos verificados: “Se a folha fosse menos de R$ 15 em cada R$ 100, a empresa passaria a **pode valer**.” e “Se o motivo fosse segurança, mudar valeria pela qualidade de vida, e o imposto subiria R$ 211.200 por ano.”
7. A regra v4 ganhou `titulo`: “Mudar de país sai da conta”. Alertas que abrangem vários caminhos usam título curto, sem enumerar os caminhos no cabeçalho.
8. “Próximos passos” ganhou 32 px entre o botão e os comentários dos caminhos. Os artigos alinham pelo topo e seus títulos têm margem superior igual a zero.
9. O painel identifica dados parciais: “Empresa: falta a energia”, “Empresa: falta a folha”, “Empresa: faltam a folha e a energia” e “Você: falta a renda”, conforme as respostas disponíveis. Renda zero continua sendo resposta válida.
10. A chamada da capa usa `axesData.modos`, com 15 perguntas no rápido e cerca de 40 no completo. Não mantém os números antigos 20/78.

Este apêndice substitui as pendências 1 e 3 da seção 6 quanto ao texto exibido: as células sem caso ficam sem legenda de caso, e a chamada da capa foi atualizada conforme a autorização da v8b. Nenhum caso foi inventado para preencher a matriz.

### Validação da v8b

Execução final, na ordem solicitada:

```text
python3 tools/embed.py
embed ok: 30 normas, 20 números

node tests/simulator.test.cjs
18 testes; 18 passaram; 0 falhas

node tests/rendered.test.cjs
43 testes; 43 passaram; 0 falhas

node tests/v8-scenarios.cjs
5 testes; 5 passaram; 0 falhas

python3 tests/validate_html.py
PASS: AA text theme tokens; minimum contrast light 4.89:1, dark 5.90:1
PASS: 177 geographic country paths; proportional flows; keyboard controls; disjoint label boxes
PASS: at most 2 eyebrows; theme control in footer; no airport UI or vendor runtime
PASS: balanced HTML; 112 unique static IDs; references and hashes resolve
PASS: one principal script; no remote images, external scripts or prohibited APIs
PASS: light/dark tokens; reduced motion; initially visible home; no em dashes
PASS: page 516,288 bytes < 700,000 bytes

git diff --check
Sem erros.
```

As quatro novas regressões cobrem artigos dos sete destinos, “para o Paraguai” no resultado, ausência de `→`, `&rarr;` e “Sem caso documentado”, data por extenso, justificativas com `curta`, Lucro Real e premissa de 15%, título da v4, contrafactuais recalculados, conteúdo das quatro células, painel parcial e leitura dos modos na capa. Os testes anteriores de handlers, persistência, condições, contas e hashes fiscais continuam passando.

Arquivos tocados nesta revisão: `data/perguntas-v5.json`, `index.html`, `tests/rendered.test.cjs`, `tests/v8-scenarios.cjs`, `tests/README.md` e este relatório. A alteração em `tools/ROTINA.md` e a retirada de `tests/v5-scenarios.cjs` já pertenciam à v8 e foram preservadas.

Tamanho final de `index.html`: **516.288 bytes**. Restam as capturas de revisão visual em 380 px, 820 px e desktop, nos temas claro e escuro. Os testes sem navegador verificam o HTML gerado e o comportamento, mas não comprovam o layout renderizado.
