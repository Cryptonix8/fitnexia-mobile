#!/usr/bin/env node
/**
 * Validates Google Sign-In config for Android + iOS.
 * Run: npm run google:verify
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function readJson(rel) {
  const file = path.join(root, rel);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readEnv() {
  const file = path.join(root, '.env');
  const out = {};
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  }
  for (const key of [
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_ANDROID_SHA1',
  ]) {
    if (process.env[key] && !out[key]) out[key] = process.env[key];
  }
  return out;
}

function normalizeSha1(value) {
  return value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
}

const env = readEnv();
const appJson = readJson('app.json');
const googleServices = readJson('google-services.json');

const pkg = appJson.expo.android?.package;
const bundle = appJson.expo.ios?.bundleIdentifier;
const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const iosClientId = env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const releaseSha1 = env.EXPO_PUBLIC_GOOGLE_ANDROID_SHA1 ?? '';
const debugSha1 = '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

if (pkg !== 'com.fitnexia.app') errors.push(`android.package debe ser com.fitnexia.app (actual: ${pkg})`);
if (bundle !== 'com.fitnexia.app') errors.push(`ios.bundleIdentifier debe ser com.fitnexia.app (actual: ${bundle})`);
if (!webClientId) errors.push('Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en .env');
if (!iosClientId) warnings.push('Falta EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — obligatorio para iOS');

const androidClient = googleServices.client?.[0];
const oauthClients = androidClient?.oauth_client ?? [];
const webInJson = oauthClients.find((c) => c.client_type === 3)?.client_id;
const androidEntries = oauthClients.filter((c) => c.client_type === 1);
const hashesInJson = androidEntries.map((c) => c.android_info?.certificate_hash?.toUpperCase());

if (webInJson && webClientId && webInJson !== webClientId) {
  errors.push(`Web client ID en .env no coincide con google-services.json`);
}
if (androidEntries.length === 0) {
  errors.push('google-services.json no tiene oauth_client Android (type 1)');
}

const expectedHashes = [normalizeSha1(debugSha1)];
if (releaseSha1) expectedHashes.push(normalizeSha1(releaseSha1));
for (const hash of expectedHashes) {
  if (!hashesInJson.includes(hash)) {
    errors.push(`SHA-1 ${hash} no está en google-services.json — reconstruí el APK después de corregirlo`);
  }
}

const plistPath = path.join(root, 'GoogleService-Info.plist');
const plist = fs.readFileSync(plistPath, 'utf8');
if (!plist.includes('<key>CLIENT_ID</key>')) errors.push('GoogleService-Info.plist sin CLIENT_ID (iOS fallará)');
if (iosClientId && !plist.includes(iosClientId)) {
  errors.push('GoogleService-Info.plist CLIENT_ID no coincide con EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
}

const oauthProject = webClientId.split('-')[0];
const firebaseProject = googleServices.project_info?.project_number;
if (oauthProject && firebaseProject && oauthProject !== String(firebaseProject)) {
  warnings.push(
    `OAuth (proyecto ${oauthProject}) y Firebase (proyecto ${firebaseProject}) son distintos. ` +
      'Registrá los SHA-1 en Google Cloud → Credentials del proyecto OAuth (635752178238-...), ' +
      'NO solo en Firebase Console.',
  );
}

const androidCopy = path.join(root, 'android', 'app', 'google-services.json');
if (fs.existsSync(androidCopy)) {
  const copy = JSON.parse(fs.readFileSync(androidCopy, 'utf8'));
  if (JSON.stringify(copy) !== JSON.stringify(googleServices)) {
    warnings.push('android/app/google-services.json difiere del root — copiá el archivo o ejecutá prebuild');
  }
}

console.log('\n=== Fitnexia Google Sign-In ===\n');
console.log(`Package Android: ${pkg}`);
console.log(`Bundle iOS:      ${bundle}`);
console.log(`Web client ID:   ${webClientId || '(vacío)'}`);
console.log(`iOS client ID:   ${iosClientId || '(vacío)'}`);
console.log(`SHA-1 debug:     ${debugSha1}`);
console.log(`SHA-1 EAS:       ${releaseSha1 || '(no configurado en .env)'}`);
console.log(`OAuth en JSON:   ${androidEntries.length} entrada(s) Android, web=${webInJson ? 'ok' : 'falta'}`);

if (warnings.length) {
  console.log('\nAdvertencias:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.log('\nErrores:');
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log('\nPasos Android (DEVELOPER_ERROR):');
  console.log('  1. Google Cloud Console → proyecto del Web client (635752178238-...)');
  console.log('  2. Credentials → OAuth client Android → com.fitnexia.app');
  console.log('  3. Agregá AMBOS SHA-1 (debug + EAS)');
  console.log('  4. eas build -p android --profile preview  (si cambiaste google-services.json)');
  process.exit(1);
}

console.log('\n✓ Configuración local coherente.\n');
process.exit(0);
