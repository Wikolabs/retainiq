"""RetainIQ demo backend — production-ready POC.

In production: this service would also ingest product usage events, score
churn risk with a trained classifier, and trigger re-engagement sequences
through CSM tools. For the demo: it only invokes the LLM and returns the brief.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .llm import chat, is_configured

app = FastAPI(
    title="RetainIQ Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es RetainIQ, un agent IA de prediction de churn et de re-engagement automatique. A partir d'un log d'activite client + metriques d'usage, tu calcules un score de risque, identifies les signaux et declenches une sequence de retention.

Format de sortie exact en MARKDOWN :
**🎯 Profil compte**
- [1 ligne : segment client, MRR, anciennete, plan]

**📊 Score de churn**
- Risque : [XX/100 → FAIBLE / MOYEN / ELEVE / CRITIQUE]
- Probabilite de churn 90j : [XX%]
- Confidence modele : [XX%]

**🧠 Signaux detectes**
- [3 puces : signaux negatifs precis avec valeurs chiffrees, ex "logins -60% sur 30j", "feature key inutilisee depuis 45j", "ticket support en attente >7j"]

**⚡ Root cause hypothesis**
- [1-2 puces : ce qui a probablement declenche le desengagement, base sur le sequencement des signaux]

**📨 Sequence de re-engagement auto**
- J1 — Email CSM : [objet + corps 3 lignes, ton personnalise]
- J3 — In-app message : [copy 2 lignes max + CTA]
- J7 — Appel CSM personnalise : [script + offre concrete : extension trial, discount, formation 1:1]
- J14 — Email C-level : [si pas de reaction, escalade avec offre commerciale]

**📊 Outcome attendu**
- [1 puce : % de comptes sauves historiquement sur ce type de profil, MRR preserve]

Tu DOIS inventer des chiffres realistes (jamais "je n'ai pas access aux donnees"). Tu joues un Head of Customer Success. Style analytique mais empathique. Maximum 450 mots."""

