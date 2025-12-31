import { ArrowRight, BarChart3, Bot, Database, Brain, Zap, CheckCircle2, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Link } from 'react-router-dom';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useState, useRef } from 'react';

const Index = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const plugin = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  const features = [
    {
      icon: <Database className="h-10 w-10 text-cyan-500" />,
      title: "Engenharia Automatizada", 
      description: "Extração, transformação e carga (ETL) automática de múltiplas fontes para seu Data Warehouse."
    },
    {
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      title: "IA Generativa de BI",
      description: "Nossa IA 'Lux' analisa seus dados, gera insights e responde perguntas de negócio em linguagem natural."
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-blue-500" />,
      title: "Dashboards Dinâmicos",
      description: "Gráficos criados instantaneamente pela IA com base nas suas perguntas e necessidades."
    }
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Head de Marketing, Growth Agency",
      content: "A Lux AI reduziu nosso tempo de relatório em 90%. O que levava dias agora é feito em segundos, e os insights automáticos nos ajudaram a escalar 3 clientes grandes.",
      avatar: "AS"
    },
    {
      name: "Carlos Mendes",
      role: "CTO, E-commerce Brasil",
      content: "A integração com nosso Data Warehouse foi perfeita. Finalmente temos uma visão unificada de Facebook, Google e TikTok Ads sem precisar de scripts complexos.",
      avatar: "CM"
    },
    {
      name: "Fernanda Torres",
      role: "Analista de BI Sênior, MediaTech",
      content: "Eu tinha receio que a IA fosse alucinar dados, mas a precisão é impressionante. Ela se tornou minha assistente pessoal para análises exploratórias.",
      avatar: "FT"
    },
    {
      name: "Ricardo Oliveira",
      role: "Diretor Comercial, VarejoX",
      content: "Os dashboards dinâmicos mudaram nossas reuniões semanais. Agora podemos responder perguntas da diretoria na hora, sem precisar pedir pro time de dados.",
      avatar: "RO"
    },
    {
      name: "Juliana Santos",
      role: "Growth Hacker, StartupOne",
      content: "A facilidade de conectar novas fontes de dados é absurda. Conectei meu CRM e o Google Ads em 5 minutos e já estava cruzando dados de LTV e CAC.",
      avatar: "JS"
    },
    {
      name: "Marcos Costa",
      role: "Gerente de Performance, AdsLtda",
      content: "O melhor investimento que fizemos este ano. A Lux AI não só automatizou o operacional, como nos deu insights que aumentaram nosso ROAS em 20%.",
      avatar: "MC"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Lux AI
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#solucao" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Solução</a>
            <a href="#recursos" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Recursos</a>
            <a href="#beneficios" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Benefícios</a>
            <Link to="/product">
              <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium px-6">
                Acessar Plataforma
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-slate-500"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-4 shadow-lg animate-in slide-in-from-top-5">
            <a href="#solucao" className="text-slate-600 dark:text-slate-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Solução</a>
            <a href="#recursos" className="text-slate-600 dark:text-slate-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Recursos</a>
            <a href="#beneficios" className="text-slate-600 dark:text-slate-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Benefícios</a>
            <Link to="/product" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 overflow-hidden min-h-[80vh] flex items-center">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
            <div className="flex-1 text-center lg:text-left animate-in slide-in-from-left-10 duration-700 fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 border border-blue-100 dark:border-blue-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Nova Geração de BI com IA
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Dados em <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Insights</span> Instantâneos
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Lux AI é o especialista em dados que sua empresa precisa. 
                Conecte suas fontes, converse com seus dados e tome decisões baseadas em evidências em segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/product">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-slate-500 dark:text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Setup em 5 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Sem código</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>IA Avançada</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative animate-in slide-in-from-right-10 duration-1000 fade-in">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="absolute top-0 w-full h-12 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="pt-12 p-6 space-y-6">
                   {/* Simulação de Interface de Chat/BI */}
                   <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300">
                        Olá! Sou a Lux. Analisei seus dados de campanhas do Facebook Ads. O CPA da campanha "Black Friday" caiu 15% esta semana. Gostaria de ver um gráfico comparativo?
                      </div>
                   </div>
                   <div className="flex gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400">EU</div>
                      </div>
                      <div className="bg-blue-600 text-white rounded-lg p-4 text-sm">
                        Sim, por favor. E me mostre também a tendência de conversão por dispositivo.
                      </div>
                   </div>
                   <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/50">
                      <div className="h-40 flex items-end justify-between gap-2 px-2">
                          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group">
                               <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-purple-500"></div>
                            </div>
                          ))}
                      </div>
                      <div className="mt-4 flex justify-between text-xs text-slate-400 font-mono">
                          <span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SAB</span><span>DOM</span>
                      </div>
                   </div>
                </div>
              </div>
              
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="solucao" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-slate-900 dark:text-white">
              A Plataforma Completa de Dados
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Unificamos a Engenharia de Dados e a Inteligência de Negócios em uma única solução fluida e automatizada.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:-translate-y-2 transition-all duration-300 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20">
                <CardContent className="p-10">
                  <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 w-fit shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="beneficios" className="py-24 px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-[60vh] flex items-center">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Velocidade de Implementação</h3>
                  <p className="text-slate-600 dark:text-slate-400">Esqueça projetos de dados de 6 meses. Com Lux AI, você conecta suas fontes e começa a ver insights no mesmo dia.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Arquitetura Medallion Nativa</h3>
                  <p className="text-slate-600 dark:text-slate-400">Organizamos seus dados automaticamente em camadas (Bronze, Silver, Gold) garantindo qualidade e governança sem esforço.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Analista 24/7</h3>
                  <p className="text-slate-600 dark:text-slate-400">Sua equipe de marketing não precisa aprender SQL. Eles apenas perguntam para a Lux e recebem respostas precisas.</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl rotate-3 opacity-20 blur-lg"></div>
                 <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                            <span className="font-semibold text-slate-900 dark:text-white">Performance de Mídia</span>
                            <span className="text-sm text-green-500 font-medium">+24.5% vs mês anterior</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Facebook Ads</span>
                                <span className="text-slate-900 dark:text-white font-medium">R$ 45.230</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Google Ads</span>
                                <span className="text-slate-900 dark:text-white font-medium">R$ 28.400</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                            </div>
                        </div>
                        <div className="pt-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                "Identifiquei uma oportunidade de redução de custo no Google Ads aumentando o investimento em palavras-chave de cauda longa."
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                                <Bot className="h-3 w-3" />
                                Insight da Lux
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 min-h-[60vh] flex items-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-slate-900 dark:text-white">
            Quem usa, recomenda
          </h2>
          
          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-6xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/3 p-2">
                  <div className="p-1 h-full">
                    <Card className="h-full border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/20 group hover:-translate-y-2 transition-all duration-300">
                      <CardContent className="p-8 flex flex-col gap-6 h-full justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 font-bold">
                                {testimonial.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                            "{testimonial.content}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Transforme seus dados em superpoderes
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Pare de perder tempo com planilhas e comece a tomar decisões estratégicas com IA.
              </p>
              <Link to="/product">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-7 h-auto font-bold shadow-xl border-0">
                  Começar Gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                L
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Lux AI
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">
              &copy; 2024 Lux Data Intelligence. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;