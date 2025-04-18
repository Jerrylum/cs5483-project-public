import { treaty } from '@elysiajs/eden';
import type { Static } from 'elysia';
import { app, consume, produceTask, produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequestExtraFeatures, pullRequests } from 'master-0/src/data';
import { FeatureEngineeringViaLLM, GetPullRequestDetails, isFeatureEngineeringViaLLM, PullRequestComment } from 'master-0/src/types';
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
    const pr = await pullRequestDetails.findOne({
      // url: "https://api.github.com/repos/facebook/react/pulls/32600"
      id: 105750292
    });

    if (!pr) {
      throw new Error('No PR found');
    }

    // console.log(pr);


    const prExtraFeatures = (await pullRequestExtraFeatures.find({ id: pr.id }).project({
      "features.last_10_comments": 1,
    }).toArray())[0] as { features: { last_10_comments: PullRequestComment[] } };

    if (!prExtraFeatures) {
      throw new Error('No extra features found');
    }

    const splits = pr.url.split('/');
    const owner = splits.at(-4)!;
    const repo = splits.at(-3)!;

    // console.log({ prExtraFeatures });

    const task = {
      nature: 'feature_engineering_via_llm',
      // repo_id: repoId,
      pr_id: pr.id,
      owner,
      repo,
      issue_number: pr.number,
      feature_name: 'closed-reason',
      prompt_template: "closedReason",
      prompt_values: {
        'title': pr.title,
        'description': pr.body ?? '',
        'created_at': pr.created_at,
        'closed_at': pr.closed_at ?? '',
        'last_10_comments': prExtraFeatures.features.last_10_comments.map(c => {
          return `
### User
====================
${c.user.login}
====================

### Body
====================
${c.body}
====================

### Author association: ${c.author_association}

### Commented at: ${c.created_at}
`
        }).join('\n'),
      },
      created_at: new Date(),
      completed: false,
    } satisfies Static<typeof FeatureEngineeringViaLLM>;

    // console.log(task);

    await produceTask(task);





    // const consumeResponse = await server.consume.post({
    //   consumer: 'consumer-llm',
    //   supported: ['feature_engineering_via_llm']
    // })

    // const myTask = consumeResponse.data;
    // if (!myTask) {
    //   throw new Error('No task found');
    // }

    // if (isFeatureEngineeringViaLLM(myTask)) {
    //   console.log(myTask);

    //   const response = await server.response.feature_engineering_via_llm.post({
    //     consumer: 'consumer-llm',
    //     task_id: myTask._id.toString(),
    //     response: {
    //       pr_id: myTask.pr_id,
    //       feature_name: myTask.feature_name,
    //       feature_value: 'This is a test feature value 4',
    //     }
    //   })

    //   console.log(response);
    // }

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
