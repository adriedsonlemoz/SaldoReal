# 🧪 Testes Automatizados — Saldo Real

Este projeto tem dois tipos de testes que rodam no terminal e mostram pass/fail:

---

## ⚡ Instalação (primeira vez)

```bash
# 1. Instala todas as dependências (incluindo Vitest e Playwright)
npm install

# 2. Instala os browsers que o Playwright usa para simular o usuário
npx playwright install chromium
```

---

## 🚀 Comandos

### Rodar TUDO de uma vez
```bash
npm test
```
Roda os testes de lógica + os testes de interface em sequência.

---

### Só testes de lógica (rápidos, ~1 segundo)
```bash
npm run test:unit
```
Testa os cálculos financeiros sem abrir nenhum browser:
- Formatação de moeda
- Cálculo de parcelas
- Débito do mês
- Saldo restante
- Bug de string concat no pagamento
- Bug de comparação de strings no filtro


---

### Modo watch (reexecuta ao salvar um arquivo)
```bash
npm run test:unit:watch
```
Útil enquanto você está desenvolvendo — qualquer mudança no código roda os testes automaticamente.

---

### Cobertura de código
```bash
npm run test:unit:coverage
```
Mostra quais linhas do código estão sendo testadas e quais não estão.

---

### Só testes de interface (robô clicando)
```bash
npm run test:e2e
```
O Playwright abre o browser automaticamente, navega pelo app e verifica:
- Home carrega com card de saldo
- Wizard de novo acordo passa por todos os passos
- Salvamento de despesa funciona
- Validação de campos obrigatórios funciona
- Saldo atualiza após pagar uma despesa
- Backup gera código

**Exemplo de saída:**
```
  ✓ Tela Inicial (Home) › exibe o card de saldo restante
  ✓ Tela Inicial (Home) › navega para Acordos e volta ao Home
  ✓ Wizard de Novo Acordo › wizard abre em tela cheia com barra de progresso
  ✓ Wizard de Novo Acordo › fluxo completo de novo acordo
  ✓ Lançamento de Gastos › salva uma despesa única com sucesso
  ✓ Lançamento de Gastos › bloqueia salvar sem nome
  ✓ Saldo restante atualiza após pagamento
  ...
```

---

## 📁 Estrutura dos arquivos de teste

```
tests/
├── unit/
│   ├── financeiro.utils.test.js      ← utilitários financeiros
│   ├── logica.financeira.test.js     ← saldo, débito e pagamentos
│   ├── datas.vencimentos.test.js     ← 29/30/31, viradas e 1º vencimento
│   ├── financeiro.service.test.js    ← backup e alertas
│   └── lista.compras.test.js         ← cálculos e conclusão de listas
└── e2e/
    └── app.spec.js                   ← fluxos reais no navegador
```

---

## 🔍 Como adicionar um novo teste

### Teste de lógica (unit)
Abra `tests/unit/logica.financeira.test.js` e adicione:

```js
describe('minha nova funcionalidade', () => {
  it('faz o que deveria fazer', () => {
    const resultado = minhaFuncao(entrada);
    expect(resultado).toBe(valorEsperado);
  });
});
```

### Teste de interface (e2e)
Abra `tests/e2e/app.spec.js` e adicione:

```js
test('meu novo fluxo', async ({ page }) => {
  await page.goto('/');
  await page.getByText('algum texto').click();
  await expect(page.getByText('resultado esperado')).toBeVisible();
});
```

---

## 🛡️ O que os testes verificam (bugs já encontrados e cobertos)

| Teste | Bug que previne |
|-------|----------------|
| `parcelasPagas não concatena string` | `"2" + 1 = "21"` em vez de `3` |
| `"9" < "10" retorna false` | Filtro de acordos ativos/quitados errado |
| `não conta acordo já pago neste mês` | Saldo voltando ao valor anterior após pagamento |
| `bloqueia salvar sem nome/valor` | Dados inválidos sendo salvos no banco |
| `saldo muda após pagar uma despesa` | Home não atualizando após voltar de outra tela |


## Cobertura adicionada na beta.2

- `datas.vencimentos.test.js`: dias 29/30/31, ano bissexto, primeiro vencimento e virada de mês.
- `financeiro.service.test.js`: backup transacional e alertas por data real.
- `lista.compras.test.js`: conversão de unidades e conclusão sem duplicação de gastos.

Para testar um deploy externo:

```bash
PLAYWRIGHT_BASE_URL=https://seu-deploy.vercel.app npm run test:e2e
```

Sem essa variável, o Playwright inicia o Vite localmente em `127.0.0.1:4173`.


## Cobertura adicionada na beta.3

- `lista.compras.test.js`: pagamento imediato, vínculo item ↔ gasto, desfazer pagamento, finalização/reabertura sem duplicação e exclusão de lista preservando histórico.
- `financeiro.service.test.js`: múltiplas parcelas vencidas, múltiplos pagamentos de acordo no mesmo mês e pagamento parcial com pendência restante.
- `financeiro.utils.test.js`: cálculo acumulado de parcelas devidas até o mês alvo.

