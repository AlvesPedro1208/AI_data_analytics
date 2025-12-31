import { useState, useEffect } from 'react';
import { ProductLayout } from '@/components/ProductLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Monitor, Loader2, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { getSetting, saveSetting } from '@/services/settings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // Profile State
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Pedro Santos",
    username: "pedro_santos",
    email: "pedro@exemplo.com",
    bio: ""
  });

  // Password State
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    marketing: false,
    security: true,
    integration: true
  });

  // AI State
  const [geminiKey, setGeminiKey] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load AI Key
  useEffect(() => {
      const loadKey = async () => {
          const data = await getSetting('GEMINI_API_KEY');
          if (data) setGeminiKey(data.value);
      };
      loadKey();
  }, []);

  const handleSaveAI = async () => {
      setIsLoadingAI(true);
      try {
          await saveSetting('GEMINI_API_KEY', geminiKey);
          toast({ title: "Configuração salva", description: "Chave da API Gemini atualizada com sucesso." });
      } catch (e) {
          toast({ title: "Erro", description: "Falha ao salvar configuração.", variant: "destructive" });
      } finally {
          setIsLoadingAI(false);
      }
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    setIsLoadingProfile(true);
    // Mock API call
    setTimeout(() => {
      setIsLoadingProfile(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    }, 1000);
  };

  const handleUpdatePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (!passwordData.current || !passwordData.new) {
       toast({
        title: "Erro",
        description: "Preencha todos os campos de senha.",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingPassword(true);
    // Mock API call
    setTimeout(() => {
      setIsLoadingPassword(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com segurança.",
      });
    }, 1000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      toast({
        title: "Preferências atualizadas",
        description: `Notificações de ${getKeyLabel(key)} ${newState[key] ? 'ativadas' : 'desativadas'}.`,
      });
      return newState;
    });
  };

  const getKeyLabel = (key: string) => {
    switch(key) {
      case 'marketing': return 'Marketing';
      case 'security': return 'Segurança';
      case 'integration': return 'Integração';
      default: return '';
    }
  };

  return (
    <ProductLayout title="Configurações">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Tabs defaultValue="account" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar de Tabs - Vertical em Desktop */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-2 items-stretch justify-start">
                <TabsTrigger 
                  value="account" 
                  className="justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary data-[state=active]:text-primary rounded-lg transition-all"
                >
                  <User className="mr-2 h-4 w-4" />
                  Minha Conta
                </TabsTrigger>
                <TabsTrigger 
                  value="platform" 
                  className="justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary data-[state=active]:text-primary rounded-lg transition-all"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Plataforma
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary data-[state=active]:text-primary rounded-lg transition-all"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Inteligência Artificial
                </TabsTrigger>
              </TabsList>
            </aside>

            {/* Conteúdo das Tabs */}
            <div className="flex-1 space-y-6">
              
              {/* ABA MINHA CONTA */}
              <TabsContent value="account" className="mt-0 space-y-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight">Minha Conta</h2>
                  <p className="text-muted-foreground">
                    Gerencie suas informações pessoais e configurações de segurança.
                  </p>
                </div>

                <Separator />

                {/* Card: Perfil */}
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>
                      Informações públicas do seu perfil.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20 border-2 border-border">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">Alterar foto</Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, GIF ou PNG. Máximo de 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name" 
                          placeholder="Seu nome" 
                          value={profileData.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input 
                          id="username" 
                          placeholder="@usuario" 
                          value={profileData.username}
                          onChange={(e) => handleProfileChange('username', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        placeholder="Escreva um pouco sobre você" 
                        value={profileData.bio}
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isLoadingProfile}>
                      {isLoadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </CardFooter>
                </Card>

                {/* Card: Senha */}
                <Card>
                  <CardHeader>
                    <CardTitle>Senha</CardTitle>
                    <CardDescription>
                      Altere sua senha para manter sua conta segura.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={passwordData.current}
                        onChange={(e) => handlePasswordChange('current', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          value={passwordData.new}
                          onChange={(e) => handlePasswordChange('new', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          value={passwordData.confirm}
                          onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-end">
                    <Button variant="outline" onClick={handleUpdatePassword} disabled={isLoadingPassword}>
                      {isLoadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Atualizar Senha
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* ABA PLATAFORMA */}
              <TabsContent value="platform" className="mt-0 space-y-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight">Plataforma</h2>
                  <p className="text-muted-foreground">
                    Personalize sua experiência na plataforma.
                  </p>
                </div>

                <Separator />

                {/* Card: Aparência */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>
                      Customize como a plataforma se parece para você.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <div className="flex items-center gap-4">
                        <div 
                          className={cn(
                            "flex flex-col items-center gap-2 cursor-pointer group",
                            theme === 'light' ? "" : "opacity-50 hover:opacity-100"
                          )}
                          onClick={() => setTheme('light')}
                        >
                          <div className={cn(
                            "h-20 w-32 rounded-lg border-2 bg-background shadow-sm flex items-center justify-center transition-all",
                            theme === 'light' ? "border-primary" : "border-muted group-hover:border-primary/50"
                          )}>
                            <div className="h-14 w-24 bg-[#f4f4f5] rounded border border-border flex flex-col gap-1 p-1">
                                <div className="h-2 w-full bg-[#e4e4e7] rounded-sm"></div>
                                <div className="h-2 w-16 bg-[#e4e4e7] rounded-sm"></div>
                            </div>
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            theme === 'light' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}>Claro</span>
                        </div>

                        <div 
                          className={cn(
                            "flex flex-col items-center gap-2 cursor-pointer group",
                            theme === 'dark' ? "" : "opacity-50 hover:opacity-100"
                          )}
                          onClick={() => setTheme('dark')}
                        >
                          <div className={cn(
                            "h-20 w-32 rounded-lg border-2 bg-slate-950 shadow-sm flex items-center justify-center transition-all",
                            theme === 'dark' ? "border-primary" : "border-muted group-hover:border-primary/50"
                          )}>
                            <div className="h-14 w-24 bg-slate-800 rounded border border-slate-700 flex flex-col gap-1 p-1">
                                <div className="h-2 w-full bg-slate-600 rounded-sm"></div>
                                <div className="h-2 w-16 bg-slate-600 rounded-sm"></div>
                            </div>
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            theme === 'dark' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}>Escuro</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Selecione o tema de sua preferência para a interface.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card: Notificações */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>
                      Escolha como você deseja ser notificado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="marketing-emails" className="font-medium">Emails de Marketing</Label>
                        <span className="text-xs text-muted-foreground">Receba novidades sobre novos recursos e promoções.</span>
                      </div>
                      <Switch 
                        id="marketing-emails" 
                        checked={notifications.marketing}
                        onCheckedChange={() => toggleNotification('marketing')}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="security-emails" className="font-medium">Alertas de Segurança</Label>
                        <span className="text-xs text-muted-foreground">Receba alertas sobre atividades suspeitas na sua conta.</span>
                      </div>
                      <Switch 
                        id="security-emails" 
                        checked={notifications.security}
                        onCheckedChange={() => toggleNotification('security')}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="integration-alerts" className="font-medium">Status de Integrações</Label>
                        <span className="text-xs text-muted-foreground">Seja notificado quando uma integração falhar ou desconectar.</span>
                      </div>
                      <Switch 
                        id="integration-alerts" 
                        checked={notifications.integration}
                        onCheckedChange={() => toggleNotification('integration')}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Card: Preferências Regionais */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências Regionais</CardTitle>
                    <CardDescription>
                      Ajuste idioma e fuso horário.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select defaultValue="pt-br" onValueChange={(val) => toast({ title: "Idioma alterado", description: `Novo idioma selecionado: ${val}` })}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select defaultValue="sao-paulo" onValueChange={(val) => toast({ title: "Fuso horário alterado", description: `Novo fuso horário selecionado: ${val}` })}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Selecione o fuso horário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sao-paulo">Brasília (GMT-3)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time (ET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ABA INTELIGÊNCIA ARTIFICIAL */}
              <TabsContent value="ai" className="mt-0 space-y-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight">Inteligência Artificial</h2>
                  <p className="text-muted-foreground">
                    Configure os provedores de IA para análise de dados e geração de insights.
                  </p>
                </div>

                <Separator />

                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de IA</CardTitle>
                    <CardDescription>Gerencie o provedor de inteligência artificial usado na plataforma.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provedor de IA</Label>
                      <Select defaultValue="gemini">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">Google Gemini</SelectItem>
                          <SelectItem value="openai" disabled>OpenAI (Em breve)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gemini-key">Chave de API (Gemini)</Label>
                      <Input 
                        id="gemini-key" 
                        type="password" 
                        placeholder="Cole sua API Key do Google Gemini aqui" 
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        A chave é armazenada localmente no seu banco de dados e usada apenas para processar suas solicitações.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-4 flex justify-end">
                    <Button onClick={handleSaveAI} disabled={isLoadingAI}>
                      {isLoadingAI && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </div>
    </ProductLayout>
  );
};

export default Settings;
