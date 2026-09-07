// Export Excel (.xlsx) du tableau de bord Jarnias
// Ce fichier utilise les variables definies dans dashboard.html
// (filteredResponses, ALL_CRITERIA) et la librairie SheetJS (XLSX).

// ---- Export Excel (.xlsx) : 3 feuilles prêtes pour les graphiques ----
document.getElementById("export-xlsx-btn").addEventListener("click", () => {
  const list = filteredResponses().slice().reverse(); // du plus ancien au plus recent

  // Feuille 1 : une ligne par reponse (donnees brutes)
  const reponses = list.map((r) => {
    const d = new Date(r.created_at);
    const mois = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    return {
      "Date": d.toLocaleDateString("fr-FR"),
      "Mois": mois,
      "Chantier": r.chantier || "",
      "Entreprise": r.entreprise || "",
      "Nom": r.nom || "",
      "Présent": r.present ? "Oui" : "Non",
      "Communication avant": r.communication_avant ?? "",
      "Sécurité": r.securite ?? "",
      "Adaptation": r.adaptation ?? "",
      "Accueil": r.accueil ?? "",
      "Qualité": r.qualite,
      "Recommandation": r.recommandation,
      "Moyenne": Number(r.moyenne),
      "Commentaire": r.commentaire || ""
    };
  });

  // Feuille 2 : moyenne par critere (pour un graphique en barres)
  const moyennes = ALL_CRITERIA.map((c) => {
    const answered = list.filter((r) => r[c.key] !== null && r[c.key] !== undefined);
    const n = answered.length;
    const avg = n ? answered.reduce((s, r) => s + Number(r[c.key]), 0) / n : 0;
    return {
      "Critère": c.label,
      "Moyenne sur 5": n ? Math.round(avg * 100) / 100 : "",
      "Nombre d'avis": n
    };
  });

  // Feuille 3 : evolution mois par mois (pour un graphique en courbe)
  const parMois = {};
  list.forEach((r) => {
    const d = new Date(r.created_at);
    const mois = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    if (!parMois[mois]) parMois[mois] = [];
    parMois[mois].push(Number(r.moyenne));
  });
  const evolution = Object.keys(parMois).sort().map((mois) => {
    const vals = parMois[mois];
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return {
      "Mois": mois,
      "Nombre de réponses": vals.length,
      "Moyenne globale": Math.round(avg * 100) / 100
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reponses), "Réponses");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(moyennes), "Moyennes par critère");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(evolution), "Évolution mensuelle");
  XLSX.writeFile(wb, "satisfaction-jarnias.xlsx");
});
