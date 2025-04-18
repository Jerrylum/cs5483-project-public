import { treaty } from '@elysiajs/eden';
import { app } from 'master-0/src/app.ts';
import { Tasks, isGetPullRequestCodeDiff } from 'master-0/src/types';
import type { WithId } from 'mongodb';
import { requestDiff } from './util';

// Create Eden client to connect to master server
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

// Consumer name
const CONSUMER_NAME = 'consumer-code';
// Delay between task checks when no task is found (ms)
const NO_TASK_DELAY = 5000;
// Delay between task consumption (ms)
const TASK_CONSUMPTION_DELAY = 200; // 0.2 seconds

// Format date to Hong Kong Time
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
}

// Handle task response and error handling
async function handleTaskResponse<T>(
  task: WithId<Tasks>,
  executor: () => Promise<T>,
  responseHandler: (data: T, taskId: string) => Promise<any>
): Promise<boolean> {
  try {
    const data = await executor();
    const taskId = task._id.toString();

    // Send response back to master server
    const feedbackResponse = await responseHandler(data, taskId);

    console.log(`TASK-${taskId} response:${feedbackResponse.status}`);
    if (feedbackResponse.status !== 200) {
      console.error(`TASK-${taskId} response:`, feedbackResponse);
    }
    return true;
  } catch (error: any) {
    console.error(`Error processing ${task.nature} task:`, error);

    // TODO: Report error back to master server
    return false;
  }
}

// Process a task
async function processTask(task: WithId<Tasks>) {
  if (!isGetPullRequestCodeDiff(task)) return false;

  return handleTaskResponse(
    task,
    async () => {
      const url = `https://patch-diff.githubusercontent.com/raw/${task.owner}/${task.repo}/pull/${task.issue_number}.diff`;
      console.log(`Processing task ${task._id?.toString()} with URL: ${url}`);
      const diff = await requestDiff(url);
      return diff;
    },
    async (diff, taskId) => {
      return server.response.get_pull_request_code_diff.post({
        consumer: CONSUMER_NAME,
        task_id: taskId,
        response: {
          pr_id: task.pr_id,
          code_diff: diff,
        },
      });
    }
  );
}

// Maximum number of concurrent tasks
const MAX_CONCURRENT_TASKS = 20;

// Main loop to consume tasks
async function consumeLoop() {
  // Track processing tasks
  const processingTasks: Promise<boolean>[] = [];

  // Function to request and process a new task
  async function requestAndProcessTask() {
    try {
      // Check if we have capacity for more tasks
      if (processingTasks.length >= MAX_CONCURRENT_TASKS) {
        return;
      }

      // Request a task from the master server
      const consumeResponse = await server.consume.post({
        consumer: CONSUMER_NAME,
        supported: ['get_pull_request_code_diff'],
      });

      const task = consumeResponse.data;

      if (task) {
        console.log(
          `TASK-${task._id?.toString() || 'unknown'} received (${processingTasks.length + 1}/${MAX_CONCURRENT_TASKS})`
        );

        const handleTask = async (): Promise<boolean> => {
          try {
            console.log(
              `TASK-${task._id?.toString()} processing (${processingTasks.length}/${MAX_CONCURRENT_TASKS})`
            );

            // Process the task
            const result = await processTask(task);

            // Remove from processing queue when done
            const procIndex = processingTasks.indexOf(processPromise);
            if (procIndex > -1) {
              processingTasks.splice(procIndex, 1);
            }

            // Request a new task to replace this one
            requestAndProcessTask();

            return result;
          } catch (error) {
            console.error(`Error in task handler for task ${task._id?.toString()}:`, error);

            // Remove from processing queue when done
            const procIndex = processingTasks.indexOf(processPromise);
            if (procIndex > -1) {
              processingTasks.splice(procIndex, 1);
            }

            // Request a new task to replace this one
            requestAndProcessTask();

            return false;
          }
        };

        // Create promise and store reference to it
        const processPromise = handleTask();

        // Add to processing queue
        processingTasks.push(processPromise);

        // Request another task after a delay
        await new Promise(resolve => setTimeout(resolve, TASK_CONSUMPTION_DELAY));
        requestAndProcessTask();
      }
    } catch (error) {
      console.error('Error requesting task:', error);
    }
  }

  // Initial filling of the processing queue
  for (let i = 0; i < MAX_CONCURRENT_TASKS; i++) {
    await requestAndProcessTask();
  }

  // Keep the main loop running indefinitely
  while (true) {
    try {
      if (processingTasks.length < MAX_CONCURRENT_TASKS) {
        requestAndProcessTask();
      }

      await new Promise(resolve => setTimeout(resolve, TASK_CONSUMPTION_DELAY));
    } catch (error) {
      console.error('Error in consume loop:', error);
      await new Promise(resolve => setTimeout(resolve, NO_TASK_DELAY));
    }
  }
}

// Main function
async function main() {
  try {
    // Start consuming tasks
    console.log(`Starting consumer ${CONSUMER_NAME}...`);
    await consumeLoop();
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Start the application
main().catch(console.error);
