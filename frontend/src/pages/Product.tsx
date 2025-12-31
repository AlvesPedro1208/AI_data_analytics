import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Upload, 
  Send, 
  Bot, 
  User, 
  FileSpreadsheet, 
  Link as LinkIcon, 
  Database,
  Moon,
  Sun,
  Trash2,
  Maximize2,
  X,
  LayoutDashboard,
  GripHorizontal,
  MoreVertical,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { DashboardGrid } from "@/components/DashboardGrid";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IntegrationsProvider, useIntegrations } from "@/contexts/IntegrationsContext";

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}

interface DynamicChart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  config?: any;
  layout?: { x: number; y: number; w: number; h: number };
}

export default function Product() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ type: 'user' | 'ai', content: string }[]>([
    { type: 'ai', content: 'Olá! Sou a **Lux**, sua assistente de analytics. Posso analisar seus dados de marketing (Meta Ads, Google Ads) ou planilhas. Como posso ajudar hoje?' }
  ]);
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'api'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [dynamicCharts, setDynamicCharts] = useState<DynamicChart[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { integrations, users } = useIntegrations();

  // Estados para integrações
  const [selectedIntegration, setSelectedIntegration] = useState<string>("");
  const [selectedPlatformUser, setSelectedPlatformUser] = useState<string>("");
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>("");
  const [selectedFacebookUser, setSelectedFacebookUser] = useState<string | null>(null);

  // Filtrar contas de anúncio com base no usuário selecionado
  const availableAdAccounts = selectedPlatformUser 
    ? integrations.filter(acc => {
        const user = users.find(u => u.facebookId === selectedPlatformUser);
        return user && acc.accessToken === user.accessToken && acc.type === 'facebook';
      })
    : [];
  
  // Estado para armazenar última planilha carregada (para contexto)
  const [lastUploadedSheet, setLastUploadedSheet] = useState<{file: File | null, url: string | undefined}>({ file: null, url: undefined });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiLoading]);

  // Contexto para a IA (simulado ou real)
  const setIaContexto = async (userId: string, dados: any) => {
    // Em um app real, isso enviaria os dados para o backend Python (LangChain/PandasAI)
    // Para MVP, vamos apenas armazenar no estado ou enviar para o endpoint de chat
    console.log("Contexto definido para IA:", userId, dados?.length, "registros");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    setIsUploadDialogOpen(false);
    setIsAiLoading(true);

    const formData = new FormData();
    if (uploadType === 'file' && selectedFile) {
      formData.append('file', selectedFile);
      setChatMessages(prev => [...prev, { type: 'ai', content: `Processando arquivo: ${selectedFile.name}...` }]);
    } else if (uploadType === 'url' && spreadsheetUrl) {
      formData.append('url', spreadsheetUrl);
      setChatMessages(prev => [...prev, { type: 'ai', content: `Acessando planilha: ${spreadsheetUrl}...` }]);
    } else if (uploadType === 'api') {
      if (!selectedIntegration || !selectedPlatformUser) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, selecione o Veículo e informe o Usuário.",
          variant: "destructive"
        });
        setIsAiLoading(false);
        return;
      }

      if (selectedIntegration === 'facebook') {
        const request = {
          user_facebook_id: selectedPlatformUser,
          account_id: selectedAdAccount || undefined,
          fields: 'campaign_name,adset_name,ad_name,impressions,reach,clicks,cpc,spend,ad_id,ctr,cpm,frequency,actions,objective,status,date_start,date_stop,nivel'
        };
        
        try {
          const response = await fetch('http://localhost:8000/api/v1/meta/dados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });
          const result = await response.json();
          if (result?.dados && result.dados.length > 0) {
            await setIaContexto(selectedPlatformUser, result.dados);
            
            // Gerar preview da tabela com TODAS as colunas (exceto actions se for muito grande, mas o usuário pediu raw)
            // Vamos formatar actions para string se necessário dentro do gerador ou aqui
            const columns = Object.keys(result.dados[0]); 
            const mdTable = generateMarkdownTable(columns, result.dados);

            setChatMessages(prev => [...prev, { 
              type: 'ai', 
              content: `Conexão com Meta Ads estabelecida! Carreguei **${result.dados.length}** registros.\n\n**Prévia dos Dados:**\n${mdTable}\n\nEstou pronta para analisá-los.` 
            }]);
            setSelectedFacebookUser(selectedPlatformUser);
          } else {
            setChatMessages(prev => [...prev, { type: 'ai', content: 'Não encontrei dados na conta selecionada.' }]);
          }
        } catch (error) {
           console.error(error);
           setChatMessages(prev => [...prev, { type: 'ai', content: 'Erro ao conectar com Meta Ads.' }]);
        }
      } else {
         await new Promise(resolve => setTimeout(resolve, 1000));
         setChatMessages(prev => [...prev, { type: 'ai', content: `Integração com **${selectedIntegration}** configurada! (Simulação: Dados carregados para usuário ${selectedPlatformUser})` }]);
      }
      
      setIsAiLoading(false);
      return;
    } else {
      setIsAiLoading(false);
      return;
    }

    try {
      const previewResponse = await fetch('http://127.0.0.1:8000/preview', {
        method: 'POST',
        body: formData,
      });

      const previewData = await previewResponse.json();

      if (previewData?.columns && previewData?.data?.length > 0) {
        const mdTable = generateMarkdownTable(previewData.columns, previewData.data);
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: `**Dados carregados com sucesso!**\n\n${mdTable}\n\nPode me pedir análises sobre estes dados agora.`
        }]);

        setLastUploadedSheet({
          file: uploadType === 'file' ? selectedFile : null,
          url: uploadType === 'url' ? spreadsheetUrl : undefined,
        });
      } else {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: 'Não consegui ler a planilha. Verifique o formato do arquivo ou permissões da URL.'
        }]);
      }

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, {
        type: 'ai',
        content: 'Erro ao processar o upload.'
      }]);
    } finally {
      setIsAiLoading(false);
    }

    setSelectedFile(null);
    setSpreadsheetUrl('');
  };

  function generateMarkdownTable(columns: string[], data: any[]): string {
    const headers = `| ${columns.join(' | ')} |`;
    const separator = `| ${columns.map(() => '---').join(' | ')} |`;
    const rows = data.slice(0, 5).map(row => {
      return `| ${columns.map(col => {
        const val = row[col];
        if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val).replace(/\|/g, '\\|');
        }
        return String(val ?? '').replace(/\|/g, '\\|');
      }).join(' | ')} |`;
    }).join('\n');

    const table = `${headers}\n${separator}\n${rows}`;
    
    const footer = data.length > 5 ? `\n\n*Mostrando 5 de ${data.length} registros*` : '';
    
    return `${table}${footer}`;
  }

  const isChartRequest = (text: string) => {
    const keywords = ['gráfico', 'chart', 'plotar', 'visualizar', 'dashboard', 'barras', 'linha', 'pizza'];
    return keywords.some(k => text.toLowerCase().includes(k));
  };

  const handleRegularRequest = async (pergunta: string) => {
    try {
      const formData = new FormData();
      formData.append('pergunta', pergunta);
      
      // Se tiver usuário do Facebook selecionado, envia. 
      // Se não, o backend pode reclamar se for obrigatório. 
      // Por enquanto, vamos enviar se existir, ou um valor dummy se for apenas chat de planilha (não implementado no backend ainda).
      if (selectedFacebookUser) {
        formData.append('facebook_id', selectedFacebookUser);
      } else {
        // TODO: Ajustar backend para permitir chat sem facebook_id (ex: planilha)
        // Por ora, enviamos vazio ou tratamos erro
        formData.append('facebook_id', 'default'); 
      }
      
      if (selectedAdAccount) {
        formData.append('account_id', selectedAdAccount);
      }

      const response = await fetch('http://localhost:8000/perguntar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro na resposta da API');
      }

      const data = await response.json();
      
      // Verifica se o backend retornou um comando de gráfico no meio do texto
      if (data.resposta && data.resposta.includes("[CHART:")) {
         // Se for gráfico, extrai e processa (embora handleChartRequest deva cuidar disso preferencialmente)
         // Mas se cair aqui, mostramos o texto ou processamos.
         // Vamos apenas mostrar a resposta por enquanto.
         const cleanContent = data.resposta.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
         setChatMessages(prev => [...prev, { type: 'ai', content: cleanContent }]);
      } else {
         const cleanContent = data.resposta.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**');
         setChatMessages(prev => [...prev, { type: 'ai', content: cleanContent }]);
      }

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { type: 'ai', content: "Desculpe, não consegui processar sua solicitação no momento. Verifique se a API Key está configurada." }]);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    const currentMessage = message;
    setMessage('');
    setIsAiLoading(true);

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
    
    try {
      const body = {
        pedido: pergunta,
        facebook_id: selectedFacebookUser || 'default',
        account_id: selectedAdAccount || undefined
      };

      // Tenta conectar ao backend
      const response = await fetch('http://localhost:8000/gerar-grafico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || "Backend offline ou erro na geração");
      }

      const apiResult = await response.json();
      
      if (apiResult && apiResult.type) {
         // Verifica se é uma atualização de gráfico existente
         if (apiResult.operation === 'update') {
            setDynamicCharts(prev => {
               if (prev.length === 0) return prev;
               
               // Atualiza o último gráfico ou busca por ID se tivesse
               const updatedCharts = [...prev];
               const lastIndex = updatedCharts.length - 1;
               
               updatedCharts[lastIndex] = {
                  ...updatedCharts[lastIndex],
                  type: apiResult.type,
                  title: apiResult.title || updatedCharts[lastIndex].title,
                  data: apiResult.data,
                  config: apiResult.config
               };
               
               return updatedCharts;
            });
            setChatMessages(prev => [...prev, { type: 'ai', content: `Atualizei o gráfico **${apiResult.title || 'existente'}** conforme seu pedido.` }]);
            return;
         }

         const newChart: DynamicChart = {
            id: `chart_${Date.now()}`,
            type: apiResult.type,
            title: apiResult.title || 'Gráfico Gerado',
            data: apiResult.data,
            config: apiResult.config
         };
         setDynamicCharts(prev => [...prev, newChart]);
         setChatMessages(prev => [...prev, { type: 'ai', content: `Gerei o gráfico: **${newChart.title}** para você.` }]);
         return; // Sucesso, sai da função
      }
      
    } catch (error: any) {
       console.error("Erro ao gerar gráfico:", error);

       // Se o erro for explícito de falta de dados, avisa o usuário e não gera fake
       if (error.message && (error.message.includes("Nenhum dado") || error.message.includes("No data"))) {
          setChatMessages(prev => [...prev, { type: 'ai', content: "⚠️ **Não foi possível gerar o gráfico.**\n\nNão encontrei dados suficientes na conta selecionada ou planilha para atender ao seu pedido." }]);
          return;
       }

       // Fallback: Gera um gráfico de exemplo baseado na pergunta APENAS se não for erro de dados
       // ... (mantendo fallback para casos de erro de servidor/conexão para não quebrar demo totalmente, mas idealmente removeríamos)

       let newChart: DynamicChart | null = null;
       
       if (pergunta.toLowerCase().includes("vendas")) {
         newChart = {
            id: `chart_${Date.now()}`,
            type: 'bar',
            title: 'Vendas por Mês (Simulado)',
            data: [
              { name: 'Jan', value: 4000 },
              { name: 'Fev', value: 3000 },
              { name: 'Mar', value: 2000 },
              { name: 'Abr', value: 2780 },
              { name: 'Mai', value: 1890 },
              { name: 'Jun', value: 2390 },
            ],
            config: { xKey: 'name', series: [{ dataKey: 'value', name: 'Vendas', color: '#3B82F6' }] }
         };
       } else if (pergunta.toLowerCase().includes("roas")) {
          newChart = {
            id: `chart_${Date.now()}`,
            type: 'line',
            title: 'ROAS Mensal (Simulado)',
            data: [
              { name: 'Jan', value: 2.5 },
              { name: 'Fev', value: 3.2 },
              { name: 'Mar', value: 3.8 },
              { name: 'Abr', value: 4.1 },
              { name: 'Mai', value: 3.9 },
            ],
            config: { xKey: 'name', series: [{ dataKey: 'value', name: 'ROAS', color: '#10B981' }] }
         };
       } else {
          // Gráfico genérico
          newChart = {
            id: `chart_${Date.now()}`,
            type: 'pie',
            title: 'Distribuição (Simulado)',
            data: [
              { name: 'Grupo A', value: 400 },
              { name: 'Grupo B', value: 300 },
              { name: 'Grupo C', value: 300 },
              { name: 'Grupo D', value: 200 },
            ],
            config: { xKey: 'name', dataKey: 'value' }
         };
       }

       if (newChart) {
          setDynamicCharts(prev => [...prev, newChart as DynamicChart]);
          setChatMessages(prev => [...prev, { type: 'ai', content: `Gerei o gráfico: **${newChart.title}** para você.` }]);
       }
    }
  };

  const removeChart = (chartId: string) => {
    setDynamicCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const onLayoutChange = (layout: any[]) => {
    setDynamicCharts(prevCharts => {
      const hasChanges = prevCharts.some(chart => {
        const layoutItem = layout.find((l: any) => l.i === chart.id);
        return layoutItem && (
          chart.layout?.x !== layoutItem.x ||
          chart.layout?.y !== layoutItem.y ||
          chart.layout?.w !== layoutItem.w ||
          chart.layout?.h !== layoutItem.h
        );
      });

      if (!hasChanges) return prevCharts;

      return prevCharts.map(chart => {
        const layoutItem = layout.find((l: any) => l.i === chart.id);
        if (layoutItem) {
          return {
            ...chart,
            layout: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h }
          };
        }
        return chart;
      });
    });
  };

  const renderDynamicChart = (chart: DynamicChart) => {
    const colors = chart.config?.colors || ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
    
    if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
      return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Sem dados disponíveis.</div>;
    }

    const getKey = (obj: any, key: string | undefined, fallback: string) => {
      if (!key) return fallback;
      if (obj.hasOwnProperty(key)) return key;
      const lowerKey = key.toLowerCase().replace(/_/g, '');
      const found = Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, '') === lowerKey);
      return found || fallback;
    };
    
    // Configurações comuns de estilo
    const axisStyle = { fontSize: 11, stroke: '#94a3b8', strokeWidth: 0, fill: '#64748b' };
    const gridStyle = { stroke: '#e2e8f0', strokeDasharray: '4 4', strokeOpacity: 0.6 };
    const tooltipStyle = { 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
      borderRadius: '8px', 
      border: 'none', 
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '8px 12px',
      fontSize: '12px'
    };
    
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
            {payload.map((entry: any, index: number) => (
               <div key={index} className="flex items-center gap-2 text-sm font-medium">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                 <span className="text-slate-700 dark:text-slate-200">{entry.name || entry.dataKey}:</span>
                 <span className="text-slate-900 dark:text-white font-bold">{entry.value}</span>
               </div>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (chart.type) {
      case 'bar': {
        const xKey = getKey(chart.data[0], chart.config?.xKey, 'name');
        const yKey = getKey(chart.data[0], chart.config?.yKey, 'value');
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} dy={10} minTickGap={30} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 4 }} />
              <Bar 
                dataKey={yKey} 
                fill={colors[0]} 
                radius={[6, 6, 0, 0]}
                barSize={32}
                animationDuration={1500}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }
      case 'line': {
        const xKey = getKey(chart.data[0], chart.config?.xKey, 'name');
        const yKey = getKey(chart.data[0], chart.config?.yKey, 'value');
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} dy={10} minTickGap={30} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={yKey} 
                stroke={colors[0]} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#color${chart.id})`} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }
      case 'pie': {
        const dataKey = getKey(chart.data[0], chart.config?.dataKey, 'value');
        const nameKey = getKey(chart.data[0], chart.config?.xKey, 'name');
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey={dataKey}
                nameKey={nameKey}
                stroke="none"
                animationDuration={1500}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-slate-600 dark:text-slate-300 text-xs font-medium ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }
      default:
        return <div className="flex items-center justify-center h-full text-slate-400">Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden font-sans">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col h-full relative min-w-0">
          {/* Header */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
             <div className="flex items-center gap-4">
               <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                   L
                 </div>
                 <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent hidden sm:block">
                   Lux Analytics
                 </h1>
               </div>
             </div>
             <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {isDarkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-500" />}
                </Button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                  <User className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
             </div>
          </header>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Dashboard (Left/Main Column) */}
            <div className="flex flex-1 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto p-4 order-2 md:order-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
               <div className="w-full h-full space-y-4 flex flex-col">
                  <div className="flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6 text-blue-600" />
                        Dashboard
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Visão geral do seu desempenho.
                      </p>
                    </div>
                    {dynamicCharts.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setDynamicCharts([])} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 gap-2">
                        <Trash2 className="h-4 w-4" /> Limpar
                      </Button>
                    )}
                  </div>

                  {dynamicCharts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-100/50 dark:bg-slate-900/50 p-10 min-h-[500px]">
                       <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                          <Bot className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Seu Dashboard está vazio</h3>
                       <p className="text-slate-500 max-w-md mb-8 text-sm leading-relaxed">
                         Converse com a Lux no painel ao lado para gerar gráficos e análises em tempo real ou use os atalhos abaixo.
                       </p>
                       <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                          <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-md" onClick={() => setMessage("Crie um gráfico de barras de vendas por mês")}>
                            "Gráfico de vendas por mês"
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-md" onClick={() => setMessage("Qual foi o ROAS do Facebook Ads?")}>
                            "ROAS do Facebook Ads"
                          </Button>
                           <Button variant="outline" size="sm" className="rounded-full border-dashed border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all" onClick={() => {
                              const newChart: DynamicChart = {
                                id: `mock_chart_${Date.now()}`,
                                type: 'bar',
                                title: 'Vendas Q1 2024 (Mock)',
                                data: [
                                  { name: 'Jan', value: 4500 },
                                  { name: 'Fev', value: 3200 },
                                  { name: 'Mar', value: 5100 },
                                  { name: 'Abr', value: 4800 },
                                  { name: 'Mai', value: 6000 }
                                ],
                                config: { xKey: 'name', series: [{ dataKey: 'value', name: 'Vendas', color: '#6366f1' }] }
                              };
                              setDynamicCharts(prev => [...prev, newChart]);
                           }}>
                             Testar Layout
                           </Button>
                       </div>
                    </div>
                  ) : (
                   <ErrorBoundary>
                     <DashboardGrid
                       layouts={{ lg: dynamicCharts.map(c => ({ i: c.id, x: c.layout?.x || 0, y: c.layout?.y || 0, w: c.layout?.w || 6, h: c.layout?.h || 4 })) }}
                       onLayoutChange={onLayoutChange}
                     >
                        {dynamicCharts.map((chart) => (
                          <div key={chart.id} className="relative h-full">
                            <Card className="h-full w-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col group rounded-xl overflow-hidden">
                              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800/50 p-4 draggable-handle cursor-move select-none bg-slate-50/30 dark:bg-slate-800/10">
                                <div className="flex items-center gap-2">
                                  <GripHorizontal className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    {chart.title}
                                  </CardTitle>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" title="Expandir">
                                    <Maximize2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onMouseDown={(e) => e.stopPropagation()} onClick={() => removeChart(chart.id)} title="Remover">
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-4 flex-1 min-h-0 relative">
                                {renderDynamicChart(chart)}
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </DashboardGrid>
                   </ErrorBoundary>
                  )}
               </div>
            </div>

            {/* Chat (Right Column) */}
            <div className="w-full md:w-[500px] lg:w-[600px] h-[60vh] md:h-auto flex flex-col border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 z-0 shadow-sm order-1 md:order-2 backdrop-blur-sm">
               <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                       <Avatar className={`h-9 w-9 mt-1 shrink-0 ring-2 shadow-sm ${msg.type === 'user' ? 'ring-blue-100 dark:ring-blue-900' : 'ring-indigo-100 dark:ring-indigo-900'}`}>
                         <AvatarFallback className={msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}>
                           {msg.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                         </AvatarFallback>
                       </Avatar>
                       <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm relative ${
                         msg.type === 'user' 
                           ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-500/10' 
                           : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-slate-200/50 dark:shadow-none'
                       }`}>
                         <div className="markdown-content">
                           <ReactMarkdown 
                             remarkPlugins={[remarkGfm]}
                             components={{
                               // Customizar componentes para manter estilo consistente
                               p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                               strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                               em: ({node, ...props}) => <em className="italic" {...props} />,
                               ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                               ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                               li: ({node, ...props}) => <li className="" {...props} />,
                               table: ({node, ...props}) => <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700"><table className="min-w-full bg-white dark:bg-slate-900" {...props} /></div>,
                               thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-800" {...props} />,
                               th: ({node, ...props}) => <th className="px-3 py-2 text-left font-medium text-xs text-slate-500 uppercase tracking-wider" {...props} />,
                               td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap border-b border-slate-100 dark:border-slate-800" {...props} />,
                               a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                             }}
                           >
                             {msg.content}
                           </ReactMarkdown>
                         </div>
                       </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex gap-3 animate-in fade-in duration-300">
                       <Avatar className="h-9 w-9 mt-1 shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-900 shadow-sm">
                         <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white"><Bot className="h-5 w-5" /></AvatarFallback>
                       </Avatar>
                       <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                         <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Digitando</span>
                         <span className="flex gap-1">
                           <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                           <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                         </span>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>
               
               {/* Input Area */}
               <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shrink-0">
                  {/* Tools/Uploads */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                     <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                       <DialogTrigger asChild>
                         <Button variant="outline" size="sm" className="gap-2 rounded-full border-dashed border-slate-300 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs h-8 transition-colors">
                           <Upload className="h-3 w-3" /> Importar Dados
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-[425px]">
                         <DialogHeader>
                           <DialogTitle>Importar Fonte de Dados</DialogTitle>
                           <DialogDescription>Escolha como deseja alimentar a IA.</DialogDescription>
                         </DialogHeader>
                         <div className="grid gap-4 py-4">
                           <div className="grid grid-cols-3 gap-2">
                              <Button 
                                variant={uploadType === 'file' ? 'default' : 'outline'} 
                                onClick={() => setUploadType('file')}
                                className="w-full"
                              >
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Arquivo
                              </Button>
                              <Button 
                                variant={uploadType === 'url' ? 'default' : 'outline'} 
                                onClick={() => setUploadType('url')}
                                className="w-full"
                              >
                                <LinkIcon className="mr-2 h-4 w-4" /> URL
                              </Button>
                              <Button 
                                variant={uploadType === 'api' ? 'default' : 'outline'} 
                                onClick={() => setUploadType('api')}
                                className="w-full"
                              >
                                <Database className="mr-2 h-4 w-4" /> Integrações
                              </Button>
                           </div>

                           {uploadType === 'file' && (
                             <div className="grid w-full max-w-sm items-center gap-1.5">
                               <Input id="picture" type="file" onChange={handleFileUpload} />
                             </div>
                           )}

                           {uploadType === 'url' && (
                             <div className="grid w-full max-w-sm items-center gap-1.5">
                               <Input 
                                 type="url" 
                                 placeholder="https://docs.google.com/spreadsheets/..." 
                                 value={spreadsheetUrl}
                                 onChange={(e) => setSpreadsheetUrl(e.target.value)}
                               />
                             </div>
                           )}

                            {uploadType === 'api' && (
                             <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo <span className="text-red-500">*</span></label>
                                  <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o veículo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="facebook">Facebook Ads</SelectItem>
                                      <SelectItem value="tiktok" disabled>TikTok Ads (Em breve)</SelectItem>
                                      <SelectItem value="google" disabled>Google Ads (Em breve)</SelectItem>
                                      <SelectItem value="linkedin" disabled>LinkedIn Ads (Em breve)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Usuário <span className="text-red-500">*</span></label>
                                  <Select value={selectedPlatformUser} onValueChange={setSelectedPlatformUser}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o usuário" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {users.length > 0 ? users.map(user => (
                                        <SelectItem key={user.id} value={user.facebookId}>{user.username}</SelectItem>
                                      )) : <SelectItem value="none" disabled>Nenhum usuário encontrado</SelectItem>}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Conta de Anúncio <span className="text-slate-400 text-xs">(Opcional)</span></label>
                                  <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount} disabled={!selectedPlatformUser}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a conta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableAdAccounts.length > 0 ? availableAdAccounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.accountId || acc.id}>{acc.name}</SelectItem>
                                      )) : <SelectItem value="none" disabled>Nenhuma conta encontrada</SelectItem>}
                                    </SelectContent>
                                  </Select>
                                </div>
                             </div>
                           )}
                         </div>
                         <div className="flex justify-end">
                            <Button onClick={handleUploadSubmit} disabled={isAiLoading}>
                              {isAiLoading ? 'Processando...' : 'Carregar'}
                            </Button>
                         </div>
                       </DialogContent>
                     </Dialog>
                  </div>

                  <div className="relative flex items-center">
                    <Input 
                      placeholder="Pergunte sobre seus dados..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="pr-12 rounded-full border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-visible:ring-blue-500 h-11 shadow-sm"
                    />
                    <Button 
                      size="icon" 
                      className="absolute right-1.5 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                      onClick={sendMessage}
                      disabled={!message.trim() || isAiLoading}
                    >
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      IA pode cometer erros. Verifique informações importantes.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
