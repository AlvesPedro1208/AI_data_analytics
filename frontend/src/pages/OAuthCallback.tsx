import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '@/services/oauth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando integração...');

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');

        if (error) {
          throw new Error(`Erro na autorização: ${error}`);
        }

        if (!code) {
          throw new Error('Código de autorização não encontrado');
        }

        // Verificar state para segurança
        if (!state || !state.startsWith('facebook_oauth_')) {
          throw new Error('Estado da requisição inválido');
        }

        setMessage('Obtendo token de acesso...');
        
        // Processar callback OAuth
        const result = await handleOAuthCallback(code);
        
        setMessage(`Importando ${result.accounts.length} contas...`);
        
        // Aguardar um pouco para mostrar o progresso
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus('success');
        setMessage(`${result.accounts.length} contas importadas com sucesso!`);
        
        toast({
          title: "Integração concluída!",
          description: `${result.accounts.length} contas do Facebook foram importadas.`,
        });

        // Redirecionar após 2 segundos
        setTimeout(() => {
          // Se a página foi aberta em popup, fechar
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_SUCCESS', data: result }, '*');
            window.close();
          } else {
            // Senão, redirecionar para integrações
            navigate('/product/integrations');
          }
        }, 2000);

      } catch (error) {
        console.error('Erro no callback OAuth:', error);
        
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro desconhecido');
        
        toast({
          title: "Erro na integração",
          description: error instanceof Error ? error.message : 'Erro desconhecido',
          variant: "destructive",
        });

        // Redirecionar após 3 segundos
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_ERROR', error: error }, '*');
            window.close();
          } else {
            navigate('/product/integrations');
          }
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [location, navigate, toast]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h2 className={`text-xl font-semibold mb-4 ${getStatusColor()}`}>
          {status === 'loading' && 'Processando...'}
          {status === 'success' && 'Sucesso!'}
          {status === 'error' && 'Erro'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {status === 'loading' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}
        
        {status !== 'loading' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {window.opener ? 'Fechando janela...' : 'Redirecionando...'}
          </p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;