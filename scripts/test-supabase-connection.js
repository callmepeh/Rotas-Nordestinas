// scripts/test-supabase-connection.js
// Testa a conexão com o Supabase e executa o schema SQL
// Uso: node scripts/test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carrega .env manualmente (sem dotenv para simplicidade)
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    envVars[key.trim()] = rest.join('=').trim();
  }
});

console.log('=== TESTE DE CONEXÃO SUPABASE ===\n');

// Verifica e corrige a URL do Supabase
let supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || '';
const projectRefMatch = supabaseUrl.match(/project\/([^/]+)/);

if (projectRefMatch) {
  // URL está no formato do Dashboard, corrigir
  const projectRef = projectRefMatch[1];
  const correctUrl = `https://${projectRef}.supabase.co`;
  console.log(`⚠️  URL do Supabase está no formato do Dashboard.`);
  console.log(`   Corrigindo de: ${supabaseUrl}`);
  console.log(`   Para: ${correctUrl}`);
  supabaseUrl = correctUrl;
}

const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || '';

console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${anonKey.substring(0, 20)}...`);
console.log(`🔑 Service Key: ${serviceKey.substring(0, 20)}...`);
console.log('');

// Verifica se as chaves parecem válidas (JWT começa com eyJ)
const isValidJwt = (key) => key.startsWith('eyJ');
if (!isValidJwt(anonKey)) {
  console.log('⚠️  A chave anônima parece ser um placeholder (não é um JWT válido)');
  console.log('   Chaves reais do Supabase começam com "eyJ"');
}
if (!isValidJwt(serviceKey)) {
  console.log('⚠️  A chave service_role parece ser um placeholder (não é um JWT válido)');
  console.log('   Chaves reais do Supabase começam com "eyJ"');
}
console.log('');

async function main() {
  try {
    // Tenta criar cliente e fazer uma consulta simples
    console.log('🔄 Tentando conectar ao Supabase...');
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    // Testa a conexão listando tabelas do schema public
    const { data, error } = await supabase
      .rpc('', {});

    // Se o RPC falhar, tenta um select simples em uma tabela que pode existir
    const { data: testData, error: testError } = await supabase
      .from('Estados')
      .select('count', { count: 'exact', head: true });

    if (testError && testError.code === 'PGRST116') {
      // A tabela Estados não existe - isso é esperado se o SQL ainda não foi executado
      console.log('✅ Conexão estabelecida com o Supabase!');
      console.log('ℹ️  A tabela Estados ainda não existe (o SQL schema precisa ser executado)');
      return { connected: true, tablesExist: false };
    } else if (testError) {
      console.log('❌ Erro ao conectar:', testError.message);
      console.log('   Código:', testError.code);
      return { connected: false, error: testError };
    } else {
      console.log('✅ Conexão estabelecida com o Supabase!');
      console.log(`ℹ️  Tabela Estados existe! Contagem: ${JSON.stringify(testData)}`);
      return { connected: true, tablesExist: true };
    }
  } catch (err) {
    console.log('❌ Erro ao conectar ao Supabase:');
    console.log('   ', err.message);
    return { connected: false, error: err };
  }
}

main().then(result => {
  console.log('');
  console.log('=== RESUMO ===');
  if (result.connected) {
    console.log('✅ Conexão: OK');
    console.log(`📊 Tabelas existem: ${result.tablesExist ? 'Sim' : 'Não'}`);
    console.log('');
    if (!result.tablesExist) {
      console.log('📋 Próximo passo: Executar o script SQL para criar as tabelas');
      console.log('   scripts/supabase-schema.sql');
    }
  } else {
    console.log('❌ Conexão: FALHOU');
    console.log('');
    console.log('💡 Soluções possíveis:');
    console.log('   1. Verifique se as credenciais no .env estão corretas');
    console.log('   2. Acesse https://supabase.com/dashboard/project/jxthnsqrwwnufepyuqcp/settings/api');
    console.log('      para copiar as credenciais corretas');
    console.log('   3. A URL da API deve ser algo como: https://jxthnsqrwwnufepyuqcp.supabase.co');
    console.log('   4. As chaves (anon + service_role) devem ser JWTs válidos (começam com eyJ)');
  }
});
