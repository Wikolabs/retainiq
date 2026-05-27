# RetainIQ — Intelligence de rétention client & analyse de churn

> Gardez vos clients. Chaque client perdu est un client qu'on aurait pu sauver.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-orange?style=flat)](https://xgboost.readthedocs.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)

---

## Vue d'ensemble

RetainIQ est une plateforme de prédiction et prévention du churn client. Elle utilise XGBoost pour prédire la probabilité de départ dans les 30 prochains jours, SHAP pour expliquer les facteurs, et un moteur de playbooks automatisés pour déclencher les bonnes actions de rétention (email personnalisé, appel proactif, offre de rétention).

**Domaine :** Customer Success / Revenue Retention  
**Port VM :** 3007 | **Sous-domaine :** retainiq.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Dashboard rétention, cohortes, playbooks |
| Backend | FastAPI (Python 3.11), Uvicorn | API churn scoring, playbooks, alertes |
| ML | XGBoost 2.0, SHAP | Churn prediction + feature explanation |
| Survival | lifelines (Kaplan-Meier) | Analyse de survie par cohorte |
| Base de données | PostgreSQL 16 | Clients, scores, actions, cohortes |
| Cache | Redis 7 | Cache scores, notifications push |
| Scheduler | APScheduler | Recalcul scores + déclenchement playbooks |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3007) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
xgboost==2.0.3
shap==0.45.1
lifelines==0.29.0
scikit-learn==1.4.2
pandas==2.2.2
numpy==1.26.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
redis==5.0.4
apscheduler==3.10.4
pydantic==2.7.1
```

---

## Architecture mono-repo

```
retainiq/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Dashboard rétention + KPIs
│   │   ├── customers/            # Liste clients avec risk score
│   │   ├── customers/[id]/       # Profil + timeline + SHAP
│   │   ├── cohorts/              # Analyse cohortes Kaplan-Meier
│   │   └── playbooks/            # Configuration actions automatiques
│   └── src/components/
│       ├── ChurnRiskCard.tsx     # Score risque + delta
│       ├── ShapExplain.tsx       # SHAP waterfall factors
│       ├── SurvivalCurve.tsx     # Courbe Kaplan-Meier cohortes
│       ├── PlaybookConfig.tsx    # Rule-based playbook builder
│       └── RetentionFunnel.tsx   # Funnel interventions → saved
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── customers.py      # CRUD + risk scores
│   │   │   ├── churn.py          # POST /predict, GET /explain
│   │   │   └── playbooks.py      # Déclenchement actions rétention
│   │   ├── services/
│   │   │   ├── churn_model.py    # XGBoost inference + batch scoring
│   │   │   ├── shap_engine.py    # SHAP TreeExplainer
│   │   │   ├── survival.py       # Kaplan-Meier par cohorte
│   │   │   └── playbook_runner.py# Conditions → actions automatiques
│   │   └── models/
│   │       ├── customer.py
│   │       └── playbook.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#dc2626', 'primaryTextColor': '#fff', 'primaryBorderColor': '#b91c1c', 'lineColor': '#374151', 'secondaryColor': '#fef2f2'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3007)"]
        NEXT["Next.js 14\nRetention Dashboard"]
        API["FastAPI"]
        SCHED["APScheduler\nBatch scoring daily"]

        subgraph ML["🧠 Churn Engine"]
            XGB["XGBoost\nChurn Probability 30d"]
            SHAP["SHAP Explainer\nTop risk factors"]
            KM["lifelines\nKaplan-Meier survival"]
        end

        PG[("PostgreSQL\nCustomers + Scores")]
        REDIS[("Redis\nNotifications + Cache")]
    end

    SCHED --> ML
    API --> ML
    ML --> REDIS
    REDIS --> NEXT
```

### Séquence — Batch scoring + déclenchement playbook

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#dc2626', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant SCHED as Scheduler (daily 6h)
    participant API as FastAPI
    participant XGB as XGBoost
    participant SHAP as SHAP
    participant PLAY as Playbook Runner
    participant CSM as CS Team

    SCHED->>API: trigger batch_score()

    loop pour chaque client actif
        API->>XGB: predict(features)
        XGB-->>API: churn_prob=0.78, delta=+0.15

        API->>SHAP: explain(customer_id)
        SHAP-->>API: top_factors=[{feature: "login_days_30d", value: -0.22}]

        API->>PLAY: evaluate_playbooks(customer_id, churn_prob=0.78)
        Note over PLAY: Rule: churn_prob > 0.7 AND tier=Enterprise
        PLAY-->>API: trigger="executive_call_playbook"
    end

    PLAY->>CSM: alert: "5 Enterprise at risk, call required"
    API-->>SCHED: batch complete: 847 scored, 5 high-risk triggered
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#dc2626', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    CUSTOMER {
        uuid id PK
        string name
        string tier
        float mrr
        float churn_probability
        string risk_level
        int login_days_30d
        int feature_usage_score
        int support_tickets_open
        timestamp contract_end_date
    }
    CHURN_SCORE {
        uuid id PK
        uuid customer_id FK
        float probability
        float delta_7d
        jsonb shap_values
        string top_risk_factor
        timestamp computed_at
    }
    PLAYBOOK {
        uuid id PK
        string name
        string trigger_condition
        string action_type
        jsonb action_config
        boolean is_active
    }
    RETENTION_ACTION {
        uuid id PK
        uuid customer_id FK
        uuid playbook_id FK
        string status
        string outcome
        timestamp triggered_at
        timestamp resolved_at
    }

    CUSTOMER ||--o{ CHURN_SCORE : "has"
    CUSTOMER ||--o{ RETENTION_ACTION : "receives"
    PLAYBOOK ||--o{ RETENTION_ACTION : "triggers"
```

