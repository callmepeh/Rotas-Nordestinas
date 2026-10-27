CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  funcao VARCHAR(50) NOT NULL DEFAULT 'usuario' CHECK (funcao IN ('usuario','colaborador','colaborador_pendente','admin')),
  telefone VARCHAR(20),
  data_nascimento DATE,
  sigla_estado CHAR(2),
  nome_cidade VARCHAR(255),
  profissao VARCHAR(255),
  cpf VARCHAR(14),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_nome ON users (nome_completo);
