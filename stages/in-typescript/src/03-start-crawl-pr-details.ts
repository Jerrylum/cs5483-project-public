import type { Static } from 'elysia';
import { produceTasks } from 'master-0/src/app.ts';
import { client, pullRequests } from 'master-0/src/data';
import { GetPullRequestDetails } from 'master-0/src/types';
import { ObjectId } from 'mongodb';

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    const prs = await pullRequests
      .find()
      .project<{
        _id: ObjectId;
        url: string;
        number: number;
        base: {
          repo: {
            id: number;
          };
        };
      }>({
        _id: 0,
        url: 1,
        number: 1,
        base: {
          repo: {
            id: 1,
          },
        },
      })
      .toArray();

    console.log(`Constructing ${prs.length} tasks...`);

    const inserting = prs.map(pr => {
      const repoId = pr.base.repo.id;
      const splits = pr.url.split('/');
      const owner = splits.at(-4)!;
      const repo = splits.at(-3)!;

      return {
        nature: 'get_pull_request_details',
        repo_id: repoId,
        owner,
        repo,
        issue_number: pr.number,
        created_at: new Date(),
        completed: false,
      } satisfies Static<typeof GetPullRequestDetails>;
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
