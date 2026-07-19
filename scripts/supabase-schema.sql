-- ============================================================================
-- ROTAS NORDESTINAS - Esquema Completo do Supabase
-- ============================================================================
-- Instruções:
-- 1. Acesse o Dashboard do Supabase (https://supabase.com/dashboard)
-- 2. Vá em "SQL Editor"
-- 3. Cole este script inteiro e execute
-- 4. Depois de criar as tabelas, vá em "Authentication > Settings"
--    e desabilite "Confirm email" em desenvolvimento se quiser pular
--    a verificação de email
-- ============================================================================

-- ============================================================================
-- 1. TABELA: Estados (Unidades Federativas do Brasil)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Estados (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  sigla VARCHAR(2) NOT NULL UNIQUE
);

-- ============================================================================
-- 2. TABELA: Users (Perfil dos usuários sincronizado com Auth do Supabase)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Users (
  id UUID PRIMARY KEY,                                  -- mesmo ID do Auth Supabase
  email VARCHAR(255) NOT NULL UNIQUE,
  nomeCompleto VARCHAR(255) NOT NULL,
  funcao VARCHAR(50) NOT NULL DEFAULT 'usuario',         -- usuario, colaborador, colaborador_pendente, admin
  telefone VARCHAR(20),
  dataNascimento DATE,
  siglaEstado VARCHAR(2),
  nomeCidade VARCHAR(255),
  profissao VARCHAR(255),
  cpf VARCHAR(14),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TABELA: Cidades (Destinos turísticos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomeCidade VARCHAR(255) NOT NULL,
  url_imagem TEXT,
  descricao TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  estadoID INTEGER NOT NULL REFERENCES Estados(id) ON DELETE RESTRICT,
  userID UUID REFERENCES Users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. TABELA: Pontos_Turisticos
-- ============================================================================
CREATE TABLE IF NOT EXISTS Pontos_Turisticos (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_imagem TEXT
);

-- ============================================================================
-- 5. TABELA: Como_Chegar
-- ============================================================================
CREATE TABLE IF NOT EXISTS Como_Chegar (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL DEFAULT 'Terrestre',        -- Terrestre, Aéreo, Marítimo
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT
);

-- ============================================================================
-- 6. TABELA: Atividades
-- ============================================================================
CREATE TABLE IF NOT EXISTS Atividades (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_imagem TEXT
);

-- ============================================================================
-- 7. TABELA: Dicas
-- ============================================================================
CREATE TABLE IF NOT EXISTS Dicas (
  id BIGSERIAL PRIMARY KEY,
  cidadeID UUID NOT NULL REFERENCES Cidades(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  url_imagem TEXT
);

-- ============================================================================
-- 8. TABELA: Comentarios (Feedbacks dos usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Comentarios (
  id BIGSERIAL PRIMARY KEY,
  userID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  cidadeID UUID NOT NULL REFERENCES Cidades(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. TABELA: Favoritos
-- ============================================================================
CREATE TABLE IF NOT EXISTS Favoritos (
  id BIGSERIAL PRIMARY KEY,
  userID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  cidadeID UUID NOT NULL REFERENCES Cidades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(userID, cidadeID)                                -- um usuário só pode favoritar a mesma cidade uma vez
);

-- ============================================================================
-- 10. TABELA: Sugestoes_de_Rota (Sugestões de novas cidades enviadas por usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Sugestoes_de_Rota (
  id BIGSERIAL PRIMARY KEY,
  userID UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  estado VARCHAR(100) NOT NULL,
  nomeCidade VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  imagemCapa TEXT,
  descricaoCidade TEXT,
  comoChegar TEXT,                                        -- JSON em string
  pontosTuristicos TEXT,                                  -- JSON em string
  atividades TEXT,                                        -- JSON em string
  dicas TEXT,                                             -- JSON em string
  dataSubmissao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',         -- pendente, aprovado, rejeitado
  obsAdmin TEXT DEFAULT '',
  idAdmin UUID REFERENCES Users(id) ON DELETE SET NULL,
  cidadeID UUID REFERENCES Cidades(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA OTIMIZAR CONSULTAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cidades_estadoID ON Cidades(estadoID);
CREATE INDEX IF NOT EXISTS idx_cidades_nomeCidade ON Cidades(nomeCidade);
CREATE INDEX IF NOT EXISTS idx_cidades_userID ON Cidades(userID);

CREATE INDEX IF NOT EXISTS idx_pontos_cidadeID ON Pontos_Turisticos(cidadeID);
CREATE INDEX IF NOT EXISTS idx_como_chegar_cidadeID ON Como_Chegar(cidadeID);
CREATE INDEX IF NOT EXISTS idx_atividades_cidadeID ON Atividades(cidadeID);
CREATE INDEX IF NOT EXISTS idx_dicas_cidadeID ON Dicas(cidadeID);

CREATE INDEX IF NOT EXISTS idx_comentarios_cidadeID ON Comentarios(cidadeID);
CREATE INDEX IF NOT EXISTS idx_comentarios_userID ON Comentarios(userID);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON Comentarios(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_favoritos_userID ON Favoritos(userID);
CREATE INDEX IF NOT EXISTS idx_favoritos_cidadeID ON Favoritos(cidadeID);

CREATE INDEX IF NOT EXISTS idx_sugestoes_userID ON Sugestoes_de_Rota(userID);
CREATE INDEX IF NOT EXISTS idx_sugestoes_status ON Sugestoes_de_Rota(status);

-- ============================================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas que têm updated_at
CREATE TRIGGER update_Users_updated_at
  BEFORE UPDATE ON Users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_Cidades_updated_at
  BEFORE UPDATE ON Cidades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_Comentarios_updated_at
  BEFORE UPDATE ON Comentarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_Sugestoes_de_Rota_updated_at
  BEFORE UPDATE ON Sugestoes_de_Rota
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — POLÍTICAS DE SEGURANÇA
-- ============================================================================
-- Habilita RLS em todas as tabelas
ALTER TABLE Estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE Cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE Pontos_Turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Como_Chegar ENABLE ROW LEVEL SECURITY;
ALTER TABLE Atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE Dicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE Comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Sugestoes_de_Rota ENABLE ROW LEVEL SECURITY;

-- Estados: leitura pública, escrita apenas admin
CREATE POLICY "Estados leitura pública"
  ON Estados FOR SELECT USING (true);
CREATE POLICY "Estados escrita admin"
  ON Estados FOR ALL USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao = 'admin')
  );

-- Users: cada um vê/edita apenas seu próprio perfil
CREATE POLICY "Users leitura própria"
  ON Users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users escrita própria"
  ON Users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users inserção"
  ON Users FOR INSERT WITH CHECK (auth.uid() = id);

-- Cidades: leitura pública, escrita admin/colaborador
CREATE POLICY "Cidades leitura pública"
  ON Cidades FOR SELECT USING (true);
CREATE POLICY "Cidades escrita admin colaborador"
  ON Cidades FOR ALL USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao IN ('admin', 'colaborador'))
  );

-- Pontos_Turisticos: leitura pública, escrita admin/colaborador
CREATE POLICY "Pontos leitura pública"
  ON Pontos_Turisticos FOR SELECT USING (true);
CREATE POLICY "Pontos escrita admin colaborador"
  ON Pontos_Turisticos FOR ALL USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao IN ('admin', 'colaborador'))
  );

-- Como_Chegar: leitura pública, escrita admin/colaborador
CREATE POLICY "ComoChegar leitura pública"
  ON Como_Chegar FOR SELECT USING (true);
CREATE POLICY "ComoChegar escrita admin colaborador"
  ON Como_Chegar FOR ALL USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao IN ('admin', 'colaborador'))
  );

-- Atividades: leitura pública, escrita admin/colaborador
CREATE POLICY "Atividades leitura pública"
  ON Atividades FOR SELECT USING (true);
CREATE POLICY "Atividades escrita admin colaborador"
  ON Atividades FOR ALL USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao IN ('admin', 'colaborador'))
  );

-- Dicas: leitura pública, escrita admin/colaborador
CREATE POLICY "Dicas leitura pública"
  ON Dicas FOR SELECT USING (true);
CREATE POLICY "Dicas escrita admin colaborador"
  ON Dicas FOR ALL USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao IN ('admin', 'colaborador'))
  );

