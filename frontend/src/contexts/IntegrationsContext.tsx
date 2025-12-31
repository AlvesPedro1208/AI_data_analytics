import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Integration {
  id: string;
  name: string;
  type: 'facebook' | 'google' | 'instagram' | 'linkedin';
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
  accessToken?: string;
  accountId?: string;
  lastSync?: string;
  isActive: boolean;
}

export interface IntegrationUser {
  id: string;
  username: string;
  facebookId: string;
  accessToken: string;
}

interface IntegrationsContextType {
  integrations: Integration[];
  users: IntegrationUser[];
  isLoading: boolean;
  refreshIntegrations: () => Promise<void>;
  setIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export function IntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [users, setUsers] = useState<IntegrationUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      // Fetch Ad Accounts
      const responseAccounts = await fetch('http://localhost:8000/accounts_ads_facebook/');
      if (responseAccounts.ok) {
        const data = await responseAccounts.json();
        const parsed: Integration[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.nome_conta,
          type: item.tipo,
          status: item.ativo ? 'connected' : 'disconnected',
          accessToken: item.token,
          accountId: item.identificador_conta,
          lastSync: item.data_conexao,
          isActive: item.ativo,
        }));
        setIntegrations(parsed);
      }

      // Fetch Users
      const responseUsers = await fetch('http://localhost:8000/user_facebook/');
      if (responseUsers.ok) {
        const dataUsers = await responseUsers.json();
        const parsedUsers: IntegrationUser[] = dataUsers.map((u: any) => ({
           id: String(u.id),
           username: u.username,
           facebookId: u.facebook_id,
           accessToken: u.access_token
        }));
        setUsers(parsedUsers);
      }

    } catch (error) {
      console.error("Erro ao buscar integrações:", error);
      // Fallback or empty state could be handled here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <IntegrationsContext.Provider value={{ integrations, users, isLoading, refreshIntegrations: fetchIntegrations, setIntegrations }}>
      {children}
    </IntegrationsContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within a IntegrationsProvider');
  }
  return context;
}
