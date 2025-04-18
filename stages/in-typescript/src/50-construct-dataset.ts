import * as parquet from 'parquetjs';

import {
  client,
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequestsFilter,
  users,
} from 'master-0/src/data';
import type { PullRequestDetails, PullRequestExtraFeatures, User } from 'master-0/src/types';
import { extractJsonFromDeepseekResponse } from 'master-0/src/utils';
import type { AggregationCursor } from 'mongodb';

const pullRequestExtraFeaturesCount = await pullRequestExtraFeatures.countDocuments();
console.log('Number of documents in Pull Requests Extra Features:', pullRequestExtraFeaturesCount);

// Create a Parquet writer
const n = 30000;

interface PullRequestTimes {
  user_id: number;
  created_at: string;
  closed_at: string;
  merged_at: string | null;
}

interface PullRequestTime {
  user_id: number;
  at: number;
}

// temp2
// [
//   {
//     "repo_id": 1,
//     "pull_requests": [
//       {
//         "created_at": "2021-01-01",
//         "closed_at": "2021-01-02",
//         "merged_at": "2021-01-03"
//       },
//       {
//         "created_at": "2021-01-04",
//         "closed_at": "2021-01-05",
//         "merged_at": "2021-01-06"
//       }
//     ]
//   }
// ]

// temp3
// [
//   {
//     "repo_id": 1,
//     "created_at": [1609459200000, 1609545600000],
//     "closed_at": [1609632000000, 1609718400000],
//     "merged_at": [1609804800000, 1609891200000]
//   }
// ]

interface PullRequestTimesByRepo {
  repo_id: number;
  pull_requests: PullRequestTimes[];
}

interface PullRequestTimesByRepoSorted {
  repo_id: number;
  created_at: PullRequestTime[]; // from oldest to newest
  closed_at: PullRequestTime[]; // from oldest to newest
  merged_at: PullRequestTime[]; // from oldest to newest
}

console.log('Start to get all pull request times');
const startTime = Date.now();

