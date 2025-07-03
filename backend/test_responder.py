import requests

url = "http://127.0.0.1:8000/gerar-grafico"

json_data = {
    "pedido": "Quero um gráfico com os lucros por produto.",
    "google_sheets_url": "https://docs.google.com/spreadsheets/d/1P7-a9D_rU5anT2YuGTU_QFkxkbNlrdTZeFECNPZITao/edit?usp=sharing"
}

response = requests.post(url, json=json_data)  # <- ENVIA JSON DIRETO
print("Status:", response.status_code)
print("Resposta:", response.json())
