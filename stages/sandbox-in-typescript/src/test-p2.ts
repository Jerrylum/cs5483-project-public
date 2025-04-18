import { treaty } from '@elysiajs/eden';
import type { Static } from 'elysia';
import { app, consume, produceTask, produceTasks } from 'master-0/src/app.ts';
import { client, pullRequestDetails, pullRequestExtraFeatures, pullRequests } from 'master-0/src/data';
import { FeatureEngineeringViaLLM, GetPullRequestDetails, isFeatureEngineeringViaLLM } from 'master-0/src/types';
import { extractJsonFromDeepseekResponse } from 'master-0/src/utils';
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
    const prs = await pullRequestExtraFeatures.find({
      "features.changes-quality": { $exists: true },
    }).project({
      _id: 0,
      id: 1,
      "features.changes-quality": 1,
    }).toArray();

    // print one invalid JSON
    // const invalid = prs.filter(pr => {
    //   const closedReason = pr["features"]["closed-reason"];
    //   return !extractJsonFromDeepseekResponse(closedReason)
    // });
    // console.log(invalid[0].id);
    
    // console.log(invalid[0].features["closed-reason"]);

    // count the number of valid JSONs
    const valid = prs.map(pr => {
      const changesQuality = pr["features"]["changes-quality"];
      try {
        const json = extractJsonFromDeepseekResponse(changesQuality);
        return true;
      } catch (error) {
        console.error('Error:', error, changesQuality);
        return false;
      }
    });

    const validCount = valid.filter(v => v).length;
    const invalidCount = valid.filter(v => !v).length;

    console.log("The number of valid JSONs is", validCount);
    console.log("The number of invalid JSONs is", invalidCount);
    console.log("The percentage of valid JSONs is", validCount / (validCount + invalidCount));

    const normalCount = prs.filter(pr => {
      const changesQuality = pr["features"]["changes-quality"];
      try {
        const json = extractJsonFromDeepseekResponse(changesQuality);
        if (!json) return false;
        return Object.keys(json["alignment"] || {}).length > 0;
      } catch (error) {
        console.error('Error:', error, changesQuality);
        return false;
      }
    }).length;

    console.log("The normal count is", normalCount);
    console.log("The normal rate is", normalCount / (validCount));

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