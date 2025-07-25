import { useState } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FacebookOAuthService, getAllFacebookUsers, getUserAdAccountsFromBackend, FacebookUser, FacebookAccount } from '@/services/oauth';
import { useToast } from '@/hooks/use-toast';
import { ProductLayout } from '@/components/ProductLayout';

interface Integration {
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

const integrationTypes = [
  {
    type: 'facebook' as const,
    name: 'Facebook Ads',
    icon: Facebook,
    description: 'Importe dados de campanhas do Facebook Ads',
    color: 'bg-blue-600',
    fields: [
      { key: 'accessToken', label: 'Access Token', required: true },
      { key: 'accountId', label: 'Account ID', required: true }
    ]
  },
  {
    type: 'google' as const,
    name: 'Google Ads',
    icon: Globe,
    description: 'Importe dados de campanhas do Google Ads',
    color: 'bg-green-600',
    fields: [
      { key: 'apiKey', label: 'API Key', required: true },
      { key: 'accountId', label: 'Customer ID', required: true }
    ]
  },
  {
    type: 'instagram' as const,
    name: 'Instagram Business',
    icon: Instagram,
    description: 'Importe métricas do Instagram Business',
    color: 'bg-pink-600',
    fields: [
      { key: 'accessToken', label: 'Access Token', required: true },
      { key: 'accountId', label: 'Business Account ID', required: true }
    ]
  },
  {
    type: 'linkedin' as const,
    name: 'LinkedIn Ads',
    icon: Linkedin,
    description: 'Importe dados de campanhas do LinkedIn',
    color: 'bg-blue-700',
    fields: [
      { key: 'accessToken', label: 'Access Token', required: true },
      { key: 'accountId', label: 'Ad Account ID', required: true }
    ]
  }
];

const Integrations = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const [selectedIntegrationType, setSelectedIntegrationType] = useState<typeof integrationTypes[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isOAuthDialogOpen, setIsOAuthDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [users, setUsers] = useState<FacebookUser[]>([]);
  const [selectedFacebookId, setSelectedFacebookId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 10;

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Desconectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllFacebookUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsers([]);
    }
  };

  const fetchIntegrations = async () => {
    try {
      // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
      const response = await fetch('http://localhost:8000/contas');
      const data = await response.json();

      const parsed: Integration[] = data.map((item: any) => ({
        id: String(item.id),
        name: item.nome_conta,
        type: item.tipo,
        status: 'connected',
        accessToken: item.token,
        accountId: item.identificador_conta,
        lastSync: item.data_conexao,
        isActive: item.ativo,
      }));

      setIntegrations(parsed);
    } catch (error) {
      console.error("Erro ao buscar integrações:", error);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    fetchUsers();
  }, []);

  // Reset state when user changes
  useEffect(() => {
    setAccounts([]);
    setHasSearched(false);
    setSearchTerm('');
    setCurrentPage(1);
  }, [selectedFacebookId]);

  // Limpar estado de importação quando o componente for desmontado
  useEffect(() => {
    return () => {
      setIsImporting(false);
    };
  }, []);

  // Limpar estado de importação quando a página for fechada/recarregada
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsImporting(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isImporting) {
        setIsImporting(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isImporting]);


