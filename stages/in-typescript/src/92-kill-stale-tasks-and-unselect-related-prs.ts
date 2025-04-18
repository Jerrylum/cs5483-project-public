import { client, pullRequestsFilter, tasks } from 'master-0/src/data';

/**
 * Finds stale tasks, marks them as completed, and unselects their related PRs.
 * This helps prevent tasks from being stuck indefinitely.
 */
async function killStaleTasksAndUnselectRelatedPRs() {
  try {
    console.log('Looking for stale tasks...');

    // Get PR IDs from incomplete tasks
    const prIds = await tasks.find({ completed: false }).project({ pr_id: 1 }).toArray();

    if (prIds.length === 0) {
      console.log('No incomplete tasks found.');
      return 0;
    }

    const prIdList = prIds.map(t => t.pr_id).filter(Boolean);
    console.log(`Found ${prIdList.length} PRs with incomplete tasks: ${prIdList.join(', ')}`);

    // Update pullRequestsFilter to unselect these PRs
    const prUpdateResult = await pullRequestsFilter.updateMany(
      { foreign_id: { $in: prIdList } },
      // { $unset: { selected: "" } }
      { $set: { selected: false, '2nd-selected': false } }
    );

    console.log(`Unselected ${prUpdateResult.modifiedCount} PRs in pullRequestsFilter`);

    // Mark the tasks as completed
    const taskUpdateResult = await tasks.updateMany(
      { pr_id: { $in: prIdList } },
      { $set: { completed: true } }
    );

    console.log(`Marked ${taskUpdateResult.modifiedCount} tasks as completed`);

    return taskUpdateResult.modifiedCount;
  } catch (error) {
    console.error('Error while killing stale tasks:', error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Kill stale tasks and unselect related PRs
    await killStaleTasksAndUnselectRelatedPRs();

    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await client.close();
    console.log('Disconnected from the database');
  }
}

// Export the function for use in other modules
export { killStaleTasksAndUnselectRelatedPRs };

// Run the script if it's called directly
if (require.main === module) {
  main().catch(console.error);
}
