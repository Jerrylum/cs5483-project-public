import type { components } from '@octokit/openapi-types';
import type {
  OctokitPullRequest,
  OctokitPullRequestComments,
  OctokitPullRequestDetails,
  OctokitUser,
  PullRequest,
  PullRequestComment,
  PullRequestDetails,
  RepoIdObject,
  User,
  UserLoginAndId,
} from './types';

export function simplifyRepoData(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(simplifyRepoData);
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([key]) => !key.endsWith('_url'))
        .map(([key, value]) => [key, simplifyRepoData(value)])
    );
  }
  return data;
}

export function simplifyUser(user: components['schemas']['simple-user']): UserLoginAndId;
export function simplifyUser(
  user: components['schemas']['nullable-simple-user']
): UserLoginAndId | null;

export function simplifyUser(
  user: components['schemas']['nullable-simple-user']
): UserLoginAndId | null {
  if (!user) return null;
  return {
    login: user.login,
    id: user.id,
  };
}

function simplifyRepo(repo: components['schemas']['repository']): RepoIdObject;
function simplifyRepo(repo: components['schemas']['nullable-repository']): RepoIdObject | null;
function simplifyRepo(repo: components['schemas']['nullable-repository']): RepoIdObject | null {
  if (!repo) return null;
  return { id: repo.id };
}

export function simplifyUserDetails(data: OctokitUser): User {
  return simplifyRepoData(data) as User;
}

export function simplifyPullRequest(pr: OctokitPullRequest): PullRequest {
  return {
    url: pr.url,
    id: pr.id,
    node_id: pr.node_id,
    number: pr.number,
    state: pr.state,
    locked: pr.locked,
    title: pr.title,
    user: simplifyUser(pr.user),
    body: pr.body,
    labels: pr.labels,
    milestone: pr.milestone,
    active_lock_reason: pr.active_lock_reason,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merged_at: pr.merged_at,
    merge_commit_sha: pr.merge_commit_sha,
    assignee: simplifyUser(pr.assignee),
    assignees: pr.assignees ? pr.assignees.map(simplifyUser).filter(user => !!user) : pr.assignees,
    requested_reviewers: pr.requested_reviewers
      ? pr.requested_reviewers.map(simplifyUser).filter(user => !!user)
      : pr.requested_reviewers,
    requested_teams: pr.requested_teams,
    head: {
      label: pr.head.label,
      ref: pr.head.ref,
      repo: simplifyRepo(pr.head.repo),
      sha: pr.head.sha,
      user: simplifyUser(pr.head.user),
    },
    base: {
      label: pr.base.label,
      ref: pr.base.ref,
      repo: simplifyRepo(pr.base.repo),
      sha: pr.base.sha,
      user: simplifyUser(pr.base.user),
    },
    author_association: pr.author_association,
    auto_merge: pr.auto_merge,
    draft: pr.draft,
  };
}

export function simplifyPullRequestDetails(pr: OctokitPullRequestDetails): PullRequestDetails {
  return {
    url: pr.url,
    id: pr.id,
    node_id: pr.node_id,
    number: pr.number,
    state: pr.state,
    locked: pr.locked,
    title: pr.title,
    user: simplifyUser(pr.user),
    body: pr.body,
    labels: pr.labels,
    milestone: pr.milestone,
    active_lock_reason: pr.active_lock_reason,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merged_at: pr.merged_at,
    merge_commit_sha: pr.merge_commit_sha,
    assignee: simplifyUser(pr.assignee),
    assignees: pr.assignees ? pr.assignees.map(simplifyUser).filter(user => !!user) : pr.assignees,
    requested_reviewers: pr.requested_reviewers
      ? pr.requested_reviewers.map(simplifyUser).filter(user => !!user)
      : pr.requested_reviewers,
    requested_teams: pr.requested_teams,
    head: {
      label: pr.head.label,
      ref: pr.head.ref,
      repo: simplifyRepo(pr.head.repo),
      sha: pr.head.sha,
      user: simplifyUser(pr.head.user),
    },
    base: {
      label: pr.base.label,
      ref: pr.base.ref,
      repo: simplifyRepo(pr.base.repo),
      sha: pr.base.sha,
      user: simplifyUser(pr.base.user),
    },
    author_association: pr.author_association,
    auto_merge: pr.auto_merge,
    draft: pr.draft,
    merged: pr.merged,
    mergeable: pr.mergeable,
    rebaseable: pr.rebaseable,
    mergeable_state: pr.mergeable_state,
    merged_by: simplifyUser(pr.merged_by),
    comments: pr.comments,
    review_comments: pr.review_comments,
    maintainer_can_modify: pr.maintainer_can_modify,
    commits: pr.commits,
    additions: pr.additions,
    deletions: pr.deletions,
    changed_files: pr.changed_files,
  };
}

export function simplifyPullRequestComments(
  comments: OctokitPullRequestComments
): PullRequestComment[] {
  return comments.map(comment => ({
    id: comment.id,
    user: simplifyUser(comment.user),
    body: comment.body,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    author_association: comment.author_association,
  }));
}

// Extract JSON from Deepseek response
export function extractJsonFromDeepseekResponse(
  response: string
): Record<string, unknown> | undefined {
  try {
    // Filter out <think> </think>
    const thinkEnd = response.lastIndexOf('</think>');
    response = response.substring(thinkEnd + '</think>'.length);

    // Extract JSON
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    const result = response.substring(jsonStart, jsonEnd + 1);

    return JSON.parse(result);
  } catch (error) {
    return undefined;
  }
}
