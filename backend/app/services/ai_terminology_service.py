"""AI-Assisted Terminology Harmonizer Service.
Maps Classical Ayurvedic clinical terminology and safety observations to MedDRA Preferred Terms and SOCs.
"""

from typing import List, Dict, Any
from app.schemas.adverse_event import TerminologySuggestion

# Knowledge base of Classical Ayurvedic clinical conditions mapped to MedDRA standards
AYURVEDA_MEDDRA_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "ayurvedic_term": "Amlapitta",
        "ayurvedic_category": "Annavaha Srotas (Digestive)",
        "meddra_term": "Dyspepsia / Gastroesophageal reflux disease",
        "meddra_code": "10013946",
        "system_organ_class": "Gastrointestinal disorders",
        "confidence_score": 0.94,
        "keywords": ["amlapitta", "acidity", "heartburn", "acid reflux", "sour eructation", "burning sensation in stomach"],
        "notes": "Correlated with hyperacidity and dyspeptic syndrome in Charaka Samhita Chikitsa Sthana."
    },
    {
        "ayurvedic_term": "Shiroshoola",
        "ayurvedic_category": "Shiroroga (Cephalic disorders)",
        "meddra_term": "Headache",
        "meddra_code": "10019211",
        "system_organ_class": "Nervous system disorders",
        "confidence_score": 0.96,
        "keywords": ["shiroshoola", "headache", "cephalalgia", "migraine", "temple pain", "heavy head"],
        "notes": "Directly correlates with cephalalgia; Vata-Pittaja presentation noted in trial observation."
    },
    {
        "ayurvedic_term": "Sandhishoola / Sandhivata",
        "ayurvedic_category": "Asthi-Majjavaha Srotas (Musculoskeletal)",
        "meddra_term": "Arthralgia",
        "meddra_code": "10003239",
        "system_organ_class": "Musculoskeletal and connective tissue disorders",
        "confidence_score": 0.95,
        "keywords": ["sandhishoola", "sandhivata", "joint pain", "arthralgia", "knee swelling", "joint stiffness"],
        "notes": "Characterized by joint degeneration and pain during movement."
    },
    {
        "ayurvedic_term": "Chhardi",
        "ayurvedic_category": "Annavaha Srotas (Upper GI)",
        "meddra_term": "Vomiting",
        "meddra_code": "10047700",
        "system_organ_class": "Gastrointestinal disorders",
        "confidence_score": 0.98,
        "keywords": ["chhardi", "vomiting", "emesis", "nausea", "hrillasa"],
        "notes": "Symptom of upward movement of Doshas; acute onset post formulation dosing."
    },
    {
        "ayurvedic_term": "Hrillasa",
        "ayurvedic_category": "Annavaha Srotas (Upper GI)",
        "meddra_term": "Nausea",
        "meddra_code": "10028813",
        "system_organ_class": "Gastrointestinal disorders",
        "confidence_score": 0.97,
        "keywords": ["hrillasa", "nausea", "queasiness", "urge to vomit"],
        "notes": "Pre-emetic discomfort; frequently associated with bitter herbal decoctions."
    },
    {
        "ayurvedic_term": "Atisara",
        "ayurvedic_category": "Pureeshvaha Srotas (Lower GI)",
        "meddra_term": "Diarrhoea",
        "meddra_code": "10012735",
        "system_organ_class": "Gastrointestinal disorders",
        "confidence_score": 0.96,
        "keywords": ["atisara", "diarrhea", "diarrhoea", "loose stools", "watery stools"],
        "notes": "Watery fecal discharge; potential bowel intolerance or formulation detoxification response."
    },
    {
        "ayurvedic_term": "Vibandha",
        "ayurvedic_category": "Pureeshvaha Srotas (Lower GI)",
        "meddra_term": "Constipation",
        "meddra_code": "10010774",
        "system_organ_class": "Gastrointestinal disorders",
        "confidence_score": 0.95,
        "keywords": ["vibandha", "constipation", "infrequent bowel movement", "hard stools"],
        "notes": "Apana Vata obstruction resulting in reduced peristalsis."
    },
    {
        "ayurvedic_term": "Kasa",
        "ayurvedic_category": "Pranavaha Srotas (Respiratory)",
        "meddra_term": "Cough",
        "meddra_code": "10011224",
        "system_organ_class": "Respiratory, thoracic and mediastinal disorders",
        "confidence_score": 0.96,
        "keywords": ["kasa", "cough", "dry cough", "productive cough", "throat clearing"],
        "notes": "Irritation in Pranavaha Srotas; differentiated into dry (Vataja) vs productive (Kaphaja)."
    },
    {
        "ayurvedic_term": "Shwasa",
        "ayurvedic_category": "Pranavaha Srotas (Respiratory)",
        "meddra_term": "Dyspnoea",
        "meddra_code": "10013968",
        "system_organ_class": "Respiratory, thoracic and mediastinal disorders",
        "confidence_score": 0.93,
        "keywords": ["shwasa", "dyspnoea", "shortness of breath", "breathlessness", "wheezing", "asthma"],
        "notes": "Severe bronchial constriction requiring immediate statutory evaluation if acute."
    },
    {
        "ayurvedic_term": "Kandu / Kushtha lakshana",
        "ayurvedic_category": "Twacha (Dermatological)",
        "meddra_term": "Pruritus / Rash erythematous",
        "meddra_code": "10037087",
        "system_organ_class": "Skin and subcutaneous tissue disorders",
        "confidence_score": 0.92,
        "keywords": ["kandu", "itching", "pruritus", "rash", "urticaria", "sheetapitta", "skin reaction"],
        "notes": "Pitta-Rakta morbidity manifesting as acute cutaneous hypersensitivity."
    },
    {
        "ayurvedic_term": "Daha",
        "ayurvedic_category": "Pitta Pradhana (Thermoregulatory)",
        "meddra_term": "Burning sensation",
        "meddra_code": "10006798",
        "system_organ_class": "General disorders and administration site conditions",
        "confidence_score": 0.91,
        "keywords": ["daha", "burning", "burning sensation", "peripheral burning", "gastric burning"],
        "notes": "Pitta escalation causing systemic or localized thermogenic distress."
    },
    {
        "ayurvedic_term": "B भ्रम (Bhrama)",
        "ayurvedic_category": "Shiroroga (Neurological)",
        "meddra_term": "Dizziness / Vertigo",
        "meddra_code": "10013573",
        "system_organ_class": "Nervous system disorders",
        "confidence_score": 0.94,
        "keywords": ["bhrama", "dizziness", "vertigo", "lightheadedness", "giddiness"],
        "notes": "Sensation of spinning or postural unsteadiness, Vata-Pitta aggrevation."
    },
    {
        "ayurvedic_term": "Jwara",
        "ayurvedic_category": "Sarvadaika (Systemic)",
        "meddra_term": "Pyrexia / Fever",
        "meddra_code": "10037660",
        "system_organ_class": "General disorders and administration site conditions",
        "confidence_score": 0.97,
        "keywords": ["jwara", "fever", "pyrexia", "hyperthermia", "elevated temperature"],
        "notes": "Santapa (elevated body temperature) due to Ama and Pitta derangement."
    },
    {
        "ayurvedic_term": "Klama / Daurbalya",
        "ayurvedic_category": "Ojokshaya (General)",
        "meddra_term": "Fatigue / Asthenia",
        "meddra_code": "10016256",
        "system_organ_class": "General disorders and administration site conditions",
        "confidence_score": 0.89,
        "keywords": ["klama", "daurbalya", "fatigue", "tiredness", "weakness", "lethargy"],
        "notes": "General loss of vitality or strength without proportionate exertion."
    }
]


