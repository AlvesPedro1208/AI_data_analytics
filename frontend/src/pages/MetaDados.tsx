import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Download, Filter, Search, Loader2, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ProductLayout } from '@/components/ProductLayout';
import { useToast } from "@/components/ui/use-toast";
import { getContas, ContaAPI } from '@/services/integrations';
import { getAllFacebookUsers, FacebookUser } from '@/services/oauth';
import { saveAs } from 'file-saver';

interface Usuario {
  id: number;
  nome: string;
}

const MetaDados = () => {
  const [dados, setDados] = useState<Array<Record<string, unknown>>>([]);
  const [filteredData, setFilteredData] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataInicial, setDataInicial] = useState<Date>();
  const [dataFinal, setDataFinal] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("campaign_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [usuarios, setUsuarios] = useState<FacebookUser[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<string>("");
  const [contas, setContas] = useState<ContaAPI[]>([]);
  const [contaSelecionada, setContaSelecionada] = useState<string>("");
  const [todasContas, setTodasContas] = useState<ContaAPI[]>([]);
  const [plataformaSelecionada, setPlataformaSelecionada] = useState<string>("Meta Ads");
  const [plataformasDisponiveis, setPlataformasDisponiveis] = useState<string[]>([]);
  const opcoesCampos = [
    { value: "account_id", label: "ID da Conta" },
    { value: "account_name", label: "Nome da Conta" },
    { value: "campaign_name", label: "Nome da Campanha" },
    { value: "campaign_id", label: "ID da Campanha" },
    { value: "adset_name", label: "Nome do Conjunto" },
    { value: "adset_id", label: "ID do Conjunto" },
    { value: "ad_name", label: "Nome do Anúncio" },
    { value: "ad_id", label: "ID do Anúncio" },
    { value: "impressions", label: "Impressões" },
    { value: "spend", label: "Valor Gasto" },
    { value: "reach", label: "Alcance" },
    { value: "clicks", label: "Cliques (Todos)" },
    { value: "unique_clicks", label: "Cliques Únicos" },
    { value: "cpc", label: "CPC (Custo por Clique)" },
    { value: "cpm", label: "CPM (Custo por 1000 Impressões)" },
    { value: "ctr", label: "CTR (Taxa de Cliques)" },
    { value: "frequency", label: "Frequência" },
    { value: "objective", label: "Objetivo" },
    { value: "buying_type", label: "Tipo de Compra" },
    { value: "optimization_goal", label: "Meta de Otimização" },
    { value: "actions", label: "Ações (Conversões/Eventos)" },
    { value: "action_values", label: "Valores das Ações" },
    { value: "cost_per_action_type", label: "Custo por Tipo de Ação" },
    { value: "website_ctr", label: "CTR no Site" },
    { value: "inline_link_clicks", label: "Cliques no Link (Inline)" },
    { value: "cost_per_inline_link_click", label: "Custo por Clique no Link" },
    { value: "date_start", label: "Data Início" },
    { value: "date_stop", label: "Data Fim" },
    { value: "age", label: "Idade" },
    { value: "gender", label: "Gênero" },
    { value: "country", label: "País" },
    { value: "region", label: "Região" },
    { value: "dma", label: "DMA" },
    { value: "impression_device", label: "Dispositivo de Impressão" },
    { value: "publisher_platform", label: "Plataforma (FB/IG/etc)" },
    { value: "platform_position", label: "Posicionamento" },
    { value: "device_platform", label: "Plataforma do Dispositivo" }
  ];

  // Campos padrão que serão selecionados automaticamente
  const camposPadrao = opcoesCampos.map(c => c.value);

  const [camposSelecionados, setCamposSelecionados] = useState<string[]>(camposPadrao);
  const camposObrigatorios = ["campaign_name", "adset_name", "ad_name", "impressions", "spend", "date_start", "date_stop"];
  const { toast } = useToast();

  const itemsPerPage = 10;

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        // Buscar usuários reais do OAuth
        const usuariosData = await getAllFacebookUsers();

        // Buscar contas do banco usando o serviço existente
        const contasData = await getContas();
        setTodasContas(contasData);

        // Extrair plataformas únicas
        const plataformas = Array.from(new Set(contasData.map(c => c.plataforma))).sort();
        setPlataformasDisponiveis(plataformas);
        
        // Se a plataforma atual não estiver na lista (e houver plataformas), selecione a primeira
        // Mas tente manter "Meta Ads" ou "Facebook Ads" como padrão se existirem
        let plataformaInicial = "Meta Ads";
        if (!plataformas.includes("Meta Ads") && !plataformas.includes("Facebook Ads")) {
             if (plataformas.length > 0) plataformaInicial = plataformas[0];
        } else if (plataformas.includes("Facebook Ads") && !plataformas.includes("Meta Ads")) {
             plataformaInicial = "Facebook Ads";
        }
        setPlataformaSelecionada(plataformaInicial);

        // Filtrar contas da plataforma inicial
        const contasFiltradas = contasData.filter(c => 
          c.plataforma === plataformaInicial && c.ativo
        );

        setUsuarios(usuariosData);
        setContas(contasFiltradas);

        // Seleciona automaticamente o primeiro usuário e conta
        if (usuariosData.length > 0) {
          setUsuarioSelecionado(usuariosData[0].facebook_id || "");
        }
        if (contasFiltradas.length > 0) {
          setContaSelecionada(contasFiltradas[0].identificador_conta);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os dados iniciais.",
        });
      }
    };

    carregarDadosIniciais();
  }, [toast]);

  // Atualizar contas quando a plataforma mudar
  useEffect(() => {
    if (todasContas.length > 0) {
      const contasFiltradas = todasContas.filter(c => 
        c.plataforma === plataformaSelecionada && c.ativo
      );
      setContas(contasFiltradas);
      
      // Resetar seleção de conta se a lista mudar
      if (contasFiltradas.length > 0) {
         // Tenta manter a conta se ela existir na nova lista (pouco provável entre plataformas diferentes, mas bom para reloads)
         const contaAindaExiste = contasFiltradas.some(c => c.identificador_conta === contaSelecionada);
         if (!contaAindaExiste) {
            setContaSelecionada(contasFiltradas[0].identificador_conta);
         }
      } else {
         setContaSelecionada("");
      }
    }
  }, [plataformaSelecionada, todasContas]);

  // Filtrar e ordenar dados
  useEffect(() => {
    const filtered = dados.filter(item => {
      const i = item as Record<string, unknown>;
      return (
        String(i.campaign_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.adset_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(i.ad_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Ordenação
    filtered.sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortField];
      const bValue = (b as Record<string, unknown>)[sortField];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [dados, searchTerm, sortField, sortDirection]);

  const obterDados = async () => {
    if (!usuarioSelecionado || !contaSelecionada) {
      toast({
        variant: "destructive",
        title: "Seleção obrigatória",
        description: "Por favor, selecione um usuário e uma conta.",
      });
      return;
    }

    setLoading(true);
    try {
      const request: any = {};
      if (usuarioSelecionado) request.user_facebook_id = usuarioSelecionado;
      if (contaSelecionada) request.account_id = contaSelecionada;
      if (camposSelecionados.length > 0) request.fields = camposSelecionados.join(",");
      if (dataInicial) request.data_inicial = format(dataInicial, "yyyy-MM-dd");
      if (dataFinal) request.data_final = format(dataFinal, "yyyy-MM-dd");

      // Validação final antes do fetch
      if (!request.user_facebook_id || !request.account_id || !request.fields) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios faltando",
          description: "user_facebook_id, account_id e fields são obrigatórios.",
        });
        setLoading(false);
        return;
      }

      console.log("DEBUG request /api/v1/meta/dados:", request);

      const response = await fetch("http://localhost:8000/api/v1/meta/dados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.erro) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: result.erro,
          });
          setLoading(false);
          return;
        }

        setDados(result.dados || []);
        toast({
          title: "Dados carregados",
          description: `${result.dados?.length || 0} registros obtidos com sucesso.`,
        });
      } else {
        setDados([]);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível obter dados reais do backend.",
        });
      }
    } catch (error) {
      console.error("Erro ao obter dados:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      "ACTIVE": "bg-green-100 text-green-800",
      "PAUSED": "bg-yellow-100 text-yellow-800",
      "DELETED": "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const [columns, setColumns] = useState<string[]>([]);

  // Atualizar colunas dinamicamente quando os dados mudarem
  useEffect(() => {
    if (dados.length > 0) {
      // Extrair todas as chaves únicas dos dados retornados
      const allKeys = Array.from(new Set(dados.flatMap(item => Object.keys(item))));
      
      // Definir uma ordem de prioridade para colunas comuns, se existirem
      const priorityFields = ['campaign_name', 'adset_name', 'ad_name', 'account_name', 'campaign_id', 'adset_id', 'ad_id'];
      
      const sortedKeys = allKeys.sort((a, b) => {
        const indexA = priorityFields.indexOf(a);
        const indexB = priorityFields.indexOf(b);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        return a.localeCompare(b);
      });

      setColumns(sortedKeys);
    }
  }, [dados]);

  // Helper para formatar o cabeçalho da coluna
  const formatHeader = (key: string) => {
    // Tenta encontrar um label pré-definido
    const option = opcoesCampos.find(opt => opt.value === key);
    if (option) return option.label;
    
    // Fallback: formata a chave (ex: "campaign_name" -> "Campaign Name")
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Função para exportar CSV
  const exportarCSV = () => {
    if (filteredData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Sem dados',
        description: 'Não há dados para exportar.'
      });
      return;
    }
    // Cabeçalhos baseados nas colunas dinâmicas
    const headers = columns.map(formatHeader);
    
    // Linhas
    const rows = filteredData.map(item => 
      columns.map(col => String(item[col] ?? '-'))
    );
    
    // Monta CSV
    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
      
    // Baixa arquivo com BOM UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'meta_ads_dados.csv');
  };

  return (
    <ProductLayout title="Dados da Meta Ads">
      <div className="h-full flex flex-col space-y-6 min-w-0">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Explorador de Dados</h2>
            <p className="text-muted-foreground mt-1">
              Configure filtros, extraia dados brutos da Meta Ads e exporte para análise.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUsuarioSelecionado("");
                setContaSelecionada("");
                setDataInicial(undefined);
                setDataFinal(undefined);
                setSearchTerm("");
                setCamposSelecionados(camposPadrao);
                setDados([]);
              }}
              className="hidden md:flex"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-5">
          {/* ... filters ... */}
          {/* Row 1: Context & Time */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Account Context (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label>Conexão (Plataforma)</Label>
                <Select value={plataformaSelecionada} onValueChange={setPlataformaSelecionada}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a plataforma..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plataformasDisponiveis.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Usuário</Label>
                <Select value={usuarioSelecionado} onValueChange={setUsuarioSelecionado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.facebook_id} value={u.facebook_id || "undefined"}>
                        {u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conta de Anúncios</Label>
                <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contas.map((c) => (
                      <SelectItem key={c.id} value={c.identificador_conta}>
                        {c.nome_conta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Separator for desktop */}
            <div className="hidden lg:flex justify-center lg:col-span-1">
               <Separator orientation="vertical" className="h-full" />
            </div>

            {/* Date Range (6 cols) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicial && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicial ? format(dataInicial, "dd/MM/yyyy") : "DD/MM/AAAA"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicial}
                      onSelect={setDataInicial}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFinal && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFinal ? format(dataFinal, "dd/MM/yyyy") : "DD/MM/AAAA"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFinal}
                      onSelect={setDataFinal}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Row 2: Search, Fields & Actions */}
          <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
               {/* Search */}
               <div className="space-y-2 flex-1">
                 <Label>Buscar</Label>
                 <div className="relative">
                   <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Campanha, conjunto ou anúncio..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10"
                   />
                 </div>
               </div>
               
               {/* Fields */}
               <div className="space-y-2 w-full sm:w-auto min-w-[200px]">
                 <Label>Colunas</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          {camposSelecionados.length} selecionadas
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Configurar Colunas</h4>
                          <p className="text-sm text-muted-foreground">
                            Selecione as métricas que deseja visualizar.
                          </p>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
                          {opcoesCampos.map((campo) => (
                             <div key={campo.value} className="flex items-center space-x-2">
                               <Checkbox 
                                 id={`field-${campo.value}`} 
                                 checked={camposSelecionados.includes(campo.value)}
                                 disabled={camposObrigatorios.includes(campo.value)}
                                 onCheckedChange={(checked) => {
                                    if (camposObrigatorios.includes(campo.value)) return;
                                    if (checked) setCamposSelecionados([...camposSelecionados, campo.value]);
                                    else setCamposSelecionados(camposSelecionados.filter(c => c !== campo.value));
                                 }}
                               />
                               <label htmlFor={`field-${campo.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                 {campo.label}
                               </label>
                             </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full lg:w-auto pt-4 lg:pt-0">
               <Button 
                 variant="secondary" 
                 onClick={exportarCSV} 
                 disabled={filteredData.length === 0}
                 className="flex-1 lg:flex-none"
               >
                 <Download className="mr-2 h-4 w-4" />
                 CSV
               </Button>
               <Button 
                 onClick={obterDados} 
                 disabled={loading}
                 className="flex-1 lg:flex-none min-w-[140px]"
               >
                 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                 Carregar Dados
               </Button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="border rounded-xl bg-card shadow-sm flex flex-col min-w-0 max-w-full overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
             <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">
                  {filteredData.length} registros
                </Badge>
                {filteredData.length > 0 && (
                   <span className="text-sm text-muted-foreground hidden sm:inline-block">
                     Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)}
                   </span>
                )}
             </div>
             {/* Pagination (Compact) */}
             {totalPages > 1 && (
               <div className="flex items-center gap-2">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages}
                 >
                   Próxima
                 </Button>
               </div>
             )}
          </div>

          <div className="w-full overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {columns.map(col => (
                      <TableHead key={col} className="whitespace-nowrap font-semibold">
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[active=true]:text-primary" 
                          onClick={() => handleSort(col)}
                          data-active={sortField === col}
                        >
                          {formatHeader(col)}
                          {sortField === col && (
                             <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length > 0 ? (
                    currentData.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                        {columns.map(col => (
                          <TableCell key={col} className="py-3 whitespace-nowrap">
                            {['status', 'effective_status', 'configured_status'].includes(col) ? (
                              getStatusBadge(String(item[col] ?? ""))
                            ) : (
                              <span className="text-sm">
                                {typeof item[col] === "number"
                                  ? (item[col] as number).toLocaleString()
                                  : String(item[col] ?? "-")}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={Math.max(columns.length, 1)} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <div className="rounded-full bg-muted p-4 mb-4">
                            <Download className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="text-lg font-medium">Nenhum dado carregado</p>
                          <p className="text-sm max-w-sm mt-1">
                            Selecione um usuário, conta e período acima, depois clique em "Carregar Dados" para visualizar.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Footer with secondary pagination if needed */}
          {filteredData.length > 0 && (
             <div className="p-4 border-t bg-muted/30 text-xs text-center text-muted-foreground">
                Dados fornecidos via API da Meta Ads • Atualizado em tempo real
             </div>
          )}
        </div>
      </div>
    </ProductLayout>
  );
};

export default MetaDados;