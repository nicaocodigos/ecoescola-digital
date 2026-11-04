/**
 * Conteúdo educativo. Cada texto tem três versões:
 *   f1 = Fundamental I (frases curtas), f2 = Fundamental II (situações práticas),
 *   em = Ensino Médio (contexto e análise crítica).
 * Os tópicos são os mesmos para todos os níveis (mesmos objetivos de aprendizagem).
 *
 * Fontes de referência: Ministério da Saúde (prevenção da dengue), Fiocruz,
 * Resolução CONAMA nº 275/2001 (cores da coleta seletiva),
 * Lei nº 12.305/2010 (Política Nacional de Resíduos Sólidos), Lei nº 11.445/2007 (saneamento).
 */

export const ENVIRONMENT_TOPICS = [
  {
    id: 'sustentabilidade', icon: '🌱', title: 'O que é sustentabilidade?',
    text: {
      f1: 'Sustentabilidade é cuidar da natureza hoje para que ela continue boa amanhã. É usar a água, a energia e os materiais sem desperdiçar.',
      f2: 'Sustentabilidade é atender às nossas necessidades sem prejudicar o planeta e as próximas gerações. Envolve o ambiente, a economia e o bem-estar das pessoas.',
      em: 'Segundo o Relatório Brundtland (ONU, 1987), desenvolvimento sustentável atende às necessidades do presente sem comprometer as das gerações futuras. Ele equilibra três dimensões: ambiental, social e econômica, e orienta os 17 Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030.',
    },
    examples: {
      f1: ['Fechar a torneira', 'Apagar a luz ao sair', 'Cuidar das plantas'],
      f2: ['Usar os dois lados da folha do caderno', 'Trocar copos descartáveis por garrafinha', 'Desligar aparelhos da tomada'],
      em: ['ODS 6: água e saneamento', 'ODS 11: cidades sustentáveis', 'ODS 12: consumo e produção responsáveis'],
    },
  },
  {
    id: 'coleta', icon: '🚛', title: 'Por que a coleta seletiva é importante?',
    text: {
      f1: 'Na coleta seletiva, separamos o lixo que pode ser reciclado. Assim, papel, plástico, vidro e metal viram coisas novas.',
      f2: 'A coleta seletiva recolhe separadamente os materiais recicláveis. Isso diminui o lixo nos aterros, economiza recursos naturais e gera trabalho e renda para cooperativas de catadores.',
      em: 'A coleta seletiva é um instrumento da Política Nacional de Resíduos Sólidos (Lei nº 12.305/2010). Ela reduz a pressão sobre aterros, permite a reinserção de materiais na cadeia produtiva (economia circular) e reconhece o papel das cooperativas de catadores, que fazem grande parte da triagem no Brasil.',
    },
    fact: 'O vidro pode ser reciclado muitas vezes sem perder qualidade.',
  },
  {
    id: 'separacao', icon: '🗂️', title: 'Como separar os resíduos',
    text: {
      f1: 'Cada cor de lixeira recebe um tipo de material. Olhe a cor antes de jogar!',
      f2: 'O padrão de cores ajuda a separar corretamente. Dica: enxágue embalagens com restos de comida e mantenha o reciclável seco.',
      em: 'O código de cores da Resolução CONAMA nº 275/2001 padroniza a identificação dos resíduos. Muitas cidades fazem coleta em apenas duas frações, recicláveis secos e rejeitos/orgânicos. Por isso, vale conferir como funciona a coleta no seu município.',
    },
    showBins: true,
  },
  {
    id: 'reciclaveis', icon: '♻️', title: 'Recicláveis e não recicláveis',
    text: {
      f1: 'Alguns materiais podem ser reciclados. Outros não podem, como papel sujo e papel higiênico.',
      f2: 'Nem tudo o que parece reciclável é. Papel engordurado, guardanapos usados, espelhos e cerâmica não entram na coleta seletiva comum.',
      em: 'A reciclabilidade depende do material, da contaminação e da existência de mercado e tecnologia na região. Embalagens multicamadas e papéis contaminados com gordura têm reciclagem difícil ou inexistente em muitos municípios.',
    },
    sortGame: [
      { name: 'Caderno usado', recyclable: true },
      { name: 'Papel higiênico usado', recyclable: false },
      { name: 'Garrafa de suco de vidro', recyclable: true },
      { name: 'Espelho quebrado', recyclable: false },
      { name: 'Lata de achocolatado', recyclable: true },
      { name: 'Guardanapo engordurado', recyclable: false },
    ],
  },
  {
    id: 'impactos', icon: '⚠️', title: 'Impactos do descarte incorreto',
    text: {
      f1: 'Lixo no chão pode entupir bueiros, causar enchentes e atrair ratos, baratas e mosquitos.',
      f2: 'Lixo descartado errado entope bueiros, provoca enchentes, polui rios e mares e vira abrigo para animais que transmitem doenças. Um plástico pode levar centenas de anos para se decompor.',
      em: 'O descarte inadequado contamina solo e água pelo chorume, libera gases de efeito estufa (como o metano), gera microplásticos que entram na cadeia alimentar e agrava enchentes urbanas. Os custos recaem principalmente sobre populações mais vulneráveis.',
    },
    fact: 'Uma pilha descartada no lixo comum pode contaminar o solo com metais pesados.',
  },
  {
    id: 'consumo', icon: '🛍️', title: 'Consumo consciente',
    text: {
      f1: 'Antes de pedir algo novo, pense: eu preciso mesmo? Posso usar de novo? Reduzir, Reutilizar e Reciclar!',
      f2: 'Consumo consciente é pensar antes de comprar: escolher produtos duráveis, com menos embalagem, e reaproveitar o que já temos. A ordem dos 3Rs importa: primeiro Reduzir, depois Reutilizar e, por fim, Reciclar.',
      em: 'Consumir conscientemente envolve questionar a obsolescência programada, considerar o ciclo de vida dos produtos e seus impactos sociais. Reduzir a geração de resíduos é mais eficaz que reciclar, que também consome energia e água.',
    },
    examples: {
      f1: ['Garrafinha reutilizável', 'Lancheira em vez de saquinhos', 'Trocar brinquedos com amigos'],
      f2: ['Sacola retornável', 'Consertar antes de trocar', 'Comprar só o necessário'],
      em: ['Avaliar a durabilidade do produto', 'Preferir refil', 'Pensar no descarte antes de comprar'],
    },
  },
  {
    id: 'escola', icon: '🏫', title: 'Preservando o ambiente escolar',
    text: {
      f1: 'A escola é de todos! Jogue o lixo na lixeira certa, cuide das plantas e não desperdice água nem comida.',
      f2: 'Pequenas atitudes fazem a diferença: separar o lixo, economizar água e energia, evitar desperdício na merenda e avisar sobre torneiras pingando ou água parada.',
      em: 'A escola pode funcionar como laboratório de sustentabilidade: diagnóstico dos resíduos gerados, metas de redução, hortas e composteiras e comissões de estudantes. Projetos com indicadores mensuráveis tornam as melhorias duradouras.',
    },
    examples: {
      f1: ['Lixo na lixeira', 'Torneira fechada', 'Prato sem desperdício'],
      f2: ['Monitores de reciclagem por sala', 'Horta escolar', 'Aviso de vazamentos à direção'],
      em: ['Diagnóstico de resíduos da escola', 'Comissão ambiental estudantil', 'Indicadores de desperdício da merenda'],
    },
  },
];

