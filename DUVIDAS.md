# ❓ Dúvidas Frequentes — SaldoReal

## 🔧 Termux

**Como instalar Git e SSH?**
```bash
pkg update && pkg install -y git openssh
```

**Como liberar acesso ao armazenamento?**
```bash
termux-setup-storage
```
Aceite a permissão exibida pelo Android.

**Como trabalhar com o projeto?**
```bash
cd ~/projetos/saldoreal
npm install
npm run dev
```

## 🐙 GitHub e Vercel

Após conectar o repositório à Vercel, cada `git push` pode gerar um novo deploy conforme a configuração da conta.

Para executar os testes E2E contra um deploy externo:
```bash
PLAYWRIGHT_BASE_URL=https://seu-deploy.vercel.app npm run test:e2e
```

Se `PLAYWRIGHT_BASE_URL` não for informado, o Playwright tenta iniciar o Vite localmente em `127.0.0.1:4173`. Em ambientes Android/Termux onde o navegador do Playwright não estiver disponível, prefira testar contra um deploy externo ou executar os E2E em um computador/CI.

## 📦 APK Android

O workflow **Build APK Android** gera um APK debug no GitHub Actions. O artefato publicado se chama `saldoreal-debug`.

A partir da beta.2, o identificador Android é `com.saldoreal.app`. Versões antigas de desenvolvimento usavam outro identificador; por isso, exporte um backup antes de migrar de uma instalação antiga.

## 🧪 Testes

```bash
npm run test:unit
npm run build
npm run test:e2e
```

Os testes unitários cobrem regras financeiras, datas/vencimentos, backup e lista de compras. Os E2E validam fluxos reais da interface.

## 🗂️ Arquivos gerados

O `.gitignore` exclui `node_modules/`, `dist/`, `android/` e arquivos `.env`. Esses diretórios/arquivos não devem ser enviados normalmente ao repositório.
