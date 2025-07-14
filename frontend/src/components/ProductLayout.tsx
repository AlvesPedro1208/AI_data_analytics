import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ArrowLeft, Moon, Sun, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
}

function ProductHeader({ title, showBackButton = true }: { title?: string; showBackButton?: boolean }) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        
        {title && (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="relative"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {showBackButton && (
          <Button onClick={handleBackClick} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>
    </header>
  );
}

export function ProductLayout({ children, title, showBackButton = true }: ProductLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <ProductHeader title={title} showBackButton={showBackButton} />
          
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}