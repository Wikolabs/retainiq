import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es RetainIQ, un agent IA de prediction de churn et de re-engagement automatique. A partir d'un log d'activite client + metriques d'usage, tu calcules un score de risque, identifies les signaux et declenches une sequence de retention.

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

Tu DOIS inventer des chiffres realistes (jamais "je n'ai pas access aux donnees"). Tu joues un Head of Customer Success. Style analytique mais empathique. Maximum 450 mots.`;

const SYSTEM_PROMPT_EN = `You are RetainIQ, an AI churn prediction and automatic re-engagement agent. From a customer activity log + usage metrics, you compute a risk score, identify signals, and trigger a retention sequence.

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

You MUST invent realistic numbers (never "I have no data access"). You play a Head of Customer Success. Analytical but empathetic. Maximum 450 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const accountLog: string = typeof body.accountLog === "string" ? body.accountLog.slice(0, 1500) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!accountLog.trim()) {
      return NextResponse.json(
        { error: lang === "fr" ? "Collez le log du compte." : "Paste account log." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(accountLog, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Log d'activite compte client :\n${accountLog}\nGenere score churn + sequence de re-engagement.`
      : `Customer account activity log:\n${accountLog}\nGenerate churn score + re-engagement sequence.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      1200
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(accountLog: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🎯 Account profile**\n- ${accountLog.slice(0, 120).replace(/\n/g, " ")} — Enterprise tier, 2,400 EUR MRR, 14-month tenure, Pro plan.\n\n**📊 Churn score**\n- Risk: 78/100 → HIGH\n- 90-day churn probability: 64%\n- Model confidence: 87%\n\n**🧠 Detected signals**\n- Active users -42% over last 30 days (was 18, now 11).\n- Core feature "Automated workflows" unused since 38 days — historically the strongest retention driver for this segment.\n- Support ticket #4827 about API rate limits — pending >12 days, no internal owner assigned.\n\n**⚡ Root cause hypothesis**\n- Combination of unresolved technical friction (API limits) + lack of value perception on core feature = disengagement spiral. Likely triggered by departure of internal champion 6 weeks ago (LinkedIn signal).\n\n**📨 Automatic re-engagement sequence**\n- D1 — CSM email: "Quick check-in" | Hi Marc, noticed your team's usage shifted — wanted to make sure ticket #4827 isn't blocking you. I'm freeing 15min Thursday to look at it together if useful. Worth it?\n- D3 — In-app message: "We've shipped the API rate limit fix you reported — here's how to enable it ↗" with CTA "Activate now".\n- D7 — Personalized CSM call: 30min — script: "Identify replacement champion + propose free 1:1 training session on Automated workflows + 2-month price hold on renewal if usage rebounds 40%+ in 60 days."\n- D14 — C-level email: From our CEO to their CTO — "Here's what we're investing in to make sure your team gets full value" with concrete roadmap commit + offer for joint QBR.\n\n**📊 Expected outcome**\n- 58% of accounts on this signal profile are saved historically via this 4-touch sequence. Expected MRR preserved: ~1,392 EUR/month → ~16,700 EUR/year.`;
  }
  return `**🎯 Profil compte**\n- ${accountLog.slice(0, 120).replace(/\n/g, " ")} — Tier Enterprise, 2 400 EUR MRR, 14 mois d'anciennete, plan Pro.\n\n**📊 Score de churn**\n- Risque : 78/100 → ELEVE\n- Probabilite de churn 90j : 64%\n- Confidence modele : 87%\n\n**🧠 Signaux detectes**\n- Active users -42% sur 30j (etait 18, maintenant 11).\n- Feature cle "Automated workflows" inutilisee depuis 38 jours — historiquement le plus fort driver de retention sur ce segment.\n- Ticket support #4827 sur les rate limits API — en attente >12 jours, aucun owner interne assigne.\n\n**⚡ Root cause hypothesis**\n- Combinaison friction technique non resolue (API limits) + manque de valeur percue sur la feature core = spirale de desengagement. Probablement declenche par le depart du champion interne il y a 6 semaines (signal LinkedIn).\n\n**📨 Sequence de re-engagement auto**\n- J1 — Email CSM : "Petit point rapide" | Salut Marc, j'ai vu que l'usage de ton equipe a evolue — je voulais m'assurer que le ticket #4827 ne te bloque pas. Je libere 15min jeudi pour qu'on le regarde ensemble si utile. Ca te va ?\n- J3 — In-app message : "On a livre le fix sur les rate limits API que tu avais signale — voici comment l'activer ↗" avec CTA "Activer maintenant".\n- J7 — Appel CSM personnalise : 30min — script : "Identifier le champion de remplacement + proposer formation 1:1 gratuite sur Automated workflows + gel du prix 2 mois si l'usage rebondit +40% en 60 jours."\n- J14 — Email C-level : De notre CEO a leur CTO — "Voici ce qu'on investit pour s'assurer que ton equipe extrait toute la valeur" avec roadmap commit concret + proposition de QBR conjoint.\n\n**📊 Outcome attendu**\n- 58% des comptes sur ce profil de signaux sont sauves historiquement via cette sequence 4-touches. MRR preserve attendu : ~1 392 EUR/mois → ~16 700 EUR/an.`;
}
