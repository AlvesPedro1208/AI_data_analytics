import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Filter, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ProductLayout } from '@/components/ProductLayout';
import { useToast } from "@/components/ui/use-toast";

interface MetaAdsData {
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  status: string;
  impressions: number;
  reach: number;
  clicks: number;
  cpc: number;
  spend: number;
  date_start: string;
  date_stop: string;
}

const MetaDados = () => {
  const [dados, setDados] = useState<MetaAdsData[]>([]);
  const [filteredData, setFilteredData] = useState<MetaAdsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataInicial, setDataInicial] = useState<Date>();
  const [dataFinal, setDataFinal] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof MetaAdsData>("campaign_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [contas, setContas] = useState<{ id: number; nome: string; account_id: string }[]>([]);
  const [contaSelecionada, setContaSelecionada] = useState<string>("");
  const { toast } = useToast();

  const itemsPerPage = 10;

  // Filtrar e ordenar dados
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const res = await fetch("http://localhost:8000/contas/");
        const data = await res.json();

        // Adapta os dados para o que o MetaDados precisa
        const contasMeta = data
          .filter((c: any) => ["Meta Ads", "Facebook Ads"].includes(c.plataforma) && c.ativo)
          .map((c: any) => ({
            id: c.id,
            nome: c.nome_conta,
            account_id: c.identificador_conta
          }));

        setContas(contasMeta);
        if (contasMeta.length > 0) setContaSelecionada(contasMeta[0].account_id);
      } catch (error) {
        console.error("Erro ao buscar contas conectadas:", error);
      }
    };

    fetchContas();
  }, []);

  useEffect(() => {
    let filtered = dados.filter(item =>
      item.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.adset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ad_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenação
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
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

  const recarregarDados = async () => {
    if (!dataInicial || !dataFinal) {
      alert("Por favor, selecione as datas inicial e final");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        access_token: "MOCK_TOKEN",
        account_id: contaSelecionada,
        data_inicial: format(dataInicial, "yyyy-MM-dd"),
        data_final: format(dataFinal, "yyyy-MM-dd")
      };

      const response = await fetch("http://localhost:8000/api/v1/meta/dados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.erro) {
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: result.erro,
          });
          return;
        }

        setDados(result.dados || []);
      } else {
        console.error("Erro ao carregar dados:", response.statusText);
        // Mock data para demonstração
        setDados([
          {
            campaign_name: "Campanha Black Friday",
            adset_name: "Conjunto Produtos",
            ad_name: "Anúncio Desconto 50%",
            status: "ACTIVE",
            impressions: 15420,
            reach: 12350,
            clicks: 324,
            cpc: 0.75,
            spend: 243.00,
            date_start: "2025-07-01",
            date_stop: "2025-07-13"
          },
          {
            campaign_name: "Campanha Verão",
            adset_name: "Conjunto Roupas",
            ad_name: "Anúncio Coleção Verão",
            status: "PAUSED",
            impressions: 8950,
            reach: 7200,
            clicks: 156,
            cpc: 1.20,
            spend: 187.20,
            date_start: "2025-07-01",
            date_stop: "2025-07-13"
          }
        ]);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof MetaAdsData) => {
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

  return (
    <ProductLayout title="Dados da Meta Ads">
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize os dados brutos das suas campanhas importadas da Meta Ads.
          </p>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Data Inicial */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Data Inicial
                </label>
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
                      {dataInicial ? format(dataInicial, "dd/MM/yyyy") : "Selecionar data"}
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

              {/* Data Final */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Data Final
                </label>
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
                      {dataFinal ? format(dataFinal, "dd/MM/yyyy") : "Selecionar data"}
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

              {/* Busca */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome da campanha, conjunto ou anúncio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Dropdown de Contas Meta Ads */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Conta Meta Ads
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={contaSelecionada}
                  onChange={(e) => setContaSelecionada(e.target.value)}
                >
                  {contas.map((conta) => (
                    <option key={conta.id} value={conta.account_id}>
                      {conta.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão Recarregar */}
              <div className="flex items-end">
                <Button 
                  onClick={recarregarDados} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Recarregar Dados da Meta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort("campaign_name")}
                    >
                      Nome da Campanha {sortField === "campaign_name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort("adset_name")}
                    >
                      Conjunto {sortField === "adset_name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort("ad_name")}
                    >
                      Anúncio {sortField === "ad_name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                      onClick={() => handleSort("impressions")}
                    >
                      Impressões {sortField === "impressions" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                      onClick={() => handleSort("reach")}
                    >
                      Alcance {sortField === "reach" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                      onClick={() => handleSort("clicks")}
                    >
                      Cliques {sortField === "clicks" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                      onClick={() => handleSort("cpc")}
                    >
                      CPC {sortField === "cpc" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                      onClick={() => handleSort("spend")}
                    >
                      Gasto {sortField === "spend" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.campaign_name}</TableCell>
                        <TableCell>{item.adset_name}</TableCell>
                        <TableCell>{item.ad_name}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">{item.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.reach.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">R$ {item.cpc.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {item.spend.toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(item.date_start), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{format(new Date(item.date_stop), "dd/MM/yyyy")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                        Nenhum dado encontrado. Clique em "Recarregar Dados da Meta" para importar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredData.length > 0 && (
                 <div className="px-4 py-2 text-sm text-muted-foreground flex justify-end">
                    Mostrando {startIndex + 1}–{Math.min(endIndex, filteredData.length)} de {filteredData.length} campanhas
                 </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </ProductLayout>
  );
};

export default MetaDados;