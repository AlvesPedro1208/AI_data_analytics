# Roadmap do Projeto - AI Data Analytics

Este documento define o plano de ação estratégico para a evolução da plataforma de Engenharia de Dados e Business Intelligence com IA.

## 📅 Visão Geral
O objetivo é transformar o protótipo atual em um produto SaaS robusto, escalável e "revolucionário", utilizando arquitetura de referência (Medallion) e boas práticas de Engenharia de Software.

---

## 1. Fase de Planejamento (Atual)
**Foco:** Definição de escopo, arquitetura e processos.

- [x] Análise do código legado e funcionalidades existentes.
- [x] Definição da Visão do Produto (Engenharia + BI/IA).
- [ ] **Definição de Requisitos Funcionais e Não Funcionais** (Performance, Segurança, Escalabilidade).
- [ ] **Priorização do MVP**: Definir quais features do protótipo entram na v1.0.
- [ ] **Cronograma de Marcos**: Estabelecer datas para Alpha, Beta e Release.

## 2. Desenvolvimento Técnico (Execução)
**Foco:** Refatoração, implementação de padrões de projeto e qualidade de código.

### 🏗️ Arquitetura e Backend
- [ ] **Implementação da Clean Architecture**:
  - Separar camadas: *Domain*, *Use Cases* (Services), *Interfaces* (API) e *Infrastructure* (DB/External APIs).
  - Implementar **Padrão Repository** para isolar o acesso a dados.
  - Implementar **Dependency Injection** para desacoplamento.
- [ ] **Pipeline de Engenharia de Dados (Medallion)**:
  - **Bronze**: Ingestão de dados brutos (Raw) do Facebook/Google Ads.
  - **Silver**: Limpeza, deduplicação e padronização.
  - **Gold**: Agregações e métricas de negócio para a IA consumir.
- [ ] **Migração/Suporte a BigQuery**: Criar interfaces para permitir troca futura de PostgreSQL para BigQuery.

### 💻 Frontend e UX
- [ ] **Otimização de Componentes**: Padronização com ShadCN/UI.
- [ ] **Gerenciamento de Estado**: Avaliar necessidade de Context API global ou libraries como Zustand.
- [ ] **Feedback Visual**: Melhorar loaders e tratamento de erros nas requisições da IA.

### 🧪 Qualidade (QA)
- [ ] **Testes Unitários**: Pytest para Services e Use Cases.
- [ ] **Testes de Integração**: Validar fluxo API -> Banco -> IA.
- [ ] **Testes E2E**: Cypress ou Playwright para fluxos críticos do usuário.

## 3. Melhorias de Produto
**Foco:** Experiência do usuário e inteligência.

- [ ] **IA Contextual (RAG)**: Implementar Retrieval-Augmented Generation para que a IA consulte grandes volumes de dados sem estourar o contexto.
- [ ] **Dashboard Personalizável**: Permitir que usuários salvem os gráficos gerados pela IA em dashboards persistentes.
- [ ] **Métricas de Uso**: Monitorar tokens gastos, latência da IA e erros de geração.

## 4. Pré-Deploy (DevOps)
**Foco:** Infraestrutura e Operação.

- [ ] **Ambientes**: Configurar Development (Local), Staging e Production.
- [ ] **Dockerização**: Criar Dockerfile e docker-compose otimizados.
- [ ] **CI/CD**: Pipelines no GitHub Actions para testes e deploy automático.
- [ ] **Monitoramento**: Logs estruturados e monitoramento de saúde da API.

## 5. Pós-Deploy e Evolução
**Foco:** Feedback e Crescimento.

- [ ] Coleta de feedback de usuários Beta.
- [ ] Ajuste fino dos prompts da IA (Prompt Engineering).
- [ ] Expansão para novas integrações (Google Ads, LinkedIn Ads, TikTok Ads).

---

## 📐 Padrões Adotados
- **Backend**: Clean Architecture, Repository Pattern, Dependency Injection.
- **Frontend**: Component-Driven Development, Atomic Design (adaptado).
- **Dados**: Medallion Architecture (Bronze/Silver/Gold).
