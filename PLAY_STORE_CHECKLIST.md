# Checklist de publicação — Google Play

## Binário
- [x] Identificador estável: `com.saldoreal.app`
- [x] Android 16 / API 36 configurado
- [x] Android App Bundle (`.aab`) previsto no CI
- [x] Chave de upload suportada por Secrets do GitHub
- [x] Ícone oficial usado na geração dos recursos Android
- [x] Splash derivado do mesmo ícone aprovado, sem redesenho
- [x] Barras do sistema e safe areas preparadas para edge-to-edge moderno
- [x] Tráfego HTTP em claro desativado
- [x] Backup automático do Android desativado; o app usa seu próprio backup local
- [ ] Gerar novo `package-lock.json` com Node 22 e validar `npm ci` antes da produção
- [ ] Rodar o workflow e instalar o APK em pelo menos Android 8, 12, 14, 15 e 16 quando possível
- [ ] Enviar o AAB primeiro para **Teste interno** / **Teste fechado**, não direto para produção

## Privacidade e dados
- [x] Política de privacidade disponível dentro do app
- [x] Página pública pronta em `public/privacy.html`
- [x] Sem analytics, anúncios, rastreamento ou login remoto na versão atual
- [x] Sem permissões perigosas necessárias às funções atuais
- [x] Banco local preservado em erro de abertura; não é apagado automaticamente
- [x] Restauração de backup exige confirmação explícita
- [ ] Hospedar o app/site e informar uma URL HTTPS pública para `/privacy.html` no Play Console
- [ ] Preencher o formulário **Segurança dos dados** mesmo declarando que não há coleta/compartilhamento

## Conteúdo do app / políticas
- [ ] Preencher **Declaração de recursos financeiros**. O SaldoReal gerencia finanças pessoais, mas não concede empréstimos, não movimenta dinheiro, não funciona como banco/carteira e não vende investimentos. Revise no formulário se a classificação apropriada é **Outro** para gerenciamento financeiro pessoal.
- [ ] Declarar que o app não contém anúncios, se continuar sem publicidade
- [ ] Informar que não há login/restrição de acesso para a equipe de revisão
- [ ] Preencher classificação indicativa e público-alvo
- [ ] Informar e-mail de suporte real na ficha da loja

## Ficha da loja
- [x] Nome do app: SaldoReal
- [x] Ícone-base aprovado presente no projeto
- [x] Ícone da Play Store 512×512 derivado sem redesenho em `store-assets/icon-512-approved.png`
- [ ] Validar a prévia do ícone no Play Console antes do envio
- [ ] Criar o **feature graphic obrigatório** 1024×500 para a ficha da loja (não foi criado nesta etapa para preservar a orientação de não redesenhar imagens)
- [ ] Capturas de tela finais sem dados pessoais reais
- [ ] Descrição curta e descrição completa
- [ ] Categoria sugerida: Finanças
- [ ] URL da política de privacidade
- [ ] E-mail de suporte válido
- [ ] Inserir esse mesmo canal de contato real na Política de Privacidade antes da produção

## Conta de desenvolvedor
- [ ] Confirmar verificação de identidade da conta de desenvolvedor
- [ ] Verificar/registrar o package name no Play Console dentro dos requisitos de verificação Android de 2026
- [ ] Se for uma conta pessoal criada depois de 13/11/2023: cumprir teste fechado com pelo menos 12 testadores opt-in por 14 dias consecutivos antes de solicitar acesso à produção

## Teste funcional mínimo antes do envio
- [ ] Primeiro uso / onboarding
- [ ] Criar, editar, pagar e excluir lançamento
- [ ] Lista: criar item → pagar → Fluxo → desfazer/excluir e confirmar sincronização
- [ ] Acordos: criar → pagar parcelas → estornar → relatório
- [ ] Backup: exportar → criar dados novos → restaurar → comparar dados
- [ ] Virada de mês e vencimentos 28/29/30/31
- [ ] App totalmente offline / modo avião
- [ ] Rotação, teclado numérico e navegação por gesto/3 botões
- [ ] Reinício forçado do processo com dados persistidos
