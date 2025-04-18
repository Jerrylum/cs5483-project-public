import type { Static } from 'elysia';
import { produceTasks } from 'master-0/src/app.ts';
import {
  client,
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequestsFilter,
} from 'master-0/src/data';
import { FeatureEngineeringViaLLM } from 'master-0/src/types';

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    const prsInFilter = (await pullRequestsFilter
      .aggregate([
        {
          $match: { '2nd-selected': true },
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
            'ext.features.changes-quality': { $exists: false },
          },
        },
        {
          $project: {
            id: '$pr.id',
            number: '$pr.number',
            title: '$pr.title',
            body: '$pr.body',
            url: '$pr.url',
            code_diff: '$ext.features.code_diff',
          },
        },
      ])
      .toArray()) as {
      id: number;
      url: string;
      code_diff: string;
      number: number;
      title: string;
      body: string;
    }[];

    console.log(`Constructing ${prsInFilter.length} tasks...`);
    const inserting = prsInFilter.map(pr => {
      const splits = pr.url.split('/');
      const owner = splits.at(-4)!;
      const repo = splits.at(-3)!;

      return {
        nature: 'feature_engineering_via_llm',
        pr_id: pr.id,
        owner,
        repo,
        issue_number: pr.number,
        feature_name: 'changes-quality',
        prompt_template: 'changesQuality',
        prompt_values: {
          title: pr.title,
          description: pr.body ?? '',
          code_changes: pr.code_diff,
        },
        created_at: new Date(),
        completed: false,
      } satisfies Static<typeof FeatureEngineeringViaLLM>;
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
