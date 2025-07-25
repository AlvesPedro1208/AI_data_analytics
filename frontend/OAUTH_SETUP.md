# 🔐 Configuração OAuth Facebook/Meta

Este guia explica como configurar a integração OAuth com o Facebook/Meta Ads seguindo o padrão da UTMify.

## 📋 Pré-requisitos

1. **Conta Facebook Developer**: [developers.facebook.com](https://developers.facebook.com)
2. **App Facebook configurado** com permissões de Ads
3. **Backend FastAPI** rodando na porta 8000
4. **PostgreSQL** para armazenar as integrações

## 🛠️ Configuração do Facebook App

### 1. Criar App no Facebook Developers

1. Acesse [Facebook Developers Console](https://developers.facebook.com)
2. Clique em "Criar App"
3. Selecione "Consumidor" ou "Empresa"
4. Preencha as informações básicas

### 2. Configurar Produtos

Adicione os seguintes produtos ao seu app:

- **Facebook Login**
- **Marketing API**

### 3. Configurar URLs de Redirecionamento

No Facebook Login > Configurações, adicione:

```
https://seudominio.com/oauth/callback
http://localhost:3000/oauth/callback (para desenvolvimento)
```

### 4. Configurar Permissões

Solicite as seguintes permissões:

- `ads_read` - Ler dados de campanhas
- `ads_management` - Gerenciar campanhas
- `business_management` - Acessar contas de negócios

### 5. Obter Credenciais

Anote suas credenciais:
- **App ID**: Encontrado em Configurações Básicas
- **App Secret**: Encontrado em Configurações Básicas

## ⚙️ Configuração do Backend

### 1. Instalar Dependências

```bash
pip install fastapi uvicorn requests psycopg2-binary sqlalchemy
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env`:

```bash
FACEBOOK_APP_ID=seu_app_id_aqui
FACEBOOK_APP_SECRET=seu_app_secret_aqui
DATABASE_URL=postgresql://usuario:senha@localhost:5432/database
```

### 3. Implementar Endpoints

Use o arquivo `backend-example.py` como base e implemente:

```python
# Adicione ao seu FastAPI
from fastapi import FastAPI, HTTPException
import os
import requests

app = FastAPI()

FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

@app.post("/oauth/facebook/import")
async def import_facebook_accounts(request: FacebookImportRequest):
    # Implementação completa no backend-example.py
    pass
```

## 🌐 Configuração do Frontend

### 1. Atualizar App ID

No arquivo `src/services/oauth.ts`, substitua:

```typescript
private static readonly FACEBOOK_APP_ID = 'SEU_APP_ID_AQUI';
```

### 2. Configurar Domínio

Para produção, atualize a URL base:

```typescript
private static readonly REDIRECT_URI = 'https://seudominio.com/oauth/callback';
```

## 🚀 Fluxo de Integração

### 1. Usuário Clica em "Facebook Ads"

```typescript
// Abre dialog OAuth similar à UTMify
handleOAuthIntegration(facebookType)
```

### 2. Popup do Facebook Abre

```typescript
// URL OAuth com permissões necessárias
const oauthUrl = FacebookOAuthService.getOAuthUrl();
window.open(oauthUrl, 'facebook-oauth', 'width=500,height=600');
```

### 3. Callback Processa Autorização

```typescript
// Página /oauth/callback processa o code
const accessToken = await FacebookOAuthService.exchangeCodeForToken(code);
const accounts = await FacebookOAuthService.getUserAdAccounts(accessToken);
```

### 4. Backend Importa Contas

```python
# FastAPI recebe e salva no PostgreSQL
@app.post("/oauth/facebook/import")
async def import_facebook_accounts(data):
    # Salvar todas as contas automaticamente
    for account in data.accounts:
        save_to_database(account)
```

### 5. Frontend Atualiza Lista

```typescript
// Lista de integrações é atualizada automaticamente
fetchIntegrations();
```

## 📱 Testando a Integração

### 1. Desenvolvimento Local

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
npm run dev
```

### 2. Acessar Aplicação

1. Abra `http://localhost:3000/product/integrations`
2. Clique no card "Facebook Ads"
3. Clique em "Continuar neste navegador"
4. Complete o login do Facebook
5. Verifique se as contas foram importadas

## 🔍 Debugging

### Logs Úteis

```javascript
// No browser console
console.log('OAuth URL:', FacebookOAuthService.getOAuthUrl());

// No backend
print(f"Access Token: {access_token}")
print(f"Accounts Found: {len(accounts)}")
```

### Erros Comuns

1. **"App ID não encontrado"**
   - Verificar se FACEBOOK_APP_ID está configurado
   
2. **"URL de callback inválida"**
   - Adicionar URL no Facebook Developers Console
   
3. **"Permissões insuficientes"**
   - Verificar se ads_read e ads_management estão aprovadas

## 🔒 Segurança

### Validações Importantes

1. **Verificar origem do popup**
2. **Validar state parameter**
3. **Verificar token no backend**
4. **Usar HTTPS em produção**

### Exemplo de Validação

```typescript
// Verificar origem da mensagem
if (event.origin !== window.location.origin) return;

// Verificar state parameter
if (!state || !state.startsWith('facebook_oauth_')) {
    throw new Error('Estado da requisição inválido');
}
```

## 📊 Monitoramento

### Métricas Importantes

- Taxa de sucesso do OAuth
- Número de contas importadas
- Tempo de resposta da API
- Erros de token expirado

### Logs Recomendados

```python
# Backend logging
import logging

logging.info(f"OAuth iniciado para user: {user_id}")
logging.info(f"Contas importadas: {len(accounts)}")
logging.error(f"Erro OAuth: {error}")
```

## 🎯 Próximos Passos

1. **Implementar refresh automático** de tokens
2. **Adicionar webhook** para atualizações
3. **Criar dashboard** de métricas OAuth
4. **Implementar rate limiting**
5. **Adicionar outras plataformas** (Google, LinkedIn)

---

💡 **Dica**: Teste primeiro em ambiente de desenvolvimento com contas de teste do Facebook antes de ir para produção!