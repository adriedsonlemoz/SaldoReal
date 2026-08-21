# Auditoria de pré-publicação — Saldo Real 1.0.0-beta.10

Data da auditoria: 21/08/2026.

## Estado técnico preparado no projeto

- Capacitor 8.5.0 e Node 22.
- Android com minSdk 24 e compileSdk/targetSdk 36.
- Versionamento Android preparado para `versionCode 13` e `versionName 1.0.0-beta.10`.
- Workflow do GitHub Actions preparado para testes unitários, build web, lint Android, APK debug e AAB release assinado.
- Assinatura release via chave de upload armazenada somente em GitHub Secrets.
- Ícone oficial preservado em `assets/icon.png`; recursos Android são gerados dele pelo `@capacitor/assets`.
- Cópia 512×512 do ícone aprovado em `store-assets/icon-512-approved.png`.
- System Bars / safe areas ajustados globalmente para edge-to-edge moderno, incluindo barra inferior, modais e telas fullscreen.
- Nome visível Android sincronizado como **Saldo Real** a partir de `capacitor.config.json`, sem nome de aplicativo hardcoded no script compartilhável.
- Revisão beta.10 do fluxo de renda, vencimentos, relatórios e consistência histórica, sem alteração destrutiva do schema financeiro.
- HTTP em claro desativado no Android.
- Backup automático do sistema Android desativado para evitar cópias externas não controladas do banco financeiro.
- Política de privacidade disponível no app e como página web (`public/privacy.html`).
- Banco local não é apagado automaticamente quando falha ao abrir.
- Restauração de backup exige confirmação antes de substituir os dados.
- Tratamento de erro informa o usuário sem sugerir apagar o banco financeiro.
- CSP web restringe recursos ao próprio aplicativo.

## Auditoria de coleta/permissões

Na versão atual não foram encontrados fetch/HTTP de aplicação, analytics, publicidade, login remoto, sincronização em nuvem, localização, câmera, microfone ou acesso a contatos no código-fonte. O funcionamento financeiro permanece local no dispositivo.

A permissão de Internet que eventualmente exista no template padrão do Capacitor não significa, por si só, coleta de dados; a declaração do Play Console deve refletir o comportamento real do app e de todas as dependências presentes no AAB final.

## Itens que dependem de ação externa antes de Produção

1. Criar/definir um e-mail público real de suporte e colocá-lo também na Política de Privacidade. Não foi inventado um endereço no código.
2. Hospedar `privacy.html` em uma URL HTTPS pública e inserir essa URL no Play Console.
3. Criar a chave de upload, cadastrar os quatro GitHub Secrets documentados em `RELEASE_ANDROID.md` e guardar a chave fora do repositório.
4. Rodar o workflow em ambiente com acesso ao npm e confirmar `npm ci`, testes + build + lint + AAB.
5. Instalar o APK/AAB em dispositivos reais e executar o roteiro de `PLAY_STORE_CHECKLIST.md`.
6. Preencher Segurança dos Dados, Declaração de Recursos Financeiros, classificação indicativa, público-alvo, anúncios e demais formulários do Play Console.
7. Se a conta pessoal tiver sido criada após 13/11/2023, cumprir o teste fechado obrigatório antes de solicitar Produção.
8. Confirmar verificação de identidade e registro do package `com.saldoreal.app` no Play Console.

## Decisão de publicação

**Código: candidato a teste de release.**

Não classificar como “pronto para Produção” até o AAB assinado passar pelo workflow, pelo teste em dispositivo e pelos formulários/validações do Play Console. Nenhum desses passos externos deve ser simulado ou marcado como concluído sem execução real.


## Validação executada nesta preparação da beta.10

Executado com sucesso neste ambiente:

- validação sintática de todos os arquivos `src/**/*.js|jsx|mjs` usando o parser do TypeScript;
- validação sintática dos scripts Node (`configure-android.mjs`, `validate-android-theme.mjs`, Vite, Vitest e Playwright configs);
- parsing de `package.json`, `package-lock.json` e `capacitor.config.json`;
- parsing do workflow `.github/workflows/build-apk.yml`;
- verificação dos imports relativos do `src` (nenhum caminho ausente);
- metadados da release sincronizados no código-fonte: `versionCode` definido como **13** e `versionName` originado do `package.json` em **1.0.0-beta.10**. A geração Android completa continua dependente do CI/SDK e não é marcada como aprovada sem execução.

Não foi possível concluir neste ambiente:

- `npm ci`: o acesso ao `registry.npmjs.org` falhou com `EAI_AGAIN`; o npm 10 encerrou com `Exit handler never called`;
- por consequência, `npm run test:unit`, `npm run build`, `npx cap add android`, `npx cap sync android` e `./gradlew lintDebug` não puderam ser executados de forma íntegra aqui.

Esses itens permanecem obrigatórios no GitHub Actions antes de considerar o binário aprovado.
