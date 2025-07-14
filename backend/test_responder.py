import requests
import dotenv
import os

dotenv.load_dotenv()

access_token = os.getenv("ACCESS_TOKEN")
ad_account_id = "act_428782437206685"

url = f"https://graph.facebook.com/v19.0/{ad_account_id}/insights"

params = {
    "access_token": access_token,
    "fields": "campaign_name,impressions,clicks,spend,cpm,ctr",
    "time_range[since]": "2025-03-01",
    "time_range[until]": "2025-12-31",
    "level": "campaign"
}

response = requests.get(url, params=params)

print("STATUS:", response.status_code)
print("RESPOSTA:", response.json())
