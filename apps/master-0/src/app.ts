import { cors } from '@elysiajs/cors';
import { Elysia, type Static, t } from 'elysia';
import { MongoServerError, ObjectId } from 'mongodb';
import {
  pullRequestDetails,
  pullRequestExtraFeatures,
  pullRequests,
  tasks,
  topRepos,
  users,
} from './data';
import {
  FeatureEngineeringViaLLMResponse,
  GetPullRequestCodeDiffResponse,
  GetPullRequestCommentsResponse,
  GetPullRequestDetailsResponse,
  GetUserDetailsResponse,
  isListPullRequests,
  ListPullRequestsResponse,
  type PullRequest,
  type PullRequestComment,
  type PullRequestDetails,
  Task,
  TaskNature,
  Tasks,
  type User,
} from './types';

export const consume = async (consumerId: string, supportedTaskNatures: TaskNature[]) => {
  // get a task which is not completed, supported by the consumer, and (no one is working on it or it has been 30 seconds since it was assigned)
  const task = await tasks.findOneAndUpdate(
    {
      completed: false,
      nature: { $in: supportedTaskNatures },
      $or: [
        { assigned_at: { $exists: false } },
        // { $expr: { $gt: [{ $subtract: [new Date(), "$assigned_at"] }, 3000] } }
        // { $expr: { $gt: [{ $subtract: [new Date(), "$assigned_at"] }, 30000] } }
        { $expr: { $gt: [{ $subtract: [new Date(), '$assigned_at'] }, 1000 * 60 * 15] } },
      ],
    },
    {
      $set: {
        assigned_to: consumerId,
        assigned_at: new Date(),
      } satisfies Partial<Static<typeof Task>>,
      // }, {
      //   sort: {
      //     assigned_to: 1,
      //     created_at: 1
      //   }
    }
  );
  return task;
};

export const responseListPullRequests = async (
  response: Static<typeof ListPullRequestsResponse>,
  taskId: string,
  consumerId: string
) => {
  // XXX: Do not check the content
  // ALGO: Ignore duplicates
  const { promise, resolve, reject } = Promise.withResolvers();

  const prs = response.prs as PullRequest[];

  const success = async () => {
    const task = await completeTask(taskId, consumerId);
    // if the task is not found or already completed before the response, return
    if (!task || task.completed) return;

    if (!isListPullRequests(task)) throw new Error('task is not a list pull requests task');
    console.log('completed task', task?._id, 'page:', task?.page, 'prs:', prs.length);

    if (prs.length === 100) {
      produceTask({
        nature: 'list_pull_requests',
        repo_id: task.repo_id,
        owner: task.owner,
        repo: task.repo,
        page: task.page + 1,
        created_at: new Date(),
        completed: false,
      });
    }
    resolve({ message: 'thank you' });
  };

  pullRequests
    .insertMany(prs, { ordered: false })
    .then(success)
    .catch(e => {
      if (e instanceof MongoServerError && e.code === 11000) {
        // duplicate key error, ignore
        success();
      } else {
        reject(e);
      }
    });

  return promise;
};

export const responseGetPullRequestDetails = async (
  response: Static<typeof GetPullRequestDetailsResponse>,
  taskId: string,
  consumerId: string
) => {
  // XXX: Do not check the content
  // ALGO: Ignore duplicates
  const { promise, resolve, reject } = Promise.withResolvers();

  const pr = response.pr as PullRequestDetails;
  pullRequestDetails
    .insertOne(pr)
    .then(async () => {
      await completeTask(taskId, consumerId);
      resolve({ message: 'thank you' });
    })
    .catch(async e => {
      if (e instanceof MongoServerError && e.code === 11000) {
        await completeTask(taskId, consumerId);
        resolve({ message: 'thank you with duplicate key error' });
      } else {
        reject(e);
      }
    });

  return promise;
};

