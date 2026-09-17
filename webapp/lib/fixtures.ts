/* ===== Fixtures de demonstração (usadas só quando o Supabase não responde) =====
 * Conteúdo em pt-BR baseado no contexto real da temporada 2026, com links reais
 * para a página-índice de cada fonte ("ler na origem" sempre funciona).
 * As funções são chamadas a cada requisição para que os horários fiquem sempre
 * relativos ao momento atual.
 */
import { NewsCard, Match, SocialPost, Corte, Venue } from './types';

const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const ahead = (hours: number) => new Date(Date.now() + hours * 3600000).toISOString();

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const IMG = {
  hero: `${BASE_PATH}/images/nacao/hero.jpg`,
  bandeira: `${BASE_PATH}/images/nacao/bandeira.jpg`,
  camisa: `${BASE_PATH}/images/nacao/camisa.jpg`,
  gol: `${BASE_PATH}/images/nacao/gol.jpg`,
  acao: `${BASE_PATH}/images/nacao/acao.jpg`,
  mosaico: `${BASE_PATH}/images/nacao/mosaico.jpg`,
  rua: `${BASE_PATH}/images/nacao/rua.jpg`,
};

export const FONTES = {
  oficial: { nome: 'Flamengo (site oficial)', url: 'https://www.flamengo.com.br/noticias' },
  ge: { nome: 'ge Flamengo', url: 'https://ge.globo.com/futebol/times/flamengo/' },
  coluna: { nome: 'Coluna do Fla', url: 'https://colunadofla.com/' },
  lance: { nome: 'Lance! Flamengo', url: 'https://www.lance.com.br/flamengo' },
  uol: { nome: 'UOL Esporte', url: 'https://www.uol.com.br/esporte/futebol/times/flamengo/' },
  extra: { nome: 'Extra / O Globo', url: 'https://extra.globo.com/esporte/flamengo/' },
};

export const FIXTURE_NEWS = (): NewsCard[] => [
  {
    id: 'n1',
    tipo: 'confirmado',
    titulo: 'Mengão vence o Corinthians por 2×1 e segue líder isolado do Brasileirão',
    resumo: 'Pedro e Samuel Lino decidiram no segundo tempo, no Maracanã lotado. São 57 pontos em 27 rodadas.',
    fonte: FONTES.ge.nome,
    url_origem: FONTES.ge.url,
    imagem_url: null,
    timestamp: ago(2),
    destaque: true,
    categoria: 'jogo',
  },
  {
    id: 'n2',
    tipo: 'oficial',
    titulo: 'Clube divulga informações de ingressos para a quarta de final da Libertadores',
    resumo: 'Venda por fases para sócios-torcedores começa hoje. Jogo de volta contra o Independiente del Valle é no Maracanã.',
    fonte: FONTES.oficial.nome,
    url_origem: FONTES.oficial.url,
    imagem_url: null,
    timestamp: ago(4),
    destaque: true,
    categoria: 'institucional',
  },
  {
    id: 'n3',
    tipo: 'rumor',
    titulo: 'Mercado: diretoria monitora lateral-esquerdo do futebol argentino para 2027',
    resumo: 'Segundo apuração, a conversa ainda é preliminar e depende da renovação de contratos do atual elenco.',
    fonte: FONTES.coluna.nome,
    url_origem: FONTES.coluna.url,
    imagem_url: null,
    timestamp: ago(6),
    destaque: false,
    categoria: 'mercado',
  },
  {
    id: 'n4',
    tipo: 'opiniao',
    titulo: 'Análise: o meio-campo de Jardim encontrou o equilíbrio que faltava',
    resumo: 'Com Arrascaeta mais solto e volantes disciplinados, o time controla os jogos sem perder poder ofensivo.',
    fonte: FONTES.lance.nome,
    url_origem: FONTES.lance.url,
    imagem_url: null,
    timestamp: ago(9),
    destaque: false,
    categoria: 'bastidor',
  },
  {
    id: 'n5',
    tipo: 'confirmado',
    titulo: 'Arrascaeta completa 100 jogos de Libertadores com a camisa rubro-negra',
    resumo: 'Uruguaio alcança a marca histórica e recebe homenagem do elenco no Ninho do Urubu.',
    fonte: FONTES.extra.nome,
    url_origem: FONTES.extra.url,
    imagem_url: null,
    timestamp: ago(14),
    destaque: false,
    categoria: 'bastidor',
  },
  {
    id: 'n6',
    tipo: 'confirmado',
    titulo: 'Pedro chega a 25 gols na temporada e lidera artilharia do Brasileirão',
    resumo: 'Camisa 9 tem 15 gols no campeonato nacional e outros 10 em Libertadores e Copa do Brasil.',
    fonte: FONTES.uol.nome,
    url_origem: FONTES.uol.url,
    imagem_url: null,
    timestamp: ago(20),
    destaque: false,
    categoria: 'jogo',
  },
];

