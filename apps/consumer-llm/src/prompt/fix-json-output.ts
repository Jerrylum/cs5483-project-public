export const fixJsonOutputPrompt = (jsonOutputGuidelines: string, previousResponse: string) => `
Fix the following response from LLM due to incorrect JSON output:

# Instructions
- Output **strictly as JSON** (no markdown, no extra text).
- Follow the definition and JSON schema below precisely.

# Output JSON Scheme
${jsonOutputGuidelines}

# Previous Response
${previousResponse}
`;
