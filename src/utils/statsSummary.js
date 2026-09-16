// Utility to compute and summarize patient cognitive, activity, and routine statistics
import {
  getActivities,
  getReminders,
  getTrendData,
  getMemories,
  getPatient
} from './storage';

/**
 * Calculates current aggregate stats across activities, routines, trends, and memories
 */
export const getFullStatsSummary = () => {
  const patient = getPatient();
  const activities = getActivities() || [];
  const reminders = getReminders() || [];
  const trend7d = getTrendData('7d') || [];
  const memories = getMemories() || [];

  // 1. Activities stats
  const totalActivities = activities.length;
  const recentActivities = activities.slice(0, 3);
  const avgAccuracy = totalActivities > 0
    ? Math.round(activities.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / totalActivities)
    : 100;
  const lastActivity = activities.length > 0 ? activities[0] : null;

  // 2. Routines / Reminders stats
  const totalReminders = reminders.length;
  const completedReminders = reminders.filter(r => r.completed);
  const pendingReminders = reminders.filter(r => !r.completed);
  const nextReminder = pendingReminders.length > 0 ? pendingReminders[0] : null;
  const routineCompletionRate = totalReminders > 0
    ? Math.round((completedReminders.length / totalReminders) * 100)
    : 0;

  // 3. 7-Day Cognitive Engagement
  const latestTrend = trend7d.length > 0 ? trend7d[trend7d.length - 1] : {
    memory: 80,
    attention: 75,
    recognition: 85,
    responseTimeSec: 65
  };

  // 4. Memory library stats
  const familyCount = memories.filter(m => m.type === 'person' || m.category === 'people').length;
  const placesCount = memories.filter(m => m.type === 'place' || m.category === 'places').length;
  const totalMemories = memories.length;

  return {
    patientName: patient?.name || "Amma",
    activities: {
      total: totalActivities,
      recent: recentActivities,
      avgAccuracy,
      lastActivity
    },
    routines: {
      total: totalReminders,
      completedCount: completedReminders.length,
      pendingCount: pendingReminders.length,
      completionRate: routineCompletionRate,
      nextReminder
    },
    cognitiveTrends: {
      memoryScore: latestTrend.memory,
      attentionScore: latestTrend.attention,
      recognitionScore: latestTrend.recognition,
      responseTimeSec: latestTrend.responseTimeSec
    },
    memories: {
      total: totalMemories,
      familyCount,
      placesCount
    }
  };
};

/**
 * Generates an empathetic spoken and readable summary text for the patient/caregiver
 */
export const generateSpokenStatsSummary = () => {
  const stats = getFullStatsSummary();
  const name = stats.patientName;

  let routineSentence = "";
  if (stats.routines.pendingCount === 0) {
    routineSentence = `You have completed all ${stats.routines.total} of your daily routines for today! Wonderful job.`;
  } else if (stats.routines.nextReminder) {
    routineSentence = `You have completed ${stats.routines.completedCount} out of ${stats.routines.total} daily routines (${stats.routines.completionRate}%). Your next routine is ${stats.routines.nextReminder.title} at ${stats.routines.nextReminder.time}.`;
  } else {
    routineSentence = `You have completed ${stats.routines.completedCount} daily routines so far today.`;
  }

  let activitySentence = "";
  if (stats.activities.lastActivity) {
    activitySentence = `In your recent games, you achieved an average of ${stats.activities.avgAccuracy}% accuracy. Your last game was ${stats.activities.lastActivity.name} with ${stats.activities.lastActivity.accuracy}% accuracy.`;
  } else {
    activitySentence = `Your cognitive exercises are ready whenever you want to play a relaxing game!`;
  }

  const trendSentence = `Your 7-day memory score is steady at ${stats.cognitiveTrends.memoryScore}%, with ${stats.cognitiveTrends.recognitionScore}% face recognition. You have ${stats.memories.familyCount} loving family members in your memory gallery.`;

  const fullText = `Here is your summary, ${name}: ${routineSentence} ${activitySentence} ${trendSentence}`;

  return {
    text: fullText,
    statsData: stats
  };
};
