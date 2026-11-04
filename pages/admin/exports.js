/** Exportação de dados em CSV e impressão do relatório. */
import { SCHOOLS, SCHOOL_NAMES } from '../../js/config.js';
import { download, summaryCSV, participantsCSV, questionnairesCSV, itemsCSV, ideasCSV, rawCSV } from '../../js/export.js';
import { toast } from '../../components/toast.js';

const EXPORTS = [
  { id: 'summary', label: 'Relatório consolidado (Geral + cada escola)', fn: (r) => summaryCSV(r), scoped: false },
  { id: 'participants', label: 'Resultados por participante (código anônimo)', fn: participantsCSV, scoped: true },
  { id: 'questionnaires', label: 'Respostas dos questionários, item a item', fn: questionnairesCSV, scoped: true },
  { id: 'items', label: 'Aproveitamento por tema e por item', fn: itemsCSV, scoped: true },
  { id: 'ideas', label: 'Desafio 3: problemas, melhorias e comentários', fn: ideasCSV, scoped: true },
  { id: 'raw', label: 'Todos os registros (bruto)', fn: rawCSV, scoped: true },
];

export function renderExports(root, { records }) {
  root.innerHTML = `
    <section class="panel">
      <h2>Exportar dados</h2>
      <p class="muted">Arquivos CSV (separador “;”), compatíveis com Excel e Google Sheets. Não contêm dados pessoais: apenas o código anônimo, a escola, o nível e as respostas.</p>
      <div class="field"><label for="x-scope">Recorte</label>
        <select id="x-scope"><option value="">Todas as escolas</option>${SCHOOLS.map((s) => `<option value="${s}">${SCHOOL_NAMES[s]}</option>`).join('')}</select></div>
      <ul class="export-list">
        ${EXPORTS.map((x) => `<li><span>${x.label}${x.scoped ? '' : ' <small>(sempre todas as escolas)</small>'}</span>
          <button class="btn btn--secondary btn--sm" type="button" data-export="${x.id}">Baixar CSV</button></li>`).join('')}
      </ul>
      <p><button class="btn btn--ghost" type="button" id="print-report">Imprimir / salvar relatório em PDF (aba Painel)</button></p>
    </section>`;

  root.querySelectorAll('[data-export]').forEach((btn) => btn.addEventListener('click', () => {
    if (!records.length) { toast('Ainda não há registros para exportar.', 'warning'); return; }
    const x = EXPORTS.find((e) => e.id === btn.dataset.export);
    const scope = root.querySelector('#x-scope').value || null;
    const date = new Date().toISOString().slice(0, 10);
    const suffix = x.scoped && scope ? `escola-${scope}` : 'geral';
    download(`ecoescola-${x.id}-${suffix}-${date}.csv`, x.fn(records, scope));
  }));
  root.querySelector('#print-report').addEventListener('click', () => {
    document.querySelector('[data-tab="painel"]').click();
    setTimeout(() => window.print(), 300);
  });
}