-- Comentarios: leitura pública, criação/edição/deleção apenas pelo próprio usuário
CREATE POLICY "Comentarios leitura pública"
  ON Comentarios FOR SELECT USING (true);
CREATE POLICY "Comentarios inserção própria"
  ON Comentarios FOR INSERT WITH CHECK (auth.uid() = userID);
CREATE POLICY "Comentarios edição própria"
  ON Comentarios FOR UPDATE USING (auth.uid() = userID);
CREATE POLICY "Comentarios deleção própria"
  ON Comentarios FOR DELETE USING (auth.uid() = userID);

-- Favoritos: gerenciamento pelo próprio usuário
CREATE POLICY "Favoritos gerenciamento próprio"
  ON Favoritos FOR ALL USING (auth.uid() = userID);

-- Sugestoes_de_Rota: criação pelo próprio usuário, leitura pública, admin pode gerenciar
CREATE POLICY "Sugestoes leitura pública"
  ON Sugestoes_de_Rota FOR SELECT USING (true);
CREATE POLICY "Sugestoes inserção própria"
  ON Sugestoes_de_Rota FOR INSERT WITH CHECK (auth.uid() = userID);
CREATE POLICY "Sugestoes admin gerencia"
  ON Sugestoes_de_Rota FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM Users WHERE funcao = 'admin')
  );

