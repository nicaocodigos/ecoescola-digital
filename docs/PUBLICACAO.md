# Publicação e QR Codes

O site é estático: não tem build nem dependências. Precisa apenas de HTTPS.

## Opção A — GitHub Pages

1. Crie um repositório e envie o conteúdo da pasta `ecoescola-digital/`.
2. **Settings > Pages > Source: Deploy from a branch** → `main` / `(root)`.
3. Endereço: `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

## Opção B — Netlify

1. Acesse app.netlify.com > **Add new site > Deploy manually**.
2. Arraste a pasta `ecoescola-digital/`.

Antes de publicar, preencha a URL do Apps Script em `js/config.js` (ver INTEGRACAO.md). Não publique a pasta `dev-data/`. As pastas `tools/` e `apps-script/` podem ser publicadas, porque não contêm segredos, mas não são necessárias.

## Os três QR Codes

Cada QR Code aponta para o mesmo site com um parâmetro diferente:

| Escola | Endereço |
|---|---|
| Escola A | `https://SEU-SITE/?escola=A` |
| Escola B | `https://SEU-SITE/?escola=B` |
| Escola C | `https://SEU-SITE/?escola=C` |

Como gerar:

- **Chrome (computador)**: abra o endereço, clique no ícone de compartilhar/QR Code na barra de endereço e baixe a imagem.
- Ou use um gerador de QR Code **estático** (sem redirecionamento ou rastreamento), informando o endereço completo.

Recomendações:

- Teste cada QR Code com dois celulares diferentes antes de imprimir. O selo no topo do site deve mostrar "Escola A · …".
- Imprima em tamanho de pelo menos 4 × 4 cm, com o texto "Escola A — EcoEscola Digital" abaixo do código.
- Cole os códigos em locais visíveis e protegidos de chuva (sala, pátio coberto, biblioteca).
- Coloque um QR Code por escola. Não misture QR Codes de escolas diferentes no mesmo local.

Ao abrir pelo QR Code, a escola fica gravada no aparelho e o parâmetro some da barra de endereço. Enquanto houver atividade em andamento, links de outras escolas são ignorados.

## Material impresso (sem internet)

No rodapé do site, abra **Versão para impressão** (`#/imprimir`) e imprima:

1. Folha de códigos (30 por folha): entregue um código por estudante.
2. Questionário inicial e questionário final do nível da escola.
3. Desafios e conteúdo resumido. O quiz vem com gabarito comentado para o professor.

Depois, no painel, use **Lançar respostas em papel** para digitar as folhas. Os dados entram na mesma base, com origem `papel`.
