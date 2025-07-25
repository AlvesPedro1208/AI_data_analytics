import requests
from typing import List, Dict, Any, Optional

def get_user_business_managers(access_token: str) -> List[Dict[str, Any]]:
    """
    Recupera todas as Business Managers às quais o usuário tem acesso.
    
    Args:
        access_token: Token de acesso do Facebook
        
    Returns:
        Lista de Business Managers com informações básicas
    """
    # Primeiro, obtemos o ID do usuário atual
    me_url = "https://graph.facebook.com/v19.0/me"
    me_response = requests.get(me_url, params={"access_token": access_token})
    
    if not me_response.ok:
        error_msg = me_response.json().get("error", {}).get("message", "Erro desconhecido")
        raise Exception(f"Falha ao obter dados do usuário: {error_msg}")
    
    user_id = me_response.json().get("id")
    
    # Agora, obtemos as Business Managers
    bm_url = f"https://graph.facebook.com/v19.0/{user_id}/businesses"
    bm_response = requests.get(bm_url, params={
        "access_token": access_token,
        "fields": "id,name,verification_status,sharing_eligibility_status,created_time"
    })
    
    if not bm_response.ok:
        error_msg = bm_response.json().get("error", {}).get("message", "Erro desconhecido")
        raise Exception(f"Falha ao obter Business Managers: {error_msg}")
    
    business_data = bm_response.json().get("data", [])
    
    return [
        {
            "id": bm.get("id"),
            "nome": bm.get("name"),
            "status_verificacao": bm.get("verification_status"),
            "status_compartilhamento": bm.get("sharing_eligibility_status"),
            "data_criacao": bm.get("created_time")
        }
        for bm in business_data
    ]

def get_ad_accounts_from_business(access_token: str, business_id: str) -> List[Dict[str, Any]]:
    """
    Recupera todas as contas de anúncios associadas a uma Business Manager específica.
    
    Args:
        access_token: Token de acesso do Facebook
        business_id: ID da Business Manager
        
    Returns:
        Lista de contas de anúncios
    """
    url = f"https://graph.facebook.com/v19.0/{business_id}/owned_ad_accounts"
    response = requests.get(url, params={
        "access_token": access_token,
        "fields": "id,name,account_status,amount_spent,currency,business,owner"
    })
    
    if not response.ok:
        error_msg = response.json().get("error", {}).get("message", "Erro desconhecido")
        raise Exception(f"Falha ao obter contas de anúncios: {error_msg}")
    
    ad_accounts = response.json().get("data", [])
    
    return [
        {
            "identificador_conta": account.get("id").replace("act_", ""),
            "nome_conta": account.get("name"),
            "status": account.get("account_status"),
            "business_id": business_id,
            "owner": account.get("owner", {}).get("id")
        }
        for account in ad_accounts
    ]

def get_all_user_ad_accounts(access_token: str) -> List[Dict[str, Any]]:
    """
    Recupera todas as contas de anúncios às quais o usuário tem acesso diretamente (não via Business Manager).
    
    Args:
        access_token: Token de acesso do Facebook
        
    Returns:
        Lista de contas de anúncios
    """
    url = "https://graph.facebook.com/v19.0/me/adaccounts"
    response = requests.get(url, params={
        "access_token": access_token,
        "fields": "id,name,account_status,amount_spent,currency,business,owner"
    })
    
    if not response.ok:
        error_msg = response.json().get("error", {}).get("message", "Erro desconhecido")
        raise Exception(f"Falha ao obter contas de anúncios: {error_msg}")
    
    ad_accounts = response.json().get("data", [])
    
    return [
        {
            "identificador_conta": account.get("id").replace("act_", ""),
            "nome_conta": account.get("name"),
            "status": account.get("account_status"),
            "business_id": account.get("business", {}).get("id") if account.get("business") else None,
            "owner": account.get("owner", {}).get("id")
        }
        for account in ad_accounts
    ]

def get_all_fb_assets(access_token: str) -> Dict[str, Any]:
    """
    Recupera todas as Business Managers e suas respectivas contas de anúncios,
    bem como contas de anúncios acessadas diretamente.
    
    Args:
        access_token: Token de acesso do Facebook
        
    Returns:
        Dicionário com Business Managers e contas de anúncios
    """
    try:
        # Obter BMs
        business_managers = get_user_business_managers(access_token)
        
        # Para cada BM, obter contas de anúncios
        for bm in business_managers:
            try:
                bm["ad_accounts"] = get_ad_accounts_from_business(access_token, bm["id"])
            except Exception as e:
                bm["ad_accounts"] = []
                bm["error"] = str(e)
        
        # Obter contas de anúncios diretas
        direct_ad_accounts = get_all_user_ad_accounts(access_token)
        
        # Filtrar contas diretas que não estão em BMs
        bm_account_ids = set()
        for bm in business_managers:
            for account in bm.get("ad_accounts", []):
                bm_account_ids.add(account["identificador_conta"])
        
        direct_only_accounts = [
            account for account in direct_ad_accounts 
            if account["identificador_conta"] not in bm_account_ids
        ]
        
        return {
            "business_managers": business_managers,
            "direct_ad_accounts": direct_only_accounts
        }
    
    except Exception as e:
        # Caso falhe a obtenção de BMs, tentar pelo menos as contas diretas
        try:
            direct_ad_accounts = get_all_user_ad_accounts(access_token)
            return {
                "business_managers": [],
                "direct_ad_accounts": direct_ad_accounts,
                "error_bm": str(e)
            }
        except Exception as inner_e:
            return {
                "business_managers": [],
                "direct_ad_accounts": [],
                "error": f"BM Error: {str(e)}. Ad Accounts Error: {str(inner_e)}"
            }