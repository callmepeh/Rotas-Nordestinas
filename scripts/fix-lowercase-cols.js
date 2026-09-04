#!/usr/bin/env node
// scripts/fix-lowercase-cols.js
// Corrige nomes de colunas camelCase para lowercase nos controllers do backend
// O PostgREST do Supabase normaliza tudo para minúsculo

const fs = require('fs');
const path = require('path');

const replacements = [
  // Colunas em .eq(), .select(), .order(), .in(), .ilike()
  { from: '"userID"', to: '"userid"' },
  { from: '"cidadeID"', to: '"cidadeid"' },
  { from: '"estadoID"', to: '"estadoid"' },
  { from: '"nomeCidade"', to: '"nomecidade"' },
  { from: '"nomeCompleto"', to: '"nomecompleto"' },
  { from: '"dataNascimento"', to: '"datanascimento"' },
  { from: '"siglaEstado"', to: '"siglaestado"' },
  { from: '"urlImagem"', to: '"url_imagem"'},
  
  // Colunas em insert objects
  { from: 'userID: userID', to: 'userid: userID' },
  { from: 'cidadeID: cidadeID', to: 'cidadeid: cidadeID' },
  { from: 'userID,', to: 'userid,' },
  
  // Tabelas em joins dentro de .select()
  { from: 'Cidades (\n          nome,\n          cidade,\n          urlImagem\n        )', to: 'cidades (\n          nomecidade,\n          url_imagem\n        )' },
  { from: 'fav.Cidades?.nome', to: 'fav.cidades?.nomecidade' },
  { from: 'fav.Cidades?.cidade', to: 'fav.cidades?.nomecidade' },
  { from: 'fav.Cidades?.urlImagem', to: 'fav.cidades?.url_imagem' },
];

const backendDir = path.join(__dirname, '..', 'backend', 'src', 'controllers');
const files = fs.readdirSync(backendDir).filter(f => f.endsWith('.js'));

let totalChanges = 0;

for (const file of files) {
  const filePath = path.join(backendDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
      totalChanges++;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file}: corrigido`);
  } else {
    console.log(`➖ ${file}: sem alterações`);
  }
}

console.log(`\n📊 Total de substituições: ${totalChanges}`);
