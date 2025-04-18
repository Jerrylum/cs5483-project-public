import { treaty } from '@elysiajs/eden';
import type { Static } from 'elysia';
import { app, consume, produceTask, produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequestExtraFeatures, pullRequests, pullRequestsFilter } from 'master-0/src/data';
import { FeatureEngineeringViaLLM, GetPullRequestDetails, isFeatureEngineeringViaLLM } from 'master-0/src/types';
import { ObjectId } from 'mongodb';

// Create Eden client
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

async function main() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');


    const prsInFilter = await pullRequestsFilter.aggregate([
      {
        $match: { selected: true }
      },
      {
        $lookup: {
          from: pullRequestDetails.collectionName,
          localField: "foreign_id",
          foreignField: "id",
          as: "pr"
        }
      },
      {
        $unwind: "$pr"
      },
      {
        $lookup: {
          from: pullRequestExtraFeatures.collectionName,
          localField: "pr.id",
          foreignField: "id",
          as: "ext"
        }
      },
      // {
      //   $match: {
      //     "ext.features.code-change-relationship": { $exists: false }
      //   }
      // },
      {
        $project: {
          id: "$pr.id",
          number: "$pr.number",
          title: "$pr.title",
          body: "$pr.body",
          url: "$pr.url",
          code_diff: "$ext.features.code_diff"
        }
      }
    ]).limit(10).toArray() as { id: number, url: string, code_diff: string, number: number, title: string, body: string }[];

    console.log(`Constructing task...`);

    const pr = prsInFilter[0]!;
    const inserting = (() => {
      const splits = pr.url.split('/');
      const owner = splits.at(-4)!;
      const repo = splits.at(-3)!;

      return {
        nature: 'feature_engineering_via_llm',
        pr_id: pr.id,
        owner,
        repo,
        issue_number: pr.number,
        feature_name: 'code-change-relationship',
        prompt_template: "codeChangeRelationship",
        // feature_name: 'nature',
        // prompt_template: "nature",
        prompt_values: {
          'title': pr.title,
          'description': pr.body ?? '',
          'code_changes': pr.code_diff,
        },
        created_at: new Date(),
        completed: false,
      } satisfies Static<typeof FeatureEngineeringViaLLM>;
    })();

    // await produceTask(inserting);
    // await produceTask(inserting);
    // await produceTask(inserting);
    // await produceTask(inserting);
    // await produceTask(inserting);
    for (let i = 0; i < 40; i++) {
      await produceTask(inserting);
    }

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
