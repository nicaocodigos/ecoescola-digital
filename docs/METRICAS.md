# Métricas do painel

Implementação em `js/metrics.js`, coberta por testes em `tools/run-tests.mjs`. Cada indicador mostra `n`, a quantidade de respostas válidas usadas no cálculo.

| Indicador | Definição |
|---|---|
| Participantes | Códigos distintos com ao menos um registro |
| Concluíram | Participantes com questionário final registrado |
| Participação por atividade | Códigos distintos por tipo de atividade |
| Aproveitamento | acertos ÷ total de questões × 100 |
| Média inicial / final | Média do aproveitamento de **todas** as respostas válidas de cada questionário |
| Média pareada | Média de inicial e final apenas dos participantes que fizeram **os dois** |
| **Evolução (p.p.)** | Média final pareada (%) − média inicial pareada (%) |
| Melhoraram / mantiveram / pioraram | Comparação individual dos pareados |
| Desempenho por tema | Acertos ÷ respostas por tema, somando todos os questionários do recorte |
| Principais dificuldades | Os 3 itens e os 2 temas com menor aproveitamento no questionário final (ou no inicial, se ainda não houver final) |

## Pontos percentuais × crescimento relativo

Exemplo: antes 45%, depois 80%.

- Evolução = 80 − 45 = **+35 p.p.** (o que o painel mostra)
- Crescimento relativo = (80 − 45) / 45 = 77,8% (**não** é usado)

## Por que usar a média pareada

Quem fez só o questionário inicial (ou só o final) altera a média sem refletir mudança de conhecimento. O relatório deve usar a **evolução pareada**. A evolução sem pareamento aparece só como referência.

## Comparação entre escolas

As escolas podem estar em níveis diferentes (Fundamental I, II ou Médio). Os itens têm o mesmo objetivo de aprendizagem, mas a dificuldade difere. Compare a **evolução em p.p.** de cada escola, e não as médias absolutas.

## O quiz como indicador complementar

O quiz ensina durante a atividade, porque mostra a correção a cada pergunta. Por isso ele não mede impacto: a medida de impacto é a comparação entre os questionários inicial e final.

## Sem dados fictícios

Recortes sem dados aparecem como "—" ou "sem dados". Nenhum gráfico mostra zeros ou valores inventados no lugar de dados ausentes.
