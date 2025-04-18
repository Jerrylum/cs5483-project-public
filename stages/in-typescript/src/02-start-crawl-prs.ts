import type { Static } from 'elysia';
import { produceTask } from 'master-0/src/app.ts';
import { client, topRepos, topReposFilter } from 'master-0/src/data';
import { type ListPullRequests } from 'master-0/src/types';

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    await client.connect();
    console.log('Connected to MongoDB');

    // Get the collection name from topReposFilter
    const filterCollectionName = topReposFilter.collectionName;

    // Find repos that are in both collections using a more direct approach
    const reposInBothCollections = await topRepos
      .aggregate([
        {
          $lookup: {
            from: filterCollectionName,
            let: { repoId: '$_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$foreign_id', '$$repoId'] } } }],
            as: 'matches',
          },
        },
        {
          $match: { 'matches.0': { $exists: true } }, // This checks if there's at least one element in the matches array.
        },
        {
          $project: {
            matches: 0, // Exclude only the matches field, keep all original fields
          },
        },
      ])
      .toArray();

    console.log(`Found ${reposInBothCollections.length} engineering software repositories`);

    const n = 60;
    const topNRepos = reposInBothCollections.slice(0, n);

    console.log(`Processing ${topNRepos.length} repositories`);

    if (dryRun) {
      console.error('Dry run complete');
      return;
    }

    // insert tasks for each repo in reposInBothCollections
    for (const repo of topNRepos) {
      await produceTask({
        nature: 'list_pull_requests',
        repo_id: repo._id.toString(),
        owner: repo.full_name.split('/')[0] || '',
        repo: repo.full_name.split('/')[1] || '',
        page: 1,
        created_at: new Date(),
        completed: false,
      } satisfies Static<typeof ListPullRequests>);
    }

    console.log('Tasks inserted');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// sandbox().catch(console.error);
main().catch(console.error);
