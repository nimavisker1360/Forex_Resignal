export type ChecklistProgressAnswer = {
  checked: boolean;
  isRequiredSnapshot?: boolean;
  isRequired?: boolean;
};

export function calculateChecklistProgress(answers: ChecklistProgressAnswer[]) {
  const totalCount = answers.length;
  const completedCount = answers.filter((answer) => answer.checked).length;
  const requiredAnswers = answers.filter(
    (answer) => answer.isRequiredSnapshot || answer.isRequired
  );
  const requiredTotalCount = requiredAnswers.length;
  const requiredCompletedCount = requiredAnswers.filter(
    (answer) => answer.checked
  ).length;
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    requiredCompletedCount,
    requiredTotalCount,
    completionPercent,
  };
}
