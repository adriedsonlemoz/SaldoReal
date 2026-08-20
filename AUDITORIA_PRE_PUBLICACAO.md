# Auditoria de pré-publicação — SaldoReal 1.0.0-beta.8.1

Data da auditoria: 20/08/2026.

## Estado técnico preparado no projeto

- Capacitor 8.5.0 e Node 22.
- Android com minSdk 24 e compileSdk/targetSdk 36.
- Versionamento Android preparado para `versionCode 9` e `versionName 1.0.0-beta.8.1`.
- Workflow do GitHub Actions preparado para testes unitários, build web, lint Android, APK debug e AAB release assinado.
- Assinatura release via chave de upload armazenada somente em GitHub Secrets.
- Ícone oficial preservado em `assets/icon.png`; recursos Android são gerados dele pelo `@capacitor/assets`.
- Cópia 512×512 do ícone aprovado em `store-assets/icon-512-approved.png`.
- System Bars / safe areas ajustados para edge-to-edge moderno.
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
4. Rodar o workflow em ambiente com acesso ao npm, regenerar/commitir `package-lock.json` e confirmar testes + build + lint + AAB.
5. Instalar o APK/AAB em dispositivos reais e executar o roteiro de `PLAY_STORE_CHECKLIST.md`.
6. Preencher Segurança dos Dados, Declaração de Recursos Financeiros, classificação indicativa, público-alvo, anúncios e demais formulários do Play Console.
7. Se a conta pessoal tiver sido criada após 13/11/2023, cumprir o teste fechado obrigatório antes de solicitar Produção.
8. Confirmar verificação de identidade e registro do package `com.saldoreal.app` no Play Console.

## Decisão de publicação

**Código: candidato a teste de release.**

Não classificar como “pronto para Produção” até o AAB assinado passar pelo workflow, pelo teste em dispositivo e pelos formulários/validações do Play Console. Nenhum desses passos externos deve ser simulado ou marcado como concluído sem execução real.