export const responseGetUserDetails = async (
  response: Static<typeof GetUserDetailsResponse>,
  taskId: string,
  consumerId: string
) => {
  // XXX: Do not check the content
  // ALGO: Ignore duplicates
  const { promise, resolve, reject } = Promise.withResolvers();

  const user = response.user as User;

  users
    .insertOne(user)
    .then(async () => {
      await completeTask(taskId, consumerId);
      resolve({ message: 'thank you' });
    })
    .catch(async e => {
      if (e instanceof MongoServerError && e.code === 11000) {
        await completeTask(taskId, consumerId);
        resolve({ message: 'thank you with duplicate key error' });
      } else {
        reject(e);
      }
    });

  return promise;
};

export const responseFeatureEngineeringViaLLM = async (
  // response: Static<typeof FeatureEngineeringViaLLMResponse>,
  pr_id: number,
  featureName: string,
  featureValue: unknown,
  taskId: string,
  consumerId: string
) => {
  // XXX: Do not check the content
  // ALGO: Ignore duplicates
  const { promise, resolve, reject } = Promise.withResolvers();

  pullRequestExtraFeatures
    .updateOne(
      { id: pr_id },
      { $set: { ['features.' + featureName]: featureValue } },
      { upsert: true }
    )
    .then(async () => {
      await completeTask(taskId, consumerId);
      resolve({ message: 'thank you' });
    })
    .catch(async e => {
      reject(e);
    });

  return promise;
};

export const responseGetPullRequestCodeDiff = async (
  response: Static<typeof GetPullRequestCodeDiffResponse>,
  taskId: string,
  consumerId: string
) => {
  // XXX: Do not check the content
  // ALGO: Ignore duplicates
  const { promise, resolve, reject } = Promise.withResolvers();

  pullRequestExtraFeatures
    .updateOne(
      { id: response.pr_id },
      { $set: { ['features.code_diff']: response.code_diff } },
      { upsert: true }
    )
    .then(async () => {
      await completeTask(taskId, consumerId);
      resolve({ message: 'thank you' });
    })
    .catch(async e => {
      reject(e);
    });

  return promise;
};

export const responseGetPullRequestComments = async (
  response: Static<typeof GetPullRequestCommentsResponse>,
  taskId: string,
  consumerId: string
) => {
  // XXX: Do not check the content
  // ALGO: Ignore duplicates
  const { promise, resolve, reject } = Promise.withResolvers();

  const comments = response.comments as PullRequestComment[];
  pullRequestExtraFeatures
    .updateOne(
      { id: response.pr_id },
      { $set: { ['features.last_10_comments']: comments } },
      { upsert: true }
    )
    .then(async () => {
      await completeTask(taskId, consumerId);
      resolve({ message: 'thank you' });
    })
    .catch(async e => {
      reject(e);
    });

  return promise;
};

export const completeTask = async (taskId: string, completedBy: string) => {
  return tasks.findOneAndUpdate(
    { _id: ObjectId.createFromHexString(taskId) },
    {
      $set: { completed: true, completed_by: completedBy, completed_at: new Date() },
    },
    {
      returnDocument: 'before',
    }
  );
};

export const produceTask = async (task: Tasks) => {
  await tasks.insertOne({
    ...task,
    created_at: new Date(),
    completed: false,
    // IMPORTANT: don't use undefined
    // assigned_to: undefined,
    // assigned_at: undefined,
    // completed_by: undefined,
    // completed_at: undefined,
  });
  return { message: 'thank you' };
};

export const produceTasks = async (ts: Tasks[]) => {
  await tasks.insertMany(ts);
  return { message: 'thank you' };
};

