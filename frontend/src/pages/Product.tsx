import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Send, 
  Upload, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock,
  MessageCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  FileUp,
  Link,
  X,
  Moon,
  Sun,
  ArrowLeft,
  Plug,
  Menu
} from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';
import { setIaContexto } from '@/services/integrations';
import { getAllFacebookUsers, getUserAdAccountsFromBackend } from '@/services/oauth';

interface DynamicChart {
  id: string;
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: unknown[];
  config?: {
    xKey?: string;
    yKey?: string;
    colors?: string[];
    dataKey?: string;
  };
}

const Product = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', content: 'Seja bem vindo a Lux, sua IA analista de dados e especialista em Business Intelligence!😉 Faça upload de uma planilha e me peça para criar visualizações dos seus dados!' },
  ]);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'api'>('file');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [selectedFacebookUser, setSelectedFacebookUser] = useState('');
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [lastUploadedSheet, setLastUploadedSheet] = useState<{ url?: string; file?: File | null }>({});

  const [isAiLoading, setIsAiLoading] = useState(false);

  const [dynamicCharts, setDynamicCharts] = useState<DynamicChart[]>([]);
  const [facebookUsers, setFacebookUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [adAccounts, setAdAccounts] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Buscar usuários reais do backend
    getAllFacebookUsers().then(users => {
      setFacebookUsers(users.map(u => ({ id: u.facebook_id, name: u.username })));
    }).catch(() => {
      setFacebookUsers([]);
    });
  }, []);

  // Buscar contas de Ads reais ao selecionar usuário
  useEffect(() => {
    if (selectedFacebookUser) {
      setSelectedAdAccount('');
      getUserAdAccountsFromBackend(selectedFacebookUser).then(accounts => {
        setAdAccounts(accounts.map((a: { identificador_conta?: string; account_id?: string; id?: string; nome_conta?: string; name?: string }) => ({ id: a.identificador_conta || a.account_id || a.id || '', name: a.nome_conta || a.name || '' })));
      }).catch(() => {
        setAdAccounts([]);
      });
    } else {
      setAdAccounts([]);
      setSelectedAdAccount('');
    }
  }, [selectedFacebookUser]);

  const adAccountsByUser = {
    'user1': [
      { id: 'act_123456789', name: 'Loja Virtual - Vendas Online' },
      { id: 'act_123456790', name: 'Campanha Black Friday' }
    ],
    'user2': [
      { id: 'act_987654321', name: 'Marketing Digital - Leads' },
      { id: 'act_987654322', name: 'Branding - Awareness' }
    ],
    'user3': [
      { id: 'act_555444333', name: 'Agência - Cliente A' },
      { id: 'act_555444334', name: 'Agência - Cliente B' },
      { id: 'act_555444335', name: 'Agência - Cliente C' }
    ]
  };

  const salesData = [
    { month: 'Jan', sales: 89500, visitors: 24700 },
    { month: 'Fev', sales: 67200, visitors: 18900 },
    { month: 'Mar', sales: 78900, visitors: 22100 },
    { month: 'Apr', sales: 85600, visitors: 25300 },
    { month: 'Mai', sales: 92400, visitors: 28600 },
    { month: 'Jun', sales: 71800, visitors: 21400 }
  ];

  const trafficData = [
    { name: 'Google', value: 4700, color: '#3B82F6' },
    { name: 'Facebook', value: 3400, color: '#8B5CF6' },
    { name: 'Direct', value: 2800, color: '#10B981' },
    { name: 'Others', value: 1900, color: '#F59E0B' }
  ];

  const dailyVisitors = [
    { day: 1, visitors: 150 }, { day: 2, visitors: 200 }, { day: 3, visitors: 180 },
    { day: 4, visitors: 220 }, { day: 5, visitors: 190 }, { day: 6, visitors: 250 },
    { day: 7, visitors: 280 }, { day: 8, visitors: 100 }, { day: 9, visitors: 210 },
    { day: 10, visitors: 400 }, { day: 11, visitors: 270 }, { day: 12, visitors: 110 },
    { day: 13, visitors: 120 }, { day: 14, visitors: 200 }, { day: 15, visitors: 180 }
  ];

  // Função para detectar pedidos de gráfico de forma extremamente permissiva
  function isChartRequest(message: string): boolean {
    if (!message) return false;
    const lower = message.toLowerCase();
    return (
      lower.includes('gráfico') ||
      lower.includes('grafico') ||
      lower.includes('chart') ||
      lower.includes('visualização') ||
      lower.includes('visualizacao') ||
      lower.includes('plot') ||
      lower.includes('barra') ||
      lower.includes('linha') ||
      lower.includes('pizza') ||
      lower.includes('pie') ||
      lower.includes('plotar')
    );
  }

  const removeChart = (chartId: string) => {
    setDynamicCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    const currentMessage = message;
    setMessage('');
    setIsAiLoading(true);

    // Log para debug
    console.log('DEBUG isChartRequest:', isChartRequest(currentMessage), '| currentMessage:', currentMessage);

    try {
      if (isChartRequest(currentMessage)) {
        await handleChartRequest(currentMessage);
      } else {
        await handleRegularRequest(currentMessage);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { type: 'ai', content: 'Erro ao se comunicar com o servidor.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleChartRequest = async (pergunta: string) => {
    if (!selectedFacebookUser) {
      setChatMessages(prev => [...prev, { type: 'ai', content: 'Selecione um usuário antes de pedir o gráfico.' }]);
      return;
    }
    try {
      const body = {
        pedido: pergunta,
        google_sheets_url: lastUploadedSheet.url || undefined,
        facebook_id: selectedFacebookUser
      };

      const response = await fetch('http://127.0.0.1:8000/gerar-grafico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const apiResult = await response.json();
      let chartConfig: any = null;
      // Se vier direto do backend já como objeto de gráfico
      if (apiResult && apiResult.type && apiResult.data) {
        chartConfig = apiResult;
      } else if (apiResult && typeof apiResult.resposta === 'object' && apiResult.resposta.type && apiResult.resposta.data) {
        chartConfig = apiResult.resposta;
      } else if (apiResult && typeof apiResult.resposta === 'string') {
        const resposta = apiResult.resposta.trim();
        if (resposta.startsWith('[CHART:')) {
          const match = resposta.match(/\[CHART:\s*(\{[\s\S]*\})\s*\]/);
          if (match && match[1]) {
            let jsonStr = match[1];
            jsonStr = jsonStr.replace(/'/g, '"').replace(/\n/g, '').replace(/\r/g, '');
            try {
              chartConfig = JSON.parse(jsonStr);
            } catch (e) {
              setChatMessages(prev => [...prev, {
                type: 'ai',
                content: 'Erro ao interpretar o gráfico: ' + (e instanceof Error ? e.message : String(e)) + '<br/><pre>' + jsonStr + '</pre>'
              }]);
              return;
            }
          }
        }
      }

      if (chartConfig && chartConfig.type && chartConfig.data) {
        const newChart: DynamicChart = {
          id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: chartConfig.type,
          title: chartConfig.title || 'Gráfico Gerado',
          data: chartConfig.data,
          config: chartConfig.config
        };
        setDynamicCharts(prev => [...prev, newChart]);
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: `📊 Gráfico "${newChart.title}" foi adicionado à dashboard!`
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: 'Não foi possível gerar o gráfico solicitado. Tente reformular sua pergunta.'
        }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: 'Ocorreu um erro ao gerar o gráfico.'
      }]);
    }
  };

  const handleRegularRequest = async (pergunta: string) => {
    try {
      const formData = new FormData();
      formData.append('pergunta', pergunta);
      if (selectedFacebookUser) {
        formData.append('facebook_id', selectedFacebookUser);
      }

      if (lastUploadedSheet.url) {
        formData.append('google_sheets_url', lastUploadedSheet.url);
      } else if (lastUploadedSheet.file) {
        formData.append('file', lastUploadedSheet.file);
      }

      // Só use /perguntar para perguntas normais, nunca para gráficos
      // const response = await fetch('http://127.0.0.1:8000/perguntar', {
      //   method: 'POST',
      //   body: formData
      // });
      // Se chegar aqui para pedido de gráfico, lance erro
      if (isChartRequest(pergunta)) {
        setChatMessages(prev => [...prev, { type: 'ai', content: 'ERRO: handleRegularRequest não deve ser chamado para pedidos de gráfico!' }]);
        return;
      }
      const response = await fetch('http://127.0.0.1:8000/perguntar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      let chartAdded = false;
      // Tenta detectar e renderizar gráfico se a resposta for um JSON de gráfico
      if (typeof data.resposta === 'string') {
        try {
          const maybeChart = JSON.parse(data.resposta);
          if (maybeChart && maybeChart.type && maybeChart.data) {
            const newChart: DynamicChart = {
              id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: maybeChart.type,
              title: maybeChart.title || 'Gráfico Gerado',
              data: maybeChart.data || [],
              config: maybeChart.config
            };
            setDynamicCharts(prev => [...prev, newChart]);
            setChatMessages(prev => [...prev, { type: 'ai', content: `📊 Gráfico "${newChart.title}" foi adicionado à dashboard!` }]);
            chartAdded = true;
          }
        } catch (e) {
          // Não é JSON de gráfico, segue fluxo normal
        }
      }

      if (!chartAdded) {
        if (data.resposta) {
          setChatMessages(prev => [...prev, { type: 'ai', content: data.resposta }]);
        } else {
          setChatMessages(prev => [...prev, { type: 'ai', content: 'Ocorreu um erro ao obter a resposta.' }]);
        }
      }
    } catch (error) {
      console.error('Erro na pergunta regular:', error);
    }
  };

  const handleFileUpload = (event: unknown) => {
    const file = (event as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    setIsUploadDialogOpen(false);
    setChatMessages(prev => [...prev, {
      type: 'ai',
      content: 'Processando dados, um momento...'
    }]);

    try {
      const formData = new FormData();

      if (uploadType === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadType === 'url' && spreadsheetUrl) {
        formData.append('google_sheets_url', spreadsheetUrl);
      } else if (uploadType === 'api' && selectedIntegration && selectedFacebookUser && selectedAdAccount) {
        // Busca dados reais de Ads e envia para contexto da IA
        const request = {
          user_facebook_id: selectedFacebookUser,
          account_id: selectedAdAccount,
          fields: 'campaign_name,adset_name,ad_name,impressions,reach,clicks,cpc,spend,ad_id,ctr,cpm,frequency,actions,objective,status,date_start,date_stop,nivel'
        };
        const response = await fetch('http://localhost:8000/api/v1/meta/dados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        const result = await response.json();
        if (result?.dados && result.dados.length > 0) {
          await setIaContexto(selectedFacebookUser, result.dados);
          setChatMessages(prev => [...prev, { type: 'ai', content: 'Dados da integração enviados para a IA! Agora você pode pedir insights, gráficos e análises.' }]);
        } else {
          setChatMessages(prev => [...prev, { type: 'ai', content: 'Não foi possível extrair dados da integração selecionada.' }]);
        }
        return;
      } else {
        return;
      }

      const previewResponse = await fetch('http://127.0.0.1:8000/preview', {
        method: 'POST',
        body: formData,
      });

      const previewData = await previewResponse.json();

      if (previewData?.columns && previewData?.data?.length > 0) {
        const html = generateHtmlTable(previewData.columns, previewData.data);
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: `<p><strong>Prévia da planilha carregada:</strong></p>${html}<p>Agora você pode me pedir para criar gráficos baseados nos seus dados! Por exemplo: "Crie um gráfico de barras dos valores por categoria" ou "Mostre um gráfico de pizza da distribuição de dados".</p>`
        }]);

        setLastUploadedSheet({
          file: uploadType === 'file' ? selectedFile : null,
          url: uploadType === 'url' ? spreadsheetUrl : undefined,
        });
      } else {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: 'Não foi possível gerar a prévia da planilha.'
        }]);
      }

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: 'Erro ao se comunicar com o servidor. Verifique a conexão.'
      }]);
    }

    setSelectedFile(null);
    setSpreadsheetUrl('');
  };

  function generateHtmlTable(columns: string[], data: any[]): string {
    const headers = columns.map(col => `<th class="px-3 py-2 text-left font-medium text-sm text-gray-600">${col}</th>`).join('');
    const rows = data.slice(0, 10).map(row => {
      const cells = columns.map(col => `<td class="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">${row[col] ?? ''}</td>`).join('');
      return `<tr class="border-t">${cells}</tr>`;
    }).join('');

    return `
      <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-200 rounded-md overflow-hidden shadow-sm text-sm">
          <thead class="bg-gray-100">
            <tr>${headers}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${data.length > 10 ? `<p class="text-xs text-gray-500 mt-2">Mostrando 10 de ${data.length} registros</p>` : ''}
      </div>
    `;
  }

  const renderDynamicChart = (chart: DynamicChart) => {
    const colors = chart.config?.colors || ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
    if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
      return <div className="text-red-500">Sem dados para exibir o gráfico.</div>;
    }
    // Normaliza nomes de colunas para evitar erros de case/underscore
    const getKey = (obj: any, key: string | undefined, fallback: string) => {
      if (!key) return fallback;
      if (obj.hasOwnProperty(key)) return key;
      const lowerKey = key.toLowerCase().replace(/_/g, '');
      const found = Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, '') === lowerKey);
      return found || fallback;
    };
    switch (chart.type) {
      case 'bar': {
        const xKey = getKey(chart.data[0], chart.config?.xKey, 'name');
        const yKey = getKey(chart.data[0], chart.config?.yKey, 'value');
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey={yKey} 
                fill={colors[0]} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case 'line': {
        const xKey = getKey(chart.data[0], chart.config?.xKey, 'name');
        const yKey = getKey(chart.data[0], chart.config?.yKey, 'value');
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={colors[0]} 
                strokeWidth={3}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      case 'pie': {
        const dataKey = getKey(chart.data[0], chart.config?.dataKey, 'value');
        const nameKey = getKey(chart.data[0], chart.config?.xKey, 'name');
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50 dark:bg-gray-900 transition-colors">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 transition-colors">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden">
                  <Menu className="h-4 w-4" />
                </SidebarTrigger>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DashboardAI
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Analytics Dashboard</div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-gray-600" />
                  )}
                </Button>

                {/* Voltar Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="h-9 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>

                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                      <Upload className="w-4 h-4 mr-2" />
                      Nova Planilha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Carregar Nova Planilha</DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    Escolha como você gostaria de adicionar sua planilha para análise.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Toggle between file, URL and API */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={uploadType === 'file' ? 'default' : 'outline'}
                      onClick={() => setUploadType('file')}
                      className="flex-1"
                    >
                      <FileUp className="w-4 h-4 mr-2" />
                      Arquivo Local
                    </Button>
                    <Button
                      variant={uploadType === 'url' ? 'default' : 'outline'}
                      onClick={() => setUploadType('url')}
                      className="flex-1"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Link/URL
                    </Button>
                    <Button
                      variant={uploadType === 'api' ? 'default' : 'outline'}
                      onClick={() => setUploadType('api')}
                      className="flex-1"
                    >
                      <Plug className="w-4 h-4 mr-2" />
                      API
                    </Button>
                  </div>

                  {/* File upload */}
                  {uploadType === 'file' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium dark:text-gray-200">Selecionar arquivo</label>
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {selectedFile && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Arquivo selecionado: {selectedFile.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Formatos aceitos: .xlsx, .xls, .csv
                      </p>
                    </div>
                  )}

                  {/* URL upload */}
                  {uploadType === 'url' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium dark:text-gray-200">Link da planilha</label>
                      <Input
                        type="url"
                        placeholder="https://docs.google.com/spreadsheets/..."
                        value={spreadsheetUrl}
                        onChange={(e) => setSpreadsheetUrl(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cole o link da sua planilha do Google Sheets ou Excel Online
                      </p>
                    </div>
                  )}

                  {/* API Integration */}
                  {uploadType === 'api' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium dark:text-gray-200">Selecionar Integração</label>
                      <Select 
                        value={selectedIntegration} 
                        onValueChange={(value) => {
                          setSelectedIntegration(value);
                          // Reset subsequent selections when integration changes
                          setSelectedFacebookUser('');
                          setSelectedAdAccount('');
                        }}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Escolha uma integração ativa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook-ads-1">Facebook Ads - Conta Principal</SelectItem>
                          <SelectItem value="google-ads-1">Google Ads - Campanhas 2024</SelectItem>
                          <SelectItem value="instagram-1">Instagram Business - Perfil Principal</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Facebook User Selection - Only show when Facebook Ads is selected */}
                      {selectedIntegration === 'facebook-ads-1' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium dark:text-gray-200">Selecionar Usuário Logado</label>
                          <Select 
                            value={selectedFacebookUser} 
                            onValueChange={(value) => {
                              setSelectedFacebookUser(value);
                              // Reset ad account selection when user changes
                              setSelectedAdAccount('');
                            }}
                          >
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <SelectValue placeholder="Escolha o usuário logado" />
                            </SelectTrigger>
                            <SelectContent>
                              {facebookUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Ad Account Selection - Only show when Facebook user is selected */}
                      {selectedIntegration === 'facebook-ads-1' && selectedFacebookUser && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium dark:text-gray-200">Selecionar Conta de Ads</label>
                          <Select 
                            value={selectedAdAccount} 
                            onValueChange={setSelectedAdAccount}
                          >
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                              <SelectValue placeholder="Escolha a conta de ads" />
                            </SelectTrigger>
                            <SelectContent>
                              {adAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Importe dados em tempo real das suas integrações configuradas
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleUploadSubmit}
                    disabled={
                      (uploadType === 'file' && !selectedFile) || 
                      (uploadType === 'url' && !spreadsheetUrl) ||
                      (uploadType === 'api' && !selectedIntegration) ||
                      (uploadType === 'api' && selectedIntegration === 'facebook-ads-1' && (!selectedFacebookUser || !selectedAdAccount))
                    }
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadType === 'api' ? 'Importar Dados' : 'Carregar Planilha'}
                  </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

          <div className="flex h-[calc(100vh-80px)]">
        {/* Main Dashboard */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Gráficos Dinâmicos da IA */}
          {dynamicCharts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">📊 Visualizações Geradas pela IA</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dynamicCharts.map((chart) => (
                  <Card key={chart.id} className="hover:shadow-lg transition-shadow relative dark:bg-gray-800 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 h-8 w-8 p-0 dark:hover:bg-gray-700"
                      onClick={() => removeChart(chart.id)}
                    >
                      <X className="h-4 w-4 dark:text-gray-300" />
                    </Button>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg dark:text-gray-200">
                        {chart.type === 'bar' && <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />}
                        {chart.type === 'line' && <LineChartIcon className="h-5 w-5 mr-2 text-green-600" />}
                        {chart.type === 'pie' && <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />}
                        {chart.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDynamicChart(chart)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Visitantes Únicos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">24.7K</div>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +20% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Pageviews</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">55.9K</div>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +4% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Taxa de Rejeição</CardTitle>
                <BarChart3 className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">54%</div>
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center mt-1">
                  -1.5% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Duração da Visita</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">2m 56s</div>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +7% vs mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-gray-200">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Vendas por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Vendas']} 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#f9fafb' : '#111827'
                      }}
                    />
                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-gray-200">
                  <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Fontes de Tráfego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#f9fafb' : '#111827'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Visitors Chart */}
          <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-gray-200">
                <LineChartIcon className="h-5 w-5 mr-2 text-green-600" />
                Visitantes Diários - Últimos 15 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyVisitors}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="day" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                  <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                  <Tooltip 
                    formatter={(value) => [value, 'Visitantes']} 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: isDarkMode ? '#f9fafb' : '#111827'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-[600px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold flex items-center dark:text-gray-200">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Assistente IA
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Faça perguntas sobre seus dados e peça visualizações</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 dark:bg-blue-700 text-white ml-4'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-4'
                  }`}
                >
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">IA analisando</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <Input
                placeholder="Ex: Crie um gráfico de barras das vendas por mês..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                disabled={isAiLoading}
              />
              <Button onClick={sendMessage} size="sm" disabled={isAiLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Product;