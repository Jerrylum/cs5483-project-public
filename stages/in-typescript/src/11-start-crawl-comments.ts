import type { Static } from 'elysia';
import { produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequestsFilter } from 'master-0/src/data';
import { GetPullRequestComments } from 'master-0/src/types';

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    const prsInFilter = await pullRequestsFilter
      .aggregate([
        {
          $match: { selected: true },
        },
        {
          $lookup: {
            from: pullRequestDetails.collectionName,
            localField: 'foreign_id',
            foreignField: 'id',
            as: 'pr',
          },
        },
        {
          $unwind: '$pr',
        },
        {
          $match: {
            selected: true,
            '2nd-selected': { $exists: false },
          },
        },
        {
          $project: {
            id: '$pr.id',
            url: '$pr.url',
            number: '$pr.number',
          },
        },
      ])
      .toArray();
    console.log(
      `Found ${prsInFilter.length} PRs in the filter collection that are selected and not second-selected (non-merged PRs)`
    );

    if (dryRun) {
      console.error('Dry run complete');
      return;
    }

    console.log(`Constructing ${prsInFilter.length} tasks...`);

    const inserting = prsInFilter.map(pr => {
      const splits = pr.url.split('/');
      const owner = splits.at(-4)!;
      const repo = splits.at(-3)!;

      return {
        nature: 'get_pull_request_comments',
        owner,
        repo,
        issue_number: pr.number,
        pr_id: pr.id,
        created_at: new Date(),
        completed: false,
      } satisfies Static<typeof GetPullRequestComments>;
    });

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
