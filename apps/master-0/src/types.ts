import type { components } from '@octokit/openapi-types';
import type { Endpoints } from '@octokit/types';
import { type Static, t } from 'elysia';
import type { ObjectId } from 'mongodb';
export type OmitPostfix<T, Postfix extends string> = {
  [K in keyof T as K extends `${string}${Postfix}` ? never : K]: T[K];
};

export type OctokitUser = Endpoints['GET /users/{username}']['response']['data'];

export type User = OmitPostfix<OctokitUser, '_url'>;

export type OctokitRepo =
  Endpoints['GET /search/repositories']['response']['data']['items'][number];

export type Repo = OmitPostfix<OctokitRepo, '_url'>;

export type RepoIdObject = { id: number };

export type UserLoginAndId = { login: string; id: number };

export type RepoFilter = { foreign_id: ObjectId };

export type OctokitPullRequest =
  Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];

// export type PullRequest = OmitPostfix<OctokitPullRequest, '_url'>;

export type PullRequest = {
  /**
   * Format: uri
   * @example https://api.github.com/repos/octocat/Hello-World/pulls/1347
   */
  url: string;
  /**
   * Format: int64
   * @example 1
   */
  id: number;
  /** @example MDExOlB1bGxSZXF1ZXN0MQ== */
  node_id: string;
  /** @example 1347 */
  number: number;
  /** @example open */
  state: string;
  /** @example true */
  locked: boolean;
  /** @example new-feature */
  title: string;
  user: UserLoginAndId | null;
  /** @example Please pull these awesome changes */
  body: string | null;
  labels: {
    /** Format: int64 */
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string;
    color: string;
    default: boolean;
  }[];
  milestone: components['schemas']['nullable-milestone'];
  /** @example too heated */
  active_lock_reason?: string | null;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  created_at: string;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  updated_at: string;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  closed_at: string | null;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  merged_at: string | null;
  /** @example e5bd3914e2e596debea16f433f57875b5b90bcd6 */
  merge_commit_sha: string | null;
  assignee: UserLoginAndId | null;
  assignees?: UserLoginAndId[] | null;
  requested_reviewers?: UserLoginAndId[] | null;
  requested_teams?: components['schemas']['team'][] | null;
  head: {
    label: string;
    ref: string;
    repo: RepoIdObject | null;
    sha: string;
    user: UserLoginAndId | null;
  };
  base: {
    label: string;
    ref: string;
    repo: RepoIdObject;
    sha: string;
    user: UserLoginAndId | null;
  };
  author_association: components['schemas']['author-association'];
  auto_merge: components['schemas']['auto-merge'];
  /**
   * @description Indicates whether or not the pull request is a draft.
   * @example false
   */
  draft?: boolean;
};

export type OctokitPullRequestDetails =
  Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']['data'];

// export type PullRequestDetails = OmitPostfix<OctokitPullRequestDetails, '_url'>;

export type PullRequestDetails = {
  /**
   * Format: uri
   * @example https://api.github.com/repos/octocat/Hello-World/pulls/1347
   */
  url: string;
  /**
   * Format: int64
   * @example 1
   */
  id: number;
  /** @example MDExOlB1bGxSZXF1ZXN0MQ== */
  node_id: string;
  /**
   * @description Number uniquely identifying the pull request within its repository.
   * @example 42
   */
  number: number;
  /**
   * @description State of this Pull Request. Either `open` or `closed`.
   * @example open
   * @enum {string}
   */
  state: string;
  /** @example true */
  locked: boolean;
  /**
   * @description The title of the pull request.
   * @example Amazing new feature
   */
  title: string;
  user: UserLoginAndId | null;
  /** @example Please pull these awesome changes */
  body: string | null;
  labels: {
    /** Format: int64 */
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string | null;
    color: string;
    default: boolean;
  }[];
  milestone: components['schemas']['nullable-milestone'];
  /** @example too heated */
  active_lock_reason?: string | null;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  created_at: string;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  updated_at: string;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  closed_at: string | null;
  /**
   * Format: date-time
   * @example 2011-01-26T19:01:12Z
   */
  merged_at: string | null;
  /** @example e5bd3914e2e596debea16f433f57875b5b90bcd6 */
  merge_commit_sha: string | null;
  assignee: UserLoginAndId | null;
  assignees?: UserLoginAndId[] | null;
  requested_reviewers?: UserLoginAndId[] | null;
  requested_teams?: components['schemas']['team-simple'][] | null;
  head: {
    label: string;
    ref: string;
    repo: RepoIdObject | null;
    sha: string;
    user: UserLoginAndId;
  };
  base: {
    label: string;
    ref: string;
    repo: RepoIdObject;
    sha: string;
    user: UserLoginAndId;
  };
  author_association: components['schemas']['author-association'];
  auto_merge: components['schemas']['auto-merge'];
  /**
   * @description Indicates whether or not the pull request is a draft.
   * @example false
   */
  draft?: boolean;
  merged: boolean;
  /** @example true */
  mergeable: boolean | null;
  /** @example true */
  rebaseable?: boolean | null;
  /** @example clean */
  mergeable_state: string;
  merged_by: UserLoginAndId | null;
  /** @example 10 */
  comments: number;
  /** @example 0 */
  review_comments: number;
  /**
   * @description Indicates whether maintainers can modify the pull request.
   * @example true
   */
  maintainer_can_modify: boolean;
  /** @example 3 */
  commits: number;
  /** @example 100 */
  additions: number;
  /** @example 3 */
  deletions: number;
  /** @example 5 */
  changed_files: number;
};

export type OctokitPullRequestComments =
  Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/comments']['response']['data'];

