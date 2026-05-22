export interface IDailyQuest {
  id: string;
  title: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
}

export interface ILeagueUser {
  studentId: string;
  name: string;
  level: number;
  xpAccumulatedThisWeek: number;
  rank: number;
}
