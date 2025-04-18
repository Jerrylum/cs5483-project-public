import { treaty } from '@elysiajs/eden';
import type { ResponseHeaders } from '@octokit/types';
import fs from 'fs/promises';
import { app } from 'master-0/src/app.ts';
import { client } from 'master-0/src/data';
import {
  isGetPullRequestComments,
  isGetPullRequestDetails,
  isGetUserDetails,
  isListPullRequests,
  Tasks,
  type OctokitPullRequest,
  type OctokitPullRequestComments,
  type OctokitPullRequestDetails,
  type OctokitUser,
} from 'master-0/src/types';
import {
  simplifyPullRequest,
  simplifyPullRequestComments,
  simplifyPullRequestDetails,
  simplifyUserDetails,
} from 'master-0/src/utils';
import type { WithId } from 'mongodb';
import { Octokit } from 'octokit';

// Create Eden client to connect to master server
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

// Consumer name
const CONSUMER_NAME = 'consumer-1';
// Delay between task checks when no task is found (ms)
const NO_TASK_DELAY = 5000;

// Format date to Hong Kong Time
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
}

interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// GitHub API rate limit management
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  nextRequestTime: number;
  resetTime: Date;
}

interface TokenManager {
  octokit: Octokit;
  rateLimit: RateLimitInfo;
  token: string;
  tokenId: number;
  isExhausted: boolean;
}

// Initialize token managers
const tokenManagers: TokenManager[] = [];

// Create a RateLimitInfo object from GitHub API data
function createRateLimitInfo(rateLimit: RateLimit): RateLimitInfo {
  const resetDate = new Date(rateLimit.reset * 1000);
  return {
    limit: rateLimit.limit,
    remaining: rateLimit.remaining,
    reset: rateLimit.reset,
    used: rateLimit.used,
    resetTime: resetDate,
    nextRequestTime: calculateNextRequestTime(rateLimit.remaining, rateLimit.reset),
  };
}

// Setup token managers with Octokit instances
async function setupTokenManagers() {
  // Load tokens from .tokens file
  const tokensText = await fs.readFile('./.tokens', 'utf-8');
  const tokensData = JSON.parse(tokensText);

  // GitHub tokens from .tokens file
  const githubTokens = tokensData.github_tokens;

  // Create Octokit instances with tokens
  let tokenId = 0;
  for (const token of githubTokens) {
    const octokit = new Octokit({ auth: token });

    try {
      // Get current rate limit information
      const rateLimitResponse = await octokit.request('GET /rate_limit');
      const rateLimit = rateLimitResponse.data.resources.core;
      const rateLimitInfo = createRateLimitInfo(rateLimit);

      tokenManagers.push({
        octokit,
        tokenId: tokenId++,
        token: token.substring(0, 8) + '...', // Store partial token for logging
        isExhausted: rateLimit.remaining <= 0,
        rateLimit: rateLimitInfo,
      });

      console.log(
        `Token ${tokenId} initialized: ${rateLimit.remaining}/${rateLimit.limit} remaining, resets at ${formatDate(rateLimitInfo.resetTime)}`
      );
    } catch (error) {
      console.error(`Failed to initialize token: ${error}`);
    }
  }

  console.log(`Initialized ${tokenManagers.length} GitHub API tokens`);
}

// Log token status changes
function logTokenStatus(manager: TokenManager, wasExhausted: boolean) {
  const { remaining, limit, resetTime } = manager.rateLimit;

  console.log(`QUOTA ${manager.tokenId} ${remaining}/${limit} ${formatDate(resetTime)}`);

  // Log when token is running low
  // if (remaining <= 10) {
  //   console.log(`Token ${manager.token} is running low: ${remaining}/${limit} remaining. Resets at ${formatDate(resetTime)}`);
  // }

  // Log when token gets exhausted
  if (!wasExhausted && manager.isExhausted) {
    console.log(
      `Token ${manager.token} is now exhausted. Will be available again at ${formatDate(resetTime)}`
    );
  }

  // Log when token becomes available again
  if (wasExhausted && !manager.isExhausted) {
    console.log(`Token ${manager.token} is available again with ${remaining}/${limit} requests.`);
  }
}

// Update rate limit info based on response headers
function updateRateLimitInfo(manager: TokenManager, headers: ResponseHeaders) {
  if (!headers) return;

  const limit = parseInt(headers['x-ratelimit-limit'] || manager.rateLimit.limit.toString());
  const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
  const reset = parseInt(headers['x-ratelimit-reset'] || manager.rateLimit.reset.toString());
  const used = parseInt(String(headers['x-ratelimit-used']) || manager.rateLimit.used.toString());
  const resetDate = new Date(reset * 1000);

  const wasExhausted = manager.isExhausted;
  manager.isExhausted = remaining <= 0;

  manager.rateLimit = {
    limit,
    remaining,
    reset,
    used,
    resetTime: resetDate,
    nextRequestTime: calculateNextRequestTime(remaining, reset),
  };

  logTokenStatus(manager, wasExhausted);
}

