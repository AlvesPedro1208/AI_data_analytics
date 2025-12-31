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
  ChevronRight,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FacebookOAuthService, getAllFacebookUsers, getUserAdAccountsFromBackend, FacebookUser, FacebookAccount } from '@/services/oauth';
import { useToast } from '@/hooks/use-toast';
import { ProductLayout } from '@/components/ProductLayout';
import { useIntegrations, Integration } from "@/contexts/IntegrationsContext";

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
  const { integrations, setIntegrations, refreshIntegrations } = useIntegrations();

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

  const fetchUsers = async () => {
    try {
      const data = await getAllFacebookUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    refreshIntegrations();
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
      const response = await fetch('http://localhost:8000/accounts_ads_facebook/', {
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

      await refreshIntegrations();

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
      await fetch(`http://localhost:8000/accounts_ads_facebook/${id}`, {
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
      await fetch(`http://localhost:8000/accounts_ads_facebook/${id}`, {
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
          refreshIntegrations();
          
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
        await refreshIntegrations();
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
      <div className="h-full flex flex-col space-y-6 min-w-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Central de Conexões</h2>
            <p className="text-muted-foreground mt-1">
              Gerencie suas conexões com plataformas de marketing e visualize o status das integrações.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshIntegrations}
              className="hidden md:flex"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar Lista
            </Button>
          </div>
        </div>

        {/* Available Integrations Panel */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-5">
          <div className="space-y-2">
            <h3 className="text-lg font-medium leading-none">Nova Conexão</h3>
            <p className="text-sm text-muted-foreground">
              Selecione uma plataforma para adicionar uma nova integração.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationTypes.map((type) => {
              const Icon = type.icon;
              const isFacebook = type.type === 'facebook';
              
              return (
                <Card 
                  key={type.type} 
                  className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                  onClick={() => isFacebook ? handleOAuthIntegration(type) : handleAddIntegration(type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${type.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {type.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {isFacebook ? 'Conexão automática' : 'Conexão manual'}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-5">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Buscar</Label>
                 <div className="relative">
                   <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Nome da conta, ID ou plataforma..."
                     value={searchTerm}
                     onChange={(e) => {
                       setSearchTerm(e.target.value);
                       setCurrentPage(1);
                     }}
                     className="pl-10"
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label>Filtrar por Usuário</Label>
                 <Select value={selectedFacebookId || "all"} onValueChange={(val) => setSelectedFacebookId(val === "all" ? null : val)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Todos os usuários" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Todos os usuários</SelectItem>
                     {users.map((u) => (
                       <SelectItem key={u.facebook_id} value={u.facebook_id || "undefined"}>
                         {u.username}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
             
             <div className="lg:col-span-4 flex items-end">
                <Button 
                  onClick={handleSearchAccounts}
                  className="w-full"
                  disabled={loading || !selectedFacebookId}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Buscar Contas do Usuário
                </Button>
             </div>
           </div>
        </div>

        {/* Results Area */}
        <div className="border rounded-xl bg-card shadow-sm flex flex-col min-w-0 max-w-full overflow-hidden flex-1">
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
             <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  {filteredAccounts.length} conexões
                </Badge>
             </div>
             {/* Pagination */}
             {totalPages > 1 && (
               <div className="flex items-center gap-2">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={handlePreviousPage}
                   disabled={currentPage === 1}
                 >
                   Anterior
                 </Button>
                 <span className="text-sm text-muted-foreground">
                   {currentPage} / {totalPages}
                 </span>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={handleNextPage}
                   disabled={currentPage === totalPages}
                 >
                   Próxima
                 </Button>
               </div>
             )}
          </div>

          <div className="w-full overflow-hidden flex-1">
            <div className="w-full overflow-x-auto h-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[50px]">Status</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>ID da Conta</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-muted-foreground">Carregando conexões...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedAccounts.length > 0 ? (
                    paginatedAccounts.map((conta) => {
                      // Tenta encontrar o tipo de integração pelo nome da plataforma
                      const integrationType = integrationTypes.find(t => 
                        conta.plataforma?.toLowerCase().includes(t.type) || 
                        t.name.toLowerCase() === conta.plataforma?.toLowerCase()
                      ) || integrationTypes[0]; // Fallback para Facebook se não encontrar
                      
                      const Icon = integrationType.icon;
                      
                      return (
                        <TableRow key={conta.id} className="group hover:bg-muted/40 transition-all duration-200 border-b border-muted/60">
                          <TableCell className="w-[100px]">
                            <div className="flex items-center gap-2">
                               {conta.ativo ? (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Ativo</span>
                                  </div>
                               ) : (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inativo</span>
                                  </div>
                               )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-background border shadow-sm group-hover:border-primary/20 transition-colors`}>
                                <Icon className={`h-4 w-4 ${conta.ativo ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                  {conta.name || conta.nome_conta}
                                </span>
                                {conta.ativo && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-emerald-500" /> Sincronizado
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal bg-background/50 backdrop-blur-sm border-muted-foreground/20">
                                {conta.plataforma}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded w-fit">
                              {conta.account_id || conta.identificador_conta}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-2 mr-3 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer" onClick={() => handleToggleIntegration(String(conta.id), !conta.ativo)}>
                                <Label htmlFor={`toggle-${conta.id}`} className="sr-only">Alternar status</Label>
                                <span className="text-xs text-muted-foreground font-medium">
                                  {conta.ativo ? 'Desativar' : 'Ativar'}
                                </span>
                                <Switch
                                  id={`toggle-${conta.id}`}
                                  checked={conta.ativo}
                                  onCheckedChange={(checked) => handleToggleIntegration(String(conta.id), checked)}
                                  className="data-[state=checked]:bg-emerald-500"
                                />
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteIntegration(conta.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50/50 transition-colors rounded-full"
                                title="Remover conexão"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="rounded-full bg-muted p-4 mb-4">
                            <Search className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">Nenhuma conexão encontrada</p>
                          <p className="text-sm max-w-sm mt-1">
                            {selectedFacebookId 
                              ? "Tente ajustar os filtros ou buscar novamente." 
                              : "Selecione um usuário para visualizar suas contas."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="p-4 border-t bg-muted/30 text-xs text-center text-muted-foreground">
             Gerencie suas conexões para garantir que os dados estejam sempre atualizados.
          </div>
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
              <DialogDescription className="text-muted-foreground mt-2">
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
              
              <p className="text-sm text-center text-muted-foreground px-4">
                Será aberta uma nova janela para autenticação segura com o Facebook
              </p>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground font-medium">OU</span>
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
              
              <p className="text-xs text-center text-muted-foreground px-4">
                Use esta opção para conectar em um navegador com múltiplas contas ou compartilhar com colaboradores
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading Overlay */}
        {isImporting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border p-6 rounded-lg shadow-lg text-center max-w-sm mx-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground font-medium mb-2">Importando contas...</p>
              <p className="text-muted-foreground text-sm mb-4">Aguarde enquanto importamos suas contas do Facebook</p>
              
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