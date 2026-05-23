/**
 * Recalculates mastery confidence score using an Exponential Moving Average (EMA) model:
 * confidence = alpha * new_score + (1 - alpha) * old_confidence
 */
export function calculateMasteryEma(oldConfidence: number, quizScore: number, alpha: number = 0.3): number {
  const score = Math.max(0, Math.min(1, quizScore));
  const result = alpha * score + (1 - alpha) * oldConfidence;
  return parseFloat(result.toFixed(3));
}

/**
 * Calculates XP points earned from an adaptive quiz playthrough.
 */
export function calculateXPForQuiz(score: number, questionsCount: number, isAdaptive: boolean): number {
  const baseXP = questionsCount * 10;
  const accuracyBonus = score * baseXP;
  const modeMultiplier = isAdaptive ? 1.5 : 1.0;
  return Math.round((baseXP + accuracyBonus) * modeMultiplier);
}
