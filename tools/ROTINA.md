# Rotina diária de atualização do "Sair ou Ficar"

Você é o agente que mantém este estudo alinhado com a situação atual. O site é público em
https://v-santi-9.github.io/sair-ou-ficar/ e é publicado pelo GitHub Pages a partir do branch `main`
deste repositório: **um push em `main` publica o site**. Leia este arquivo inteiro antes de começar.

## O que é o site
Estudo em português sobre empresários e pessoas que saem do Brasil para Paraguai, Portugal, EUA,
Uruguai, Emirados, Espanha e Itália. Tem monitor de normas, dossiês por país, casos de empresas, relatos,
simulador de imposto e um diagnóstico por 8 eixos (no estilo do 12axes) que cruza o perfil da pessoa com
caminhos e casos parecidos. A tese: quem sai é o dono, não a empresa; para dividendos de empresa
brasileira, sair não reduz imposto. A análise é direta e sempre com fonte.

## Onde ficam os dados (edite só estes arquivos)
- `data/estudo-v4.json`: `normas` (monitor e linha do tempo), `numeros`, `atualizacoes`, `lacunas`.
- `data/casos-v5.json`: `casos` de empresas e `setores` (lista `casos` de cada setor). Alimenta a página
  Casos e os "casos parecidos" do diagnóstico.
- `data/perguntas-v5.json`: perguntas, eixos, `caminhos` e `regras` do diagnóstico.
- Nunca edite `index.html` à mão. Depois de mudar os JSON, rode `python3 tools/embed.py`, que leva os
  dados para o HTML e atualiza a data e o bloco de atualização da capa.

## Passo a passo
1. Rode `date +%F` e use essa data como hoje. Leia `atualizacoes[0]` e as normas com status `pendente`,
   `contestada`, `recente` ou `conferir` para saber o que está em andamento.
2. Pesquise notícias dos **últimos 3 dias** (e o desfecho dos itens em andamento), em português, espanhol
   e inglês, com WebSearch e WebFetch. Para cada destino procure: impostos e residência fiscal, vistos e
   residência, regimes para estrangeiros, bancos e crises, política que afete investimento, grandes casos de
   empresas brasileiras, números oficiais de migração. No Brasil: regras para quem sai (Lei 15.270/2025,
   decisões do STF nas ADIs, Receita Federal sobre saída definitiva, IR mínimo, dividendos).
   Prefira fonte oficial (diário oficial, banco central, receita, migrações); depois imprensa de referência
   (no Paraguai: ABC Color, La Nación, Última Hora, Hoy; no Brasil: Valor, Folha, Estadão, g1; agências AP,
   Reuters, Bloomberg Línea). Blog de consultoria só como apoio, nunca como única fonte de número.
3. Decida o que entra. Entra o que muda a decisão de quem pensa em sair ou em produzir fora: imposto,
   residência, risco bancário ou político, custo, regime de maquila, caso relevante de empresa. Não entra
   opinião, previsão ou notícia repetida.
4. Atualize os JSON:
   - Norma nova: acrescente em `normas` com os mesmos campos das existentes (`id` em minúsculas com hífen,
     ex. `py-ueno`; `data` em AAAA-MM-DD, AAAA-MM ou AAAA; `status` entre vigente, contestada, recente,
     pendente, conferir; `impacto` alto, médio ou baixo; `fontes` com `t`, `u`, `tipo`).
   - Norma existente que mudou: atualize `resumo`, `o_que_observar`, `status` e acrescente a fonte.
   - Número novo: acrescente **no fim** de `numeros` (`t`, `v`, `fonte`, `u`, `conf`). Não reordene.
   - Caso novo de empresa: acrescente em `casos` com todos os campos dos casos existentes (`setor` e
     `modelo` com os valores já usados) e inclua o `id` na lista `casos` do setor.
   - Se um risco mudar de forma material um caminho do diagnóstico, acrescente uma frase curta ao `texto`
     desse caminho em `perguntas-v5.json`. Não mexa em `ideal`, `eixos`, `escala`, perguntas ou regras.
   - Acrescente **no início** de `atualizacoes` um item `{"data": hoje, "titulo": "...", "itens": [...],
     "automatica": true}`: título factual de jornal; de 3 a 6 itens, frases curtas, cada uma com o fato e o
     número. Mantenha no máximo 30 itens em `atualizacoes`.
5. Regras de qualidade:
   - Nada inventado. Todo número com fonte e URL. Fato com uma única fonte não oficial entra com
     `status: "conferir"` ou com "segundo <veículo>" no texto.
   - Situação em andamento: diga "até <data>" e o que ainda falta decidir.
   - Português do Brasil, frases curtas, voz ativa, datas por extenso no texto, sem emoji, sem travessão
     como aparte, sem slogan.
   - Nunca altere fórmulas do simulador, testes, CSS ou JavaScript. Nunca apague normas, casos ou números
     (corrija ou marque como superado no texto).
6. Rode, nesta ordem: `python3 tools/embed.py`, `node tests/simulator.test.cjs`,
   `node tests/rendered.test.cjs`, `node tests/v5-scenarios.cjs`, `python3 tests/validate_html.py`.
   Se algo falhar, corrija os dados (nunca os testes). Se não conseguir, desfaça suas mudanças com
   `git checkout -- .` e termine relatando o erro, sem commit.
7. Registre em `atualizacoes/AAAA-MM-DD.md` o que mudou, com as fontes, e o que você pesquisou e decidiu
   não incluir (uma linha cada).
8. Se houve mudança: `git add -A`, `git commit -m "Atualização automática AAAA-MM-DD: <resumo>"` e
   `git push origin main`. Se não houve nada material, não faça commit; só relate "sem novidades".
9. Termine com um resumo em português: o que mudou, fontes, e itens a conferir por uma pessoa.
