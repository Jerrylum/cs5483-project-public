import { treaty } from '@elysiajs/eden';
import type { Static } from 'elysia';
import { app, produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequests, users } from 'master-0/src/data';
import { GetPullRequestDetails } from 'master-0/src/types';
import { ObjectId } from 'mongodb';

// Create Eden client
const server = treaty<typeof app>('cs5483-24-g1.jerryio.com');

async function main() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log('Fetching PRs...');

    // find a random PR for test only
    const prs = await pullRequestDetails.find().skip(10000).limit(1).toArray();

    const pr = prs[0]!;

    // console.log(pr);

    const classes = pr.merged_at ? 'merged' : 'closed';

    // - Account created date
    // Endpoint: `/users/cwksc`
    // TODO: not enough data
    const account_created_date = (await users.findOne({
      'id': pr.user?.id,
    }))?.created_at ?? null;

    // - No. of projects owned by the contributor before the submitted PR
    // Endpoint: `/users/cwksc/repos?sort=created&direction=desc&per_page=100`
    // Count create date of repo `created_at`
    // TODO: not enough data
  
    // No. of issue created in the project before the submitted PR
    // Endpoint: `/repos/{owner}/{repo}/issues?per_page=100` (Get all issues and PRs)
    // Endpoint: `/repos/{owner}/{repo}/pulls?per_page=100` (Get all PRs)
    // TODO: not enough data
  
    // Number of created PR in the project before the submit created by the contributor
    // Count by getting all the PRs from the project (using `/repos/{owner}/{repo}/issues`), with equals `user.id`
    const prs_count = await pullRequests.countDocuments({
      'user.id': pr.user?.id,
      'base.repo.id': pr.base.repo.id,
    });

    // Number of issue created in the project before the submitted PR, like is_this_proj_first
    // Count by getting all the issues from the project (using /repos/{owner}/{repo}/issues), with equals user.id
    // TODO: not enough data

    // Number of merged PR in the project before the submit created by the contributor
    // Count by getting all the issues from the project (using `/repos/{owner}/{repo}/issues`), with equals `merged_at` not null
    const merged_prs_count = await pullRequests.countDocuments({
      'user.id': pr.user?.id,
      'base.repo.id': pr.base.repo.id,
      merged_at: { $ne: null },
    });

    // Number of closed PR in the project before the submit created by the contributor
    // Count by getting all the issues from the project (using `/repos/{owner}/{repo}/issues`), with equals `merged_at` is null but `closed_at` is not null
    const closed_prs_count = await pullRequests.countDocuments({
      'user.id': pr.user?.id,
      'base.repo.id': pr.base.repo.id,
      merged_at: null,
      closed_at: { $ne: null },
    });

    // No. of lines added in the PR
    const additions = pr.additions;

    // No. of lines deleted in the PR
    const deletions = pr.deletions;

    // No. of files changed in the PR
    const changed_files = pr.changed_files;


    console.log({prs_count, merged_prs_count, closed_prs_count, additions, deletions, changed_files});
    


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
