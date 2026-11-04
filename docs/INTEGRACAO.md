# Integração com a base de dados (Google Sheets + Apps Script)

## 1. Criar a planilha e o script

1. Crie uma planilha no Google Sheets, por exemplo "EcoEscola Digital — Dados", usando a conta institucional da equipe.
2. Abra **Extensões > Apps Script**.
3. Crie três arquivos e cole o conteúdo da pasta `apps-script/`:
   - `Code.gs`
   - `Core.gs`
   - `AnswerKey.gs` (gerado: rode `npm run build:key` antes de copiar, se tiver editado as questões)
4. Em **Configurações do projeto** (ícone de engrenagem), marque "Mostrar arquivo de manifesto appsscript.json" e substitua o conteúdo pelo de `apps-script/appsscript.json`.
5. No editor, selecione a função `setup` e clique em **Executar**. Autorize o acesso. Isso cria a aba **Registros** com os cabeçalhos.

## 2. Definir a senha do painel

1. **Configurações do projeto > Propriedades do script > Adicionar propriedade**
   - Propriedade: `ADMIN_PASSWORD`
   - Valor: uma senha forte, com pelo menos 10 caracteres
2. No editor, execute a função `protegerSenhaAdmin`.
   Ela grava `ADMIN_PASSWORD_HASH` e `ADMIN_PASSWORD_SALT` (SHA-256 com salt) e **apaga a senha em texto puro**.
3. Para trocar a senha, repita os dois passos.

A senha não aparece em nenhum arquivo público. O navegador recebe apenas um token temporário, válido por 6 horas e guardado em `sessionStorage`.

## 3. Publicar o Web App

1. **Implantar > Nova implantação > Tipo: App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
2. Copie a URL, que termina em `/exec`.
3. Em `js/config.js`, troque `COLE_AQUI_O_ID_DA_IMPLANTACAO` pela URL completa.
4. Teste: abra a URL `/exec` no navegador. O retorno deve ser `{"ok":true,"service":"EcoEscola Digital",...}`.

> Sempre que alterar o código do Apps Script, use **Implantar > Gerenciar implantações > Editar > Nova versão**. Assim a URL continua a mesma.

## 4. API

Todas as chamadas são `POST` na URL `/exec`, com corpo JSON enviado como `Content-Type: text/plain`. Esse formato evita o *preflight* CORS, que o Apps Script não suporta.

| action | Autenticação | Descrição |
|---|---|---|
| `ping` | — | Teste de disponibilidade |
| `getConfig` | — | Nível de conteúdo de cada escola |
| `status` | — | `{code}` → atividades já registradas para o código (permite continuar em outro aparelho) |
| `submit` | — | `{data}` → registra uma atividade |
| `login` | senha | `{password}` → `{token}` |
| `logout` | token | Invalida o token |
| `adminData` | token | Todos os registros e a configuração |
| `setConfig` | token | `{config:{levels:{A,B,C}}}` |
| `adminSubmit` | token | Lançamento das folhas em papel (origem `papel`) |

Exemplo de `submit`:

```json
{
  "action": "submit",
  "data": {
    "submissionId": "0f8c…uuid",
    "type": "pre",
    "school": "A",
    "level": "f2",
    "participantCode": "A-7KX3Q",
    "answers": { "AV01": 1, "AV02": 2, "…": 0 },
    "clientTime": "2026-11-04T13:00:00.000Z"
  }
}
```

Respostas possíveis: `{ok:true,status:"saved"|"duplicate"|"already_recorded"}` ou `{ok:false,error,message}`.

## 5. Validação e segurança (Core.gs)

- Lista fechada de ações, tipos de atividade, escolas (A/B/C) e níveis (f1/f2/em).
- O código do participante precisa seguir o formato `^[ABC]-[2-9A-HJKMNP-Z]{5}$`, e a letra deve ser a da escola.
- Questionário e quiz exigem as 10 respostas, cada uma com índice válido. A pontuação é **recalculada no servidor**.
- Desafios aceitam apenas ids conhecidos. O comentário é limpo: sem HTML, com e-mails e sequências de 7 ou mais dígitos substituídos por `[removido]`, e limite de 280 caracteres.
- **Deduplicação**: o mesmo `submissionId` é ignorado (reenvio seguro). Há um registro por código e tipo de atividade.
- `LockService` impede gravações concorrentes.
- Textos que começam com `= + - @` recebem `'` na planilha e no CSV, o que impede a execução de fórmulas.
- O login é bloqueado por 15 minutos após 5 senhas erradas.
- Requisições acima de 20 000 caracteres são recusadas.

## 6. Estrutura da aba "Registros"

| Coluna | Conteúdo |
|---|---|
| submissionId | UUID do envio (chave de idempotência) |
| receivedAt | Data/hora do servidor (ISO) |
| source | `app` ou `papel` |
| type | `start`, `pre`, `post`, `quiz`, `conteudo_ambiente`, `conteudo_saude`, `desafio1`, `desafio2`, `desafio3` |
| school / level | Escola (A/B/C) e nível (f1/f2/em) |
| participantCode | Código anônimo |
| score / total / percent | Pontuação calculada pelo servidor |
| detail | JSON `{AV01:1, AV02:0, …}` (acerto por item) |
| themes | JSON `{reciclagem:[acertos,total], …}` |
| answers | JSON com as alternativas escolhidas |
| extra | Desafio 3: `{problems, improvements, comment}` |
| clientTime | Horário informado pelo aparelho |

Não edite linhas à mão durante a coleta. Se for preciso excluir um registro de teste, apague a linha inteira.

## 7. Antes de aplicar nas escolas

1. Apague as linhas de teste da aba **Registros**, mantendo o cabeçalho.
2. No painel, em **Configurações**, defina o nível de cada escola.
3. Faça um teste completo com cada QR Code usando um celular de verdade.