export const FIXTURE_MATCHES = (): Match[] => [
  {
    id: 'm1',
    competicao: 'CONMEBOL Libertadores 2026 — Quartas de Final (Jogo 2)',
    mandante: 'Flamengo',
    visitante: 'Independiente del Valle',
    data_hora: ahead(30),
    local: 'Maracanã',
    status: 'agendado',
    placar_mandante: null,
    placar_visitante: null,
    transmissao: ['ESPN', 'Disney+'],
  },
  {
    id: 'm2',
    competicao: 'Brasileirão Série A 2026 — R28',
    mandante: 'Flamengo',
    visitante: 'RB Bragantino',
    data_hora: ahead(96),
    local: 'Maracanã',
    status: 'agendado',
    placar_mandante: null,
    placar_visitante: null,
    transmissao: ['Premiere'],
  },
  {
    id: 'm0',
    competicao: 'Brasileirão Série A 2026 — R27',
    mandante: 'Flamengo',
    visitante: 'Corinthians',
    data_hora: ago(60),
    local: 'Maracanã',
    status: 'encerrado',
    placar_mandante: 2,
    placar_visitante: 1,
    transmissao: ['Premiere', 'Globo RJ'],
  },
];

export const FIXTURE_SOCIAL = (): SocialPost[] => [
  {
    id: 's1',
    plataforma: 'twitter',
    autor: 'Coluna do Fla',
    handle: '@ColunadoFla',
    texto: 'Maracanã confirmado com mais de 60 mil para a quarta de final. A Nação não brinca em serviço. 🔴⚫',
    curtidas: 12400,
    url_post: 'https://x.com/ColunadoFla',
    timestamp: ago(1),
  },
  {
    id: 's2',
    plataforma: 'instagram',
    autor: 'Paparazzo Rubro-Negro',
    handle: '@paparazzorubronegro',
    texto: 'O mosaico de domingo foi de arrepiar. Cada vez mais orgulho de ser dessa Nação! ❤️🖤',
    curtidas: 8700,
    url_post: 'https://www.instagram.com/paparazzorubronegro/',
    timestamp: ago(3),
  },
  {
    id: 's3',
    plataforma: 'twitter',
    autor: 'Out of Context CRF',
    handle: '@outofcontextCRF',
    texto: 'POV: você tá na arquibancada e sai o gol do Pedro aos 47 do segundo tempo 😱🔥',
    curtidas: 45200,
    url_post: 'https://x.com/outofcontextCRF',
    timestamp: ago(6),
  },
  {
    id: 's4',
    plataforma: 'youtube',
    autor: 'FlaTV',
    handle: '@FlaTV',
    texto: 'NOVO VÍDEO: bastidores do vestiário após a vitória sobre o Corinthians. Emoção pura!',
    curtidas: 22100,
    url_post: 'https://www.youtube.com/@FlaTV',
    timestamp: ago(10),
  },
  {
    id: 's5',
    plataforma: 'twitter',
    autor: 'Mauro Cezar',
    handle: '@maurocezar',
    texto: 'Análise rápida: com o meio-campo mais compacto, o time ganhou outra dinâmica na saída de bola.',
    curtidas: 3200,
    url_post: 'https://x.com/maurocezar',
    timestamp: ago(14),
  },
];

