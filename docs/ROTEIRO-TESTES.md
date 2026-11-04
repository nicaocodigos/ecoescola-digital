# Roteiro de testes

## Testes automatizados

```bash
npm test
```

São 22 testes que cobrem:

- sincronia do gabarito
- recálculo da pontuação no servidor
- idempotência e deduplicação
- validação de escola, código, nível, tipo e respostas
- pontuação dos desafios
- limpeza de dados pessoais no comentário
- login, bloqueio após 5 tentativas e logout
- configuração de níveis
- lançamento em papel
- consulta de status
- métricas: p.p. pareado, `n` correto, escola sem dados, dificuldades
- CSV: separador, BOM, proteção contra fórmulas e ausência de dados pessoais

## Testes manuais (celular real, com o site publicado)

Marque cada item:

### Escola e participante
- [ ] 1. QR Code A abre o site; o selo mostra "Escola A · <nível>"; `?escola=A` some da barra.
- [ ] 2. Repita com os QR Codes B e C (use aparelhos ou abas anônimas diferentes).
- [ ] 3. Sem QR Code: "Minha jornada" pede para acessar pelo QR Code; os conteúdos continuam abertos.
- [ ] 4. "Gerar meu código" mostra um código no formato `A-XXXXX`; "Copiar código" funciona.
- [ ] 5. Com atividade em andamento, abrir o link `?escola=B` mostra um aviso e mantém a Escola A.
- [ ] 6. O questionário final fica bloqueado antes do inicial.

### Questionários
- [ ] 7. Clicar em "Próxima" sem marcar alternativa mostra "Escolha uma alternativa".
- [ ] 8. "Voltar" mantém as respostas; recarregar a página no meio mantém o rascunho.
- [ ] 9. Enviar mostra "Respostas registradas com sucesso!" e a pontuação, sem gabarito no inicial.
- [ ] 10. O final mostra a comparação inicial → final.
- [ ] 11. Tentar responder de novo mostra "já respondido".

### Conteúdos, desafios e quiz
- [ ] 12. Os tópicos abrem e fecham; o contador "x de 7" atualiza; o teste rápido e a vistoria funcionam.
- [ ] 13. "Concluir leitura" registra a atividade (avisa se nem todos os tópicos foram abertos).
- [ ] 14. Desafio 1: correção a cada item (verde/vermelho + explicação) e pontuação final.
- [ ] 15. Desafio 2: exige as duas respostas e mostra as ilustrações e a explicação.
- [ ] 16. Desafio 3: enviar sem marcar nada mostra erro; o contador de caracteres funciona.
- [ ] 17. Quiz: uma pergunta por vez, barra de progresso, explicação, pontos e "Parabéns! Você concluiu o desafio EcoEscola!".
- [ ] 18. Quiz sem código: aviso de "modo livre"; nada é registrado.

### Falha de conexão
- [ ] 19. Ativar o modo avião e enviar um questionário: aparece o aviso "guardadas neste aparelho" e o selo "⏳ 1 envio pendente".
- [ ] 20. Desativar o modo avião: o selo some em até 30 s e o registro aparece na planilha **uma única vez**.

### Painel
- [ ] 21. `admin.html`: senha errada mostra mensagem; a 6ª tentativa errada bloqueia por 15 min.
- [ ] 22. Painel Geral: os totais conferem com a planilha; cada média mostra `n`.
- [ ] 23. Os botões Escola A/B/C mudam os indicadores; escola sem dados mostra "sem dados".
- [ ] 24. Conferência manual: com pré 40% e pós 80% de um participante, a evolução mostra +40,0 p.p.
- [ ] 25. Os quatro gráficos aparecem (comparação inicial/final, escolas, participação, temas).
- [ ] 26. Configurações: mudar o nível de uma escola; um **novo** participante dessa escola vê os textos do novo nível.
- [ ] 27. Lançar papel: valida código e questões faltantes; o mesmo código e tipo duas vezes é recusado.
- [ ] 28. Exportar: os 6 CSV abrem no Excel/Sheets com acentuação correta; nenhum tem nome, telefone ou e-mail.
- [ ] 29. "Imprimir relatório" gera um PDF legível do painel.
- [ ] 30. "Sair" e fechar a aba exigem novo login.

### Acessibilidade e responsividade
- [ ] 31. Navegação completa só com teclado (Tab/Enter/Espaço), com foco visível.
- [ ] 32. Testar em 360 px (celular), 768 px (tablet) e 1280 px (computador), em Chrome, Safari (iOS) e Firefox.
- [ ] 33. Zoom de 200% sem perda de conteúdo.

## Resultado da validação feita no desenvolvimento

No sandbox, com o servidor local e Chromium headless em 375 × 740 px, o fluxo completo do estudante funcionou:

- QR Code A → código → inicial (validação OK) → conteúdos → desafios 1, 2 e 3 → quiz → final enviado **offline** e reenviado ao reconectar
- 9 registros gravados, sem duplicidade
- e-mail do comentário removido

O painel também foi validado: login, métricas por escola conferidas à mão (+30,0 p.p. geral, +40,0 p.p. na Escola A), CSVs, configuração, lançamento em papel com bloqueio de duplicidade e logout.

Não foi possível testar no sandbox: o Apps Script real (sem acesso à Google), o Chart.js via CDN (bloqueado; o painel usou o gráfico de reserva) e dispositivos físicos.
