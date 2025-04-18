import { treaty } from '@elysiajs/eden';
import type { WithId } from 'mongodb';

import { app } from 'master-0/src/app.ts';
import { client } from 'master-0/src/data';
import { isFeatureEngineeringViaLLM, Tasks } from 'master-0/src/types';

import { extractJsonFromDeepseekResponse } from 'master-0/src/utils';
import { getOllamaServerCount, requestOllama } from './llm';
import { fixJsonOutputPrompt } from './prompt/fix-json-output';
import { promptOutputGuidelines, PromptTemplateEnum, promptTemplates } from './types';
import { replacePlaceholders } from './util';

// Create Eden client to connect to master server
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

// Consumer name from environment variable
const CONSUMER_NAME = process.env.CONSUMER_NAME;
if (!CONSUMER_NAME) {
  throw new Error(
    'CONSUMER_NAME environment variable is required. Please set it in your .env file.'
  );
}
// Type assertion after validation ensures it's a string
const consumer = CONSUMER_NAME as string;

// Delay between task checks when no task is found (ms)
const NO_TASK_DELAY = 5000;

// Format date to Hong Kong Time
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
}

// Remove a task from active tasks array
function removeTask<T>(taskPromise: Promise<T>, activeTasks: Promise<T>[]) {
  const index = activeTasks.indexOf(taskPromise);
  if (index > -1) {
    activeTasks.splice(index, 1);
  }
}

// Handle task response and error handling
async function handleTaskResponse<T>(
  task: WithId<Tasks>,
  executor: () => Promise<T>,
  responseHandler: (data: T, taskId: string) => Promise<any>
): Promise<boolean> {
  try {
    // start time
    const startTime = Date.now();

    const data = await executor();
    const taskId = task._id.toString();

    // Send response back to master server
    const feedbackResponse = await responseHandler(data, taskId);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `Response sent for task ${taskId}, status: ${feedbackResponse.status} in ${duration}ms`
    );
    return true;
  } catch (error: any) {
    console.error(`Error processing ${task.nature} task:`, error);

    // TODO: Report error back to master server
    return false;
  }
}

// Process a task
async function processTask(task: WithId<Tasks>) {
  if (!isFeatureEngineeringViaLLM(task)) return false;

  const { prompt_template, prompt_values } = task;

  if (!(prompt_template in promptTemplates)) {
    console.error('Unknown prompt template:', prompt_template);
    throw new Error(`Unknown prompt template: ${prompt_template}`);
  }

  const promptTempalte = prompt_template as PromptTemplateEnum;

  const prompt = replacePlaceholders(promptTemplates[promptTempalte], prompt_values);
  // console.log('Replaced Prompt:', prompt);

  return handleTaskResponse(
    task,
    async () => {
      const startTime = Date.now();
      const llmResult = await requestOllama(prompt);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!extractJsonFromDeepseekResponse(llmResult)) {
        console.log(
          `Task ${task._id} LLM result is not a valid JSON, ${duration}ms passed, fixing...`
        );

        const fixPrompt = fixJsonOutputPrompt(promptOutputGuidelines[promptTempalte], llmResult);
        const fixResult = await requestOllama(fixPrompt);
        return `${llmResult}\n${fixResult}`;
      } else {
        return llmResult;
      }
    },
    async (llmResult, taskId) => {
      return server.response.feature_engineering_via_llm.post({
        consumer: consumer,
        task_id: taskId,
        response: {
          pr_id: task.pr_id,
          feature_name: task.feature_name,
          feature_value: llmResult,
        },
      });
    }
  );
}

// Maximum number of concurrent tasks (10 per server)
const MAX_CONCURRENT_TASKS = 10 * getOllamaServerCount();
console.log(
  `Using ${getOllamaServerCount()} Ollama servers, allowing up to ${MAX_CONCURRENT_TASKS} concurrent tasks`
);

// Main loop to consume tasks
async function consumeLoop() {
  // Track active task promises
  const activeTasks: Promise<boolean>[] = [];

  while (true) {
    try {
      // If we're below the maximum concurrent tasks, request more tasks
      if (activeTasks.length < MAX_CONCURRENT_TASKS) {
        // Request a task from the master server
        const consumeResponse = await server.consume.post({
          consumer: consumer,
          supported: ['feature_engineering_via_llm'],
        });

        const task = consumeResponse.data;

        if (task) {
          // Start processing the task without awaiting completion
          console.log(
            `Starting task ${task._id?.toString() || 'unknown'} (${
              activeTasks.length + 1
            }/${MAX_CONCURRENT_TASKS} active tasks)`
          );
          const taskPromise = processTask(task);
          activeTasks.push(taskPromise);

          // Cleanup handler removes the task when done (success or failure)
          taskPromise
            .then(() => removeTask(taskPromise, activeTasks))
            .catch(() => removeTask(taskPromise, activeTasks));
        } else {
          // No task available, wait before trying again
          console.log(`No tasks available. Checking again in ${NO_TASK_DELAY / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, NO_TASK_DELAY));
        }
      } else {
        // Wait for a short time if we're at max concurrent tasks
        console.log(
          `At maximum concurrent tasks (${activeTasks.length}/${MAX_CONCURRENT_TASKS}). Waiting for tasks to complete...`
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error in consume loop:', error);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, NO_TASK_DELAY));
    }
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB (if needed)
    // await client.connect();
    // console.log('Connected to MongoDB');

    // Start consuming tasks
    console.log(`Starting consumer ${CONSUMER_NAME}...`);
    await consumeLoop();
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await client.close();
  }
}

// Start the application
main().catch(console.error);