---

## PRD

### Problème
Le churn est découvert quand le client envoie sa lettre de résiliation. Les équipes CS réagissent trop tard. Sans prédiction et sans playbooks standardisés, chaque CSM gère le churn de façon différente — avec des résultats inégaux.

### Solution
RetainIQ prédit le churn 30 jours à l'avance, explique les facteurs pour chaque client, et déclenche automatiquement le bon playbook de rétention selon le tier et le risque. Les CSMs interviennent sur les bons clients, avec le bon message, au bon moment.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| Customer Success Manager | Prioriser les comptes à risque, savoir quoi dire |
| VP Customer Success | Monitorer le taux de rétention, ROI des playbooks |
| CX Analyst | Analyser les causes racines du churn par segment |

### OKRs
- Net Revenue Retention (NRR) > 110%
- Churn rate mensuel < 2%
- Taux de succès des interventions de rétention > 45%

---

## User Stories

```
US-01 [CSM] En tant que Customer Success Manager,
      je veux voir chaque matin les 10 clients avec la plus forte probabilité de churn
      afin de planifier mes interventions de la semaine.

US-02 [CSM] En tant que CSM,
      je veux comprendre POURQUOI un client risque de churner
      (manque d'utilisation, tickets ouverts, concurrent identifié)
      afin d'adapter mon message d'intervention.

US-03 [VP CS] En tant que VP Customer Success,
      je veux voir les courbes Kaplan-Meier par cohorte (trim d'onboarding × tier)
      afin d'identifier les cohortes qui survivent moins bien.

US-04 [Admin] En tant qu'admin,
      je veux créer un playbook "Enterprise at risk > 0.7 → appel CEO dans 48h"
      afin de standardiser la réponse pour nos gros comptes.

US-05 [Analyst] En tant qu'analyste CX,
      je veux voir les features les plus corrélées au churn
      afin de guider le Product sur les améliorations prioritaires.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Seuils risque | > 0.7 = HIGH, 0.4-0.7 = MEDIUM, < 0.4 = LOW | ✅ Traffic light |
| R2 | Batch scoring | Recalcul toutes les nuits (6h UTC) | ✅ Last scored badge |
| R3 | Alert Enterprise | churn_prob > 0.6 AND tier=Enterprise → alerte immédiate | ✅ Alert demo |
| R4 | SHAP explain | Top 3 facteurs positifs et négatifs pour chaque client | ✅ Waterfall |
| R5 | Playbook conditions | IF churn_prob > threshold AND tier AND delta > 0.1 THEN action | ✅ Playbook builder |
| R6 | Cooldown actions | Max 1 intervention par type par client par 14 jours | ✅ Timeline |
| R7 | Saved definition | Client retained = pas de résiliation dans les 60j après intervention | ✅ Status toggle |
| R8 | MRR at risk | Σ(MRR × churn_prob) pour les clients HIGH risk | ✅ MRR at risk card |
| R9 | Segment analysis | Churn par (sector × tier × usage_quartile) | ✅ Cohort view |
| R10 | Contract cliff | Contrat se termine < 90j → risk +0.15 automatique | ✅ Renewal alert |

---

## Spécification API

**Base URL :** `http://retainiq.wikolabs.com/api/v1`

### GET /customers?risk=HIGH
```json
// Response: {"customers": [{"id": "c1", "name": "Acme Corp", "churn_prob": 0.82, "mrr": 4500, "delta_7d": +0.12}], "mrr_at_risk": 47000}
```

### POST /customers/{id}/score
```json
// Response: {"churn_probability": 0.78, "risk_level": "HIGH", "shap_top_factors": [{"feature": "login_days_30d", "impact": -0.22, "value": 3}], "recommended_playbook": "executive_call"}
```

### POST /playbooks/{id}/execute
```json
{"customer_id": "c1", "override_message": "..."}
// Response: {"action_id": "act_xyz", "status": "triggered", "action_type": "email_executive"}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Churn Risk List** | Tableau clients triés par churn_prob avec delta coloré |
| **SHAP Waterfall** | Explication facteurs pour chaque client |
| **Kaplan-Meier Chart** | Courbes de survie par cohorte (Recharts area) |
| **Playbook Builder** | Interface IF/THEN : conditions → actions |
| **MRR at Risk Card** | Total MRR exposé avec drill-down par tier |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: retainiq, POSTGRES_USER: ri_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://ri_user:${POSTGRES_PASSWORD}@postgres/retainiq
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]
    expose: ["8000"]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3007:80"]
volumes:
  pg_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] XGBoost churn prediction (features manuelles)
- [ ] Dashboard risk scoring
- [ ] Alertes email CSM

### Phase 2 — Automatisation
- [ ] Playbooks conditionnels
- [ ] SHAP explainability
- [ ] Kaplan-Meier survival curves

### Phase 3 — IA avancée
- [ ] Prédiction lifetime value (LTV)
- [ ] Recommandation d'offre de rétention personnalisée
- [ ] Intégration PulseScope (NPS + Churn combiné)

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