export const FIXTURE_CORTES = (): Corte[] => [
  {
    id: 'c1',
    tipo: 'ugc',
    titulo: 'Gols e melhores momentos: Flamengo 2×1 Corinthians',
    descricao: 'Compacto do jogo pela visão da FlaTV, direto do Maracanã.',
    midia_url: '',
    midia_tipo: 'video',
    autor: 'FlaTV',
    curtidas: 18700,
    timestamp: ago(4),
    url_origem: 'https://www.youtube.com/@FlaTV',
    visualizacoes: '1,2M',
  },
  {
    id: 'c2',
    tipo: 'meme',
    titulo: 'A cara do rival quando saiu o segundo gol',
    descricao: 'Compilação dos melhores memes da rodada. A internet não perdoa! 😂',
    midia_url: '',
    midia_tipo: 'imagem',
    autor: '@outofcontextCRF',
    curtidas: 32400,
    timestamp: ago(7),
    url_origem: 'https://x.com/outofcontextCRF',
  },
  {
    id: 'c3',
    tipo: 'ugc',
    titulo: 'Mosaico completo da Nação visto do setor norte',
    descricao: 'Mais de 60 mil torcedores cantando juntos. Vídeo completo da festa.',
    midia_url: '',
    midia_tipo: 'video',
    autor: 'Urubucam',
    curtidas: 55100,
    timestamp: ago(15),
    url_origem: 'https://www.youtube.com/@urubucam',
  },
  {
    id: 'c4',
    tipo: 'ugc',
    titulo: 'Bandeirões na entrada do time em campo',
    descricao: 'A recepção da torcida no Maracanã antes da bola rolar.',
    midia_url: '',
    midia_tipo: 'video',
    autor: 'Flazoeiro',
    curtidas: 41800,
    timestamp: ago(22),
    url_origem: 'https://www.youtube.com/@flazoeiro',
  },
];

export const FIXTURE_VENUES = (): Venue[] => [
  // Rio de Janeiro
  { id: 'v1', nome: 'Bar do Urubu', tipo: 'bar', cidade: 'Rio de Janeiro', endereco: 'Rua Dias Ferreira, 200', bairro: 'Leblon', descricao: 'Telão gigante, chopp gelado e a torcida mais animada da Zona Sul. Transmissão de todos os jogos.', tem_telao: true },
  { id: 'v2', nome: 'Ninho da Nação', tipo: 'bar', cidade: 'Rio de Janeiro', endereco: 'Rua Voluntários da Pátria, 88', bairro: 'Botafogo', descricao: 'Ponto de encontro clássico antes de subir pro Maracanã. Promoção em dia de jogo.', tem_telao: true },
  { id: 'v3', nome: 'Gávea Prime', tipo: 'bar', cidade: 'Rio de Janeiro', endereco: 'Rua Marquês de São Vicente, 52', bairro: 'Gávea', descricao: 'A poucos metros da sede. Ambiente familiar e telão 4K.', tem_telao: true },
  { id: 'v4', nome: 'Toca do Urubu', tipo: 'bar', cidade: 'Rio de Janeiro', endereco: 'Rua Uruguai, 300', bairro: 'Tijuca', descricao: 'Reduto da Nação na Zona Norte. Petiscos e futebol na veia.', tem_telao: true },
  // Brasília
  { id: 'v5', nome: 'Nação Candanga', tipo: 'bar', cidade: 'Brasília', endereco: 'SCS Quadra 4, Bloco A', bairro: 'Asa Sul', descricao: 'Único bar com pacote Libertadores completo em Brasília.', tem_telao: true },
  { id: 'v6', nome: 'Clube do Urubu DF', tipo: 'bar', cidade: 'Brasília', endereco: 'SHIS QI 21, Conjunto 2', bairro: 'Lago Sul', descricao: 'Espaço amplo com área kids para jogos diurnos.', tem_telao: true },
  { id: 'v7', nome: 'Urubu do Cerrado', tipo: 'bar', cidade: 'Brasília', endereco: 'CLN 208, Bloco B', bairro: 'Asa Norte', descricao: 'Chopp artesanal e telão. Festa garantida em dia de clássico.', tem_telao: true },
  { id: 'v8', nome: 'Nação do Planalto', tipo: 'bar', cidade: 'Brasília', endereco: 'QS 5, Rua 300', bairro: 'Águas Claras', descricao: 'Encontro da Nação em Águas Claras. Caravanas para o Mané Garrincha.', tem_telao: true },
];