// Refresh token rate limit info
async function refreshTokenRateLimit(manager: TokenManager) {
  try {
    // Refresh rate limit info
    const response = await manager.octokit.request('GET /rate_limit');
    const rateLimit = response.data.resources.core;

    manager.rateLimit = createRateLimitInfo(rateLimit);
    manager.isExhausted = manager.rateLimit.remaining <= 0;

    console.log(
      `Refreshed token ${manager.token}: ${manager.rateLimit.remaining}/${manager.rateLimit.limit} available, resets at ${formatDate(manager.rateLimit.resetTime)}`
    );

    return true;
  } catch (error) {
    console.error(`Failed to refresh rate limit for token ${manager.token}:`, error);
    return false;
  }
}

// Calculate when to make the next request to distribute evenly until reset
function calculateNextRequestTime(remaining: number, reset: number): number {
  const now = Date.now();
  const resetTime = reset * 1000;
  const timeUntilReset = Math.max(0, resetTime - now) - 5 * 60 * 1000;

  if (remaining <= 0) {
    return resetTime + 1000; // Add 1 second buffer after reset
  }

  // Distribute remaining requests evenly until reset time

  // Use fixed delay between requests
  // const delayBetweenRequests = (1000 * 60 * 60) / 5000;
  const delayBetweenRequests = timeUntilReset / (remaining + 1);
  // We subtract 50ms to ensure all tokens will eventually be used
  return now + delayBetweenRequests; // - 50; // + Math.random() * 100;
}

// Handle GitHub API request with rate limit handling
async function makeGitHubRequest<T>(
  tokenManager: TokenManager,
  endpoint: string,
  params: Record<string, any>
): Promise<T> {
  try {
    const response = await tokenManager.octokit.request(endpoint, {
      ...params,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        ...(params.headers || {}),
      },
    });

    // Update rate limit info from response headers
    updateRateLimitInfo(tokenManager, response.headers);

    return response.data as T;
  } catch (error: any) {
    // If we received API rate limit error, mark token as exhausted
    if (error.status === 403 && error.message?.includes('API rate limit exceeded')) {
      console.log(`Rate limit exceeded for token ${tokenManager.token}, marking as exhausted`);
      tokenManager.isExhausted = true;

      // Update rate limit info if available in headers
      if (error.response?.headers) {
        updateRateLimitInfo(tokenManager, error.response.headers);
      }
    }

    throw error; // Re-throw the error to be handled by the caller
  }
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
    return true;
  } catch (error: any) {
    console.error(`Error processing ${task.nature} task:`, error);

    // TODO: Report error back to master server
    return false;
  }
}

// Process a task
async function processTask(task: WithId<Tasks>, tokenManager: TokenManager) {
  if (isListPullRequests(task)) {
    // Token manager is now passed as parameter
    return handleTaskResponse(
      task,
      async () => {
        // Fetch pull requests
        const data = await makeGitHubRequest<OctokitPullRequest[]>(
          tokenManager,
          'GET /repos/{owner}/{repo}/pulls',
          {
            owner: task.owner,
            repo: task.repo,
            page: task.page,
            per_page: 100,
            state: 'all',
            sort: 'created',
            direction: 'asc',
          }
        );

        return data.map(simplifyPullRequest);
      },
      async (trimmedData, taskId) => {
        return server.response.list_pull_requests.post({
          consumer: CONSUMER_NAME,
          task_id: taskId,
          response: {
            prs: trimmedData,
          },
        });
      }
    );
  } else if (isGetPullRequestDetails(task)) {
    // Token manager is now passed as parameter
    return handleTaskResponse(
      task,
      async () => {
        // Get the pull request details
        const data = await makeGitHubRequest<OctokitPullRequestDetails>(
          tokenManager,
          'GET /repos/{owner}/{repo}/pulls/{pull_number}',
          {
            owner: task.owner,
            repo: task.repo,
            pull_number: task.issue_number,
          }
        );

        return simplifyPullRequestDetails(data);
      },
      async (pr, taskId) => {
        return server.response.get_pull_request_details.post({
          consumer: CONSUMER_NAME,
          task_id: taskId,
          response: { pr },
        });
      }
    );
  } else if (isGetUserDetails(task)) {
    // Token manager is now passed as parameter
    return handleTaskResponse(
      task,
      async () => {
        // Get the user details
        const data = await makeGitHubRequest<OctokitUser>(tokenManager, 'GET /users/{username}', {
          username: task.username,
        });

        return simplifyUserDetails(data);
      },
      async (user, taskId) => {
        return server.response.get_user_details.post({
          consumer: CONSUMER_NAME,
          task_id: taskId,
          response: { user },
        });
      }
    );
  } else if (isGetPullRequestComments(task)) {
    // Token manager is now passed as parameter
    return handleTaskResponse(
      task,
      async () => {
        // Get the pull request comments
        const data = await makeGitHubRequest<OctokitPullRequestComments>(
          tokenManager,
          'GET /repos/{owner}/{repo}/issues/{pull_number}/comments',
          {
            owner: task.owner,
            repo: task.repo,
            pull_number: task.issue_number,
            per_page: 10,
            sort: 'created',
            direction: 'desc',
          }
        );
        return simplifyPullRequestComments(data);
      },
      async (comments, taskId) => {
        return server.response.get_pull_request_comments.post({
          consumer: CONSUMER_NAME,
          task_id: taskId,
          response: {
            pr_id: task.pr_id,
            comments,
          },
        });
      }
    );
  } else {
    console.log(`Unsupported task type: ${task.nature}`);
    return false;
  }
}

