// screen -L -dmS stage-90 ./run.sh src/90-run-stages-10-to-40.ts
// screen -L -dmS stage-90 ./run.sh src/90-run-stages-10-to-40.ts --skip [6,10,11,12,20] --skip-current-tasks
import { exec } from 'child_process';
import { client, tasks } from 'master-0/src/data';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  console.log({ args });
  const skipArg = args.findIndex(arg => arg === '--skip');

  if (skipArg !== -1 && skipArg + 1 < args.length) {
    try {
      // Try to parse the next argument as a JSON array
      const skipArgValue = args[skipArg + 1];
      if (skipArgValue) {
        return JSON.parse(skipArgValue);
      }
    } catch (e) {
      console.error('Error parsing --skip argument. Expected JSON array format.');
      console.error('Example: --skip "[6,10,11]"');
      process.exit(1);
    }
  }

  return [];
}

// Get stages to skip from command line
const stageSkipList = parseArgs();
console.log(`Will skip stages: ${stageSkipList.join(', ')}`);

async function runStage(stage: string) {
  try {
    console.log(`=== Running stage ${stage}...`);
    const { stdout, stderr } = await execPromise(`bun run src/${stage}`);
    console.log(`Stage ${stage} stdout:\n${stdout}`);
    if (stderr) {
      console.error(`Stage ${stage} stderr:\n${stderr}`);
      onGoing = false;
      throw new Error(`Stage ${stage} failed`);
    }
    console.log(`=== Stage ${stage} completed`);
  } catch (error) {
    console.error(`=== Error running stage ${stage}:`, error);
    onGoing = false;
    throw error;
  }
}

async function waitUntilAllTasksCompleted(currentCycle: number) {
  while (true) {
    const incompleteTasksCount = await tasks.countDocuments({ completed: false });
    if (incompleteTasksCount === 0) break;
    console.log(`[C${currentCycle}] ${incompleteTasksCount} tasks remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

let onGoing = true;
let cycleCount = 0;
let lastCycleTime = 0;

const CYCLE_INTERVAL = 1000 * 60 * 10; // 10 minutes

async function cycle(skip: number[] = []) {
  if (Date.now() - lastCycleTime < CYCLE_INTERVAL) {
    // panic, stop the cycle if it's too frequent
    throw new Error('Cycle is too frequent');
  }

  const currentCycle = cycleCount++;

  console.log(`======== Cycle ${currentCycle} started at ${new Date().toISOString()} ========`);
  if (skip.length === 0) {
    lastCycleTime = Date.now();
  }

  if (!skip.includes(6)) {
    await runStage('06-sample-prs.ts');
  }

  if (!skip.includes(10)) {
    await runStage('10-select-merged-prs.ts');
  }

  if (!skip.includes(11)) {
    await runStage('11-start-crawl-comments.ts');
  }

  await waitUntilAllTasksCompleted(currentCycle);

  if (!skip.includes(12)) {
    await runStage('12-start-feature-engineering-of-closed-reason.ts');
  }

  if (!skip.includes(20)) {
    // this step runs for all sampled PRs
    await runStage('20-run-get-code-diff.ts');
  }

  await waitUntilAllTasksCompleted(currentCycle);

  if (!skip.includes(13)) {
    await runStage('13-select-some-closed-prs.ts');
  }

  await waitUntilAllTasksCompleted(currentCycle);

  if (!skip.includes(30)) {
    await runStage('30-start-feature-engineering-of-nature.ts');
  }

  if (!skip.includes(40)) {
    await runStage('40-start-feature-engineering-of-changes-quality.ts');
  }

  if (!skip.includes(41)) {
    await runStage('41-start-feature-engineering-of-description-quality.ts');
  }

  if (onGoing) {
    // async function
    cycle(); // this will run 06 to 10 and after all tasks from 30 and 40 are completed, it will run 12
  }

  await waitUntilAllTasksCompleted(currentCycle);
}

async function main() {
  const isSkipCurrentTasks = process.argv.includes('--skip-current-tasks');

  // connect to the database
  await client.connect();
  console.log('Connected to the database');

  // Start first cycle with the provided skip list
  cycle(stageSkipList);

  // watchdog, check the task count every 10 seconds, should not larger than 30000
  let lowTaskCountStartTime: number | null = isSkipCurrentTasks ? 1 : null;
  const LOW_TASK_THRESHOLD = 30;
  const LOW_TASK_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

  try {
    while (true) {
      const taskCount = await tasks.countDocuments({ completed: false });

      // Check for too many tasks
      if (taskCount > 30000) {
        console.error(`Task count is too large: ${taskCount}`);
        onGoing = false;
      }

      // Track low task count duration
      if (taskCount < LOW_TASK_THRESHOLD) {
        if (!lowTaskCountStartTime) {
          lowTaskCountStartTime = Date.now();
          console.log(`Task count below ${LOW_TASK_THRESHOLD}, starting timer`);

          // Run stage 91 to refresh remaining tasks
          await runStage('91-refresh-remaining-tasks.ts');
        } else if (Date.now() - lowTaskCountStartTime > LOW_TASK_DURATION) {
          console.log(
            `Task count below ${LOW_TASK_THRESHOLD} for over 20 minutes, running stage 92`
          );

          // Run stage 92 to kill stale tasks and unselect related PRs
          await runStage('92-kill-stale-tasks-and-unselect-related-prs.ts');

          lowTaskCountStartTime = null; // Reset timer after taking action
        }
      } else {
        if (lowTaskCountStartTime) {
          console.log('Task count increased above threshold, resetting timer');
          lowTaskCountStartTime = null;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  } catch (error) {
    console.error('Error in watchdog:', error);
    onGoing = false;
  } finally {
    await client.close();
  }

  process.exit(0);
}

main().catch(console.error);
