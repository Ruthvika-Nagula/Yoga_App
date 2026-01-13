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

  return { isUnsafe: flags.length > 0, flags };
}

export function buildUnsafeResponse(userQuery) {
  return {
    answer:
      "Your question touches on an area that can be risky without personalized medical guidance. " +
      "Instead of intense or inversion poses, consider gentle supine postures, restorative yoga, and slow breathing exercises.\n\n" +
      "Please consult a doctor or certified yoga therapist before attempting any new poses.",

    safetyMessage:
      "⚠ Safety note: Because your query mentions pregnancy or a medical condition, this response avoids specific pose prescriptions.",

    suggestion:
      "You may explore gentle practices like supported savasana, side-lying relaxation, or diaphragmatic breathing under professional supervision."
  };
}
