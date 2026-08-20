# 🛒 SaldoReal

**Slogan:** O controle do seu bolso dentro do carrinho.  
**Versão:** 1.0.0-beta.8.2

## Sobre

O SaldoReal é um gerenciador financeiro pessoal offline com renda, despesas, acordos/dívidas, relatórios, lista de compras integrada aos gastos e backup local. Os dados ficam no próprio dispositivo usando IndexedDB/Dexie.

## Principais recursos

- Razão financeiro unificado: entradas e saídas efetivadas em uma única tabela de movimentações, com origem rastreável.
- Saldo disponível e saldo projetado após pendências.
- Acordos parcelados com primeiro vencimento real, histórico de pagamentos, parcelas atrasadas acumuladas, valor real pago e estorno individual por pagamento.
- Vencimentos seguros para dias 29/30/31 e meses curtos.
- Lista de compras com identidade própria; cada item pago gera uma movimentação vinculada no Razão e a exclusão/desmarcação mantém o financeiro sincronizado.
- Cadastro de lançamentos com categorias personalizadas criadas no próprio formulário e campos monetários otimizados para teclado numérico.
- Home com distribuição de saídas por categoria, ritmo do mês, próximos compromissos e perfil financeiro ampliado.
- Backup/restauração v3 incluindo o Razão (`movimentacoes`), além de gastos, acordos, configurações, listas e itens.
- Web via Vite e Android via Capacitor 8, com APK de teste e AAB de release para Google Play.
- Testes unitários com Vitest e E2E com Playwright.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para validar:

```bash
npm run test:unit
npm run build
npm run test:e2e
```

## Atenção ao Android

O identificador Android foi padronizado para `com.saldoreal.app`. Se você já instalou uma versão de desenvolvimento com o identificador antigo `com.minhasfinancas.app`, o Android tratará a versão atual como outro aplicativo. **Exporte um backup na versão antiga antes de migrar**, depois importe-o no SaldoReal novo.


## Pré-publicação Google Play

A beta.8 prepara a camada Android para API 36, AAB release, assinatura segura via GitHub Secrets, política de privacidade e safe areas do Android 16. Consulte `PLAY_STORE_CHECKLIST.md` e `RELEASE_ANDROID.md` antes de enviar à loja.
