#!/usr/bin/env node
// scripts/fix-nextjs-lowercase.js
// Corrige nomes de tabelas e colunas para lowercase nos arquivos app/api/*.ts

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');

// Encontra todos os arquivos .ts recursivamente
function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const replacements = [
  // Table names in .from()
  { from: '.from("Cidades")', to: '.from("cidades")' },
  { from: '.from("Comentarios")', to: '.from("comentarios")' },
  { from: '.from("Favoritos")', to: '.from("favoritos")' },
  { from: '.from("Users")', to: '.from("users")' },
  { from: '.from("Atividades")', to: '.from("atividades")' },
  { from: '.from("Pontos_Turisticos")', to: '.from("pontos_turisticos")' },
  { from: '.from("Como_Chegar")', to: '.from("como_chegar")' },
  { from: '.from("Dicas")', to: '.from("dicas")' },
  { from: '.from("Sugestoes_de_Rota")', to: '.from("sugestoes_de_rota")' },

  // Column names in .eq()
  { from: '.eq("cidadeID"', to: '.eq("cidadeid"' },
  { from: '.eq("cidadeId"', to: '.eq("cidadeid"' },
  { from: '.eq("userID"', to: '.eq("userid"' },
  { from: '.eq("nomeCidade"', to: '.eq("nomecidade"' },

  // Column names in .ilike()
  { from: '.ilike("nomeCidade"', to: '.ilike("nomecidade"' },

  // Column names in .select()
  { from: '"nomeCompleto"', to: '"nomecompleto"' },

  // Column names in cidadeSelect (shared variable)
  { from: 'nomeCidade', to: 'nomecidade' },
  { from: 'estadoID', to: 'estadoid' },
  { from: '  usuario:userID ', to: '  usuario:userid ' },

  // Join references
  { from: 'fav.Cidades?.nomeCidade', to: 'fav.cidades?.nomecidade' },

  // Insert object keys (ES6 shorthand → explicit with lowercase keys)
  { from: '{ userID, cidadeID }', to: '{ userid: userID, cidadeid: cidadeID }' },
  { from: '{ userID, cidadeID, mensagem }', to: '{ userid: userID, cidadeid: cidadeID, mensagem }' },
];

const files = findFiles(apiDir);
let totalChanges = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let fileChanged = false;

  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      fileChanged = true;
      totalChanges++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, content);
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`✅ ${relativePath}`);
  }
}

console.log(`\n📊 Total de substituições: ${totalChanges}`);
console.log(`📁 Arquivos modificados: ${files.filter(f => {
  const content = fs.readFileSync(f, 'utf-8');
  return replacements.some(r => content.includes(r.from));
}).length}`);
