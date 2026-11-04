# Limitações conhecidas

1. **Apps Script não testado em produção.** O `Code.gs` foi verificado quanto à sintaxe e segue as APIs documentadas. A lógica (`Core.gs`) foi testada no Node. Faça o teste completo após a implantação (docs/ROTEIRO-TESTES.md).
2. **Gabarito visível no navegador.** O quiz precisa das respostas para dar a correção imediata, e o código JS é público. Um estudante com conhecimento técnico poderia consultá-lo. O servidor recalcula as notas, mas não impede a consulta. Isso é aceitável para uma atividade educativa sem nota.
3. **Sem limite de envios por IP.** O Apps Script não informa o IP de quem acessa. Qualquer pessoa com a URL pode enviar registros válidos com códigos inventados. Mitigação: as métricas consideram um registro por código e tipo, e o painel mostra a origem. Revise a planilha se houver números estranhos.
4. **Pareamento depende do código.** Se o estudante trocar de aparelho e não anotar o código, o questionário final não é pareado e entra só na média sem pareamento.
5. **Cota do Apps Script.** Contas gratuitas permitem cerca de 30 execuções simultâneas. Para 20 estudantes ao mesmo tempo é suficiente, mas evite que as três escolas enviem no mesmo minuto.
6. **Chart.js via CDN.** Sem acesso ao CDN, o painel mostra gráficos simples em HTML/CSS, sempre com tabelas. Para não depender do CDN, baixe `chart.umd.min.js` (v4.4.4) para `assets/vendor/` e troque o `src` em `admin.html`.
7. **Ícones em emoji.** A aparência varia por sistema operacional. Alguns celulares antigos podem não exibir emojis recentes (ex.: 🫙).
8. **Sem service worker.** O site precisa de internet para abrir pela primeira vez. Depois de aberto, a coleta funciona offline via fila local. Sem internet desde o início, use o material impresso.
9. **Itens iguais no inicial e no final.** Isso garante comparabilidade, mas pode haver efeito de memorização. Como o inicial não mostra gabarito, esse efeito é reduzido.
10. **Nível travado no início.** Se o administrador mudar o nível de uma escola durante a coleta, quem já começou continua no nível anterior, para manter a comparação. O nível fica registrado em cada envio.
11. **Comentários livres.** O filtro remove padrões de e-mail e telefone, mas não reconhece nomes próprios. Revise os comentários antes de publicá-los no relatório.
12. **Conteúdos de saúde.** O material é educativo, com base em informações do Ministério da Saúde e da Fiocruz. Peça revisão de um professor da área antes da aplicação.
