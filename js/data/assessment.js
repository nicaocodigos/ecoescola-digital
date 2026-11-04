/**
 * Questionários inicial e final.
 *
 * Desenho de avaliação: os questionários inicial e final usam os MESMOS 10 itens
 * (AV01–AV10) para cada nível. Assim a comparação antes/depois mede o mesmo conteúdo.
 * O questionário inicial não mostra gabarito, para não ensinar antes da intervenção.
 *
 * Os três níveis têm itens equivalentes (mesmo id = mesmo objetivo de aprendizagem e tema),
 * o que permite comparar escolas configuradas com níveis diferentes por tema/objetivo.
 *
 * `correct` é o índice (0, 1, 2…) da alternativa correta.
 * Após editar este arquivo, rode `npm run build:key` para atualizar o gabarito do servidor.
 */

export const THEMES = {
  reciclagem: 'Reciclagem',
  separacao: 'Separação de resíduos',
  descarte: 'Descarte incorreto',
  dengue: 'Prevenção da dengue',
  ambiente_saude: 'Ambiente e saúde',
  consumo: 'Consumo consciente',
};

/** Objetivo de aprendizagem de cada item (comum aos três níveis). */
export const ITEM_OBJECTIVES = {
  AV01: 'Conceito e benefícios da reciclagem',
  AV02: 'Materiais recicláveis × não recicláveis / 3Rs',
  AV03: 'Cores e funcionamento da coleta seletiva',
  AV04: 'Preparação e separação correta dos resíduos',
  AV05: 'Consequências do descarte incorreto',
  AV06: 'Destino de resíduos especiais (pilhas, óleo, logística reversa)',
  AV07: 'Criadouros e biologia do Aedes aegypti',
  AV08: 'Atitudes que eliminam criadouros',
  AV09: 'Relação entre ambiente e saúde',
  AV10: 'Responsabilidade coletiva na prevenção',
};

