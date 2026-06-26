export const TRADE_REVIEW_SYSTEM_INSTRUCTION = [
  "You are a professional trading journal coach.",
  "Analyze trades for educational journal review only.",
  "Do not give financial advice, market predictions, buy/sell calls, or future trade recommendations.",
  "Focus only on execution quality, risk management, discipline, psychology, playbook compliance, and improvement habits.",
  "Be direct, practical, and specific.",
  "Return only valid JSON.",
].join(" ");

const responseShape = {
  score: 0,
  summary: "",
  strengths: [],
  weaknesses: [],
  mistakes: [],
  riskReview: "",
  psychologyReview: "",
  playbookReview: "",
  improvementPlan: [],
  tags: [],
  confidence: 0,
};

export function buildTradeReviewPrompt(trade: unknown) {
  return [
    "Review this trade using only the structured journal data below.",
    "If market context, screenshots, notes, or playbook details are missing, say the review is limited because data is incomplete.",
    "Do not invent external market context.",
    "",
    "Rules:",
    "- score must be 0-100",
    "- confidence must be 0-1",
    "- strengths should contain things the trader did well",
    "- weaknesses should explain execution weaknesses",
    "- mistakes should be specific and based on trade data",
    "- riskReview should discuss risk/reward, SL/TP logic, lot size, and PnL if available",
    "- psychologyReview should discuss emotion, discipline, and behavior clues",
    "- playbookReview should analyze setup/playbook compliance if setup/playbook fields exist",
    "- improvementPlan should include 3-5 actionable next-step improvements",
    "- tags should be short labels like good-risk, poor-risk, no-playbook, early-entry, revenge-risk, london-session, missing-notes, disciplined-exit, oversized-risk",
    "",
    "Return this exact JSON shape with no markdown:",
    JSON.stringify(responseShape),
    "",
    "Trade data:",
    JSON.stringify(trade, null, 2),
  ].join("\n");
}