-- ============================================================================
-- SEED DATA: Estados Brasileiros
-- ============================================================================
INSERT INTO Estados (id, nome, sigla) VALUES
  (1, 'Acre', 'AC'),
  (2, 'Alagoas', 'AL'),
  (3, 'Amapá', 'AP'),
  (4, 'Amazonas', 'AM'),
  (5, 'Bahia', 'BA'),
  (6, 'Ceará', 'CE'),
  (7, 'Distrito Federal', 'DF'),
  (8, 'Espírito Santo', 'ES'),
  (9, 'Goiás', 'GO'),
  (10, 'Maranhão', 'MA'),
  (11, 'Mato Grosso', 'MT'),
  (12, 'Mato Grosso do Sul', 'MS'),
  (13, 'Minas Gerais', 'MG'),
  (14, 'Pará', 'PA'),
  (15, 'Paraíba', 'PB'),
  (16, 'Paraná', 'PR'),
  (17, 'Pernambuco', 'PE'),
  (18, 'Piauí', 'PI'),
  (19, 'Rio de Janeiro', 'RJ'),
  (20, 'Rio Grande do Norte', 'RN'),
  (21, 'Rio Grande do Sul', 'RS'),
  (22, 'Rondônia', 'RO'),
  (23, 'Roraima', 'RR'),
  (24, 'Santa Catarina', 'SC'),
  (25, 'São Paulo', 'SP'),
  (26, 'Sergipe', 'SE'),
  (27, 'Tocantins', 'TO')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('Estados_id_seq', (SELECT MAX(id) FROM Estados));

-- ============================================================================
-- FUNÇÃO AUXILIAR: Criar usuário no banco após cadastro no Auth
-- ============================================================================
-- Crie uma trigger no Auth do Supabase para inserir automaticamente
-- na tabela Users quando um novo usuário se cadastrar.
--
-- Vá em Database > Triggers e crie uma trigger chamada:
-- "on_auth_user_created" no schema "auth" na tabela "users"
-- que chama esta função:
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.Users (id, email, nomeCompleto, funcao)
--   VALUES (
--     NEW.id,
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data->>'nomeCompleto', 'Usuário'),
--     'usuario'
--   )
--   ON CONFLICT (id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