export const ASSESSMENT = {
  f1: [
    { id: 'AV01', theme: 'reciclagem', text: 'O que é reciclar?',
      options: ['Jogar tudo no mesmo lixo', 'Transformar um material usado em algo novo', 'Queimar o lixo'], correct: 1 },
    { id: 'AV02', theme: 'reciclagem', text: 'Qual destes objetos pode ser reciclado?',
      options: ['Lata de refrigerante', 'Guardanapo sujo de comida', 'Papel higiênico usado'], correct: 0 },
    { id: 'AV03', theme: 'separacao', text: 'Em qual lixeira colocamos o papel?',
      options: ['Lixeira azul', 'Lixeira vermelha', 'Lixeira marrom'], correct: 0 },
    { id: 'AV04', theme: 'separacao', text: 'A garrafa de plástico vai na lixeira de cor…',
      options: ['Verde', 'Vermelha', 'Azul'], correct: 1 },
    { id: 'AV05', theme: 'descarte', text: 'O que acontece quando jogamos lixo na rua?',
      options: ['Nada, o lixo some sozinho', 'O lixo pode entupir bueiros e causar enchentes', 'A rua fica mais bonita'], correct: 1 },
    { id: 'AV06', theme: 'descarte', text: 'Onde devemos colocar uma pilha usada?',
      options: ['No lixo comum', 'No rio', 'Em um ponto de coleta de pilhas'], correct: 2 },
    { id: 'AV07', theme: 'dengue', text: 'Onde o mosquito da dengue coloca seus ovos?',
      options: ['Em lugares com água parada', 'Na areia seca da praia', 'Nas nuvens'], correct: 0 },
    { id: 'AV08', theme: 'dengue', text: 'O que ajuda a combater o mosquito da dengue?',
      options: ['Deixar baldes com água no quintal', 'Guardar garrafas de boca para baixo', 'Deixar pneus na chuva'], correct: 1 },
    { id: 'AV09', theme: 'ambiente_saude', text: 'Um lugar limpo e organizado ajuda a…',
      options: ['Deixar as pessoas doentes', 'Evitar doenças', 'Atrair ratos e baratas'], correct: 1 },
    { id: 'AV10', theme: 'ambiente_saude', text: 'Quem deve cuidar da limpeza da escola?',
      options: ['Só a equipe de limpeza', 'Ninguém', 'Todos nós: alunos, professores e funcionários'], correct: 2 },
  ],
  f2: [
    { id: 'AV01', theme: 'reciclagem', text: 'Qual é o principal benefício da reciclagem?',
      options: ['Aumentar a quantidade de lixo produzida', 'Reduzir o uso de recursos naturais e o lixo enviado aos aterros',
        'Deixar os produtos mais caros', 'Acabar com a necessidade de coleta de lixo'], correct: 1 },
    { id: 'AV02', theme: 'reciclagem', text: 'Qual destes itens NÃO é reciclável na coleta seletiva comum?',
      options: ['Caixa de papelão', 'Garrafa PET', 'Guardanapo engordurado', 'Lata de alumínio'], correct: 2 },
    { id: 'AV03', theme: 'separacao', text: 'Na coleta seletiva, as cores azul, vermelho, verde e amarelo indicam, nessa ordem:',
      options: ['Papel, plástico, vidro e metal', 'Plástico, papel, metal e vidro', 'Vidro, metal, papel e plástico', 'Metal, vidro, plástico e papel'], correct: 0 },
    { id: 'AV04', theme: 'separacao', text: 'Antes de descartar um pote de iogurte para reciclagem, o ideal é:',
      options: ['Jogar com o resto do iogurte dentro', 'Enxaguar rapidamente e separar com os plásticos',
        'Misturar com restos de comida', 'Queimar a embalagem'], correct: 1 },
    { id: 'AV05', theme: 'descarte', text: 'Lixo jogado em terrenos e ruas pode causar:',
      options: ['Enchentes, mau cheiro e aumento de animais que transmitem doenças', 'Melhoria na qualidade do ar',
        'Aumento das áreas verdes', 'Nenhum problema, porque o lixo se decompõe rápido'], correct: 0 },
    { id: 'AV06', theme: 'descarte', text: 'Qual é o destino correto para pilhas e baterias usadas?',
      options: ['Lixeira de orgânicos', 'Pontos de coleta específicos', 'Lixeira de plástico', 'Vaso sanitário'], correct: 1 },
    { id: 'AV07', theme: 'dengue', text: 'Qual mosquito transmite a dengue?',
      options: ['Anopheles', 'Aedes aegypti', 'Pernilongo comum (Culex)', 'Mosca doméstica'], correct: 1 },
    { id: 'AV08', theme: 'dengue', text: 'Qual atitude elimina um possível criadouro do mosquito da dengue?',
      options: ['Colocar areia até a borda dos pratinhos de vasos de planta', 'Deixar a caixa-d’água destampada',
        'Guardar pneus em quintal descoberto', 'Juntar garrafas vazias de boca para cima'], correct: 0 },
    { id: 'AV09', theme: 'ambiente_saude', text: 'Por que o lixo acumulado pode prejudicar a saúde?',
      options: ['Porque atrai ratos, baratas e mosquitos que transmitem doenças', 'Porque deixa o ambiente mais fresco',
        'Porque melhora a qualidade da água', 'Porque lixo não tem relação com saúde'], correct: 0 },
    { id: 'AV10', theme: 'ambiente_saude', text: 'Na prevenção da dengue na escola, a responsabilidade é:',
      options: ['Somente da direção', 'Somente dos agentes de saúde', 'De toda a comunidade escolar', 'Somente dos alunos'], correct: 2 },
  ],
  em: [
    { id: 'AV01', theme: 'reciclagem',
      text: 'Produzir uma lata de alumínio a partir de latas recicladas gasta muito menos energia do que produzi-la a partir do minério. Isso mostra que a reciclagem:',
      options: ['Tem apenas vantagens estéticas', 'Reduz a extração de recursos naturais e o consumo de energia',
        'Aumenta a emissão de poluentes', 'Torna desnecessário reduzir o consumo'], correct: 1 },
    { id: 'AV02', theme: 'reciclagem', text: 'Na lógica dos 3Rs (Reduzir, Reutilizar, Reciclar), qual ação deve ser priorizada?',
      options: ['Reciclar, porque transforma o resíduo', 'Reutilizar, porque prolonga a vida útil do objeto',
        'Reduzir, porque evita que o resíduo seja gerado', 'Todas têm a mesma prioridade'], correct: 2 },
    { id: 'AV03', theme: 'separacao',
      text: 'Uma escola coloca recicláveis e restos de comida em um único saco. Qual é a principal consequência?',
      options: ['Os recicláveis ficam contaminados e podem perder valor para a reciclagem', 'A reciclagem fica mais eficiente',
        'Os restos de comida passam a ser recicláveis', 'Nenhuma, pois a triagem separa tudo sem custo'], correct: 0 },
    { id: 'AV04', theme: 'separacao', text: 'No padrão de cores da coleta seletiva (Resolução CONAMA nº 275/2001), a cor marrom identifica:',
      options: ['Resíduos perigosos', 'Resíduos orgânicos', 'Vidro', 'Papel'], correct: 1 },
    { id: 'AV05', theme: 'descarte', text: 'Despejar óleo de cozinha usado na pia pode:',
      options: ['Ajudar a limpar o encanamento', 'Contaminar a água e entupir a rede de esgoto',
        'Ser tratado facilmente e sem custo', 'Virar adubo nos rios'], correct: 1 },
    { id: 'AV06', theme: 'descarte', text: 'A Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010) prevê a logística reversa, que significa:',
      options: ['Fabricantes, comerciantes e consumidores participam do retorno de produtos como pilhas e eletrônicos após o uso',
        'O consumidor deve queimar os resíduos em casa', 'Todo resíduo deve ir para o aterro',
        'A prefeitura é a única responsável por todos os resíduos'], correct: 0 },
    { id: 'AV07', theme: 'dengue',
      text: 'Os ovos do Aedes aegypti podem resistir por meses grudados nas paredes secas de recipientes. Por isso, além de esvaziar recipientes, é importante:',
      options: ['Esfregar as paredes internas, como em bebedouros de animais', 'Trocar a água apenas uma vez por mês',
        'Adicionar mais água ao recipiente', 'Esperar a chuva lavar os recipientes'], correct: 0 },
    { id: 'AV08', theme: 'dengue', text: 'Por que se recomenda vistoriar e eliminar criadouros pelo menos uma vez por semana?',
      options: ['Porque o ciclo de ovo a mosquito adulto pode levar cerca de 7 a 10 dias', 'Porque o mosquito só aparece no inverno',
        'Porque o inseticida dura exatamente uma semana', 'Porque o mosquito vive apenas um dia'], correct: 0 },
    { id: 'AV09', theme: 'ambiente_saude', text: 'A abordagem “Saúde Única” (One Health) defende que:',
      options: ['A saúde humana não depende do ambiente', 'A saúde humana, animal e ambiental estão interligadas',
        'Somente hospitais influenciam a saúde da população', 'Doenças só passam de pessoa para pessoa'], correct: 1 },
    { id: 'AV10', theme: 'ambiente_saude',
      text: 'Em um bairro com coleta de lixo irregular, aumentam os casos de doenças transmitidas por vetores. A resposta mais eficaz e duradoura é:',
      options: ['Apenas o uso individual de repelente', 'Ação coletiva: comunidade e poder público melhorando a coleta e eliminando criadouros',
        'Mudar de bairro', 'Esperar o fim do período de chuvas'], correct: 1 },
  ],
};
