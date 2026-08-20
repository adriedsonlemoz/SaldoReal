# Release Android — SaldoReal

## Configuração desta versão
- App ID: `com.saldoreal.app`
- Version name: `1.0.0-beta.8`
- Version code: `8`
- minSdk: 24
- compileSdk/targetSdk: 36 (Android 16)
- Capacitor: 8.5.0
- Node no CI: 22

O workflow `.github/workflows/build-apk.yml` gera sempre um APK debug para testes. O AAB de release só é gerado quando a chave de upload está configurada nos Secrets do GitHub.

## 1. Criar a chave de upload (uma vez)
Guarde essa chave fora do repositório e mantenha uma cópia segura.

```bash
keytool -genkeypair -v \
  -keystore saldoreal-upload.jks \
  -alias saldoreal \
  -keyalg RSA -keysize 4096 -validity 10000
```

## 2. Criar os Secrets no GitHub
Converta o arquivo para Base64 e cadastre estes secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Linux:
```bash
base64 -w 0 saldoreal-upload.jks
```

PowerShell:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('saldoreal-upload.jks'))
```

Nunca coloque o `.jks`, senhas ou `keystore.properties` no Git.

## 3. Build no GitHub Actions
Execute o workflow **Android — APK de teste + AAB Play Store**.

Artefatos esperados:
- `saldoreal-beta8-debug-apk`: instalação/testes fora da Play Store;
- `saldoreal-beta8-play-aab`: pacote assinado para o Play Console, quando os secrets estiverem configurados.

## 4. Play App Signing
Para um app novo, use a Assinatura de Apps do Google Play. A chave deste documento funciona como **chave de upload**; a chave de assinatura de distribuição pode ser gerenciada pelo Google Play.

## 5. Lockfile
A beta.8 migrou Capacitor 5 → 8. O `package-lock.json` antigo foi removido de propósito. Faça um `npm install` com Node 22 em um ambiente com acesso ao npm, valide os testes/build e então versione o novo lockfile antes do lançamento final.
