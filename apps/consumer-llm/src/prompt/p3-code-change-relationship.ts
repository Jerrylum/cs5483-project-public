export const codeChangeRelationshipPrompt = `Generate a JSON analysis of whether the GitHub pull request’s code changes are **aligned with its goal** and **merge-worthy**.  

# User content delimiters
====================

# Categories
1. **good**: The given changes is code that well-written, follows best practices, and aligns with the PR's goal.
2. **acceptable**: The given changes is code that is functional but may have minor issues or could be improved (e.g. not standardized code format), or not fully aligned with the PR's goal.
3. **poor**: The given changes is code that has significant issues, such as security flaws, poor readability, or major bugs, or does not align with the PR's goal.
4. **non-suitable**: The given changes is not a code (e.g., documentation) or the given title and description do not provide any information about the goal of the PR.

# Instructions
- Analyze the **title** and **description** for the goal of PR.
- Output **strictly as JSON** (no markdown, no extra text).
- Follow the definition and JSON schema below precisely.
- \`category\`: The most relevant category (use lowercase, e.g., "good").
- \`alignment\`: A JSON object with two fields:
  - \`is_aligned\`: A interger indicating whether the code changes align with the PR's goal.
  - \`reason\`: A string explaining why the code changes are aligned or not aligned with the PR's goal.
- \`alignment\` can be {} only if the title and description are empty or they does not provide any information about the goal of the PR.
- \`confidence\`: A confidence score between 1 (low) and 10 (high).

# Output JSON Scheme
\`\`\`json
{
  "category": "good | acceptable | poor | non-suitable",
  "alignment": {
    "is_aligned": interger,
    "reason": string
  },
  "confidence": integer
}
\`\`\`

# Input Data
## Title
====================
%%%title%%%
====================

## Description
====================
%%%description%%%
====================

## Changes
====================
%%%code_changes%%%
====================
`;
