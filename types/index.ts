// Types used across the app
export interface Destino {
  id: string;
  nomeCidade: string;
  url_imagem: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  estados?: Estado;
  usuario?: UsuarioInfo;
}

export interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

export interface UsuarioInfo {
  id: string;
  nomeCompleto: string;
}

export interface ComoChegarItem {
  id: number;
  tipo: "Terrestre" | "Aéreo" | "Marítimo";
  titulo: string;
  descricao: string;
}

export interface CarouselItem {
  id: string | number;
  titulo: string;
  descricao: string;
  url_imagem: string;
}

export interface Comentario {
  id: number;
  mensagem: string;
  created_at: string;
  userID: string;
  usuario?: {
    nome: string;
  } | null;
}

export interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  funcao: string;
  telefone?: string;
  dataNascimento?: string;
  siglaEstado?: string;
  nomeCidade?: string;
  profissao?: string;
  cpf?: string;
}

export interface InfoItem {
  id: string;
  imagem: string;
  nome: string;
  descricao: string;
}
