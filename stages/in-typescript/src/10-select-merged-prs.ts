import {
  client,
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequestsFilter,
} from 'master-0/src/data';

async function main() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Counting initial PRs...');
    // Get initial count of selected PRs
    const initialCount = await pullRequestsFilter.countDocuments({ '2nd-selected': true });
    console.log(`Initial 2nd-selected PR count: ${initialCount}`);

    console.log('Sampling and marking PRs...');

    // First, get the list of merged PRs
    const mergedPRs = await pullRequestsFilter
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
        { $unwind: '$pr' },
        {
          $match: {
            'pr.merged_at': { $ne: null },
          },
        },
        {
          $project: {
            _id: 1,
            foreign_id: 1,
            'pr.id': 1,
          },
        },
      ])
      .toArray();

    console.log(`Found ${mergedPRs.length} merged PRs to process`);

    if (mergedPRs.length > 0) {
      // Update pullRequestExtraFeatures to set features.final-state to "merged"
      console.log('Setting final-state to "merged" in pullRequestExtraFeatures...');

      // Extract all PR IDs for bulk operation
      const prIds = mergedPRs.map(pr => pr.pr.id);

      // Create bulk operations for each PR
      const bulkOps = prIds.map(prId => ({
        updateOne: {
          filter: { id: prId },
          update: {
            $set: {
              'features.final-state': 'merged',
            },
          },
          upsert: true,
        },
      }));

      // Execute bulk operations
      const extraFeaturesResult = await pullRequestExtraFeatures.bulkWrite(bulkOps);

      console.log(
        `Updated/inserted ${extraFeaturesResult.upsertedCount + extraFeaturesResult.modifiedCount} PRs (${extraFeaturesResult.upsertedCount} new, ${extraFeaturesResult.modifiedCount} modified)`
      );

      // Now mark them as 2nd-selected in pullRequestsFilter
      console.log('Marking PRs as 2nd-selected...');

      // Extract all PR _ids for bulk operation
      const prObjectIds = mergedPRs.map(pr => pr._id);

      // Use updateMany for setting 2nd-selected in one operation
      const filterResult = await pullRequestsFilter.updateMany(
        { _id: { $in: prObjectIds } },
        { $set: { '2nd-selected': true } }
      );

      console.log(`Marked ${filterResult.modifiedCount} PRs as 2nd-selected`);
    }

    console.log('Counting final PRs...');
    // Get final count of selected PRs to verify
    const finalCount = await pullRequestsFilter.countDocuments({ '2nd-selected': true });
    console.log(`Marked ${finalCount - initialCount} PRs as selected`);
    console.log(`Total PRs now marked as 2nd-selected: ${finalCount}`);

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
