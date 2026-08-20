import fs from 'node:fs';
import path from 'node:path';

const resRoot = path.resolve('android/app/src/main/res');
const basePath = path.join(resRoot, 'values/styles.xml');
const v27Path = path.join(resRoot, 'values-v27/styles.xml');
const v29Path = path.join(resRoot, 'values-v29/styles.xml');

for (const file of [basePath, v27Path, v29Path]) {
  if (!fs.existsSync(file)) throw new Error(`Tema Android esperado não encontrado: ${file}`);
}

const base = fs.readFileSync(basePath, 'utf8');
const v27 = fs.readFileSync(v27Path, 'utf8');
const v29 = fs.readFileSync(v29Path, 'utf8');

const assertNotContains = (text, value, label) => {
  if (text.includes(value)) throw new Error(`${label} não pode conter ${value}.`);
};
const assertContains = (text, value, label) => {
  if (!text.includes(value)) throw new Error(`${label} deveria conter ${value}.`);
};

assertNotContains(base, 'android:windowLightNavigationBar', 'values/styles.xml (minSdk 24)');
assertNotContains(base, 'android:enforceNavigationBarContrast', 'values/styles.xml (minSdk 24)');
assertContains(v27, 'android:windowLightNavigationBar', 'values-v27/styles.xml');
assertNotContains(v27, 'android:enforceNavigationBarContrast', 'values-v27/styles.xml');
assertContains(v29, 'android:windowLightNavigationBar', 'values-v29/styles.xml');
assertContains(v29, 'android:enforceNavigationBarContrast', 'values-v29/styles.xml');

console.log('Temas Android validados: atributos das barras do sistema estão separados corretamente para API 24, 27 e 29+.');
