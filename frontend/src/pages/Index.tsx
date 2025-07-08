import { ArrowRight, Star, Check, Globe, Zap, Shield, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useDarkMode } from '@/hooks/useDarkMode';

const Index = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const features = [
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: "Alcance Global", 
      description: "Conecte-se com clientes ao redor do mundo com nossa plataforma internacional."
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-500" />,
      title: "Velocidade Extrema",
      description: "Performance otimizada para garantir a melhor experiência do usuário."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Segurança Total",
      description: "Proteção avançada para seus dados e informações confidenciais."
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "CEO, TechCorp",
      content: "Transformou completamente nossa forma de trabalhar. Resultados incríveis!",
      rating: 5
    },
    {
      name: "João Santos", 
      role: "Diretor, InnovaCo",
      content: "A melhor decisão que tomamos para nosso negócio. Recomendo 100%!",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Gerente, StartupXYZ", 
      content: "Interface intuitiva e resultados surpreendentes. Superou expectativas!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50 transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YourBrand
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#inicio" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Início</a>
            <a href="#sobre" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sobre</a>
            <a href="#recursos" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Recursos</a>
            <a href="#contato" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contato</a>
            <Link to="/product" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-9 w-9 p-0"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link to="/product">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Acessar Produto
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              O Futuro é Agora
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
              Revolucione sua forma de trabalhar com nossa plataforma inovadora. 
              Tecnologia de ponta para resultados extraordinários.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/product">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 hover-scale">
                  Experimente Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover-scale border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-16 px-6 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
              Por Que Escolher Nossa Solução?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Combinamos inovação, performance e segurança para oferecer a melhor experiência possível.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg transition-colors duration-300">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">Interface Intuitiva</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Design pensado para máxima usabilidade e produtividade.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg transition-colors duration-300">
                  <Check className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">Suporte 24/7</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Equipe especializada sempre pronta para ajudar você.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg transition-colors duration-300">
                  <Check className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-300">Atualizações Constantes</h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Sempre na vanguarda da tecnologia com melhorias contínuas.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl transition-colors duration-300">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">99.9%</div>
                <div className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">Uptime Garantido</div>
                
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 transition-colors duration-300">10M+</div>
                <div className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">Usuários Satisfeitos</div>
                
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2 transition-colors duration-300">24/7</div>
                <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Suporte Disponível</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Descubra as funcionalidades que vão transformar sua produtividade.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-scale transition-all duration-300 hover:shadow-xl border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Histórias reais de sucesso e transformação.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic transition-colors duration-300">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 transition-colors duration-300">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Pronto Para Começar?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto transition-colors duration-300">
            Junte-se a milhões de usuários que já transformaram seus negócios.
          </p>
          <Link to="/product">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 hover-scale">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="py-12 px-6 bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                YourBrand
              </div>
              <p className="text-gray-400 dark:text-gray-500 leading-relaxed transition-colors duration-300">
                Transformando o futuro através da tecnologia e inovação.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-300 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
            <p>&copy; 2024 YourBrand. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;