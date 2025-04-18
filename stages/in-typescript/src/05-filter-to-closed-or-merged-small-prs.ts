import { client, pullRequestDetails, pullRequestsFilter } from 'master-0/src/data';

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    // find a random PR for test only
    const prs = await pullRequestDetails
      .find({
        state: 'closed',
        // additions + deletions < 200
        $expr: {
          $lt: [{ $add: ['$additions', '$deletions'] }, 200],
        },
      })
      .toArray();
    console.log(`Filtered to ${prs.length} PRs`);

    if (dryRun) {
      console.error('Dry run complete');
      return;
    }

    // Save the PRs to a file
    await Bun.write(
      'results/filtered-prs.json',
      JSON.stringify(
        prs.map(pr => pr.id),
        null,
        2
      )
    );
    console.log('Filtered PRs saved to filtered-prs.json');

    // write to pullRequestsFilter
    await pullRequestsFilter.deleteMany({});
    await pullRequestsFilter.insertMany(
      prs.map(pr => ({
        foreign_id: pr.id,
      }))
    );
    console.log('PRs saved to pullRequestsFilter');

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
