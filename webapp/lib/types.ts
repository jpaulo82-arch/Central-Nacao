/* ===== Tipos centrais do Central da Nação ===== */

export type SeloTipo = 'oficial' | 'confirmado' | 'rumor' | 'opiniao' | 'meme' | 'ugc';

export interface NewsCard {
  id: string;
  tipo: SeloTipo;
  titulo: string;
  resumo: string;
  fonte: string;
  url_origem: string;
  imagem_url: string | null;
  timestamp: string; // ISO
  destaque: boolean;
}

export interface Match {
  id: string;
  competicao: string;
  mandante: string;
  visitante: string;
  data_hora: string; // ISO
  local: string;
  status: 'agendado' | 'ao_vivo' | 'intervalo' | 'encerrado';
  placar_mandante: number | null;
  placar_visitante: number | null;
}

export interface SocialPost {
  id: string;
  plataforma: 'twitter' | 'instagram' | 'tiktok' | 'youtube';
  autor: string;
  handle: string;
  texto: string;
  curtidas: number;
  url_post: string;
  timestamp: string;
}

export interface Corte {
  id: string;
  tipo: 'ugc' | 'meme';
  titulo: string;
  descricao: string;
  midia_url: string;
  midia_tipo: 'video' | 'imagem';
  autor: string;
  curtidas: number;
  timestamp: string;
}

export interface Venue {
  id: string;
  nome: string;
  tipo: 'bar' | 'loja' | 'embaixada';
  cidade: string;
  endereco: string;
  bairro: string;
  descricao: string;
}