export const HEALTH_TOPICS = [
  {
    id: 'ambiente_saude', icon: '🌍', title: 'Ambiente e saúde estão ligados',
    text: {
      f1: 'Quando o lugar onde vivemos está limpo, ficamos menos doentes. Lixo e água parada podem trazer bichos que causam doenças.',
      f2: 'Um ambiente sujo favorece ratos, baratas, moscas e mosquitos, que podem transmitir doenças. Cuidar do ambiente é também cuidar da nossa saúde.',
      em: 'A abordagem “Saúde Única” (One Health) reconhece que a saúde humana, animal e ambiental estão interligadas. Saneamento básico (água, esgoto, resíduos e drenagem) é um dos fatores que mais influenciam a ocorrência de doenças na população.',
    },
  },
  {
    id: 'dengue', icon: '🦟', title: 'Dengue: o que é e como prevenir',
    text: {
      f1: 'A dengue é uma doença passada pela picada de um mosquito chamado Aedes aegypti. Para evitar, não podemos deixar água parada.',
      f2: 'A dengue é causada por um vírus transmitido pela picada da fêmea do Aedes aegypti, que também transmite zika e chikungunya. A forma mais eficaz de prevenção é eliminar os locais onde o mosquito se reproduz.',
      em: 'A dengue é uma arbovirose transmitida principalmente pelo Aedes aegypti, mosquito de hábitos diurnos e adaptado ao ambiente urbano. Como não há tratamento específico contra o vírus, o controle do vetor, em especial a eliminação de criadouros, é central para a saúde pública. Existe vacina no SUS para grupos definidos pelo Ministério da Saúde.',
    },
    fact: 'O Aedes aegypti costuma picar durante o dia, principalmente no início da manhã e no fim da tarde.',
  },
  {
    id: 'criadouros', icon: '🔍', title: 'Onde o mosquito se reproduz?',
    text: {
      f1: 'O mosquito coloca ovos perto da água parada: em pneus, garrafas, baldes, tampinhas e pratinhos de vaso.',
      f2: 'Os criadouros mais comuns ficam dentro das casas e escolas: pratinhos de vasos, baldes, garrafas, pneus, calhas entupidas, ralos, caixas-d’água destampadas e até tampinhas.',
      em: 'A fêmea deposita os ovos nas paredes de recipientes, logo acima da linha da água. Os ovos resistem por meses ao ressecamento e eclodem quando entram em contato com a água. Do ovo ao adulto, o ciclo pode levar de 7 a 10 dias, por isso a vistoria deve ser semanal.',
    },
    checklist: true,
  },
  {
    id: 'recipientes', icon: '🪣', title: 'Elimine a água parada',
    text: {
      f1: 'Vire garrafas e baldes de boca para baixo. Coloque areia no pratinho do vaso. Tampe a caixa-d’água.',
      f2: 'Esvazie e esfregue recipientes, guarde garrafas de boca para baixo, coloque areia nos pratinhos dos vasos, mantenha caixas-d’água tampadas e calhas limpas, e descarte corretamente o que não for usar.',
      em: 'Eliminar criadouros quebra o ciclo de reprodução do vetor. Esfregar as paredes dos recipientes remove os ovos aderidos. Inseticidas atingem principalmente os mosquitos adultos, e seu uso excessivo pode selecionar populações resistentes.',
    },
  },
  {
    id: 'higiene', icon: '🧼', title: 'Higiene dos ambientes',
    text: {
      f1: 'Lave as mãos, mantenha a sala limpa e as lixeiras tampadas.',
      f2: 'Lavar as mãos, manter lixeiras tampadas e esvaziadas, limpar bebedouros e banheiros e guardar alimentos corretamente ajudam a evitar doenças.',
      em: 'A higiene dos ambientes coletivos reduz a transmissão de doenças por contato, por alimentos e por vetores. Rotinas de limpeza, armazenamento adequado de resíduos e manutenção predial são medidas de saúde coletiva.',
    },
  },
  {
    id: 'coletiva', icon: '🤝', title: 'Responsabilidade coletiva',
    text: {
      f1: 'Cuidar da escola e de casa é tarefa de todos. Se você ver água parada, avise um adulto!',
      f2: 'Um único criadouro pode afetar toda a vizinhança. Por isso, prevenção é trabalho de equipe: estudantes, famílias, escola e poder público.',
      em: 'Como o mosquito circula entre casas e quarteirões, a prevenção depende de ações coordenadas entre cidadãos, escolas e serviços públicos (vigilância em saúde, coleta de resíduos). Participar e cobrar soluções faz parte da cidadania.',
    },
    fact: 'Campanhas do Ministério da Saúde e da Fiocruz sugerem reservar cerca de 10 minutos por semana para vistoriar e eliminar criadouros.',
  },
];

/** Lista da vistoria semanal (interativa, não é registrada). */
export const BREEDING_CHECKLIST = [
  'Pratinhos de vasos sem água (ou com areia até a borda)',
  'Garrafas e baldes guardados de boca para baixo',
  'Caixa-d’água e tonéis bem tampados',
  'Calhas e ralos limpos, sem água acumulada',
  'Pneus guardados em local coberto',
  'Lixeiras tampadas e sem embalagens espalhadas',
  'Bebedouros de animais lavados e esfregados',
  'Tampinhas, potes e copos descartados corretamente',
];

export const HEALTH_DISCLAIMER =
  'Este conteúdo é educativo e não substitui a orientação de profissionais de saúde. Em caso de febre ou outros sintomas, procure uma unidade de saúde.';
