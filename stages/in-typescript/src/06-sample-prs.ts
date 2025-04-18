import { client, pullRequestDetails, pullRequestsFilter } from 'master-0/src/data';

async function main() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Counting initial PRs...');
    // Get initial count of selected PRs
    const initialCount = await pullRequestsFilter.countDocuments({ selected: true });
    console.log(`Initial selected PR count: ${initialCount}`);

    console.log('Sampling and marking PRs...');
    await pullRequestsFilter
      .aggregate([
        { $match: { selected: { $exists: false } } },
        {
          $lookup: {
            from: pullRequestDetails.collectionName,
            localField: 'foreign_id',
            foreignField: 'id',
            as: 'pr_details',
          },
        },
        {
          $unwind: '$pr_details',
        },
        { $match: { 'pr_details.merged_at': null } },
        { $sample: { size: 7000 } },
        { $addFields: { selected: true } },
        {
          $project: {
            _id: 1,
            selected: 1,
          },
        },
        {
          $merge: {
            into: pullRequestsFilter.collectionName,
            on: '_id',
            whenMatched: 'merge',
          },
        },
      ])
      .toArray();

    await pullRequestsFilter
      .aggregate([
        { $match: { selected: { $exists: false } } },
        {
          $lookup: {
            from: pullRequestDetails.collectionName,
            localField: 'foreign_id',
            foreignField: 'id',
            as: 'pr_details',
          },
        },
        {
          $unwind: '$pr_details',
        },
        { $match: { 'pr_details.merged_at': { $ne: null } } },
        { $sample: { size: 3000 } },
        { $addFields: { selected: true } },
        {
          $project: {
            _id: 1,
            selected: 1,
          },
        },
        {
          $merge: {
            into: pullRequestsFilter.collectionName,
            on: '_id',
            whenMatched: 'merge',
          },
        },
      ])
      .toArray();

    console.log('Counting final PRs...');
    // Get final count of selected PRs to verify
    const finalCount = await pullRequestsFilter.countDocuments({ selected: true });
    console.log(`Marked ${finalCount - initialCount} PRs as selected`);
    console.log(`Total PRs now marked as selected: ${finalCount}`);

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
