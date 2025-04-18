# sandbox

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.



- Output
  - Stale: `closed_at` is null, the last update time `updated_at` is more than a month
  - Merged: `merged_at` not null, or the PR is closed (`closed_at` not null) but the last comment said merge
  - Closed: `closed_at` is not null
  - Opening
- Alternative Output
  - Accept/Reject?
- Account created date
  Endpoint: `/users/cwksc`
- No. of projects owned by the contributor before the submitted PR
  Endpoint: `/users/cwksc/repos?sort=created&direction=desc&per_page=100`
  Count create date of repo `created_at`
- No. of issue created in the project before the submitted PR
  Endpoint: `/repos/{owner}/{repo}/issues?per_page=100` (Get all issues and PRs)
  Endpoint: `/repos/{owner}/{repo}/pulls?per_page=100` (Get all PRs)
- Number of created PR in the project before the submit created by the contributor
  Count by getting all the PRs from the project (using `/repos/{owner}/{repo}/issues`), with equals `user.id`
- Number of issue created in the project before the submitted PR, like `is_this_proj_first`
  Count by getting all the issues from the project (using `/repos/{owner}/{repo}/issues`), with equals `user.id`
- Number of merged PR in the project before the submit created by the contributor
  Count by getting all the issues from the project (using `/repos/{owner}/{repo}/issues`), with equals `merged_at` not null
- Number of closed PR in the project before the submit created by the contributor
  Count by getting all the issues from the project (using `/repos/{owner}/{repo}/issues`), with equals `merged_at` is null but `closed_at` is not null
- No. of lines added in the PR
  Endpoint: `/repos/{owner}/{repo}/pulls/{number}`
- No. of lines deleted in the PR
  Endpoint: `/repos/{owner}/{repo}/pulls/{number}`
- No. of files changed in the PR
  Endpoint: `/repos/{owner}/{repo}/pulls/{number}`
- Number of opening PRs in the project before the submitted PR
  Count by getting all the PRs from the project (using `/repos/{owner}/{repo}/issues`)
- Number of opened PRs in the project in 30 days before the submitted PR
  Count by getting all the PRs from the project (using `/repos/{owner}/{repo}/issues`)
- Number of opening issues in the project before the submitted PR
  Count by getting all the PRs from the project (using `/repos/{owner}/{repo}/issues`)

- Is mentioned issue
  TODO
- Contain test files, whether the change contains one or more test files
  TODO
- Contain doc files, whether the change includes a document file
  TODO

Feature Engineering using LLM:
- nature of the PR body, including title and description, one feature per nature (or combined with the next one)
- nature of the code changes, one feature per nature
- Can the code resolve the mentioned issue?
- How likely the pull request is a spam? From 0 to 1, 0 is very unlikely, 1 is very likely
- How likely the code changes match the pull request title and description? From 0 to 1, 0 is very unlikely, 1 is very likely