import type { Static } from 'elysia';
import { produceTasks } from 'master-0/src/app.ts';
import {
  client,
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequestsFilter,
} from 'master-0/src/data';
import { FeatureEngineeringViaLLM, type PullRequestComment } from 'master-0/src/types';

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    interface PullRequestProjected {
      id: number;
      number: number;
      title: string;
      body: string;
      url: string;
      last_10_comments: PullRequestComment[];
      // closed_reason: string;
      created_at: string;
      closed_at: string | null;
    }

    const prsInFilter = (await pullRequestsFilter
      .aggregate([
        {
          $match: {
            selected: true,
            '2nd-selected': { $exists: false },
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
          $project: {
            id: '$pr.id',
            number: '$pr.number',
            title: '$pr.title',
            body: '$pr.body',
            url: '$pr.url',
            created_at: '$pr.created_at',
            closed_at: '$pr.closed_at',
            last_10_comments: '$ext.features.last_10_comments',
            // closed_reason: "$ext.features.closed-reason"
          },
        },
      ])
      .toArray()) as PullRequestProjected[];

    console.log(
      `Found ${prsInFilter.length} PRs in the filter collection that are selected and not second-selected (non-merged PRs)`
    );

    console.log(`Constructing ${prsInFilter.length} tasks...`);
    const inserting = prsInFilter
      // .filter(pr => !extractJsonFromDeepseekResponse(pr.closed_reason))
      .map(pr => {
        const splits = pr.url.split('/');
        const owner = splits.at(-4)!;
        const repo = splits.at(-3)!;

        return {
          nature: 'feature_engineering_via_llm',
          pr_id: pr.id,
          owner,
          repo,
          issue_number: pr.number,
          feature_name: 'closed-reason',
          prompt_template: 'closedReason',
          prompt_values: {
            title: pr.title,
            description: pr.body ?? '',
            created_at: pr.created_at,
            closed_at: pr.closed_at ?? '',
            last_10_comments: pr.last_10_comments
              .map(c => {
                return `
### User
====================
${c.user.login}
====================

### Body
====================
${c.body}
====================

### Author association: ${c.author_association}

### Commented at: ${c.created_at}
`;
              })
              .join('\n'),
          },
          created_at: new Date(),
          completed: false,
        } satisfies Static<typeof FeatureEngineeringViaLLM>;
      });

    // console.log(`Found ${inserting.length} PRs that have no closed reason`);

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

// sandbox().catch(console.error);
main().catch(console.error);
