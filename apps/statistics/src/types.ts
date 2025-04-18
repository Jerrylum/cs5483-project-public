export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate?: number;
}

export interface StatisticsResponse {
  status: string;
  message: string;
  data: TaskStatistics;
}
