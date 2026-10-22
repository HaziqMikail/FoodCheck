import ingredientsDatabase from '../data/ingredients_data.json';

/**
 * Normalizes text for regex token matching
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Analyzes raw extracted text against user preferences and the static ingredient database.
 * 
 * @param {string} rawText - Ingredients string extracted from OCR or user input
 * @param {Object} userProfile - User health profile from localStorage
 * @returns {Object} Structured verdict, matched ingredients, and reasons
 */
export function analyzeIngredients(rawText, userProfile) {
  if (!rawText || !rawText.trim()) {
    return {
      verdict: 'safe',
      score: 100,
      totalMatched: 0,
      matches: [],
      summary: 'No text provided for analysis.'
    };
  }

  const normalizedText = ' ' + rawText.toLowerCase().replace(/[\r\n\t]/g, ' ') + ' ';
  const matches = [];

  const userAllergies = new Set((userProfile?.allergies || []).map(a => a.toLowerCase()));
  const userHealthGoals = new Set((userProfile?.health_goals || []).map(g => g.toLowerCase()));
  const userDietary = new Set((userProfile?.dietary_restrictions || []).map(d => d.toLowerCase()));
  const userAdditives = new Set((userProfile?.flagged_additives || []).map(a => a.toLowerCase()));

  // Iterate over canonical database items
  for (const item of ingredientsDatabase) {
    const searchTerms = [item.canonical_name, ...(item.aliases || [])];
    let matchedTerm = null;

    for (const term of searchTerms) {
      if (!term || term.length < 2) continue;
      // Word boundary match
      const escaped = escapeRegExp(term.toLowerCase());
      const regex = new RegExp(`(?:^|[\\s,;:.()\\[\\]\\/\\-])${escaped}(?:$|[\\s,;:.()\\[\\]\\/\\-])`, 'i');
      if (regex.test(normalizedText)) {
        matchedTerm = term;
        break;
      }
    }

    if (!matchedTerm) continue;

    const matchedAllergens = (item.associated_allergens || []).map(a => a.toLowerCase());
    const healthRiskTags = (item.health_risk_tags || []).map(t => t.toLowerCase());

    // 1. Check Allergens (DANGER)
    const hitAllergen = matchedAllergens.find(a => userAllergies.has(a) || (a === 'milk' && userAllergies.has('dairy')));
    if (hitAllergen) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'allergen',
        severity: 'danger',
        title: `Allergen: ${item.canonical_name}`,
        explanation: `"${matchedTerm}" is linked to ${hitAllergen.toUpperCase()}, which matches your active allergy profile.`
      });
      continue;
    }

    // 2. Check Dietary Restrictions (Vegan, Halal, Kosher)
    if (userDietary.has('vegan') && (matchedAllergens.includes('dairy') || matchedAllergens.includes('eggs') || matchedAllergens.includes('fish') || matchedAllergens.includes('shellfish') || healthRiskTags.includes('animal_derived'))) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'dietary',
        severity: 'danger',
        title: `Vegan Conflict: ${item.canonical_name}`,
        explanation: `"${matchedTerm}" is animal-derived or contains animal byproducts.`
      });
      continue;
    }

    if (userDietary.has('halal') && (healthRiskTags.includes('pork_derived') || healthRiskTags.includes('alcohol') || item.canonical_name.toLowerCase().includes('gelatin'))) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'dietary',
        severity: 'danger',
        title: `Halal Warning: ${item.canonical_name}`,
        explanation: `"${matchedTerm}" may contain non-halal animal derivatives or alcohol.`
      });
      continue;
    }

    // 3. Check Health Goals (Hypertension / Sodium, Diabetes / Sugar, Celiac)
    if (userHealthGoals.has('hypertension') && (healthRiskTags.includes('high_sodium') || item.canonical_name.toLowerCase().includes('salt') || item.canonical_name.toLowerCase().includes('sodium'))) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'health_goal',
        severity: 'warning',
        title: `Sodium Alert: ${item.canonical_name}`,
        explanation: `Contains high sodium/salt compounds that may conflict with Hypertension management.`
      });
      continue;
    }

    if (userHealthGoals.has('diabetes') && (healthRiskTags.includes('high_glycemic') || healthRiskTags.includes('sugar') || item.canonical_name.toLowerCase().includes('sugar') || item.canonical_name.toLowerCase().includes('syrup'))) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'health_goal',
        severity: 'warning',
        title: `Sugar Alert: ${item.canonical_name}`,
        explanation: `High sugar or sweetener content flagged for Diabetes care.`
      });
      continue;
    }

    if (userHealthGoals.has('lactose_intolerance') && (healthRiskTags.includes('lactose_intolerance') || matchedAllergens.includes('dairy') || matchedAllergens.includes('milk'))) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'health_goal',
        severity: 'warning',
        title: `Lactose Alert: ${item.canonical_name}`,
        explanation: `Contains dairy/lactose derivatives.`
      });
      continue;
    }

    // 4. Check Flagged Additives (E621, E102, etc.)
    const hitAdditive = userAdditives.has(item.canonical_name.toLowerCase()) || 
                        (item.aliases || []).some(al => userAdditives.has(al.toLowerCase()));
    if (hitAdditive) {
      matches.push({
        ingredient: matchedTerm,
        canonical: item.canonical_name,
        type: 'additive',
        severity: 'warning',
        title: `Additive Flag: ${item.canonical_name}`,
        explanation: `Matched blacklist additive: ${item.canonical_name}.`
      });
      continue;
    }
  }

  // 5. Check Custom User Conditions / Specific Allergens
  if (userProfile?.custom_condition?.trim()) {
    const customTerms = userProfile.custom_condition
      .split(/[,;\n]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length >= 2);

    for (const term of customTerms) {
      const escaped = escapeRegExp(term);
      const regex = new RegExp(`(?:^|[\\s,;:.()\\[\\]\\/\\-])${escaped}(?:$|[\\s,;:.()\\[\\]\\/\\-])`, 'i');
      if (regex.test(normalizedText)) {
        // Prevent duplicate match if already added
        if (!matches.some(m => m.canonical.toLowerCase() === term)) {
          matches.push({
            ingredient: term,
            canonical: term.charAt(0).toUpperCase() + term.slice(1),
            type: 'custom_condition',
            severity: 'danger',
            title: `Custom Condition Alert: ${term}`,
            explanation: `Matches your specified custom condition / ingredient watch: "${term}".`
          });
        }
      }
    }
  }

  // Determine final verdict
  let verdict = 'safe';
  let summary = 'Zero allergens or restricted ingredients found matching your profile.';

  const hasDanger = matches.some(m => m.severity === 'danger');
  const hasWarning = matches.some(m => m.severity === 'warning');

  if (hasDanger) {
    verdict = 'danger';
    const dangerCount = matches.filter(m => m.severity === 'danger').length;
    summary = `CRITICAL ALERT: Detected ${dangerCount} severe allergen or dietary conflict(s)!`;
  } else if (hasWarning) {
    verdict = 'warning';
    const warnCount = matches.filter(m => m.severity === 'warning').length;
    summary = `ATTENTION: Detected ${warnCount} ingredient(s) matching your health conditions or additive flags.`;
  }

  return {
    verdict,
    matches,
    totalMatched: matches.length,
    summary,
    timestamp: new Date().toISOString()
  };
}
