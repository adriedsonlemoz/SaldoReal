import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('android');
const appRoot = path.join(root, 'app');
const resRoot = path.join(appRoot, 'src/main/res');
const valuesDir = path.join(resRoot, 'values');
const stylesPath = path.join(valuesDir, 'styles.xml');
const colorsPath = path.join(valuesDir, 'colors.xml');
const manifestPath = path.join(appRoot, 'src/main/AndroidManifest.xml');
const variablesPath = path.join(root, 'variables.gradle');
const appGradlePath = path.join(appRoot, 'build.gradle');

for (const required of [stylesPath, manifestPath, variablesPath, appGradlePath]) {
  if (!fs.existsSync(required)) throw new Error(`Arquivo Android não encontrado: ${required}. Execute npx cap add android antes.`);
}

fs.mkdirSync(valuesDir, { recursive: true });
let colors = fs.existsSync(colorsPath)
  ? fs.readFileSync(colorsPath, 'utf8')
  : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';

const ensureColor = (name, value) => {
  const re = new RegExp(`<color\\s+name=["']${name}["'][^>]*>[^<]*<\\/color>`);
  const line = `<color name="${name}">${value}</color>`;
  colors = re.test(colors) ? colors.replace(re, line) : colors.replace('</resources>', `    ${line}\n</resources>`);
};
ensureColor('saldoreal_system_bar', '#2D0B5E');
ensureColor('saldoreal_primary', '#7B2CBF');
fs.writeFileSync(colorsPath, colors);

// Mantém o tema coerente em Androids anteriores; Android 16 usa edge-to-edge.
let styles = fs.readFileSync(stylesPath, 'utf8');
const styleItems = [
  ['android:statusBarColor', '@color/saldoreal_system_bar'],
  ['android:navigationBarColor', '@color/saldoreal_system_bar'],
  ['android:windowLightStatusBar', 'false'],
  ['android:windowLightNavigationBar', 'false'],
  ['android:windowDrawsSystemBarBackgrounds', 'true'],
  ['android:enforceNavigationBarContrast', 'false'],
];
const upsertItems = (body) => {
  let out = body;
  for (const [name, value] of styleItems) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`<item\\s+name=["']${escaped}["'][^>]*>[^<]*<\\/item>`);
    const line = `<item name="${name}">${value}</item>`;
    out = re.test(out) ? out.replace(re, line) : `${out.trimEnd()}\n        ${line}\n    `;
  }
  return out;
};
styles = styles.replace(/(<style\s+name=["']AppTheme[^"']*["'][^>]*>)([\s\S]*?)(<\/style>)/g,
  (_, open, body, close) => `${open}${upsertItems(body)}${close}`);
fs.writeFileSync(stylesPath, styles);

// API 36 é exigida para novos envios a partir de 31/08/2026.
let vars = fs.readFileSync(variablesPath, 'utf8');
const setGradleVar = (name, value) => {
  const re = new RegExp(`(${name}\\s*=\\s*)[^\\n\\r]+`);
  vars = re.test(vars) ? vars.replace(re, `$1${value}`) : vars.replace(/ext\s*\{/, `ext {\n    ${name} = ${value}`);
};
setGradleVar('minSdkVersion', '24');
setGradleVar('compileSdkVersion', '36');
setGradleVar('targetSdkVersion', '36');
fs.writeFileSync(variablesPath, vars);

// Versionamento Play Store.
let appGradle = fs.readFileSync(appGradlePath, 'utf8');
appGradle = appGradle
  .replace(/versionCode\s*(?:=\s*)?\d+/, 'versionCode 9')
  .replace(/versionName\s*(?:=\s*)?["'][^"']+["']/, 'versionName "1.0.0-beta.8.2"');

// Assinatura opcional via android/keystore.properties, criada apenas no CI.
const signingApply = "apply from: 'saldoreal-signing.gradle'";
if (!appGradle.includes(signingApply)) appGradle += `\n${signingApply}\n`;
fs.writeFileSync(appGradlePath, appGradle);

const signingGradle = `import java.util.Properties\n\ndef propsFile = rootProject.file('keystore.properties')\nif (propsFile.exists()) {\n    def props = new Properties()\n    props.load(new FileInputStream(propsFile))\n    android {\n        signingConfigs {\n            release {\n                storeFile rootProject.file(props['storeFile'])\n                storePassword props['storePassword']\n                keyAlias props['keyAlias']\n                keyPassword props['keyPassword']\n            }\n        }\n        buildTypes {\n            release {\n                signingConfig signingConfigs.release\n            }\n        }\n    }\n}\n`;
fs.writeFileSync(path.join(appRoot, 'saldoreal-signing.gradle'), signingGradle);

// Hardening: app offline, sem tráfego HTTP em claro e sem backup automático do SO.
let manifest = fs.readFileSync(manifestPath, 'utf8');
manifest = manifest.replace(/<application\b([^>]*)>/, (full, attrs) => {
  let a = attrs;
  const upsertAttr = (name, value) => {
    const re = new RegExp(`\\s${name}=["'][^"']*["']`);
    a = re.test(a) ? a.replace(re, ` ${name}="${value}"`) : `${a} ${name}="${value}"`;
  };
  upsertAttr('android:usesCleartextTraffic', 'false');
  upsertAttr('android:allowBackup', 'false');
  upsertAttr('android:fullBackupContent', 'false');
  return `<application${a}>`;
});
fs.writeFileSync(manifestPath, manifest);

console.log('Android do SaldoReal preparado: API 36, versionCode 9, barras do sistema e hardening aplicados.');