const temp2 = (await pullRequestDetails
  .aggregate([
    {
      $project: {
        repo_id: '$base.repo.id',
        user_id: '$user.id',
        created_at: '$created_at',
        closed_at: '$closed_at',
        merged_at: '$merged_at',
      },
    },
    {
      $group: {
        _id: '$repo_id',
        pull_requests: {
          $push: {
            user_id: '$user_id',
            created_at: '$created_at',
            closed_at: '$closed_at',
            merged_at: '$merged_at',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        repo_id: '$_id',
        pull_requests: 1,
      },
    },
  ])
  .toArray()) as PullRequestTimesByRepo[];

const endTime = Date.now();
const elapsedTime = endTime - startTime;
const elapsedTimeInSeconds = Math.floor(elapsedTime / 1000);
console.log(`Elapsed time: ${elapsedTimeInSeconds} seconds`);

console.log('Start to sort pull request times');
const startTime2 = Date.now();

// Sort the pull_requests by created_at
const temp3: PullRequestTimesByRepoSorted[] = temp2.map(repo => ({
  repo_id: repo.repo_id,
  created_at: repo.pull_requests
    .map(pr => ({
      user_id: pr.user_id,
      at: new Date(pr.created_at).getTime(),
    }))
    .sort((a, b) => a.at - b.at),
  closed_at: repo.pull_requests
    .map(pr => ({
      user_id: pr.user_id,
      at: new Date(pr.closed_at).getTime() || Date.now(),
    }))
    .sort((a, b) => a.at - b.at),
  merged_at: repo.pull_requests
    .filter(pr => pr.merged_at)
    .map(pr => ({
      user_id: pr.user_id,
      at: new Date(pr.merged_at!).getTime(),
    }))
    .sort((a, b) => a.at - b.at),
}));

const endTime2 = Date.now();
const elapsedTime2 = endTime2 - startTime2;
const elapsedTimeInSeconds2 = Math.floor(elapsedTime2 / 1000);
console.log(`Elapsed time: ${elapsedTimeInSeconds2} seconds`);

console.log('Start to get all records');
const startTime3 = Date.now();

const records = pullRequestsFilter
  .aggregate([
    {
      $match: {
        '2nd-selected': true,
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
        'ext.features.final-state': { $exists: true },
        'ext.features.code_diff': { $exists: true },
        'ext.features.nature-v3': { $exists: true },
        'ext.features.changes-quality': { $exists: true },
        'ext.features.description-quality': { $exists: true },
        'ext.features.changes-necessity': { $exists: true },
      },
    },
    {
      $lookup: {
        from: users.collectionName,
        localField: 'pr.user.id',
        foreignField: 'id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        repo_id: '$pr.base.repo.id',
        pr_details: '$pr',
        user_details: '$user',
        extra_features: '$ext',
      },
    },
  ])
  .limit(n) as unknown as AggregationCursor<{
  repo_id: number;
  pr_details: PullRequestDetails;
  user_details: User;
  extra_features: PullRequestExtraFeatures;
}>;

console.log('Adding to Parquet file');

// Define the Parquet schema
const schema = new parquet.ParquetSchema({
  id: { type: 'INT64' },

  final_state: { type: 'UTF8' },
  comments: { type: 'INT32' },
  review_comments: { type: 'INT32' },
  commits: { type: 'INT32' },
  additions: { type: 'INT32' },
  deletions: { type: 'INT32' },
  changed_files: { type: 'INT32' },
  nature: { type: 'UTF8' },
  changes_quality: { type: 'UTF8' },
  changes_quality_score_confidence: { type: 'INT32' },
  alignment: { type: 'INT32' },
  description_quality: { type: 'UTF8' },
  description_quality_score_confidence: { type: 'INT32' },
  changes_necessity: { type: 'UTF8' },
  changes_necessity_score_confidence: { type: 'INT32' },
  changes_necessity_justification: { type: 'INT32' },
  user_account_age: { type: 'INT32' },
  user_type: { type: 'UTF8' },
  user_public_repos: { type: 'INT32' },
  user_followers: { type: 'INT32' },
  user_following: { type: 'INT32' },
  user_public_gists: { type: 'INT32' },
  author_association: { type: 'UTF8' },
  // No. of projects owned by the contributor before the submitted PR
  // No. of issue created in the project before the submitted PR
  before_pr_count: { type: 'INT32' },
  is_first_pr: { type: 'INT32' },
  // Number of issue created in the project before the submitted PR
  before_merged_pr_count: { type: 'INT32' },
  before_closed_pr_count: { type: 'INT32' },
  opening_pr_count: { type: 'INT32' },
  opened_pr_count_in_30_days: { type: 'INT32' },
  // opening_issue_count: { type: 'INT32' },
});
const writer = await parquet.ParquetWriter.openFile(schema, `../../data/${n}-with-p5.parquet`);

const countPullRequestsBefore = (times: PullRequestTime[], target: number) => {
  return times.findIndex(time => time.at > target);
};

const countPullRequestsBeforeByUserId = (
  times: PullRequestTime[],
  target: number,
  user_id: number
) => {
  return times.filter(time => time.at > target && time.user_id === user_id).length;
};

const countPullRequestsInRange = (times: PullRequestTime[], start: number, end: number) => {
  return times.filter(time => time.at >= start && time.at <= end).length;
};

const getNature = (r: Record<string, unknown>): string => {
  if (!r['categories'] || Array.isArray(r['categories']) === false) {
    return 'unknown';
  }
  return r['categories'][0]?.name || 'unknown';
};

const getChangesQuality = (r: Record<string, unknown>): string => {
  if (typeof r['category'] === 'string') {
    return r['category'];
  }
  return 'non-suitable';
};

const getChangesQualityScoreConfidence = (r: Record<string, unknown>): number => {
  if (typeof r['confidence'] === 'number') {
    return Number(r['confidence']) || 0;
  }
  return 0;
};
const getAlignment = (r: Record<string, unknown>): number => {
  if (r['alignment'] && typeof r['alignment'] === 'object' && 'is_aligned' in r['alignment']) {
    return Number(r['alignment']['is_aligned']) || 0;
  }
  return 0;
};

const getDescriptionQuality = (r: Record<string, unknown>): string => {
  if (typeof r['category'] === 'string') {
    return r['category'];
  }
  return 'poor';
};

const getDescriptionQualityScoreConfidence = (r: Record<string, unknown>): number => {
  if (typeof r['confidence'] === 'number') {
    return Number(r['confidence']) || 0;
  }
  return 0;
};

const getChangesNecessity = (r: Record<string, unknown>): string => {
  if (typeof r['necessity'] === 'string') {
    return r['necessity'];
  }
  return 'unknown';
};

const getChangesNecessityScoreConfidence = (r: Record<string, unknown>): number => {
  if (typeof r['confidence'] === 'number') {
    return Number(r['confidence']) || 0;
  }
  return 0;
};

const getChangesNecessityJustification = (r: Record<string, unknown>): number => {
  if (
    r['justification'] &&
    typeof r['justification'] === 'object' &&
    'score' in r['justification']
  ) {
    return Number(r['justification']['score']) || 0;
  }
  return 0;
};


let i = 0;
for await (const r of records) {
  // console.log("pr", r);

  const _pr_created_at = new Date(r.pr_details.created_at).getTime();
  const _pr_ext_nature =
    extractJsonFromDeepseekResponse(r.extra_features.features['nature-v3'] as string) ?? {};
  const _pr_ext_changes_quality =
    extractJsonFromDeepseekResponse(r.extra_features.features['changes-quality'] as string) ?? {};
  const _pr_ext_description_quality =
    extractJsonFromDeepseekResponse(r.extra_features.features['description-quality'] as string) ??
    {};
  const _pr_ext_changes_necessity =
    extractJsonFromDeepseekResponse(r.extra_features.features['changes-necessity'] as string) ??
    {};

  const id = r.pr_details.id;
  const final_state = `${r.extra_features.features['final-state']}` || 'closed';
  const comments = r.pr_details.comments;
  const review_comments = r.pr_details.review_comments;
  const commits = r.pr_details.commits;
  const additions = r.pr_details.additions;
  const deletions = r.pr_details.deletions;
  const changed_files = r.pr_details.changed_files;

  const nature = getNature(_pr_ext_nature);
  const changes_quality = getChangesQuality(_pr_ext_changes_quality);
  const changes_quality_score_confidence =
    getChangesQualityScoreConfidence(_pr_ext_changes_quality);
  const alignment = getAlignment(_pr_ext_changes_quality);
  const description_quality = getDescriptionQuality(_pr_ext_description_quality);
  const description_quality_score_confidence =
    getDescriptionQualityScoreConfidence(_pr_ext_description_quality);
  const changes_necessity = getChangesNecessity(_pr_ext_changes_necessity);
  const changes_necessity_score_confidence =
    getChangesNecessityScoreConfidence(_pr_ext_changes_necessity);
  const changes_necessity_justification = getChangesNecessityJustification(
    _pr_ext_changes_necessity
  );
  // How many days of the user's account age before the submitted PR
  const user_account_age = Math.floor(
    (_pr_created_at - new Date(r.user_details.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const user_type = r.user_details.type;
  const user_public_repos = r.user_details.public_repos;
  const user_followers = r.user_details.followers;
  const user_following = r.user_details.following;
  const user_public_gists = r.user_details.public_gists;
  const author_association = r.pr_details.author_association;

  // No. of projects owned by the contributor before the submitted PR
  // TODO

  // No. of issue created in the project before the submitted PR
  // TODO

  const _temp3_repo = temp3.find(repo => repo.repo_id === r.repo_id);

  // Number of created PR in the project before the submit created by the contributor
  const before_pr_count = countPullRequestsBeforeByUserId(
    _temp3_repo?.created_at ?? [],
    _pr_created_at,
    r.user_details.id
  );

  const is_first_pr = before_pr_count === 0 ? 1 : 0;

  // Number of issue created in the project before the submitted PR
  // TODO

  // Number of merged PR in the project before the submit created by the contributor
  // TODO
  // const before_merged_pr_count = count_prs(temp3_repo?.merged_at ?? [], _pr_created_at);
  const before_merged_pr_count = countPullRequestsBeforeByUserId(
    _temp3_repo?.merged_at ?? [],
    _pr_created_at,
    r.user_details.id
  );

  // Number of closed PR in the project before the submit created by the contributor
  // TODO
  // const before_closed_pr_count = count_prs(temp3_repo?.closed_at ?? [], _pr_created_at);
  const before_closed_pr_count = countPullRequestsBeforeByUserId(
    _temp3_repo?.closed_at ?? [],
    _pr_created_at,
    r.user_details.id
  );

  // Number of opening PRs in the project before the submitted PR
  const opening_pr_count =
    countPullRequestsBefore(_temp3_repo?.created_at ?? [], _pr_created_at) -
    countPullRequestsBefore(_temp3_repo?.closed_at ?? [], _pr_created_at); // here closed_at means closed/merged

  // Number of opened PRs in the project in 30 days before the submitted PR
  const opened_pr_count_in_30_days =
    countPullRequestsInRange(
      _temp3_repo?.created_at ?? [],
      _pr_created_at - 30 * 24 * 60 * 60 * 1000,
      _pr_created_at
    ) -
    countPullRequestsInRange(
      _temp3_repo?.closed_at ?? [],
      _pr_created_at - 30 * 24 * 60 * 60 * 1000,
      _pr_created_at
    ); // here closed_at means closed/merged

  // Number of opening issues in the project before the submitted PR
  // TODO

  if (i % 1000 === 0) {
    console.log(`[${i} / ${n}]`);
  }
  i++;

  const row = {
    id,
    final_state,
    comments,
    review_comments,
    commits,
    additions,
    deletions,
    changed_files,
    nature,
    changes_quality,
    changes_quality_score_confidence,
    alignment,
    description_quality,
    description_quality_score_confidence,
    changes_necessity,
    changes_necessity_score_confidence,
    changes_necessity_justification,
    user_account_age,
    user_type,
    user_public_repos,
    user_followers,
    user_following,
    user_public_gists,
    author_association,
    // No. of projects owned by the contributor before the submitted PR
    // No. of issue created in the project before the submitted PR
    before_pr_count,
    is_first_pr,
    // Number of issue created in the project before the submitted PR
    before_merged_pr_count,
    before_closed_pr_count,
    opening_pr_count,
    opened_pr_count_in_30_days: opened_pr_count_in_30_days,
    // opening_issue_count,
  };

  try {
    await writer.appendRow(row);
  } catch (e) {
    console.log('Error', e);
    console.log({ ...row });
    break;
  }
}

const endTime3 = Date.now();
const elapsedTime3 = endTime3 - startTime3;
const elapsedTimeInSeconds3 = Math.floor(elapsedTime3 / 1000);
console.log(`Elapsed time: ${elapsedTimeInSeconds3} seconds`);

await writer.close();
console.log('Parquet file created successfully!');

await client.close();
console.log('MongoDB client closed successfully!');
