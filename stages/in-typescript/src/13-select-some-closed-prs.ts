import { treaty } from '@elysiajs/eden';
import { app } from 'master-0/src/app.ts';
import {
  client,
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequestsFilter,
} from 'master-0/src/data';
import { extractJsonFromDeepseekResponse } from 'master-0/src/utils';
import { ObjectId } from 'mongodb';

// Create Eden client
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    interface PullRequestProjected {
      pr_id: number;
      filter_id: ObjectId;
      closed_reason: string;
    }

    const prs = (await pullRequestsFilter
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
          $match: {
            'ext.features.closed-reason': { $exists: true },
          },
        },
        {
          $project: {
            pr_id: '$pr.id',
            filter_id: '$_id',
            closed_reason: '$ext.features.closed-reason',
          },
        },
      ])
      .toArray()) as PullRequestProjected[];

    console.log(
      `Found ${prs.length} PRs with inner joins to pullRequestsFilter and pullRequestDetails`
    );

    // const normalCount = prs.filter(pr => {
    //   const closedReason = pr["features"]["closed-reason"];
    //   try {
    //     const json = extractJsonFromDeepseekResponse(closedReason);
    //     if (!json) return false;
    //     return json["categories"] === "normal" //|| json["categories"] === "pending-merge";
    //   } catch (error) {
    //     console.error('Error:', error, closedReason);
    //     return false;
    //   }
    // }).length;

    // console.log("The normal count is", normalCount);

    const markAsSelected: PullRequestProjected[] = [];
    const markAsClosed: PullRequestProjected[] = [];
    const markAsPendingMerge: PullRequestProjected[] = [];
    const markAsNotSelected: PullRequestProjected[] = [];

    for (const pr of prs) {
      const closedReason = pr.closed_reason;
      try {
        const json = extractJsonFromDeepseekResponse(closedReason);
        if (!json) {
          markAsNotSelected.push(pr);
        } else if (json['categories'] === 'normal') {
          markAsSelected.push(pr);
          markAsClosed.push(pr);
        } else if (json['categories'] === 'pending-merge') {
          markAsSelected.push(pr);
          markAsPendingMerge.push(pr);
        } else {
          markAsNotSelected.push(pr);
        }
      } catch (error) {
        markAsNotSelected.push(pr);
      }
    }
    console.log(`Marking ${markAsSelected.length} PRs as selected`);
    console.log(`Marking ${markAsClosed.length} PRs as closed`);
    console.log(`Marking ${markAsPendingMerge.length} PRs as pending-merge`);
    console.log(`Marking ${markAsNotSelected.length} PRs as not selected`);
    if (dryRun) {
      console.error('Dry run complete');
      return;
    }

    await pullRequestsFilter.updateMany(
      { _id: { $in: markAsSelected.map(pr => pr.filter_id) } },
      { $set: { '2nd-selected': true } }
    );

    console.log(`Marked ${markAsSelected.length} PRs as selected`);

    if (markAsClosed.length !== 0) {
      // Create bulk operations for closed PRs
      const closedBulkOps = markAsClosed.map(pr => ({
        updateOne: {
          filter: { id: pr.pr_id },
          update: { $set: { 'features.final-state': 'closed' } },
          upsert: true,
        },
      }));

      const closedResult = await pullRequestExtraFeatures.bulkWrite(closedBulkOps);
      console.log(
        `Marked ${closedResult.upsertedCount + closedResult.modifiedCount} PRs as closed (${closedResult.upsertedCount} new, ${closedResult.modifiedCount} modified)`
      );
    }

    if (markAsPendingMerge.length !== 0) {
      // Create bulk operations for pending-merge PRs
      const pendingMergeBulkOps = markAsPendingMerge.map(pr => ({
        updateOne: {
          filter: { id: pr.pr_id },
          update: { $set: { 'features.final-state': 'pending-merge' } },
          upsert: true,
        },
      }));

      const pendingResult = await pullRequestExtraFeatures.bulkWrite(pendingMergeBulkOps);
      console.log(
        `Marked ${pendingResult.upsertedCount + pendingResult.modifiedCount} PRs as pending-merge (${pendingResult.upsertedCount} new, ${pendingResult.modifiedCount} modified)`
      );
    }

    await pullRequestsFilter.updateMany(
      { _id: { $in: markAsNotSelected.map(pr => pr.filter_id) } },
      { $set: { '2nd-selected': false } }
    );

    console.log(`Marked ${markAsNotSelected.length} PRs as not selected`);

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
