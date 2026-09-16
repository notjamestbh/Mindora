// Mindora Adaptive Engine
// An ethical, lightweight adaptive intelligence engine that adjusts game difficulty,
// recommends appropriate next activities, and derives caregiver engagement insights.

import { getActivities, getMemories, getReminders } from './storage';

/**
 * Calculates average accuracy and response times across recent sessions
 * @param {Array} activities 
 * @param {number} sessionCount 
 */
export const calculatePerformance = (activities = null, sessionCount = 5) => {
  const acts = activities || getActivities();
  if (!acts || acts.length === 0) {
    return {
      averageAccuracy: 85,
      averageResponseTime: 60,
      totalSessions: 0,
      completionRate: 100
    };
  }

  const recent = acts.slice(0, sessionCount);
  const totalAcc = recent.reduce((sum, a) => sum + (a.accuracy || 80), 0);
  const totalTime = recent.reduce((sum, a) => sum + (a.responseTimeSec || 60), 0);

  return {
    averageAccuracy: Math.round(totalAcc / recent.length),
    averageResponseTime: Math.round(totalTime / recent.length),
    totalSessions: acts.length,
    completionRate: 92
  };
};

/**
 * Determines appropriate difficulty for the patient
 * @returns {Object} { difficulty: 'easy' | 'medium' | 'hard', reason: string, pairCount: number, sequenceLength: number }
 */
export const getDifficulty = (activities = null) => {
  const perf = calculatePerformance(activities);

  // If no sessions yet, start at a comfortable medium
  if (perf.totalSessions === 0) {
    return {
      difficulty: "medium",
      pairCount: 4,
      sequenceLength: 3,
      reason: "Initial baseline setup"
    };
  }

  // High accuracy (>85%) with prompt response time (<65s) -> Increase complexity
  if (perf.averageAccuracy >= 85 && perf.averageResponseTime <= 65) {
    return {
      difficulty: "hard",
      pairCount: 6,
      sequenceLength: 4,
      reason: "High accuracy and confident response in recent activities."
    };
  }

  // Steady comfort zone (65% - 85%) -> Maintain balanced difficulty
  if (perf.averageAccuracy >= 65) {
    return {
      difficulty: "medium",
      pairCount: 4,
      sequenceLength: 3,
      reason: "Consistent comfort and engagement with current activities."
    };
  }

  // Lower accuracy (<65%) or slower response -> Simplify for stress-free experience
  return {
    difficulty: "easy",
    pairCount: 3,
    sequenceLength: 3,
    reason: "Simplified to maintain reassurance and pleasant engagement."
  };
};

/**
 * Recommends the next best cognitive activity for the patient
 */
export const recommendActivity = () => {
  const acts = getActivities();
  const perf = calculatePerformance(acts);
  const diff = getDifficulty(acts);

  // Rotate between games with emphasis on personal memory
  const allGameTypes = [
    { type: "whos-speaking", path: "/game/whos-speaking", title: "Who's Speaking?", desc: "Familiar voice recognition" },
    { type: "who-is-this", path: "/game/who-is-this", title: "Who Is This?", desc: "Familiar family faces" },
    { type: "memory-match", path: "/game/memory-match", title: "Memory Match", desc: "Gentle card matching" },
    { type: "pattern", path: "/game/pattern", title: "Pattern Recall", desc: "Visual shape sequence" },
    { type: "routine", path: "/game/routine", title: "What Comes Next?", desc: "Everyday routines" },
    { type: "pair", path: "/game/pair", title: "Find the Pair", desc: "Household companions" }
  ];

  if (!acts || acts.length === 0) {
    return {
      game: allGameTypes[0], // Start with Who's Speaking
      difficulty: diff.difficulty,
      reason: "A gentle auditory recognition activity with family voices"
    };
  }

  const lastActivity = acts[0];
  // Recommend a different activity from last played to avoid repetitive fatigue
  const candidate = allGameTypes.find(g => g.type !== lastActivity.type) || allGameTypes[0];

  return {
    game: candidate,
    difficulty: diff.difficulty,
    reason: diff.reason
  };
};

/**
 * Generates human-centered, dignified caregiver insights (never diagnostic)
 */
export const getCaregiverInsights = () => {
  const acts = getActivities();
  const reminders = getReminders();
  const perf = calculatePerformance(acts);
  const diff = getDifficulty(acts);

  const insights = [];

  // Memory activity consistency
  const memoryActs = acts.filter(a => a.type === 'memory-match' || a.type === 'who-is-this' || a.type === 'whos-speaking');
  if (memoryActs.length >= 2) {
    insights.push({
      category: "Memory",
      text: "Memory and recognition activities have been completed regularly this week with calm focus.",
      level: "positive"
    });
  }

  // Response pacing
  if (perf.averageResponseTime < 70) {
    insights.push({
      category: "Engagement",
      text: "Average response time remains steady at comfortable pacing.",
      level: "neutral"
    });
  }

  // Routine check
  const incompleteReminders = reminders.filter(r => !r.completed);
  if (incompleteReminders.length > 2) {
    insights.push({
      category: "Routines",
      text: "Some afternoon routines are awaiting completion. A gentle family reminder may be helpful.",
      level: "attention"
    });
  } else {
    insights.push({
      category: "Routines",
      text: "Morning routine milestones were completed on schedule.",
      level: "positive"
    });
  }

  // Adaptive note
  insights.push({
    category: "Adaptive Support",
    text: `Mindora is currently presenting ${diff.difficulty} activities to match Amma's natural rhythm.`,
    level: "info"
  });

  return insights;
};
