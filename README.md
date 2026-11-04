# EcoEscola Digital

Aplicação web educativa sobre **Meio Ambiente e Saúde** para o itinerário extensionista do curso de ADS da Universidade Cruzeiro do Sul. Atende três escolas (meta: 60 participantes) por QR Code, com conteúdos em três níveis de linguagem, desafios, quiz, questionários inicial e final pareados por código anônimo e um painel administrativo com métricas, gráficos e exportação CSV.

> *Pequenas atitudes, grandes transformações.*

## Arquitetura

```
Navegador (HTML/CSS/JS puro, ES modules, sem build)
   │  POST text/plain JSON  { action, ... }
   ▼
Google Apps Script (Web App)  ── Code.gs  (adaptador Sheets, cache, lock, senha)
                               └ Core.gs  (validação, pontuação, deduplicação, autenticação)
                               └ AnswerKey.gs (gabarito gerado a partir de js/data)
   ▼
Google Sheets (aba "Registros")  ← fonte única das métricas consolidadas
```

- O servidor **recalcula todas as pontuações** a partir do gabarito. Ele nunca usa a nota enviada pelo navegador.
- O `localStorage` serve só como fila temporária de envio (*outbox*) quando não há internet. As métricas vêm sempre da planilha.
- O mesmo `Core.gs` roda no servidor local de desenvolvimento e nos testes, carregado com `node:vm`.

### Estrutura

```
ecoescola-digital/
├── index.html            Área do estudante (SPA com rotas por hash)
├── admin.html            Painel administrativo
├── assets/img/           Logo e ilustrações SVG do Desafio 2
├── css/                  base.css, app.css, admin.css, print.css
├── js/
│   ├── config.js         URL do Apps Script, escolas e níveis (sem segredos)
│   ├── app.js            Inicialização da área do estudante
│   ├── router.js         Navegação
│   ├── school.js         Identificação e trava da escola, nível configurado
│   ├── participant.js    Código anônimo (ex.: A-7KX3Q)
│   ├── results.js        Registro das atividades
│   ├── outbox.js         Fila offline com reenvio automático e idempotência
│   ├── api.js            Comunicação com o backend
│   ├── metrics.js        Cálculo das métricas (funções puras)
│   ├── export.js         CSV
│   ├── admin.js          Inicialização do painel
│   └── data/             Conteúdos, questionários, quiz e desafios (3 níveis)
├── pages/                Páginas do estudante e pages/admin/ (painel)
├── components/           Layout, componentes de UI, tópicos, gráficos, toasts
├── apps-script/          Backend Google Apps Script (Code.gs, Core.gs, AnswerKey.gs)
├── tools/                Servidor local, gerador do gabarito e testes
└── docs/                 Integração, testes, publicação, QR Codes e limitações
```

## Executar localmente

Requer Node.js 18 ou superior. O projeto não tem dependências para instalar.

```bash
cd ecoescola-digital
ADMIN_PASSWORD="uma-senha-local" npm run dev
```

- Estudante (Escola A): http://localhost:8080/?escola=A (troque por B ou C)
- Painel: http://localhost:8080/admin.html (senha = `ADMIN_PASSWORD`)
- Os dados de teste ficam em `dev-data/db.json`. Apague a pasta para zerar.

Em `localhost`, o front-end usa automaticamente o servidor local (`/api`).

Outros comandos:

```bash
npm test            # 22 testes: backend, métricas e CSV
npm run build:key   # regenera apps-script/AnswerKey.gs após editar js/data/*
```

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/INTEGRACAO.md](docs/INTEGRACAO.md) | Google Sheets e Apps Script: instalação, senha, API, segurança e estrutura dos dados |
| [docs/PUBLICACAO.md](docs/PUBLICACAO.md) | Publicação (GitHub Pages ou Netlify) e geração dos três QR Codes |
| [docs/ROTEIRO-TESTES.md](docs/ROTEIRO-TESTES.md) | Roteiro de testes manuais e automatizados |
| [docs/METRICAS.md](docs/METRICAS.md) | Definição de cada indicador do painel |
| [docs/LIMITACOES.md](docs/LIMITACOES.md) | Limitações conhecidas e próximos passos |

## Privacidade

O sistema não pede nome, CPF, telefone, endereço nem e-mail. Cada participante recebe um código aleatório que liga o questionário inicial ao final. Comentários livres passam por um filtro que remove e-mails, números longos e HTML.
