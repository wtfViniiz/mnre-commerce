import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Script para gerar secrets seguros
 * Execute: npx tsx scripts/generate-secrets.ts
 */

function generateSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64')
}

function generateHexSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

const secrets = {
  JWT_SECRET: generateSecret(64),
  JWT_REFRESH_SECRET: generateSecret(64),
  NEXTAUTH_SECRET: generateSecret(64),
  MERCADOPAGO_WEBHOOK_SECRET: generateSecret(64),
}

console.log('\n🔐 SECRETS GERADOS\n')
console.log('Adicione estas variáveis ao seu arquivo .env:\n')

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`)
})

console.log('\n⚠️  IMPORTANTE:')
console.log('- Guarde estes valores em local seguro')
console.log('- NUNCA commite estes valores no Git')
console.log('- Use um gerenciador de secrets em produção')
console.log('- Gere novos secrets a cada deploy em produção\n')

// Opcional: salvar em arquivo .env.secrets (não commitado)
const secretsPath = path.join(__dirname, '../.env.secrets')
const envContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')

fs.writeFileSync(secretsPath, envContent)
console.log(`✅ Secrets salvos em: ${secretsPath}`)
console.log('⚠️  Certifique-se de adicionar .env.secrets ao .gitignore\n')

