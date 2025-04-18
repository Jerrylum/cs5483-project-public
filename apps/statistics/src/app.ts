import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { tasks } from 'master-0/src/data';
// Create and configure the app

enum TaskNatureExtended {
  "list_pull_requests" = "List Pull Requests",
  "get_pull_request_details" = "Get Pull Request Details",
  // "feature_engineering_via_llm" = "Feature Engineering via LLM",
  "llm_nature" = "LLM Nature",
  "llm_changes_quality" = "LLM Changes Quality",
  "llm_closed_reason" = "LLM Closed Reason",
  "llm_description_quality" = "LLM Description Quality",
  "get_user_details" = "Get User Details",
  "get_pull_request_code_diff" = "Get Pull Request Code Diff",
  "get_pull_request_comments" = "Get Pull Request Comments",
  "unknown" = "Unknown",
}

interface TaskProjection {
  completed_at: Date,
  nature: string,
  prompt_template?: string,
}

// Format date to Hong Kong Time
function formatDate(date: Date): string {
  return date.toLocaleString('en-GB', { timeZone: 'Asia/Hong_Kong' });
}

function getTaskDateSlot(task: TaskProjection) {
  // return "2025-04-05 15:00", "15:15", "15:30", "15:45" every 15 minutes
  const temp = formatDate(task.completed_at).split(',');
  const hour_minute = temp[1].split('.')[0];
  const temp2 = hour_minute.split(':');
  const hour = temp2[0];
  const minute = temp2[1];
  const slot = Math.floor(parseInt(minute) / 15) * 15;
  return `${temp[0]} ${hour}:${slot}`;
}

function getTaskNatureExtended(task: TaskProjection): TaskNatureExtended {
  switch (task.nature) {
    case "list_pull_requests":
      return TaskNatureExtended.list_pull_requests;
    case "get_pull_request_details":
      return TaskNatureExtended.get_pull_request_details;
    case "feature_engineering_via_llm":
      switch (task.prompt_template) {
        case "nature":
          return TaskNatureExtended.llm_nature;
        case "changesQuality":
          return TaskNatureExtended.llm_changes_quality;
        case "closedReason":
          return TaskNatureExtended.llm_closed_reason;
        case "descriptionQuality":
          return TaskNatureExtended.llm_description_quality;
        default:
          return TaskNatureExtended.unknown;
      }
    case "get_user_details":
      return TaskNatureExtended.get_user_details;
    case "get_pull_request_code_diff":
      return TaskNatureExtended.get_pull_request_code_diff;
    case "get_pull_request_comments":
      return TaskNatureExtended.get_pull_request_comments;
    default:
      return TaskNatureExtended.unknown;
  }
}

function createDefaultStats(): Record<TaskNatureExtended, number> {
  return {
    [TaskNatureExtended.list_pull_requests]: 0,
    [TaskNatureExtended.get_pull_request_details]: 0,
    [TaskNatureExtended.llm_nature]: 0,
    [TaskNatureExtended.llm_changes_quality]: 0,
    [TaskNatureExtended.llm_closed_reason]: 0,
    [TaskNatureExtended.llm_description_quality]: 0,
    [TaskNatureExtended.get_user_details]: 0,
    [TaskNatureExtended.get_pull_request_code_diff]: 0,
    [TaskNatureExtended.get_pull_request_comments]: 0,
    [TaskNatureExtended.unknown]: 0,
  };
}

let stats: Record<string, Record<TaskNatureExtended, number>> = {};

async function main() {

  const startTime = new Date();

  const cursor = tasks
    .find({ completed: true, completed_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    .project<TaskProjection>({
      completed_at: 1,
      nature: 1,
      prompt_template: 1,
    });

  let i = 0;
  let newStats: Record<string, Record<TaskNatureExtended, number>> = {};
  for await (const task of cursor) {
    const dateSlot = getTaskDateSlot(task);
    const nature = getTaskNatureExtended(task);
    if (!newStats[dateSlot]) {
      newStats[dateSlot] = createDefaultStats();
    }
    newStats[dateSlot][nature]++;
    i++;

    // if (i % 1000 === 0) {
    //   console.log(`Remaining tasks: ${i} ${formatDate(new Date())}`);
    // }
  }

  stats = newStats;

  // console.log(stats);

  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  console.log(`Time taken: ${duration}ms`);
  console.log(`Remaining tasks: ${i}`);
}

main();

setInterval(main, 1000 * 60); // every minute

export const app = new Elysia()
  .use(cors())
  .get('/', () => ({
    message: '200 OK',
    status: 'statistics server is running',
  }))
  .get('/api/statistics', async () => {
    // example output
    /*
  {
    "2025-04-05 15:00": {
      "llm_nature": 1000,
      "llm_changes_quality": 1000,
      "llm_closed_reason": 1000,
      "llm_description_quality": 1000,
    }, ...
  }

    */

    return {
      status: 'success',
      data: stats,
    };
  });
