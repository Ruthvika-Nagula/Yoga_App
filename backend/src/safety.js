const PREGNANCY_KEYWORDS = [
  "pregnant",
  "pregnancy",
  "first trimester",
  "second trimester",
  "third trimester"
];

const CONDITION_KEYWORDS = [
  "hernia",
  "glaucoma",
  "high blood pressure",
  "hypertension",
  "low blood pressure",
  "recent surgery",
  "heart condition",
  "back injury",
  "slipped disc",
  "disc bulge"
];

export function checkSafety(query) {
  const lower = query.toLowerCase();
  const flags = [];

  if (PREGNANCY_KEYWORDS.some(k => lower.includes(k))) {
    flags.push("pregnancy");
  }
  if (CONDITION_KEYWORDS.some(k => lower.includes(k))) {
    flags.push("condition");
  }

  const isUnsafe = flags.length > 0;
  return { isUnsafe, flags };
}

export function buildUnsafeResponse(userQuery) {
  return {
    answer:
      "Your question touches on an area that can be risky without personalized medical guidance. " +
      "Instead of intense or inversion poses, focus on gentle supine postures, restorative positions, and simple breathing practices.\n\n" +
      "Please consult a doctor or certified yoga therapist before attempting any new poses or sequences.",
    safetyMessage:
      "Safety note: Because your query mentions pregnancy or a medical condition, this answer avoids specific posture prescriptions.",
    suggestion:
      "Consider gentle movement like supported savasana, side-lying rest, or diaphragmatic breathing, always under professional supervision."
  };
}
