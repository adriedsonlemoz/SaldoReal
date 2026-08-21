# Changelog

## 1.0.0-beta.10 — Fluxo de renda, vencimentos e correções financeiras

- Renda mensal configurada passa a permanecer pendente até confirmação do recebimento, com opção de receber antecipadamente.
- Recebimentos de renda podem ser editados ou excluídos sem apagar indevidamente o histórico de outros meses.
- Configuração da renda mensal pode ser editada ou removida, sem confundir previsão futura com movimentação já recebida.
- Relatórios foram ampliados com valores realizados e previstos, pendências, saldo previsto, fluxo realizado e indicadores de realização.
- Lançamentos pendentes exibem data, dia da semana e quantidade de dias até o vencimento ou atraso; o cadastro mostra uma prévia do prazo.
- Ação “Receber agora” foi compactada para o mesmo padrão visual das demais ações financeiras e o card principal da Home recebeu contraste mais suave.
- Corrigida a edição de contas fixas para preservar o vencimento original quando apenas outros campos são alterados.
- Corrigida a edição de lançamentos para permitir mudança real de mês/ano, em vez de alterar somente o dia.
- Corrigida a competência da renda para que salário atrasado recebido em outro mês não esconda a previsão da competência seguinte.
- Corrigido o histórico de meses anteriores para que pagamentos futuros não removam retroativamente pendências que existiam naquele período.
- Corrigida a data exibida para parcelas de acordos em consultas históricas.
- Próximo recebimento da Home passa a considerar se a renda da competência já foi efetivamente recebida e avança corretamente após antecipação.
- Saldo disponível passa a representar somente fluxo efetivamente realizado; renda ainda não recebida permanece no saldo projetado.
- Tela de humor teve referências internas inválidas removidas/corrigidas para não quebrar caso volte a ser utilizada.
- Versão do app sincronizada em `package.json`, lockfile, Android (`versionCode 13`), documentação e tela Sobre.

## 1.0.0-beta.9 — UX Android, recebimentos e autocompletes

- Corrige o nome visível do Android para **Saldo Real** usando `capacitor.config.json` como fonte de verdade e sincronização de `strings.xml` no script Android.
- Incrementa o Android `versionCode` para **12**; `versionName` continua vindo automaticamente do `package.json`.
- Consolida safe areas, `100dvh`, barra inferior e telas fullscreen para Android edge-to-edge.
- Refina o wizard de acordos: cabeçalho compacto, progresso discreto, menos margens, conteúdo adaptável ao teclado e melhor centralização.
- Substitui listas gigantes de banco/empresa e administradora por autocomplete com no máximo 5 sugestões visíveis e entrada manual livre.
- Home passa a exibir **Próx. recebimento** com data, dia da semana e prazo restante.
- Alertas ficam compactos, com altura baseada no conteúdo, rolagem quando necessário e grupos Hoje / Próximos 7 dias / Mais tarde.
- “Média/dia” vira **Gasto médio/dia** e “Disponível/dia” vira **Pode gastar/dia**, com explicação do período considerado.
- Próximos compromissos passam a mostrar nome, valor, dia/data e prazo.
- Tela Sobre destaca apenas 5 versões recentes, com detalhes expansíveis e opção de histórico completo.
- Lista de compras aprende localmente com produtos já cadastrados e reaproveita categoria/unidade ao selecionar uma sugestão.
- Modais gerais recebem limite de altura e comportamento de rolagem mais consistente.
- Estado vazio de Acordos oferece ação **+ Criar primeiro acordo** e o cabeçalho foi compactado.
- Regras financeiras, schema do banco, backup e compatibilidade de dados foram preservados.


## 1.0.0-beta.8.4 — Compatibilidade de temas Android

- Corrige o Android Lint com `minSdk 24` sem elevar a versão mínima do sistema.
- Move `windowLightNavigationBar` para recursos `values-v27`.
- Move `enforceNavigationBarContrast` para recursos `values-v29`.
- Adiciona validação automática dos temas antes do lint Android.
- Incrementa o Android `versionCode` para 11.

## 1.0.0-beta.8.3 — Android CI com Java 21

- Corrige a compilação Android do Capacitor 8 usando JDK 21 no GitHub Actions.
- Atualiza `actions/cache` para v5, compatível com o runtime Node.js 24 das Actions atuais.
- Mantém os 112 testes unitários e o build Vite sem alterações de regra de negócio.
- Incrementa o `versionCode` Android para 10.

## 1.0.0-beta.8.2 — Correção do build Vite

- Corrige o build de produção substituindo o ícone `EcoRounded`, ausente no pacote Material Icons resolvido, por `LocalFloristRounded`.
- Inclui o `package-lock.json` gerado pelo GitHub Actions para instalações reproduzíveis com `npm ci`.
- Atualiza `actions/upload-artifact` para v7, eliminando o aviso de runtime Node.js 20 no runner atual.
- Mantém os 112 testes unitários da beta.8.1 sem alteração de regras financeiras.


## 1.0.0-beta.8.1 — Correção do CI de pré-publicação

- Atualiza os testes legados de acordos para a regra atual de primeiro vencimento.
- Torna os testes financeiros determinísticos, sem depender do dia em que o CI é executado.
- Evita tentativa de abrir IndexedDB em ambientes de teste sem essa API.
- Atualiza checkout/setup-java/setup-node para Actions v5.
- Publica o `package-lock.json` gerado como artefato quando o repositório ainda não possui lockfile.
- Android passa a usar `versionCode 9` e `versionName 1.0.0-beta.8.1`.


## 1.0.0-beta.8 — Preparação para Google Play