  const handleAddIntegration = (type: typeof integrationTypes[0]) => {
    setSelectedIntegrationType(type);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleSubmitIntegration = async () => {
    if (!selectedIntegrationType) return;

    const newIntegration = {
      plataforma: selectedIntegrationType.name,
      tipo: selectedIntegrationType.type,
      token: formData.accessToken || formData.apiKey || '',
      identificador_conta: formData.accountId || '',
      nome_conta: `${selectedIntegrationType.name} - ${formData.accountId || 'Nova Conta'}`,
      data_conexao: new Date().toISOString(),
      ativo: true
    };

    try {
      // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
      const response = await fetch('http://localhost:8000/contas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIntegration),
      });
      
      if (!response.ok) throw new Error('Erro ao salvar no banco');

      toast({
        title: "Integração salva",
        description: `${newIntegration.nome_conta} foi conectada com sucesso.`,
      });

      await fetchIntegrations();

      setIsDialogOpen(false);
      setFormData({});

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a integração no banco.",
      });
      console.error(error);
    }
  };

  const handleToggleIntegration = async (id: string, newStatus: boolean) => {
    console.log("🔁 Atualizando integração com ID:", id); 
    try {
      // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
      await fetch(`http://localhost:8000/contas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: newStatus }),
      });

      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === id 
            ? { ...integration, isActive: newStatus }
            : integration
        )
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da integração.",
      });
      console.error(error);
    }
  };

  const handleDeleteIntegration = async (id: number) => {
  try {
      console.log("Deletando integração com ID:", id);
      // TODO: Substituir por /user_facebook ou /accounts_ads_facebook
      await fetch(`http://localhost:8000/contas/${id}`, {
        method: 'DELETE',
      });
      setIntegrations(prev => prev.filter(integration => integration.id !== String(id)));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a integração.",
      });
      console.error(error);
    }
  };

  const formatLastSync = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  // OAuth Functions
  const handleOAuthIntegration = (type: typeof integrationTypes[0]) => {
    setSelectedIntegrationType(type);
    setIsOAuthDialogOpen(true);
  };

  const handleFacebookOAuth = async () => {
    setIsImporting(true);
    setIsOAuthDialogOpen(false);
    
    try {
      const oauthUrl = FacebookOAuthService.getOAuthUrl();
      
      // Abrir popup para OAuth
      const popup = window.open(oauthUrl, 'facebook-oauth', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      if (!popup) {
        setIsImporting(false);
        throw new Error('Popup bloqueado pelo navegador');
      }

      let isComplete = false;
      let timeoutId: NodeJS.Timeout;

      // Detectar quando usuário volta para esta janela (indica que fechou o Facebook)
      const handleWindowFocus = () => {
        console.log('Window focus detected, checking if should cancel...');
        if (!isComplete && isImporting) {
          console.log('Cancelling import due to window focus');
          performCleanup();
          toast({
            title: "Integração cancelada",
            description: "A janela de autenticação foi fechada.",
            variant: "destructive",
          });
        }
      };

      // Detectar quando a janela fica visível novamente  
      const handleVisibilityChange = () => {
        console.log('Visibility change:', document.visibilityState);
        if (document.visibilityState === 'visible' && !isComplete && isImporting) {
          console.log('Cancelling import due to visibility change');
          performCleanup();
          toast({
            title: "Integração cancelada",
            description: "A janela de autenticação foi fechada.",
            variant: "destructive",
          });
        }
      };

      // Detectar mudanças no popup a cada segundo
      const checkPopupStatus = setInterval(() => {
        try {
          if (!isComplete && (popup.closed || !popup.window)) {
            console.log('Popup detected as closed');
            clearInterval(checkPopupStatus);
            performCleanup();
            toast({
              title: "Integração cancelada",
              description: "A janela de autenticação foi fechada.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.log('Error checking popup, assuming closed');
          clearInterval(checkPopupStatus);
          if (!isComplete) {
            performCleanup();
            toast({
              title: "Integração cancelada",
              description: "A janela de autenticação foi fechada.",
              variant: "destructive",
            });
          }
        }
      }, 1000);

      // Cleanup function
      const performCleanup = () => {
        if (!isComplete) {
          isComplete = true;
          setIsImporting(false);
          window.removeEventListener('message', handleMessage);
          window.removeEventListener('focus', handleWindowFocus);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          clearInterval(checkPopupStatus);
          if (timeoutId) clearTimeout(timeoutId);
        }
      };

      // Aguardar mensagem do callback
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin || isComplete) return;
        
        if (event.data.type === 'OAUTH_SUCCESS') {
          performCleanup();
          
          toast({
            title: "Integração concluída!",
            description: `${event.data.data.accounts.length} contas importadas com sucesso.`,
          });
          
          // Recarregar integrações
          fetchIntegrations();
          
        } else if (event.data.type === 'OAUTH_ERROR') {
          performCleanup();
          
          toast({
            title: "Erro na integração",
            description: event.data.error?.message || "Não foi possível conectar com o Facebook.",
            variant: "destructive",
          });
        }
      };

      window.addEventListener('message', handleMessage);
      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Timeout de segurança (30 segundos - mais prático)
      timeoutId = setTimeout(() => {
        if (!isComplete) {
          performCleanup();
          if (!popup.closed) popup.close();
          toast({
            title: "Integração cancelada",
            description: "A autenticação foi cancelada automaticamente.",
            variant: "destructive",
          });
        }
      }, 30000);
      
    } catch (error) {
      setIsImporting(false);
      toast({
        title: "Erro na integração",
        description: error instanceof Error ? error.message : "Não foi possível conectar com o Facebook.",
        variant: "destructive",
      });
    }
  };

  const handleImportFacebookAccounts = async (accessToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/oauth/facebook/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });
      
      if (response.ok) {
        await fetchIntegrations();
        toast({
          title: "Contas importadas!",
          description: "Todas as contas do Facebook foram importadas com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao importar contas:', error);
    }
  };

  // Função para buscar contas
  const handleSearchAccounts = async () => {
    if (!selectedFacebookId) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await getUserAdAccountsFromBackend(selectedFacebookId);
      setAccounts(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar contas por nome
  const filteredAccounts = accounts.filter(account => 
    (account.name || account.nome_conta || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginação
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
  const startIndex = (currentPage - 1) * accountsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + accountsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <ProductLayout title="Integrações de API">
      <div className="space-y-6">
        {/* Header com descrição */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie suas conexões com plataformas de marketing e dados
            </p>
          </div>
        </div>

        {/* Available Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrationTypes.map((type) => {
            const Icon = type.icon;
            const isFacebook = type.type === 'facebook';
            
            return (
              <Card 
                key={type.type} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => isFacebook ? handleOAuthIntegration(type) : handleAddIntegration(type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isFacebook ? 'Conecte suas contas automaticamente' : type.description}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User Filter */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Integrações Ativas
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualize e gerencie suas conexões ativas
            </p>
          </div>
          
          {/* Search Bar in the middle */}
          <div className="flex-1 max-w-md mx-8">
            <label htmlFor="account-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="account-search"
                placeholder="Nome da campanha, conjunto ou anúncio..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <label htmlFor="user-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por usuário:
            </label>
            <select
              id="user-filter"
              value={selectedFacebookId || ''}
              onChange={(e) => setSelectedFacebookId(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px] z-10"
            >
              <option value="">---</option>
              {users.map((user) => (
                <option key={user.facebook_id} value={user.facebook_id}>
                  {user.username}
                </option>
              ))}
            </select>
            
            <Button 
              onClick={handleSearchAccounts}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Buscando...' : 'Buscar Contas'}</span>
            </Button>
          </div>
        </div>

        {/* Integrações Ativas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[200px]">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando contas...</p>
            </div>
          )}
          
          {!loading && selectedFacebookId && !hasSearched && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Pronto para buscar
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Clique no botão "Buscar Contas" para carregar as integrações deste usuário.
              </p>
            </div>
          )}
          
          {!loading && selectedFacebookId && hasSearched && accounts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Settings className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Este usuário não possui contas conectadas.
              </p>
            </div>
          )}
          
          {!loading && !selectedFacebookId && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Settings className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecione um usuário
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Escolha um usuário acima para visualizar suas integrações ativas.
              </p>
            </div>
          )}
          
          {!loading && filteredAccounts.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma conta encontrada com o termo "{searchTerm}".
              </p>
            </div>
          )}
          
          {!loading && paginatedAccounts.length > 0 && (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedAccounts.map((conta) => {
                  const integrationType = integrationTypes.find(t => t.type === 'facebook');
                  const Icon = integrationType?.icon || Settings;
                  
                  return (
                    <div key={conta.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${integrationType?.color || 'bg-gray-600'}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {conta.name || conta.nome_conta}
                            </h3>
                            {conta.ativo ? (
                              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Account ID: {conta.account_id || conta.identificador_conta}</span>
                            <span>Plataforma: {conta.plataforma}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`toggle-${conta.id}`} className="text-sm">
                            Ativo
                          </Label>
                          <Switch
                            id={`toggle-${conta.id}`}
                            checked={conta.ativo}
                            onCheckedChange={(checked) => handleToggleIntegration(String(conta.id), checked)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIntegration(conta.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + accountsPerPage, filteredAccounts.length)} de {filteredAccounts.length} contas
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Anterior</span>
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Página {currentPage} de {totalPages}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-1"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* OAuth Integration Dialog */}
        <Dialog open={isOAuthDialogOpen} onOpenChange={setIsOAuthDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Facebook className="h-6 w-6 text-white" />
                </div>
              </div>
              <DialogTitle className="text-xl font-semibold">
                Conectar {selectedIntegrationType?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                Escolha como deseja conectar sua conta {selectedIntegrationType?.name} para importar dados de campanhas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              <Button 
                onClick={handleFacebookOAuth}
                disabled={isImporting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-base font-medium rounded-lg"
                size="lg"
              >
                <Globe className="h-5 w-5 mr-3" />
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Conectando...
                  </>
                ) : (
                  'Continuar neste navegador'
                )}
              </Button>
              
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 px-4">
                Será aberta uma nova janela para autenticação segura com o Facebook
              </p>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-gray-500 dark:text-gray-400 font-medium">OU</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => {
                  const oauthUrl = FacebookOAuthService.getOAuthUrl();
                  navigator.clipboard.writeText(oauthUrl);
                  toast({
                    title: "Link copiado!",
                    description: "Cole o link em outro navegador para conectar sua conta.",
                  });
                }}
                className="w-full py-4 text-base font-medium rounded-lg border-2"
                size="lg"
                disabled={isImporting}
              >
                <Settings className="h-5 w-5 mr-3" />
                Copiar link para navegador multilogin
              </Button>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 px-4">
                Use esta opção para conectar em um navegador com múltiplas contas ou compartilhar com colaboradores
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading Overlay */}
        {isImporting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-sm mx-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-900 dark:text-white font-medium mb-2">Importando contas...</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Aguarde enquanto importamos suas contas do Facebook</p>
              
              <Button 
                variant="outline" 
                onClick={() => setIsImporting(false)}
                className="w-full"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Add Integration Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Conectar {selectedIntegrationType?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedIntegrationType?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedIntegrationType?.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type={field.key.includes('Token') || field.key.includes('Key') ? 'password' : 'text'}
                    placeholder={`Digite seu ${field.label.toLowerCase()}`}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                  />
                </div>
              ))}
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleSubmitIntegration}
                  disabled={!selectedIntegrationType?.fields.every(field => 
                    !field.required || formData[field.key]
                  )}
                  className="flex-1"
                >
                  Conectar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProductLayout>
  );
};

export default Integrations;