export default function RetainIQ() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-amber-50/95 backdrop-blur border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="font-bold text-amber-900 text-xl" style={{ fontFamily: "var(--font-display)" }}>RetainIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-amber-800">
            <a href="#signals" className="hover:text-amber-600 transition-colors">Signaux churn</a>
            <a href="#dashboard" className="hover:text-amber-600 transition-colors">Dashboard</a>
            <a href="#roi" className="hover:text-amber-600 transition-colors">ROI</a>
          </div>
          <a href="#cta" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">
            Réduire mon churn
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-8">
            🛡️ Détection comportementale du churn — temps réel
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-amber-950 leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
            75% du churn détecté<br />
            <span className="text-amber-600">avant qu&apos;il se produise.</span>
          </h1>
          <p className="text-amber-800 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            RetainIQ surveille chaque comportement utilisateur, score le risque de désabonnement en temps réel et déclenche automatiquement les séquences de réengagement personnalisées.
          </p>

          {/* Dashboard KPI preview */}
          <div className="bg-white rounded-3xl shadow-xl shadow-amber-200 border border-amber-100 p-6 max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>RetainIQ — Vue d&apos;ensemble</span>
              <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-semibold">● Live</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: "Churn évité", value: "€42k", trend: "+12%", green: true },
                { label: "À risque", value: "23", trend: "↓ 8 hier", green: false },
                { label: "Réengagés", value: "156", trend: "ce mois", green: true },
                { label: "Score moyen", value: "87/100", trend: "Sain", green: true },
              ].map((k) => (
                <div key={k.label} className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                  <div className="text-lg font-bold text-amber-950" style={{ fontFamily: "var(--font-display)" }}>{k.value}</div>
                  <div className="text-xs text-amber-600 font-medium">{k.label}</div>
                  <div className={`text-xs font-semibold mt-1 ${k.green ? "text-green-600" : "text-red-500"}`}>{k.trend}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { user: "Acme Corp", score: 28, risk: "Critique", action: "Email CEO envoyé" },
                { user: "TechStart SAS", score: 45, risk: "Élevé", action: "Séquence warm-up" },
                { user: "MediaGroup", score: 67, risk: "Modéré", action: "Feature tour déclenché" },
              ].map((row) => (
                <div key={row.user} className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-700">{row.user[0]}</div>
                  <div className="flex-1 text-sm font-medium text-gray-800">{row.user}</div>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.score < 40 ? "bg-red-500" : row.score < 60 ? "bg-amber-400" : "bg-yellow-500"}`} style={{ width: `${row.score}%` }} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.score < 40 ? "bg-red-100 text-red-700" : row.score < 60 ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700"}`}>{row.risk}</span>
                  <div className="text-xs text-green-600 font-semibold hidden md:block">{row.action}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#cta" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-200">
              Réduire mon churn →
            </a>
            <a href="#signals" className="bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-400 px-8 py-4 rounded-xl font-bold text-lg transition-all">
              Voir les signaux
            </a>
          </div>
        </div>
      </section>

      {/* CHURN SIGNALS */}
      <section id="signals" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-950 text-center mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Les signaux que RetainIQ détecte
          </h2>
          <p className="text-amber-700 text-center text-lg mb-12">Que vos clients vous quittent en silence ou bruyamment — RetainIQ le voit avant vous.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📉", title: "Baisse d'usage", signals: ["Connexions espacées", "Features clés non utilisées", "Sessions < 30 secondes", "Tickets support non résolus"], color: "bg-red-50 border-red-100" },
              { icon: "💬", title: "Signaux négatifs", signals: ["NPS en baisse", "Plainte en ticket", "Mention négative sur Slack/Twitter", "Demande de données d'export"], color: "bg-amber-50 border-amber-100" },
              { icon: "🔍", title: "Comportements suspects", signals: ["Recherche de documentation de migration", "Visite page annulation", "Comparaison avec concurrents", "Expiration imminente non renouvelée"], color: "bg-yellow-50 border-yellow-100" },
            ].map((g) => (
              <div key={g.title} className={`${g.color} border rounded-2xl p-6`}>
                <div className="text-4xl mb-4">{g.icon}</div>
                <h3 className="font-bold text-amber-950 text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>{g.title}</h3>
                {g.signals.map(s => (
                  <div key={s} className="flex items-center gap-2 mb-2 text-sm text-amber-800">
                    <span className="text-amber-400 font-bold">→</span>{s}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RETENTION FLOW */}
      <section id="dashboard" className="py-20 bg-amber-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Réengagement automatique
          </h2>
          <p className="text-amber-300 text-lg mb-12">Quand un risque est détecté, RetainIQ agit sans attendre.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { score: "< 40", label: "Risque critique", action: "Email CEO personnalisé + appel CS déclenché en 2h", bg: "bg-red-900/50 border-red-700" },
              { score: "40–65", label: "Risque élevé", action: "Séquence email 3 jours + offre de support prioritaire", bg: "bg-amber-900/50 border-amber-700" },
              { score: "65–80", label: "Risque modéré", action: "Feature tour + check-in automatique à J+7", bg: "bg-yellow-900/50 border-yellow-700" },
            ].map((r) => (
              <div key={r.score} className={`${r.bg} border rounded-2xl p-6 text-left`}>
                <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>{r.score}</div>
                <div className="text-amber-300 font-semibold text-sm mb-3">{r.label}</div>
                <p className="text-amber-200 text-sm leading-relaxed">{r.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section id="roi" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-950 text-center mb-12" style={{ fontFamily: "var(--font-display)" }}>
            L&apos;impact financier est immédiat
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { value: "75%", label: "du churn détecté à l'avance" },
              { value: "€42k", label: "de MRR sauvé en moyenne / mois" },
              { value: "3×", label: "de ROI sur le premier trimestre" },
            ].map((s) => (
              <div key={s.label} className="text-center p-8 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="text-5xl font-bold text-amber-600 mb-2" style={{ fontFamily: "var(--font-display)" }}>{s.value}</div>
                <div className="text-amber-700 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <blockquote className="text-xl font-medium text-amber-950 mb-5 leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
              &ldquo;Notre churn mensuel est passé de 8% à 2.1% en 4 mois. RetainIQ a identifié des clients à risque qu&apos;on n&apos;aurait jamais vus — et les a réengagés avant qu&apos;ils partent.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-700">AP</div>
              <div className="text-left">
                <div className="font-semibold text-amber-950">Alexandre P.</div>
                <div className="text-sm text-amber-500">CEO, SaaS B2B 200 clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 bg-gradient-to-br from-amber-500 to-yellow-500">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Vos premiers signaux détectés aujourd&apos;hui
          </h2>
          <p className="text-amber-100 text-xl mb-10">Connexion en 1h. Premiers scores de churn sous 24h.</p>
          <a href="mailto:hello@wikolabs.com?subject=RetainIQ — Demande de démo" className="inline-block bg-white text-amber-700 hover:bg-amber-50 px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-xl">
            Réduire mon churn →
          </a>
          <p className="text-amber-200 text-sm mt-5">14 jours gratuits · Sans carte bancaire · Intégration CRM incluse</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-amber-950 text-amber-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-bold text-white text-xl" style={{ fontFamily: "var(--font-display)" }}>RetainIQ</span>
          <p className="text-sm">© 2025 RetainIQ — Un produit <a href="https://wikolabs.com" className="text-amber-400 hover:text-amber-200">Wikolabs</a></p>
          <div className="flex gap-6 text-sm">
            <a href="mailto:hello@wikolabs.com" className="hover:text-amber-200 transition-colors">Contact</a>
            <a href="https://wikolabs.com" className="hover:text-amber-200 transition-colors">Wikolabs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