// Maximum number of concurrent tasks
const MAX_CONCURRENT_TASKS = 40;
const MAX_PENDING_TASKS = 10;

// Acquire a token for a task, returns the token manager and the time to wait before using it
async function acquireToken(): Promise<{ tokenManager: TokenManager; waitTime: number }> {
  const now = Date.now();

  // Check if we need to refresh rate limit info for any tokens that should have reset
  for (const manager of tokenManagers) {
    if (manager.isExhausted && now >= manager.rateLimit.reset * 1000) {
      await refreshTokenRateLimit(manager);
    }
  }

  if (tokenManagers.length === 0) {
    throw new Error('No token managers available');
  }

  // Find the token manager that will be available soonest
  let bestManager = tokenManagers[0]!;
  let earliestTime = bestManager.rateLimit.nextRequestTime;

  for (const manager of tokenManagers) {
    if (manager.rateLimit.nextRequestTime < earliestTime) {
      bestManager = manager;
      earliestTime = manager.rateLimit.nextRequestTime;
    }
  }

  // Calculate wait time
  const waitTime = Math.max(0, earliestTime - now);

  // Update the next request time for this token immediately to prevent contention
  bestManager.rateLimit.nextRequestTime = calculateNextRequestTime(
    bestManager.rateLimit.remaining - 1,
    bestManager.rateLimit.reset
  );

  return { tokenManager: bestManager, waitTime };
}

// Main loop to consume tasks
async function consumeLoop() {
  // Track pending and processing tasks
  const pendingTasks: Promise<boolean>[] = [];
  const processingTasks: Promise<boolean>[] = [];

  // Function to request and queue a new task
  async function requestAndQueueTask() {
    try {
      // Request a task from the master server
      const consumeResponse = await server.consume.post({
        consumer: CONSUMER_NAME,
        supported: [
          'list_pull_requests',
          'get_pull_request_details',
          'get_user_details',
          'get_pull_request_comments',
        ],
      });

      const task = consumeResponse.data;

      if (task) {
        console.log(
          `TASK-${task._id?.toString() || 'unknown'} assigned to pending queue (${pendingTasks.length + 1}/${MAX_PENDING_TASKS})`
        );

        // Create a task handler that will wait for a token and then process the task
        const taskHandler = async (): Promise<boolean> => {
          try {
            // Acquire a token for this task
            const { tokenManager, waitTime } = await acquireToken();

            // Wait until the token is ready to be used
            if (waitTime > 0) {
              console.log(
                `TASK-${task._id?.toString()} waiting ${(waitTime / 1000).toFixed(2)}s for token`
              );
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }

            // Wait until there's space in the processing queue
            while (processingTasks.length >= MAX_CONCURRENT_TASKS) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Remove from pending queue
            const pendingIndex = pendingTasks.findIndex(p => p === taskPromise);
            if (pendingIndex > -1) {
              pendingTasks.splice(pendingIndex, 1);
            }

            // Start processing and add to processing queue
            console.log(
              `TASK-${task._id?.toString()} moved to processing queue (${processingTasks.length + 1}/${MAX_CONCURRENT_TASKS})`
            );
            const processPromise = processTask(task, tokenManager);
            processingTasks.push(processPromise);

            // Request a new task to fill the pending queue
            if (pendingTasks.length < MAX_PENDING_TASKS) {
              requestAndQueueTask();
            }

            // Handle task completion
            const result = await processPromise;

            // Remove from processing queue when done
            const procIndex = processingTasks.indexOf(processPromise);
            if (procIndex > -1) {
              processingTasks.splice(procIndex, 1);
            }

            return result;
          } catch (error) {
            console.error(`Error in task handler for task ${task._id?.toString()}:`, error);
            return false;
          }
        };

        // Add to pending queue without awaiting completion
        const taskPromise = taskHandler();
        pendingTasks.push(taskPromise);
      }
    } catch (error) {
      console.error('Error requesting task:', error);
    }
  }

  // Initial filling of the pending queue
  for (let i = 0; i < MAX_PENDING_TASKS; i++) {
    await requestAndQueueTask();
  }

  // Keep the loop running to monitor the task queues
  while (true) {
    try {
      // Check if we need to refill the pending queue
      if (pendingTasks.length < MAX_PENDING_TASKS) {
        requestAndQueueTask();
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error in consume loop:', error);
      await new Promise(resolve => setTimeout(resolve, NO_TASK_DELAY));
    }
  }
}

// Main function
async function main() {
  try {
    // Setup token managers
    await setupTokenManagers();

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
