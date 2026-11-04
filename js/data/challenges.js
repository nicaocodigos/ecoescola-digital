/**
 * Dados dos desafios interativos. Após editar, rode `npm run build:key`.
 * Cores conforme a Resolução CONAMA nº 275/2001.
 */

export const BINS = [
  { id: 'papel', label: 'Papel', color: '#1565c0', text: '#fff', icon: '📄' },
  { id: 'plastico', label: 'Plástico', color: '#c62828', text: '#fff', icon: '🧴' },
  { id: 'vidro', label: 'Vidro', color: '#2e7d32', text: '#fff', icon: '🫙' },
  { id: 'metal', label: 'Metal', color: '#f9c400', text: '#1a1a1a', icon: '🥫' },
  { id: 'organico', label: 'Orgânico', color: '#6d4c41', text: '#fff', icon: '🍂' },
  { id: 'rejeito', label: 'Não reciclável', color: '#757575', text: '#fff', icon: '🗑️' },
  { id: 'especial', label: 'Ponto de coleta (perigosos)', color: '#ef6c00', text: '#fff', icon: '🔋' },
];

/** Desafio 1 — Onde descartar? */
export const DISPOSAL_ITEMS = [
  { id: 'D1_01', name: 'Jornal velho', icon: '📰', bin: 'papel', explain: 'Jornais, revistas e folhas limpas vão no azul (papel).' },
  { id: 'D1_02', name: 'Caixa de papelão desmontada', icon: '📦', bin: 'papel', explain: 'Papelão é papel. Desmontar a caixa economiza espaço.' },
  { id: 'D1_03', name: 'Garrafa PET de refrigerante', icon: '🍾', bin: 'plastico', explain: 'Garrafas PET são plástico: lixeira vermelha.' },
  { id: 'D1_04', name: 'Embalagem vazia de xampu', icon: '🧴', bin: 'plastico', explain: 'Frascos plásticos de higiene vão no vermelho, de preferência enxaguados.' },
  { id: 'D1_05', name: 'Pote de vidro de geleia', icon: '🫙', bin: 'vidro', explain: 'Vidro vai no verde. Se estiver quebrado, embrulhe em jornal para proteger quem coleta.' },
  { id: 'D1_06', name: 'Lata de refrigerante', icon: '🥫', bin: 'metal', explain: 'Latas de alumínio e aço vão no amarelo (metal).' },
  { id: 'D1_07', name: 'Casca de banana', icon: '🍌', bin: 'organico', explain: 'Restos de alimentos são orgânicos e podem virar adubo.' },
  { id: 'D1_08', name: 'Miolo de maçã do lanche', icon: '🍎', bin: 'organico', explain: 'Restos de frutas são orgânicos (lixeira marrom).' },
  { id: 'D1_09', name: 'Guardanapo sujo de gordura', icon: '🧻', bin: 'rejeito', explain: 'Papel sujo de gordura ou usado não é reciclável: vai no cinza (rejeito).' },
  { id: 'D1_10', name: 'Pilha usada', icon: '🔋', bin: 'especial', explain: 'Pilhas e baterias têm metais tóxicos. Leve a um ponto de coleta específico.' },
];