### E2E — Lista de Compras integrada

A beta.3 inclui um cenário de navegador dedicado ao fluxo crítico da nova lista:

1. criar uma lista;
2. adicionar um item com valor planejado;
3. confirmar o valor realmente pago;
4. verificar o estado **Pago e lançado**;
5. abrir **Fluxo** e confirmar que a despesa correspondente foi registrada automaticamente.

Esse teste protege a integração Lista de Compras → fluxo financeiro contra regressões futuras.


## Cobertura adicionada na beta.4

- `movimentacao.ledger.test.js`: separação entre **competência** e **mês do fluxo real**, além da origem Manual/Compras/Acordos.
- `acordos.estorno.test.js`: estorno individual, preservação do número real das parcelas e pagamento da primeira lacuna pendente.
- `datas.vencimentos.test.js`: parcela adiantada não esconde uma parcela vencida após estorno.
- `lista.compras.test.js`: além do gasto vinculado, valida a criação e remoção da movimentação no Razão.
- `financeiro.service.test.js`: backup v3 com a tabela `movimentacoes` e consolidação dos pagamentos de acordos pelo fluxo efetivo.

### Regra contábil protegida

O Saldo Real passa a guardar duas referências para pagamentos:

- **Fluxo real:** mês em que o dinheiro efetivamente entrou ou saiu.
- **Competência:** mês ao qual a conta/parcela pertence.

Exemplo: uma parcela de fevereiro paga em 28 de janeiro aparece no fluxo de janeiro, mas mantém competência `02/2026`.
## Regressões beta.6

A suíte passou a cobrir também:

- exclusão de item já pago removendo gasto e movimentação vinculados, inclusive chave legada;
- edição de lançamento pelo Fluxo sem perda do estado de edição/tela branca;
- criação de categoria personalizada sem sair do novo lançamento;
- entrada monetária por centavos (`1990` → `19,90`) em teclado numérico;
- fluxo E2E Lista → pagar item → Fluxo → remover item → confirmar ausência no Fluxo.



## Revisão visual beta.7

A beta.7 preserva as regras de negócio e concentra alterações em componentes visuais. Validar principalmente:

- Home em telas Android estreitas (360 px e similares);
- Novo Lançamento com teclado aberto e categorias;
- Fluxo com nomes longos, valores altos e filtros;
- Lista de Compras vazia e com muitos itens;
- Relatório e Acordos em telas pequenas;
- barra inferior com safe-area;
- foco visível, contraste e áreas de toque.


## Pré-publicação beta.8

Validar adicionalmente:
- build com Node 22 e Capacitor 8;
- Android target API 36;
- safe areas/status/navigation bars no Android 16;
- política de privacidade acessível em Configurações;
- confirmação antes de restaurar backup;
- workflow gerando APK debug e AAB release quando a chave de upload estiver configurada.


## Validação da beta.9

Além da suíte existente (112 testes unitários na beta.8.4), a beta.9 deve validar:

- `npm ci` com Node 22;
- `npm run test:unit`;
- `npm run build`;
- JSON de `package.json` e `capacitor.config.json`;
- YAML do workflow GitHub Actions;
- geração `npx cap add android` + `npx cap sync android`;
- `node scripts/configure-android.mjs` e `node scripts/validate-android-theme.mjs`;
- `./gradlew lintDebug --no-daemon` quando o SDK/Gradle estiver disponível;
- `appName`, `app_name` e `android:label` resolvendo para **Saldo Real**;
- ausência de regressão no banco/backup e funcionamento offline dos autocompletes.

O resultado real de cada comando deve ser registrado no release/CI; falhas de ambiente não devem ser descritas como aprovação.


## Regressões da beta.10

Além da validação geral de release, a beta.10 deve proteger estes cenários:

- editar uma conta fixa sem alterar a data e confirmar que o dia de vencimento permanece o mesmo;
- editar uma conta para outro mês/ano e confirmar que a competência completa é atualizada;
- receber antecipadamente a renda do mês e verificar a movimentação real, a Home e o próximo recebimento;
- receber em um mês uma renda atrasada de competência anterior sem esconder a previsão da competência atual;
- consultar um mês histórico antes/depois de um pagamento futuro e confirmar que a situação daquele mês não é reescrita;
- consultar acordos históricos e confirmar que valor e vencimento pertencem à mesma parcela;
- validar dias restantes, dia da semana, atraso e prévia de vencimento em lançamentos;
- confirmar que saldo disponível usa somente entradas/saídas realizadas e que renda pendente entra apenas no projetado;
- abrir a tela Sobre e confirmar `Beta 10`;
- gerar Android e confirmar `versionCode 13` / `versionName 1.0.0-beta.10`.

