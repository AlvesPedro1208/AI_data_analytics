import pandas as pd
import os
import requests
from dotenv import load_dotenv

load_dotenv()
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

def ler_planilha(uploaded_file=None, google_sheets_url=None):
    if google_sheets_url:
        try:
            if "/d/" in google_sheets_url:
                sheet_id = google_sheets_url.split("/d/")[1].split("/")[0]
                url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv"
                df = pd.read_csv(url)
            else:
                raise ValueError("URL do Google Sheets inválida.")
        except Exception as e:
            raise Exception(f"Erro ao ler planilha do Google Sheets: {str(e)}")
    elif uploaded_file:
        if uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
        else:
            df = pd.read_excel(uploaded_file)
    else:
        raise ValueError("Nenhuma fonte de dados fornecida.")

    df = df.dropna(axis=1, how='all')
    return df