// export type PullRequestComment = OmitPostfix<OctokitPullRequestComments, '_url'>;

export type PullRequestComment = {
  id: number;
  user: UserLoginAndId;
  body: string;
  created_at: string;
  updated_at: string;
  author_association: components['schemas']['author-association'];
};

export type PullRequestFilter = {
  foreign_id: number;
};

export type PullRequestExtraFeatures = {
  id: number;
  features: Record<string, unknown>;
  // [key: string]: unknown;
};

export const Task = t.Object({
  nature: t.String(),
  created_at: t.Date(),
  assigned_to: t.Optional(t.String()),
  assigned_at: t.Optional(t.Date()),
  completed_by: t.Optional(t.String()),
  completed_at: t.Optional(t.Date()),
  completed: t.Boolean(),
});

export const TaskNature = t.Union([
  t.Literal('list_pull_requests'),
  t.Literal('get_pull_request_details'),
  t.Literal('feature_engineering_via_llm'),
  t.Literal('get_user_details'),
  t.Literal('get_pull_request_code_diff'),
  t.Literal('get_pull_request_comments'),
]);

export type TaskNature = Static<typeof TaskNature>;

export const ListPullRequests = t.Object(
  {
    ...Task.properties,
    nature: t.Literal('list_pull_requests'),
    repo_id: t.Number(),
    owner: t.String(),
    repo: t.String(),
    page: t.Number(),
  },
  { additionalProperties: true }
);

export function isListPullRequests(task: Tasks): task is Static<typeof ListPullRequests> {
  return task.nature === 'list_pull_requests';
}

export const ListPullRequestsResponse = t.Object({
  prs: t.Array(t.Record(t.String(), t.Any())),
});

export const GetPullRequestDetails = t.Object(
  {
    ...Task.properties,
    nature: t.Literal('get_pull_request_details'),
    repo_id: t.Number(),
    owner: t.String(),
    repo: t.String(),
    issue_number: t.Number(), // a.k.a the PR number
  },
  { additionalProperties: true }
);

export function isGetPullRequestDetails(task: Tasks): task is Static<typeof GetPullRequestDetails> {
  return task.nature === 'get_pull_request_details';
}

export const GetPullRequestDetailsResponse = t.Object({
  pr: t.Record(t.String(), t.Any()),
});

export const GetUserDetails = t.Object(
  {
    ...Task.properties,
    nature: t.Literal('get_user_details'),
    username: t.String(),
  },
  { additionalProperties: true }
);

export function isGetUserDetails(task: Tasks): task is Static<typeof GetUserDetails> {
  return task.nature === 'get_user_details';
}

export const GetUserDetailsResponse = t.Object({
  user: t.Record(t.String(), t.Any()),
});

export const FeatureEngineeringViaLLM = t.Object(
  {
    ...Task.properties,
    nature: t.Literal('feature_engineering_via_llm'),
    pr_id: t.Number(),
    owner: t.String(),
    repo: t.String(),
    issue_number: t.Number(), // a.k.a the PR number
    feature_name: t.String(),
    prompt_template: t.String(),
    prompt_values: t.Record(t.String(), t.String()),
  },
  { additionalProperties: true }
);

export function isFeatureEngineeringViaLLM(
  task: Tasks
): task is Static<typeof FeatureEngineeringViaLLM> {
  return task.nature === 'feature_engineering_via_llm';
}

export const FeatureEngineeringViaLLMResponse = t.Object({
  // repo_id: t.Number(),
  // issue_number: t.Number(), // a.k.a the PR number
  pr_id: t.Number(),
  feature_name: t.String(),
  feature_value: t.Any(),
});

export const GetPullRequestCodeDiff = t.Object(
  {
    ...Task.properties,
    nature: t.Literal('get_pull_request_code_diff'),
    pr_id: t.Number(),
    owner: t.String(),
    repo: t.String(),
    issue_number: t.Number(), // a.k.a the PR number
  },
  { additionalProperties: true }
);

export function isGetPullRequestCodeDiff(
  task: Tasks
): task is Static<typeof GetPullRequestCodeDiff> {
  return task.nature === 'get_pull_request_code_diff';
}

export const GetPullRequestCodeDiffResponse = t.Object({
  pr_id: t.Number(),
  code_diff: t.String(),
});

export const GetPullRequestComments = t.Object(
  {
    ...Task.properties,
    nature: t.Literal('get_pull_request_comments'),
    pr_id: t.Number(),
    owner: t.String(),
    repo: t.String(),
    issue_number: t.Number(), // a.k.a the PR number
  },
  { additionalProperties: true }
);

export function isGetPullRequestComments(
  task: Tasks
): task is Static<typeof GetPullRequestComments> {
  return task.nature === 'get_pull_request_comments';
}

export const GetPullRequestCommentsResponse = t.Object({
  pr_id: t.Number(),
  comments: t.Array(t.Record(t.String(), t.Any())),
});

export const Tasks = t.Union([
  ListPullRequests,
  GetPullRequestDetails,
  FeatureEngineeringViaLLM,
  GetUserDetails,
  GetPullRequestCodeDiff,
  GetPullRequestComments,
]);

export type Tasks = Static<typeof Tasks>;

export const TaskResponses = t.Union([
  ListPullRequestsResponse,
  GetPullRequestDetailsResponse,
  FeatureEngineeringViaLLMResponse,
  GetUserDetailsResponse,
  GetPullRequestCodeDiffResponse,
  GetPullRequestCommentsResponse,
]);

export type TaskResponses = Static<typeof TaskResponses>;

// export type TaskTypes = Static<typeof Tasks[number]>;