/** Desafio 2 — Identifique o risco. `action` é a solução correta. */
export const RISK_SITUATIONS = [
  {
    id: 'S1', image: 'assets/img/situacoes/garrafa.svg', title: 'Garrafa com água parada',
    description: 'Uma garrafa aberta, de boca para cima, com água da chuva no canto do pátio.',
    risk: true,
    actions: [
      { id: 'a', text: 'Esvaziar a garrafa e guardá-la de boca para baixo ou descartá-la na reciclagem' },
      { id: 'b', text: 'Deixar como está, porque é só um pouco de água' },
      { id: 'c', text: 'Completar com mais água' },
    ],
    action: 'a',
    explain: 'Qualquer recipiente com água parada pode virar criadouro do Aedes aegypti, mesmo pequeno.',
  },
  {
    id: 'S2', image: 'assets/img/situacoes/pneu.svg', title: 'Pneu exposto à chuva',
    description: 'Um pneu velho fica no quintal, sem cobertura, e acumula água quando chove.',
    risk: true,
    actions: [
      { id: 'a', text: 'Fazer furos e deixar no mesmo lugar' },
      { id: 'b', text: 'Guardar em local coberto ou entregar em um ponto de coleta de pneus' },
      { id: 'c', text: 'Pintar o pneu para enfeitar o jardim, ao ar livre' },
    ],
    action: 'b',
    explain: 'Pneus acumulam água e são criadouros frequentes. O ideal é guardá-los cobertos ou levá-los ao descarte correto.',
  },
  {
    id: 'S3', image: 'assets/img/situacoes/lixeira.svg', title: 'Lixeira aberta e cheia',
    description: 'Uma lixeira sem tampa, transbordando, com restos de lanche ao redor.',
    risk: true,
    actions: [
      { id: 'a', text: 'Deixar aberta para ventilar' },
      { id: 'b', text: 'Colocar mais sacos de lixo em volta dela' },
      { id: 'c', text: 'Tampar a lixeira, recolher o lixo do chão e avisar para esvaziá-la com mais frequência' },
    ],
    action: 'c',
    explain: 'Lixo exposto atrai moscas, baratas e ratos, e embalagens espalhadas podem acumular água.',
  },
  {
    id: 'S4', image: 'assets/img/situacoes/limpo.svg', title: 'Pátio limpo e organizado',
    description: 'Pátio varrido, lixeiras tampadas e separadas por cor, sem objetos acumulando água.',
    risk: false,
    actions: [
      { id: 'a', text: 'Continuar mantendo a limpeza e fazer vistorias semanais' },
      { id: 'b', text: 'Parar de limpar, porque já está limpo' },
      { id: 'c', text: 'Guardar objetos velhos no canto do pátio' },
    ],
    action: 'a',
    explain: 'Sem risco aparente! A prevenção depende de manter os cuidados de forma contínua.',
  },
  {
    id: 'S5', image: 'assets/img/situacoes/vaso.svg', title: 'Vaso com pratinho cheio de água',
    description: 'Um vaso de planta na sala com o pratinho de baixo cheio de água.',
    risk: true,
    actions: [
      { id: 'a', text: 'Colocar areia até a borda do pratinho ou retirar o pratinho' },
      { id: 'b', text: 'Regar mais a planta' },
      { id: 'c', text: 'Não fazer nada, porque está dentro da sala' },
    ],
    action: 'a',
    explain: 'A areia absorve a água e impede o acúmulo, sem prejudicar a planta. Criadouros também existem dentro de ambientes fechados.',
  },
];

/** Desafio 3 — Minha escola mais sustentável (sem certo/errado). */
export const SCHOOL_PROBLEMS = [
  { id: 'p_lixo_chao', label: 'Lixo jogado no chão', icon: '🚯' },
  { id: 'p_poucas_lixeiras', label: 'Poucas lixeiras', icon: '🗑️' },
  { id: 'p_sem_coleta', label: 'Falta de coleta seletiva', icon: '♻️' },
  { id: 'p_agua_parada', label: 'Água parada (possível criadouro)', icon: '🦟' },
  { id: 'p_desperdicio_agua', label: 'Desperdício de água', icon: '🚰' },
  { id: 'p_desperdicio_comida', label: 'Desperdício de comida', icon: '🍽️' },
  { id: 'p_energia', label: 'Luzes ou aparelhos ligados sem uso', icon: '💡' },
  { id: 'p_banheiros', label: 'Banheiros com pouca higiene', icon: '🚻' },
  { id: 'p_areas_verdes', label: 'Poucas plantas e áreas verdes', icon: '🌳' },
  { id: 'p_entulho', label: 'Entulho ou objetos velhos acumulados', icon: '🧱' },
];

export const SCHOOL_IMPROVEMENTS = [
  { id: 'm_lixeiras_seletivas', label: 'Lixeiras de coleta seletiva', icon: '♻️' },
  { id: 'm_campanhas', label: 'Campanhas e cartazes de conscientização', icon: '📢' },
  { id: 'm_mutirao', label: 'Mutirão de limpeza', icon: '🧹' },
  { id: 'm_vistoria_dengue', label: 'Vistoria semanal contra a dengue', icon: '🔍' },
  { id: 'm_horta', label: 'Horta ou composteira', icon: '🥕' },
  { id: 'm_reaproveitar', label: 'Reaproveitar materiais em atividades', icon: '✂️' },
  { id: 'm_torneiras', label: 'Consertar torneiras e vazamentos', icon: '🔧' },
  { id: 'm_plantio', label: 'Plantio de árvores e plantas', icon: '🌱' },
  { id: 'm_energia', label: 'Apagar luzes e desligar aparelhos', icon: '🔌' },
  { id: 'm_brigada', label: 'Equipe de alunos guardiões do ambiente', icon: '🦸' },
];

export const COMMENT_MAX = 280;