export const app = new Elysia()
  .use(cors())

  .get('/', () => ({
    message: '200 OK',
    status: 'running',
  }))

  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }))

  .post(
    '/consume',
    async ({ body }) => {
      const consumerId = body.consumer;
      const supportedTaskNatures = body.supported;

      return consume(consumerId, supportedTaskNatures);
    },
    {
      body: t.Object({
        consumer: t.String(),
        supported: t.Array(TaskNature),
      }),
      //  null or task
      // response: t.Union([t.Null(), ...Tasks.anyOf])
    }
  )

  .post(
    '/response/list_pull_requests',
    async ({ body }) => {
      return responseListPullRequests(body.response, body.task_id, body.consumer);
    },
    {
      body: t.Object({
        consumer: t.String(),
        task_id: t.String(),
        response: ListPullRequestsResponse,
      }),
    }
  )

  .post(
    '/response/get_pull_request_details',
    async ({ body }) => {
      return responseGetPullRequestDetails(body.response, body.task_id, body.consumer);
    },
    {
      body: t.Object({
        consumer: t.String(),
        task_id: t.String(),
        response: GetPullRequestDetailsResponse,
      }),
    }
  )

  .post(
    '/response/get_user_details',
    async ({ body }) => {
      return responseGetUserDetails(body.response, body.task_id, body.consumer);
    },
    {
      body: t.Object({
        consumer: t.String(),
        task_id: t.String(),
        response: GetUserDetailsResponse,
      }),
    }
  )

  .post(
    '/response/feature_engineering_via_llm',
    async ({ body }) => {
      return responseFeatureEngineeringViaLLM(
        body.response.pr_id,
        body.response.feature_name,
        body.response.feature_value,
        body.task_id,
        body.consumer
      );
    },
    {
      body: t.Object({
        consumer: t.String(),
        task_id: t.String(),
        response: FeatureEngineeringViaLLMResponse,
      }),
    }
  )

  .post(
    '/response/get_pull_request_code_diff',
    async ({ body }) => {
      return responseGetPullRequestCodeDiff(body.response, body.task_id, body.consumer);
    },
    {
      body: t.Object({
        consumer: t.String(),
        task_id: t.String(),
        response: GetPullRequestCodeDiffResponse,
      }),
    }
  )

  .post(
    '/response/get_pull_request_comments',
    async ({ body }) => {
      return responseGetPullRequestComments(body.response, body.task_id, body.consumer);
    },
    {
      body: t.Object({
        consumer: t.String(),
        task_id: t.String(),
        response: GetPullRequestCommentsResponse,
      }),
    }
  )

  .post(
    '/produce',
    async ({ body }) => {
      return produceTask(body.task);
    },
    {
      body: t.Object({
        task: Tasks,
      }),
    }
  )

  .get('/top-repos', async () => {
    const repos = await topRepos.find({}).toArray();
    return repos;
  })

  .get('/non-completed-tasks', async () => {
    const ts = await tasks
      .find({
        completed: false,
      })
      .toArray();
    return ts;
  })

  .get(
    '/processing-rate',
    async ({ query }) => {
      const mode = query.mode;
      if (mode === 'last_hour') {
        const lastHourTime = new Date(Date.now() - 60 * 60 * 1000);
        const lastHourTasks = await tasks.countDocuments({
          nature: { $in: query.nature },
          completed: true,
          completed_at: { $gte: lastHourTime },
          assigned_to: query.assigned_to ?? { $exists: true },
        });

        return {
          lastHourTasks,
        };
      } else if (mode === 'last_12_hours') {
        // for last 12 hours, return the processing rate for each hour
        const last12HoursTime = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const completedTasksWithTime = await tasks
          .aggregate([
            {
              $match: {
                nature: { $in: query.nature },
                completed: true,
                completed_at: { $gte: last12HoursTime },
                assigned_to: query.assigned_to ?? { $exists: true },
              },
            },
            {
              $group: {
                _id: {
                  hour: { $hour: '$completed_at' },
                },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray();

        return completedTasksWithTime.map(t => ({
          hour: (t._id.hour + 8) % 24,
          count: t.count,
        }));
      }
    },
    {
      query: t.Object({
        mode: t.Union([t.Literal('last_hour'), t.Literal('last_12_hours')]),
        nature: t.Array(TaskNature),
        assigned_to: t.Optional(t.String()),
      }),
    }
  );
