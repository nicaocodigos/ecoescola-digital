/**
 * Gráficos de barras. Usa Chart.js quando disponível (carregado via CDN em admin.html).
 * Se o Chart.js não carregar (sem internet/CDN bloqueado), desenha barras simples em HTML/CSS.
 * Valores null (sem dados) NÃO são desenhados como zero: aparecem como "sem dados".
 * Uma tabela com os mesmos números sempre acompanha o gráfico (acessibilidade e relatório).
 */
import { esc, formatNumber } from '../js/utils.js';

const instances = new Set();

export const COLORS = { pre: '#9ccc65', post: '#1e7a3c', quiz: '#0288d1', A: '#2e7d32', B: '#0277bd', C: '#ef6c00', extra: '#8d6e63' };

export function destroyCharts() {
  instances.forEach((c) => c.destroy());
  instances.clear();
}

/**
 * @param {HTMLElement} container
 * @param {{ labels: string[], datasets: { label: string, data: (number|null)[], color: string }[], percent?: boolean, title: string }} spec
 */
export function barChart(container, spec) {
  const hasData = spec.datasets.some((d) => d.data.some((v) => v != null && v !== 0));
  if (!hasData) {
    container.innerHTML = '<p class="empty">Sem dados registrados para este gráfico.</p>';
    return;
  }
  const unit = spec.percent ? '%' : '';
  if (window.Chart) {
    container.innerHTML = `<div class="chart-box"><canvas role="img" aria-label="${esc(spec.title)}"></canvas></div>`;
    const chart = new window.Chart(container.querySelector('canvas'), {
      type: 'bar',
      data: {
        labels: spec.labels,
        datasets: spec.datasets.map((d) => ({ label: d.label, data: d.data, backgroundColor: d.color, borderRadius: 4 })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: { y: { beginAtZero: true, ...(spec.percent ? { max: 100 } : { ticks: { precision: 0 } }) } },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw == null ? 'sem dados' : formatNumber(c.raw, spec.percent ? 1 : 0) + unit}` } },
        },
      },
    });
    instances.add(chart);
    return;
  }
  // Reserva sem biblioteca
  const max = spec.percent ? 100 : Math.max(1, ...spec.datasets.flatMap((d) => d.data.filter((v) => v != null)));
  container.innerHTML = `<div class="hbars" role="img" aria-label="${esc(spec.title)}">
    ${spec.labels.map((label, i) => `<div class="hbars__group"><p class="hbars__label">${esc(label)}</p>
      ${spec.datasets.map((d) => {
        const v = d.data[i];
        return `<div class="hbars__row"><span class="hbars__name">${esc(d.label)}</span>
          <span class="hbars__track"><span class="hbars__bar" style="width:${v == null ? 0 : (v / max) * 100}%;background:${d.color}"></span></span>
          <span class="hbars__value">${v == null ? 'sem dados' : formatNumber(v, spec.percent ? 1 : 0) + unit}</span></div>`;
      }).join('')}</div>`).join('')}
  </div>`;
}
