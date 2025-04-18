import { client, tasks } from 'master-0/src/data';

/**
 * Refreshes the assigned_at timestamp for all incomplete tasks
 * by setting it to 1 hour ago, allowing them to be reassigned.
 */
async function refreshRemainingTasks() {
  try {
    console.log('Refreshing remaining tasks...');
    const result = await tasks.updateMany(
      { completed: false },
      { $set: { assigned_at: new Date(Date.now() - 60 * 60 * 1000) } }
    );

    console.log(`Updated ${result.modifiedCount} tasks to be reassigned`);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error refreshing remaining tasks:', error);
    throw error;
  }
}

async function main() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Refresh remaining tasks
    await refreshRemainingTasks();

    console.log('Refresh operation completed successfully');
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    await client.close();
    console.log('Disconnected from the database');
  }
}

// Export the function for use in other modules
export { refreshRemainingTasks };

// Run the script if it's called directly
if (require.main === module) {
  main().catch(console.error);
}
