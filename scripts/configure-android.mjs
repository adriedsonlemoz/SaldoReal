import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.resolve('package.json');
const packageVersion = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version;

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

// O minSdk do Capacitor 8 é 24. Atributos introduzidos depois da API 24
// precisam ficar em resources versionados para o Android Lint e para o
// carregamento correto do tema em aparelhos antigos.
const baseStyleItems = [
  ['android:statusBarColor', '@color/saldoreal_system_bar'],               // API 21
  ['android:navigationBarColor', '@color/saldoreal_system_bar'],           // API 21
  ['android:windowLightStatusBar', 'false'],                               // API 23
  ['android:windowDrawsSystemBarBackgrounds', 'true'],                     // API 21
];
const api27StyleItems = [
  ['android:windowLightNavigationBar', 'false'],                           // API 27
];
const api29StyleItems = [
  ...api27StyleItems,
  ['android:enforceNavigationBarContrast', 'false'],                       // API 29
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const removeItems = (xml, names) => {
  let out = xml;
  for (const name of names) {
    const escaped = escapeRegExp(name);
    out = out.replace(new RegExp(`\\s*<item\\s+name=["']${escaped}["'][^>]*>[^<]*<\\/item>`, 'g'), '');
  }
  return out;
};

const applyItemsToAppThemes = (xml, items) => xml.replace(
  /(<style\s+name=["']AppTheme[^"']*["'][^>]*>)([\s\S]*?)(<\/style>)/g,
  (_, open, body, close) => {
    let out = body;
    for (const [name, value] of items) {
      const escaped = escapeRegExp(name);
      const re = new RegExp(`<item\\s+name=["']${escaped}["'][^>]*>[^<]*<\\/item>`);
      const line = `<item name="${name}">${value}</item>`;
      out = re.test(out) ? out.replace(re, line) : `${out.trimEnd()}\n        ${line}\n    `;
    }
    return `${open}${out}${close}`;
  },
);

let styles = fs.readFileSync(stylesPath, 'utf8');
const allManagedNames = [...baseStyleItems, ...api29StyleItems].map(([name]) => name);
styles = removeItems(styles, allManagedNames);
styles = applyItemsToAppThemes(styles, baseStyleItems);
fs.writeFileSync(stylesPath, styles);

// API 27–28: mantém todo o tema base e acrescenta somente o atributo disponível
// a partir do Android 8.1.
const valuesV27Dir = path.join(resRoot, 'values-v27');
fs.mkdirSync(valuesV27Dir, { recursive: true });
const stylesV27 = applyItemsToAppThemes(styles, api27StyleItems);
fs.writeFileSync(path.join(valuesV27Dir, 'styles.xml'), stylesV27);

// API 29+: a variante mais específica também precisa carregar o item da API 27.
const valuesV29Dir = path.join(resRoot, 'values-v29');
fs.mkdirSync(valuesV29Dir, { recursive: true });
const stylesV29 = applyItemsToAppThemes(styles, api29StyleItems);
fs.writeFileSync(path.join(valuesV29Dir, 'styles.xml'), stylesV29);

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
const versionCode = 11;
let appGradle = fs.readFileSync(appGradlePath, 'utf8');
appGradle = appGradle
  .replace(/versionCode\s*(?:=\s*)?\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s*(?:=\s*)?["'][^"']+["']/, `versionName "${packageVersion}"`);

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

console.log(`Android do SaldoReal preparado: API 36, minSdk 24, versionCode ${versionCode}, versionName ${packageVersion}, system bars compatíveis por nível de API e hardening aplicados.`);
