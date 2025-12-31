# Arquitetura do Sistema

Este documento descreve a arquitetura técnica alvo para a plataforma AI Data Analytics, seguindo os princípios de **Clean Architecture** e **Medallion Architecture** para dados.

## 1. Visão Geral (C4 Model - Nível 1)
O sistema é composto por três grandes blocos:
1.  **Frontend (SPA)**: Interface React para interação do usuário e visualização de dados.
2.  **Backend (API)**: Orchestrator central em FastAPI, gerenciando regras de negócio, IA e integrações.
3.  **Data Platform**: Pipeline de dados (ETL/ELT) e armazenamento (PostgreSQL/BigQuery).

## 2. Backend - Clean Architecture
Para garantir manutenibilidade e testabilidade, o backend será refatorado para seguir camadas concêntricas:

### Camadas
1.  **Domain (Core)**
    *   Entidades e Modelos de Negócio (ex: `User`, `AdAccount`, `Insight`).
    *   Interfaces (Protocolos) para Repositórios e Serviços Externos.
    *   *Regra*: Zero dependências externas. Python puro.

2.  **Application (Use Cases/Services)**
    *   Lógica de aplicação (ex: `GerarInsightService`, `SyncFacebookDataService`).
    *   Orquestra o fluxo de dados entre Repositórios e Domínio.
    *   *Regra*: Depende apenas do Domain.

3.  **Infrastructure (Adapters)**
    *   Implementação concreta das Interfaces.
    *   Banco de Dados (Postgres com `psycopg2` ou ORM).
    *   APIs Externas (Facebook Graph API, Together AI).
    *   *Regra*: Onde residem as bibliotecas e frameworks externos.

4.  **Interface (API)**
    *   Controllers/Routers do FastAPI.
    *   DTOs (Pydantic Models) para entrada/saída.
    *   Conversão de HTTP Requests para chamadas de Use Cases.

## 3. Arquitetura de Dados - Medallion (Bronze/Silver/Gold)
Para suportar a visão de Engenharia de Dados profissional:

*   **Bronze (Raw)**:
    *   Armazena os JSONs brutos retornados pelas APIs (Facebook/Google).
    *   Objetivo: Histórico imutável e reprocessamento.
    *   *Storage*: Tabela `raw_data` (JSONB) ou Bucket (GCS/S3).

*   **Silver (Clean)**:
    *   Dados filtrados, tipados e normalizados.
    *   Remoção de duplicatas e dados inválidos.
    *   *Storage*: Tabelas relacionais estruturadas (`campaigns`, `ads_insights`).

*   **Gold (Curated)**:
    *   Métricas agregadas e KPIs de negócio prontos para BI/IA.
    *   Ex: "Custo por Conversão Semanal", "ROAS por Campanha".
    *   *Storage*: Views ou tabelas agregadas otimizadas para leitura.

## 4. Fluxo de Integração com IA
1.  **Usuário** solicita insight/gráfico.
2.  **Backend** identifica o contexto (ex: "Campanhas do Cliente X").
3.  **Data Service** busca dados na camada **Gold** (já agregados).
4.  **IA Service** monta o prompt com metadados e amostra dos dados Gold.
5.  **LLM** retorna resposta estruturada (JSON) ou textual.
6.  **Backend** valida o JSON e devolve ao Frontend.

## 5. Stack Tecnológico
- **Linguagem**: Python 3.10+
- **Framework Web**: FastAPI
- **Banco de Dados**: PostgreSQL 14+ (Transicional), BigQuery (Alvo).
- **IA**: Together AI (Mistral/Mixtral/Llama-3).
- **Frontend**: React, TypeScript, Tailwind, ShadCN/UI, Recharts.
- **Infra**: Docker, GitHub Actions.
