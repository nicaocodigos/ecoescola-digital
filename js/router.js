/**
 * Navegação por hash (#/rota). Funciona em hospedagem estática (GitHub Pages, Netlify)
 * sem configuração de servidor, e mantém o botão "voltar" do celular funcionando.
 */
export function createRouter(routes, notFound, onRoute) {
  const compiled = routes.map((r) => ({
    ...r,
    regex: new RegExp(`^${r.path.replace(/:(\w+)/g, '([^/]+)')}$`),
  }));

  function current() {
    const path = (location.hash.replace(/^#/, '') || '/').split('?')[0];
    for (const r of compiled) {
      const m = path.match(r.regex);
      if (m) return { route: r, params: m.slice(1).map(decodeURIComponent), path };
    }
    return { route: notFound, params: [], path };
  }

  const handle = () => onRoute(current());
  window.addEventListener('hashchange', handle);

  return {
    start: handle,
    reload: handle,
    go: (path) => {
      if (location.hash === `#${path}`) handle();
      else location.hash = path;
    },
  };
}