def suggest_terminology(query: str, context: str = None) -> List[TerminologySuggestion]:
    """Search knowledge base and return ranked suggestions with MedDRA codes and Ayurvedic correlates."""
    query_clean = query.strip().lower()
    matches: List[Dict[str, Any]] = []

    for item in AYURVEDA_MEDDRA_KNOWLEDGE_BASE:
        score = 0.0
        # Direct keyword match
        for kw in item["keywords"]:
            if kw == query_clean:
                score = max(score, item["confidence_score"])
            elif kw in query_clean or query_clean in kw:
                score = max(score, item["confidence_score"] * 0.85)

        # Check in ayurvedic term or meddra term
        if query_clean in item["ayurvedic_term"].lower() or query_clean in item["meddra_term"].lower():
            score = max(score, 0.90)

        if score > 0.4:
            matches.append({
                "suggestion": TerminologySuggestion(
                    meddra_term=item["meddra_term"],
                    meddra_code=item["meddra_code"],
                    system_organ_class=item["system_organ_class"],
                    ayurvedic_correlate=item["ayurvedic_term"],
                    ayurvedic_category=item["ayurvedic_category"],
                    confidence_score=round(score, 2),
                    notes=item["notes"]
                ),
                "score": score
            })

    # Sort by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)

    if not matches:
        # Fallback suggestion for unmapped general clinical query
        return [
            TerminologySuggestion(
                meddra_term="Adverse event, unclassified",
                meddra_code="10001367",
                system_organ_class="General disorders and administration site conditions",
                ayurvedic_correlate="Agantuja / Asatmya Lakshana",
                ayurvedic_category="General Clinical Observation",
                confidence_score=0.60,
                notes=f"No direct classical term found for '{query}'. Manual clinical coding advised."
            )
        ]

    return [m["suggestion"] for m in matches[:5]]
