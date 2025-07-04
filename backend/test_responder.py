import os
from openai import OpenAI
from dotenv import load_dotenv

# Carrega .env
load_dotenv()
api_key = os.getenv("TOGETHER_API_KEY")")
client = OpenAI(api_key=api_key)

# Prompt para teste
prompt = """
Você é um assistente de BI. Gere um JSON com o seguinte formato:

{
  "type": "bar",
  "title": "Exemplo de Gráfico",
  "data": [
    { "Categoria": "A", "Valor": 10 },
    { "Categoria": "B", "Valor": 20 }
  ],
  "config": {
    "xKey": "Categoria",
    "yKey": "Valor"
  }
}

Responda apenas com o JSON.
"""

try:
    response = client.chat.completions.create(
        model="gpt-4o",  # ou gpt-3.5-turbo
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1000,
    )

    content = response.choices[0].message.content
    print("\n✅ Resposta da IA:\n")
    print(content)

except Exception as e:
    print(f"\n❌ Erro: {e}")
