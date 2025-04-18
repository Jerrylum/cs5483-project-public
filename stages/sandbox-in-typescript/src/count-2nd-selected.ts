import type { Static } from 'elysia';
import { produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequestExtraFeatures, pullRequestsFilter } from 'master-0/src/data';
import { FeatureEngineeringViaLLM } from 'master-0/src/types';

async function main() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    {
      const prsInFilter = await pullRequestsFilter.aggregate([
        {
          $match: { "2nd-selected": true }
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
        {
          $unwind: "$ext"
        },
        {
          $project: {
            id: "$pr.id",
            "final-state": "$ext.features.final-state"
          }
        }
      ]).toArray() as { id: number }[];

      console.log(`The number of PRs in filter is ${prsInFilter.length}`);
    }

    // return;

    const prsInFilter = await pullRequestsFilter.aggregate([
      {
        $match: { "2nd-selected": true }
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
          localField: "id",
          foreignField: "id",
          as: "ext"
        }
      },
      {
        $unwind: "$ext"
      },
      {
        $project: {
          id: "$pr.id",
          "final-state": "$ext.features.final-state"
        }
      }
    ]).toArray() as { id: number, "final-state"?: string }[];

    console.log(`The number of PRs in filter is ${prsInFilter.length}`);

    // how many are merged?
    const mergedCount = prsInFilter.filter(pr => pr["final-state"] === "merged").length;
    console.log(`The number of merged PRs is ${mergedCount}, rate: ${mergedCount / prsInFilter.length}`);

    // how many are pending?
    const pendingCount = prsInFilter.filter(pr => pr["final-state"] === "pending-merge").length;
    console.log(`The number of pending PRs is ${pendingCount}, rate: ${pendingCount / prsInFilter.length}`);

    // how many are other?
    const otherCount = prsInFilter.filter(pr => pr["final-state"] !== "merged" && pr["final-state"] !== "pending-merge").length;
    console.log(`The number of closed PRs is ${otherCount}, rate: ${otherCount / prsInFilter.length}`);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
