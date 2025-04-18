export const closedReasonPromptOutputGuidelines = `
{
  "categories": "normal | spam | duplication | abandoned | policy violation | pending-merge | other | unknown",
  "confidence": integer,
  "summary": string,
  "details": string,
}
`;

export const closedReasonPrompt = `Analyze the provided GitHub pull request (title, description, comments) to determine why it was closed. Use the following guidelines:

# User content delimiters
====================

# Categories
- normal: PR was closed based on problem on the changes itself (e.g., not merge-worthy, not aligned with the goal, have bug, not a bug etc.).
- spam: irrelevant, malicious, or promotional content.
- duplication: redundant with another PR/issue.
- abandoned: PR was inactive for a long time with no response from the author and got automatically or manually closed.
- policy-violation: Does not follow contribution guidelines, licensing issues, does not sign on contributor license agreement, etc.
- pending-merge: PR is closed but will be merged later.
- other: specify a unique reason in \`details\`.
- unknown: not enough information to determine the reason.

# Instructions
- Output strictly as JSON, follow the Output JSON Scheme (no markdown, no extra text).
- Analyze the title, description, and comments for clues.
- Follow the definition and JSON schema below precisely.
- \`categories\`: The most relevant category (use lowercase, e.g., "spam").
- \`confidence\`: A confidence score between 1 (low) and 10 (high).
- \`summary\`: A short explanation of why the category was chosen, referencing keywords, comments, or context.
- \`details\`: A short explanation of why the category was chosen, referencing keywords, comments, or context. Only required for \`other\` category.

# Output JSON Scheme
\`\`\`json  
${closedReasonPromptOutputGuidelines}
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

## Created at: %%%created_at%%%

## Closed at: %%%closed_at%%%

## Last 10 comments

%%%last_10_comments%%%

`;
