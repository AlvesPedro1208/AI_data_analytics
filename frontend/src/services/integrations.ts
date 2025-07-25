import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface ContaAPI {
  id: number;
  plataforma: string;
  tipo: 'facebook' | 'google' | 'instagram' | 'linkedin';
  token?: string;
  identificador_conta: string;
  nome_conta: string;
  data_conexao: string;
  ativo: boolean;
}

export const getContas = async (): Promise<ContaAPI[]> => {
  const response = await axios.get(`${API_BASE_URL}/accounts_ads_facebook/`);
  return response.data;
};

export const criarConta = async (dados: Omit<ContaAPI, 'id' | 'data_conexao'>): Promise<void> => {
  // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
};

export const atualizarStatusConta = async (id: number, ativo: boolean): Promise<void> => {
  // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
};

export const deletarConta = async (id: number): Promise<void> => {
  // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
};

// Envia dados para contexto da IA
export async function setIaContexto(userId: string, dados: any[]) {
  const response = await fetch('http://localhost:8000/contexto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, dados })
  });
  if (!response.ok) throw new Error('Erro ao enviar contexto para IA');
  return response.json();
}

// Busca contexto atual da IA
export async function getIaContexto(userId: string) {
  const response = await fetch(`http://localhost:8000/contexto?user_id=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Erro ao buscar contexto da IA');
  return response.json();
}
