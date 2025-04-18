import { app } from './app';
import {
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequests,
  pullRequestsFilter,
  tasks,
  topRepos,
  users,
} from './data';

topRepos.createIndex({ id: 1 }, { unique: true });
pullRequests.createIndex({ 'base.repo.id': 1 });
pullRequests.createIndex({ id: 1 }, { unique: true });
pullRequestDetails.createIndex({ 'base.repo.id': 1 });
pullRequestDetails.createIndex({ id: 1 }, { unique: true });
pullRequestsFilter.createIndex({ selected: 1 });
pullRequestsFilter.createIndex({ '2nd-selected': 1 });
pullRequestsFilter.createIndex({ foreign_id: 1 }, { unique: true });
pullRequestExtraFeatures.createIndex({ id: 1 }, { unique: true });
users.createIndex({ id: 1 }, { unique: true });
tasks.createIndex({ completed: 1 });
tasks.createIndex({ completed: 1, nature: 1 });
tasks.createIndex({ _id: 1, repo_id: 1, page: 1 }, { unique: true });

app.listen(8000);

console.log(`🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`);
