import fs from 'node:fs';
import path from 'node:path';
const resRoot = path.resolve('android/app/src/main/res');
const valuesDir = path.join(resRoot, 'values');
const stylesPath = path.join(valuesDir, 'styles.xml');
const colorsPath = path.join(valuesDir, 'colors.xml');
if (!fs.existsSync(stylesPath)) throw new Error(`styles.xml não encontrado em ${stylesPath}. Execute npx cap add android antes.`);
fs.mkdirSync(valuesDir, { recursive: true });
let colors = fs.existsSync(colorsPath) ? fs.readFileSync(colorsPath, 'utf8') : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';
const ensureColor = (name, value) => {
  const re = new RegExp(`<color\\s+name=["']${name}["'][^>]*>[^<]*<\\/color>`);
  const line = `<color name="${name}">${value}</color>`;
  colors = re.test(colors) ? colors.replace(re, line) : colors.replace('</resources>', `    ${line}\n</resources>`);
};
ensureColor('saldoreal_system_bar', '#2D0B5E');
ensureColor('saldoreal_primary', '#7B2CBF');
fs.writeFileSync(colorsPath, colors);
const items = [
  ['android:statusBarColor', '@color/saldoreal_system_bar'], ['android:navigationBarColor', '@color/saldoreal_system_bar'],
  ['android:windowLightStatusBar', 'false'], ['android:windowLightNavigationBar', 'false'],
  ['android:windowDrawsSystemBarBackgrounds', 'true'], ['android:enforceNavigationBarContrast', 'false'],
];
let styles = fs.readFileSync(stylesPath, 'utf8');
const upsert = (body) => {
  let out=body;
  for (const [name,value] of items) {
    const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`<item\\s+name=["']${escaped}["'][^>]*>[^<]*<\\/item>`);
    const line=`<item name="${name}">${value}</item>`;
    out=re.test(out)?out.replace(re,line):`${out.trimEnd()}\n        ${line}\n    `;
  }
  return out;
};
styles=styles.replace(/(<style\s+name=["']AppTheme[^"']*["'][^>]*>)([\s\S]*?)(<\/style>)/g,(_,open,body,close)=>`${open}${upsert(body)}${close}`);
fs.writeFileSync(stylesPath,styles);
console.log('Identidade Android do SaldoReal aplicada às barras do sistema.');