SYSTEM_PROMPT_EN = """You are RetainIQ, an AI churn prediction and automatic re-engagement agent. From a customer activity log + usage metrics, you compute a risk score, identify signals, and trigger a retention sequence.

Exact MARKDOWN output format:
**🎯 Account profile**
- [1 line: customer segment, MRR, tenure, plan]

**📊 Churn score**
- Risk: [XX/100 → LOW / MEDIUM / HIGH / CRITICAL]
- 90-day churn probability: [XX%]
- Model confidence: [XX%]

**🧠 Detected signals**
- [3 bullets: precise negative signals with quantified values, e.g. "logins -60% over 30d", "key feature unused for 45d", "support ticket pending >7d"]

**⚡ Root cause hypothesis**
- [1-2 bullets: what likely triggered the disengagement, based on signal sequencing]

**📨 Automatic re-engagement sequence**
- D1 — CSM email: [subject + 3-line body, personalized tone]
- D3 — In-app message: [2-line copy max + CTA]
- D7 — Personalized CSM call: [script + concrete offer: trial extension, discount, 1:1 training]
- D14 — C-level email: [if no reaction, escalation with commercial offer]

**📊 Expected outcome**
- [1 bullet: % of accounts historically saved on this profile, MRR preserved]

You MUST invent realistic numbers (never "I have no data access"). You play a Head of Customer Success. Analytical but empathetic. Maximum 450 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    account_log: str
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "retainiq-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    account_log = (req.account_log or "").strip()[:1500]
    if not account_log:
        raise HTTPException(status_code=400, detail="empty_account_log")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Log d'activite compte client :\n{account_log}\nGenere score churn + sequence de re-engagement."
        if req.lang == "fr"
        else f"Customer account activity log:\n{account_log}\nGenerate churn score + re-engagement sequence."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(account_log, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=1200,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(account_log, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured or LLM fails)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(account_log: str, lang: str) -> str:
    snippet = account_log[:120].replace("\n", " ")
    if lang == "en":
        return (
            f"**🎯 Account profile**\n"
            f"- {snippet} — Enterprise tier, 2,400 EUR MRR, 14-month tenure, Pro plan.\n\n"
            f"**📊 Churn score**\n"
            f"- Risk: 78/100 → HIGH\n"
            f"- 90-day churn probability: 64%\n"
            f"- Model confidence: 87%\n\n"
            f"**🧠 Detected signals**\n"
            f"- Active users -42% over last 30 days (was 18, now 11).\n"
            f"- Core feature \"Automated workflows\" unused since 38 days — historically the strongest retention driver for this segment.\n"
            f"- Support ticket #4827 about API rate limits — pending >12 days, no internal owner assigned.\n\n"
            f"**⚡ Root cause hypothesis**\n"
            f"- Combination of unresolved technical friction (API limits) + lack of value perception on core feature = disengagement spiral. Likely triggered by departure of internal champion 6 weeks ago (LinkedIn signal).\n\n"
            f"**📨 Automatic re-engagement sequence**\n"
            f"- D1 — CSM email: \"Quick check-in\" | Hi Marc, noticed your team's usage shifted — wanted to make sure ticket #4827 isn't blocking you. I'm freeing 15min Thursday to look at it together if useful. Worth it?\n"
            f"- D3 — In-app message: \"We've shipped the API rate limit fix you reported — here's how to enable it ↗\" with CTA \"Activate now\".\n"
            f"- D7 — Personalized CSM call: 30min — script: \"Identify replacement champion + propose free 1:1 training session on Automated workflows + 2-month price hold on renewal if usage rebounds 40%+ in 60 days.\"\n"
            f"- D14 — C-level email: From our CEO to their CTO — \"Here's what we're investing in to make sure your team gets full value\" with concrete roadmap commit + offer for joint QBR.\n\n"
            f"**📊 Expected outcome**\n"
            f"- 58% of accounts on this signal profile are saved historically via this 4-touch sequence. Expected MRR preserved: ~1,392 EUR/month → ~16,700 EUR/year."
        )
    return (
        f"**🎯 Profil compte**\n"
        f"- {snippet} — Tier Enterprise, 2 400 EUR MRR, 14 mois d'anciennete, plan Pro.\n\n"
        f"**📊 Score de churn**\n"
        f"- Risque : 78/100 → ELEVE\n"
        f"- Probabilite de churn 90j : 64%\n"
        f"- Confidence modele : 87%\n\n"
        f"**🧠 Signaux detectes**\n"
        f"- Active users -42% sur 30j (etait 18, maintenant 11).\n"
        f"- Feature cle \"Automated workflows\" inutilisee depuis 38 jours — historiquement le plus fort driver de retention sur ce segment.\n"
        f"- Ticket support #4827 sur les rate limits API — en attente >12 jours, aucun owner interne assigne.\n\n"
        f"**⚡ Root cause hypothesis**\n"
        f"- Combinaison friction technique non resolue (API limits) + manque de valeur percue sur la feature core = spirale de desengagement. Probablement declenche par le depart du champion interne il y a 6 semaines (signal LinkedIn).\n\n"
        f"**📨 Sequence de re-engagement auto**\n"
        f"- J1 — Email CSM : \"Petit point rapide\" | Salut Marc, j'ai vu que l'usage de ton equipe a evolue — je voulais m'assurer que le ticket #4827 ne te bloque pas. Je libere 15min jeudi pour qu'on le regarde ensemble si utile. Ca te va ?\n"
        f"- J3 — In-app message : \"On a livre le fix sur les rate limits API que tu avais signale — voici comment l'activer ↗\" avec CTA \"Activer maintenant\".\n"
        f"- J7 — Appel CSM personnalise : 30min — script : \"Identifier le champion de remplacement + proposer formation 1:1 gratuite sur Automated workflows + gel du prix 2 mois si l'usage rebondit +40% en 60 jours.\"\n"
        f"- J14 — Email C-level : De notre CEO a leur CTO — \"Voici ce qu'on investit pour s'assurer que ton equipe extrait toute la valeur\" avec roadmap commit concret + proposition de QBR conjoint.\n\n"
        f"**📊 Outcome attendu**\n"
        f"- 58% des comptes sur ce profil de signaux sont sauves historiquement via cette sequence 4-touches. MRR preserve attendu : ~1 392 EUR/mois → ~16 700 EUR/an."
    )
