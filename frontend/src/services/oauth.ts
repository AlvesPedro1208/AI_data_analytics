// Serviço para integração OAuth com Facebook/Meta
export interface FacebookAccount {
  id?: string;
  name?: string;
  account_id?: string;
  account_status?: number;
  currency?: string;
  business_name?: string;
  business_id?: string;
  nome_conta?: string;
  identificador_conta?: string;
  ativo?: boolean;
}

export interface FacebookOAuthResponse {
  access_token: string;
  accounts: FacebookAccount[];
  user_id: string;
  user_name: string;
}

export interface FacebookUser {
  facebook_id: string;
  username: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
}

export class FacebookOAuthService {
  private static readonly FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
  private static readonly FACEBOOK_APP_SECRET = import.meta.env.VITE_FACEBOOK_APP_SECRET;
  private static readonly REDIRECT_URI = window.location.origin + '/oauth/callback';

  static getOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.FACEBOOK_APP_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: 'ads_read,ads_management',
      response_type: 'code',
      state: 'facebook_oauth_' + Date.now(),
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.FACEBOOK_APP_ID,
      client_secret: this.FACEBOOK_APP_SECRET,
      redirect_uri: this.REDIRECT_URI,
      code,
    });
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao obter token');
    }
    return data.access_token;
  }

  static async getFacebookUser(accessToken: string): Promise<FacebookUser> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao buscar usuário do Facebook');
    }
    return data;
  }

  static async getUserAdAccounts(accessToken: string): Promise<FacebookAccount[]> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,account_status,currency,business_name,business&access_token=${accessToken}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao buscar contas');
    }
    return data.data || [];
  }

  static async importUserToBackend(user: FacebookUser, accessToken: string): Promise<void> {
    await fetch('http://localhost:8000/user_facebook/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.name,
        facebook_id: user.id,
        access_token: accessToken
      })
    });
  }

  static async importAccountsToBackend(accessToken: string, accounts: FacebookAccount[]): Promise<void> {
    const response = await fetch('http://localhost:8000/oauth/facebook/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        accounts: accounts.map(account => ({
          plataforma: 'Facebook Ads',
          tipo: 'facebook',
          token: accessToken,
          identificador_conta: account.account_id,
          nome_conta: account.name,
          ativo: account.account_status === 1,
          metadata: {
            currency: account.currency,
            business_name: account.business_name,
            business_id: account.business_id,
          }
        }))
      }),
    });
    if (!response.ok) {
      throw new Error('Erro ao importar contas para o backend');
    }
  }
}

// Exemplo de uso na página de callback OAuth
export const handleOAuthCallback = async (code: string): Promise<FacebookOAuthResponse> => {
  try {
    // 1. Trocar code por access_token
    const accessToken = await FacebookOAuthService.exchangeCodeForToken(code);

    // 2. Buscar dados do usuário
    const user = await FacebookOAuthService.getFacebookUser(accessToken);

    // 3. Salvar usuário no backend
    await FacebookOAuthService.importUserToBackend(user, accessToken);

    // 4. Buscar contas do usuário
    const accounts = await FacebookOAuthService.getUserAdAccounts(accessToken);

    // 5. Importar contas para o backend
    await FacebookOAuthService.importAccountsToBackend(accessToken, accounts);

    return {
      access_token: accessToken,
      accounts,
      user_id: user.id,
      user_name: user.name
    };
  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    throw error;
  }
};

export async function getUserAdAccountsFromBackend(facebookId: string) {
  const response = await fetch(`http://localhost:8000/accounts_ads_facebook/by_facebook_id/${facebookId}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar contas do backend');
  }
  return await response.json();
}

export async function getAllFacebookUsers(): Promise<FacebookUser[]> {
  const response = await fetch('http://localhost:8000/user_facebook/');
  if (!response.ok) {
    throw new Error('Erro ao buscar usuários do Facebook');
  }
  return await response.json();
}