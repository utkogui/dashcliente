#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detectar se é PostgreSQL ou SQLite baseado na URL
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const isPostgreSQL = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

console.log(`🔍 Detected database: ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'}`);
console.log(`📊 Database URL: ${databaseUrl}`);

// Ler o schema atual
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Atualizar o provider baseado na detecção
const newProvider = isPostgreSQL ? 'postgresql' : 'sqlite';
const providerRegex = /provider\s*=\s*"(sqlite|postgresql)"/;
const newProviderLine = `provider = "${newProvider}"`;

if (providerRegex.test(schema)) {
  schema = schema.replace(providerRegex, newProviderLine);
  console.log(`✅ Updated schema to use ${newProvider}`);
} else {
  console.log(`⚠️  Could not find provider in schema`);
}

// Escrever o schema atualizado
fs.writeFileSync(schemaPath, schema);
console.log(`💾 Schema updated successfully`);
