import { treaty } from '@elysiajs/eden';
import type { Static } from 'elysia';
import { app, consume, produceTask, produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequestExtraFeatures, pullRequests, pullRequestsFilter } from 'master-0/src/data';
import { FeatureEngineeringViaLLM, GetPullRequestDetails, isFeatureEngineeringViaLLM, PullRequestDetails } from 'master-0/src/types';
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
      }
    ]).toArray() as { pr: PullRequestDetails }[];

    console.log(`Total PRs: ${prsInFilter.length}`);
    console.log(`First PR:`, prsInFilter[0]);

    const mergedPRs = prsInFilter.filter(pr => pr.pr.merged_at);
    const closedPRs = prsInFilter.filter(pr => !pr.pr.merged_at);

    console.log(`Merged PRs: ${mergedPRs.length}`);
    console.log(`Closed PRs: ${closedPRs.length}`);

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
