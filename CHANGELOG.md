# Changelog — SaldoReal

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
