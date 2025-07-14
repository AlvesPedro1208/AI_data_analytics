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
  const response = await axios.get(`${API_BASE_URL}/contas`);
  return response.data;
};

export const criarConta = async (dados: Omit<ContaAPI, 'id' | 'data_conexao'>): Promise<void> => {
  await axios.post(`${API_BASE_URL}/contas`, dados);
};

export const atualizarStatusConta = async (id: number, ativo: boolean): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/contas/${id}`, { ativo });
};

export const deletarConta = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/contas/${id}`);
};
