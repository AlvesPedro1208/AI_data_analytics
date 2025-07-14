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
  AlertCircle
} from 'lucide-react';
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

  const fetchIntegrations = async () => {
    try {
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
  }, []);


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
      await fetch(`http://localhost:8000/contas/${id}`, {
        method: 'DELETE',
      });
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
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

  return (
    <ProductLayout title="Integrações de API">
      <div className="space-y-6">
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
            return (
              <Card 
                key={type.type} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleAddIntegration(type)}
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
                        {type.description}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Integrations */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Integrações Ativas
          </h2>
          
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Settings className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma integração configurada
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Adicione sua primeira integração clicando em uma das opções acima
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => {
                const integationType = integrationTypes.find(t => t.type === integration.type);
                const Icon = integationType?.icon || Settings;
                
                return (
                  <Card key={integration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${integationType?.color || 'bg-gray-600'}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {integration.name}
                              </h3>
                              {getStatusIcon(integration.status)}
                              {getStatusBadge(integration.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Account ID: {integration.accountId}</span>
                              <span>Última sincronização: {formatLastSync(integration.lastSync || '')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`toggle-${integration.id}`} className="text-sm">
                              Ativo
                            </Label>
                            <Switch
                              id={`toggle-${integration.id}`}
                              checked={integration.isActive}
                              onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIntegration(integration.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

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