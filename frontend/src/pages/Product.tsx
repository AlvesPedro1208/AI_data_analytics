import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { marked } from 'marked';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Link
} from 'lucide-react';

const Product = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', content: 'Olá! Suas planilhas foram carregadas com sucesso. Pode me fazer perguntas sobre os dados ou pedir gráficos específicos.' },
    { type: 'user', content: 'Qual foi o mês com mais vendas?' },
    { type: 'ai', content: 'Baseado nos seus dados, o mês com mais vendas foi Janeiro com 89.5K em vendas totais.' }
  ]);

  // Estados para upload de planilha
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedSheet, setLastUploadedSheet] = useState<{ url?: string; file?: File | null }>({});

  // Estado para controlar o carregamento da IA
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    setMessage('');
    setIsAiLoading(true);

    try {
      let formData = new FormData();
      formData.append('pergunta', message);

      if (lastUploadedSheet.url) {
        formData.append('google_sheets_url', lastUploadedSheet.url);
      } else if (lastUploadedSheet.file) {
        formData.append('file', lastUploadedSheet.file);
      }

      const response = await fetch('http://127.0.0.1:8000/perguntar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.resposta) {
        setChatMessages(prev => [...prev, { type: 'ai', content: data.resposta }]);
      } else {
        setChatMessages(prev => [...prev, { type: 'ai', content: 'Ocorreu um erro ao obter a resposta.' }]);
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { type: 'ai', content: 'Erro ao se comunicar com o servidor.' }]);
    } finally {
    setIsAiLoading(false);
  }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    setIsUploadDialogOpen(false);
    setChatMessages(prev => [...prev, {
      type: 'ai',
      content: 'Processando a planilha, um momento...'
    }]);

    try {
      const formData = new FormData();

      if (uploadType === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadType === 'url' && spreadsheetUrl) {
        formData.append('google_sheets_url', spreadsheetUrl);
      } else {
        return;
      }

      // Envia para a rota de preview
      const previewResponse = await fetch('http://127.0.0.1:8000/preview', {
        method: 'POST',
        body: formData,
      });

      const previewData = await previewResponse.json();

      if (previewData?.columns && previewData?.data?.length > 0) {
        const html = generateHtmlTable(previewData.columns, previewData.data);
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: `<p><strong>Prévia da planilha carregada:</strong></p>${html}`
        }]);

        // Salva referência da planilha carregada
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
    const rows = data.map(row => {
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
      </div>
    `;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DashboardAI
            </div>
            <div className="text-sm text-gray-500">Analytics Dashboard</div>
          </div>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Nova Planilha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Carregar Nova Planilha</DialogTitle>
                <DialogDescription>
                  Escolha como você gostaria de adicionar sua planilha para análise.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Toggle between file and URL */}
                <div className="flex space-x-2">
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
                </div>

                {/* File upload */}
                {uploadType === 'file' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selecionar arquivo</label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600">
                        Arquivo selecionado: {selectedFile.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: .xlsx, .xls, .csv
                    </p>
                  </div>
                )}

                {/* URL upload */}
                {uploadType === 'url' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Link da planilha</label>
                    <Input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/..."
                      value={spreadsheetUrl}
                      onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Cole o link da sua planilha do Google Sheets ou Excel Online
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleUploadSubmit}
                  disabled={
                    (uploadType === 'file' && !selectedFile) || 
                    (uploadType === 'url' && !spreadsheetUrl)
                  }
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Planilha
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Dashboard */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Visitantes Únicos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.7K</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +20% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Pageviews</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">55.9K</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +4% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Rejeição</CardTitle>
                <BarChart3 className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">54%</div>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  -1.5% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Duração da Visita</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2m 56s</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +7% vs mês anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Vendas por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Vendas']} />
                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Visitors Chart */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="h-5 w-5 mr-2 text-green-600" />
                Visitantes Diários - Últimos 15 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyVisitors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Visitantes']} />
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
        <div className="w-[600px] bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Assistente IA
            </h3>
            <p className="text-sm text-gray-600 mt-1">Faça perguntas sobre seus dados</p>
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
                      ? 'bg-blue-600 text-white ml-4'
                      : 'bg-gray-100 text-gray-800 mr-4'
                  }`}
                >
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                </div>
              </div>
            ))}
              {/* Indicador de carregamento da IA */}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 mr-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">IA digitando</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                placeholder="Ex: Mostre vendas por produto..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
                disabled={isAiLoading}
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;