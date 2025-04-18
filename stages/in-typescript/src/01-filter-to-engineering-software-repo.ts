import { client, topRepos, topReposFilter } from 'master-0/src/data';

// Keywords for filtering
const excludeNames = ['996', 'Python-100-Days', 'chinese-poetry', 'DeepLearning-500-questions'];
const excludeKeywords = [
  'awesome',
  'tutorial',
  'education',
  'community',
  'share',
  'list',
  'guide',
  'resume',
];
const excludeTopics = [
  'education',
  'tutorial',
  'tutorials',
  'awesome-list',
  'community',
  'resource',
  'resources',
  'dataset',
  'interview',
];

async function main() {
  try {
    const dryRun = process.argv.includes('--dry-run');

    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Fetch all repos
    const repos = await topRepos.find().toArray();
    console.log(`Found ${repos.length} repositories in the database`);

    // Filter repos
    const filteredRepos = repos.filter(repo => {
      // Check if it's a fork, or archived
      if (repo.fork || repo.archived) return false;

      // Check if it has issues, if it doesn't, the main code development activities
      if (repo.has_issues === false) return false;

      // Check if it is not active
      if (repo.open_issues_count < 50) return false;

      const name = repo.full_name.split('/')[1] || '';
      if (excludeNames.find(n => name.toLowerCase().includes(n.toLowerCase()))) return false;

      // Convert description to lowercase for case-insensitive matching
      const description = (repo.description || '').toLowerCase();

      // Check for exclude keywords in description
      if (excludeKeywords.some(keyword => description.includes(keyword.toLowerCase()))) {
        return false;
      }

      // Check for HTML or Markdown as main language (likely documentation)
      if (repo.language === null || ['HTML', 'Markdown'].includes(repo.language)) {
        return false;
      }

      // Check for specific topics (if available)
      const topics = repo.topics || [];
      if (
        topics.some(topic => excludeTopics.find(t => topic.toLowerCase().includes(t.toLowerCase())))
      ) {
        return false;
      }

      return true;
    });

    console.log(`Filtered to ${filteredRepos.length} engineering software repositories`);

    // Print the names of filtered repos
    console.log('\nFiltered Repository List:');
    filteredRepos.forEach((repo, index) => {
      console.log(`${index + 1}. https://github.com/${repo.full_name}`);
    });

    if (dryRun) {
      console.error('Dry run complete');
      return;
    }

    // Save the filtered repos to a file
    await Bun.write(
      'results/filtered-repos.json',
      JSON.stringify(
        filteredRepos.map(repo => ({
          repo_id: repo._id.toString(),
          repo_url: `https://github.com/${repo.full_name}`,
        })),
        null,
        2
      )
    );
    console.log('Filtered repositories saved to filtered-repos.json');

    // write to filter
    await topReposFilter.drop();
    await topReposFilter.insertMany(
      filteredRepos.map(repo => ({
        foreign_id: repo._id,
      }))
    );
    console.log('Filtered repositories saved to filter collection');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// sandbox().catch(console.error);
main().catch(console.error);
