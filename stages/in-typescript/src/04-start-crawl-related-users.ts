import { type Static } from 'elysia';
import { produceTasks } from 'master-0/src/app';
import { client, pullRequests } from 'master-0/src/data';
import { GetUserDetails } from 'master-0/src/types';

// ========================================================
// = NOTE
// After running this, we found 111595 related users. However,
// not all of their user details can be crawled. (0.01% of them)
// Make sure to provide default values for the missing fields
// when constructing the dataset.
// ========================================================

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    await client.connect();
    console.log('Connected to MongoDB');

    // get all distinct users from all the PRs
    const users: string[] = await pullRequests.distinct('user.login');
    console.log(`Found ${users.length} related users`);

    console.log(`Constructing ${users.length} tasks...`);

    const inserting = users.map(
      user =>
        ({
          nature: 'get_user_details',
          username: user,
          created_at: new Date(),
          completed: false,
        }) satisfies Static<typeof GetUserDetails>
    );

    if (dryRun) {
      console.error('Dry run complete');
      return;
    }

    console.log(`Inserting ${inserting.length} tasks...`);
    await produceTasks(inserting);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
