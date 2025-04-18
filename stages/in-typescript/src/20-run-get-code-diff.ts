import type { Static } from 'elysia';
import { produceTasks } from 'master-0/src/app.ts';
import {
  client,
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequestsFilter,
} from 'master-0/src/data';
import { GetPullRequestCodeDiff } from 'master-0/src/types';

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
          $match: {
            selected: true,
          },
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
          $lookup: {
            from: pullRequestExtraFeatures.collectionName,
            localField: 'pr.id',
            foreignField: 'id',
            as: 'ext',
          },
        },
        {
          $unwind: '$ext',
        },
        {
          $match: {
            $or: [
              {
                ext: { $exists: false },
              },
              {
                'ext.features.code_diff': { $eq: null },
              },
            ],
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

    console.log(`Found ${prsInFilter.length} PRs in the filter collection`);

    console.log(`Constructing ${prsInFilter.length} tasks...`);

    const inserting = prsInFilter.map(pr => {
      const splits = pr.url.split('/');
      const owner = splits.at(-4)!;
      const repo = splits.at(-3)!;

      return {
        nature: 'get_pull_request_code_diff',
        owner,
        repo,
        issue_number: pr.number,
        pr_id: pr.id,
        created_at: new Date(),
        completed: false,
      } satisfies Static<typeof GetPullRequestCodeDiff>;
    });

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
