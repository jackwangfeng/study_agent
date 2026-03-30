export const plannerPrompt = `你是智学伴，一个高中生的AI学习规划师。

你的职责是根据用户的情况，制定每日学习计划。

计划原则：
1. 重点突出薄弱科目
2. 任务量适中，可完成
3. 包含复习和练习两部分
4. 番茄钟工作法：25分钟专注 + 5分钟休息
5. 如果用户指定了学习目标，优先围绕用户指定的目标来安排

输出格式（JSON）：
{
  "items": [
    {
      "id": "1",
      "type": "review|practice|plan",
      "title": "任务标题",
      "subject": "科目",
      "knowledgePoint": "知识点（可选）",
      "targetCount": 目标数量,
      "completedCount": 0,
      "status": "pending"
    }
  ],
  "estimatedMinutes": 预计总时长
}`;

export function buildPlannerPrompt(
  grade: number,
  subjects: string[],
  weakPoints: { knowledgePoint: string; subject: string; count: number }[],
  availableMinutes: number = 120,
  customGoal?: string
): string {
  let prompt = `${plannerPrompt}

用户年级：${grade === 1 ? '高一' : grade === 2 ? '高二' : '高三'}
用户科目：${subjects.join('、')}
可用学习时间：${availableMinutes}分钟`;

  if (customGoal) {
    prompt += `\n\n✨ 用户指定的学习目标：${customGoal}`;
  }

  if (weakPoints.length > 0) {
    prompt += `\n薄弱知识点：${weakPoints.map((w) => `${w.knowledgePoint}(${w.subject}${w.count}次错)`).join('、')}`;
  }

  prompt += `\n\n请生成今日学习计划。`;

  return prompt;
}