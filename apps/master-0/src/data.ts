import { MongoClient } from 'mongodb';
import type {
  PullRequest,
  PullRequestDetails,
  PullRequestExtraFeatures,
  PullRequestFilter,
  Repo,
  RepoFilter,
  Tasks,
  User,
} from './types';

const APP_USER_PASSWORD = process.env.MONGO_APP_USER_PASSWORD;
const DB_NAME = process.env.MONGO_DATABASE_NAME;
const DB_URI = process.env.MONGO_DB_URI || 'host.docker.internal:27017';
const MONGO_URI = `mongodb://app_user:${APP_USER_PASSWORD}@${DB_URI}/${DB_NAME}`;

export const client = new MongoClient(MONGO_URI);
export const db = client.db(DB_NAME);

export const topRepos = db.collection<Repo>('Top Repos');
export const topReposFilter = db.collection<RepoFilter>('Top Repos FILTER');
export const pullRequests = db.collection<PullRequest>('Pull Requests');
export const pullRequestDetails = db.collection<PullRequestDetails>('Pull Request Details');
export const pullRequestsFilter = db.collection<PullRequestFilter>('Pull Requests FILTER');
export const pullRequestExtraFeatures = db.collection<PullRequestExtraFeatures>(
  'Pull Requests Extra Features'
);
export const users = db.collection<User>('Users');
// export const pullRequestComments = db.collection<PullRequestComment[]>('Pull Request Comments');
// export const promptTemplates = db.collection<PromptTemplate>('Prompt Templates');
export const tasks = db.collection<Tasks>('Tasks');