- Capacitor atualizado de 5 para 8.5.0 e pipeline migrado para Node 22;
- Android configurado para compile/target API 36 e minSdk 24;
- workflow passa a validar testes unitários, lint Android, APK debug e AAB release assinado quando a chave de upload estiver configurada;
- suporte a Play App Signing por chave de upload armazenada somente em GitHub Secrets;
- SystemBars/safe areas preparados para edge-to-edge do Android 16;
- tráfego HTTP em claro e backup automático do Android desativados;
- política de privacidade adicionada dentro do app e como página pública;
- restauração de backup recebe confirmação adicional e conta também as movimentações do Razão;
- tela de erro do banco informa preservação dos dados e evita orientar exclusão destrutiva;
- placeholders de PIX/e-mail de suporte foram removidos da interface de publicação;
- documentação de release e checklist do Play Console adicionados.

## 1.0.0-beta.7 — Polimento visual e consistência de interface

- identidade visual consolidada em roxo/violeta, reservando verde e vermelho para significado financeiro;
- Home refinada com saldo mais limpo, gráfico de categorias compacto, cards rápidos consistentes e indicadores de ritmo do mês;
- Novo Lançamento compactado, com categorias vetoriais, seletores mais claros e melhor uso em telas estreitas;
- Fluxo reorganizado para leitura em três zonas, filtros mais consistentes e ações com áreas de toque adequadas;
- Lista de Compras alinhada à identidade geral, com cartões, estados vazios, categorias e unidades mais coerentes;
- Acordos e Relatórios receberam a mesma linguagem de cards, navegação, ícones e espaçamento;
- tipografia, bordas, sombras, campos, diálogos e espaçamentos globais padronizados;
- barra inferior e botão central refinados para reduzir peso visual;
- melhorias de acessibilidade, foco, redução de movimento e responsividade para Android compacto.

## 1.0.0-beta.6 — Sincronização, edição e revisão de UX

- Corrigida a sincronização ao excluir/desmarcar itens pagos da Lista de Compras, incluindo vínculos legados do Fluxo.
- Corrigida a tela branca ao editar lançamentos pelo Fluxo e endurecido o carregamento de datas antigas/malformadas.
- Home recebe novo resumo por categorias, indicadores de ritmo do mês e próximos compromissos.
- Cadastro de lançamentos permite criar categorias sem sair do formulário.
- Campos monetários passam a usar digitação automática em centavos e formatação pt-BR.
- Perfil ampliado com resumo financeiro, dados principais e atalhos úteis.
- Revisão de responsividade, contraste, áreas de toque, espaçamento e acessibilidade em telas mobile.

## 1.0.0-beta.5 — UI/UX e Android
- Revisão visual responsiva com identidade roxa unificada.
- Home compactada para remover rolagem criada por alturas/paddings redundantes.
- Componente de próximo pagamento com hierarquia mais clara.
- Seletor de unidades da Lista de Compras reformulado para uso em telas pequenas.
- Tipografia, espaçamentos, contraste, cards e estados ativos ajustados.
- Ícone aprovado incorporado como fonte oficial dos assets Android.
- Pipeline Android ajustado para gerar densidades do launcher icon e aplicar barras do sistema em roxo escuro com ícones claros.

## 1.0.0-beta.4

- Novo Razão financeiro (`movimentacoes`) como fonte única das entradas e saídas efetivadas.
- Banco Dexie v13 migra gastos pagos e histórico de acordos existentes para o Razão sem duplicação.
- Fluxo real separado da competência: pagamentos adiantados/atrasados mantêm o mês da conta e o mês em que o dinheiro saiu.
- Lista de Compras, lançamentos manuais/renda e pagamentos de acordos registram origem rastreável no mesmo fluxo.
- Tela Gastos passa a se chamar **Fluxo**, com filtros por Manual, Compras, Acordos e Renda.
- Gráfico da Home passa a usar o mesmo Razão, evitando divergência entre Home, Fluxo e Relatório.
- Pagamentos de acordos podem ser estornados individualmente sem renumerar parcelas restantes.
- Ao existir lacuna após estorno, o próximo pagamento quita a primeira parcela realmente pendente.
- Backup evolui para formato v3 e passa a incluir `movimentacoes`; backups v1/v2 são reconstruídos na importação.
- Testes ampliados para competência x fluxo real, origem das movimentações e lacunas de parcelas.

## 1.0.0-beta.3

- Lista de Compras recriada com identidade visual própria e fluxo mais simples.
- Item pago é lançado imediatamente como despesa paga no financeiro.
- Desfazer pagamento remove somente o lançamento daquele item.
- Finalizar/reabrir lista não cria duplicações nem apaga o histórico financeiro.
- Exclusão da lista preserva pagamentos já registrados.
- Acordos/negociações passam a considerar todas as parcelas vencidas até o mês atual.
- Relatórios usam o valor realmente pago em acordos, inclusive múltiplas parcelas no mesmo mês.
- Banco v12 adiciona vínculo entre item da lista e lançamento financeiro.

## 1.0.0-beta.2

- Backup v2 completo com cinco tabelas e restauração transacional.
- Removido apagamento automático do IndexedDB após erro de abertura.
- Lista de compras centralizada em `ListaComprasService` e conclusão protegida contra duplicação.
- Dashboard separado em saldo disponível, pendências e saldo projetado.
- Primeiro vencimento de acordos passa a respeitar `vencimentoMesAno`.
- Datas 29/30/31 são ajustadas ao último dia real de meses curtos.
- Alertas usam a próxima parcela realmente pendente e suportam virada de mês.
- Datas de inputs passam a usar calendário local em vez de UTC.
- Novos testes de vencimentos, backup e lista de compras.
- Marca, documentação, workflow Android e identificador do app padronizados para SaldoReal.
- Componentes órfãos removidos e terminologia da interface padronizada para PT-BR.
