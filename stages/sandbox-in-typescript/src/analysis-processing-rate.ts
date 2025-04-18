import { treaty } from '@elysiajs/eden';
import { app } from 'master-0/src/app.ts';
import { client, tasks } from 'master-0/src/data';
import { Tasks } from 'master-0/src/types';

// Create Eden client
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

// Get command line arguments
const taskNature = process.argv[2];

// Connect to MongoDB and analyze tasks processing rate
async function main() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    if (!taskNature) {
      console.log("Usage: bun run processing-rate <task_nature>");
      console.log("Available task natures: 'list_pull_requests', 'get_pull_request_details', 'get_pull_request_code_diff'");
      return;
    }

    let filter = {};
    if (taskNature === 'list_pull_requests' || taskNature === 'get_pull_request_details') {
      filter = { nature: { $in: ['list_pull_requests', 'get_pull_request_details'] } };
      console.log(`Analyzing tasks with nature: list_pull_requests or get_pull_request_details`);
    } else if (taskNature === 'get_pull_request_code_diff') {
      filter = { nature: 'get_pull_request_code_diff' };
      console.log(`Analyzing tasks with nature: get_pull_request_code_diff`);
    } else if (taskNature === 'llm_tasks') {
      filter = { nature: { $in: ['feature_engineering_via_llm'] } };
      console.log(`Analyzing tasks with nature: feature_engineering_via_llm`);
    } else {
      console.log(`Invalid task nature: ${taskNature}`);
      console.log("Available task natures: 'list_pull_requests', 'get_pull_request_details', 'get_pull_request_code_diff', 'llm_tasks'");
      return;
    }

    // Analyze processing rate in the last hour
    const lastHourTime = new Date(Date.now() - 60 * 60 * 1000);
    const lastHourTasks = await tasks.countDocuments({ 
      ...filter,
      completed: true,
      completed_at: { $gte: lastHourTime }
    });
    
    console.log('\n--- Last Hour Processing Rate ---');
    console.log(`Tasks completed in the last hour: ${lastHourTasks}`);
    console.log(`Last hour processing rate: ${lastHourTasks.toFixed(2)} tasks/hour`);

    // Analyze processing rate per hour
    console.log('\n--- Processing Rate Per Hour ---');
    const completedTasksWithTime = await tasks.find({ 
      ...filter,
      completed: true,
      completed_at: { 
        $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) 
      }
    }).toArray();
    
    // Group tasks by hour
    const tasksByHour = {};
    
    completedTasksWithTime.forEach(task => {
      if (task.completed_at) {
        const hourKey = new Date(task.completed_at).toLocaleString('en-GB', { timeZone: 'Asia/Hong_Kong' }).split(':')[0];
        if (!tasksByHour[hourKey]) {
          console.log("processing", hourKey, "...");
        }
        tasksByHour[hourKey] = (tasksByHour[hourKey] || 0) + 1;
      }
    });
    
    // Sort hours and display processing rate
    const sortedHours = Object.keys(tasksByHour).sort();
    sortedHours.forEach(hour => {
      const displayHour = hour.replace('T', ' ');
      console.log(`${displayHour}: ${tasksByHour[hour]} tasks`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
