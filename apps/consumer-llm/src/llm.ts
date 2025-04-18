// Array of Ollama server endpoints
const OLLAMA_SERVERS = [
  'http://127.0.0.1:11434/api/generate', // GPU 0
  'http://127.0.0.1:11435/api/generate', // GPU 1
  'http://127.0.0.1:11436/api/generate', // GPU 2
  'http://127.0.0.1:11437/api/generate', // GPU 3
  // "http://127.0.0.1:11438/api/generate", // GPUs 0+1 combined
  // "http://127.0.0.1:11439/api/generate"  // GPUs 2+3 combined
] as const;

// Default server in case of issues
const DEFAULT_SERVER = 'http://127.0.0.1:11434/api/generate';

// Round-robin counter for server selection
let currentServerIndex = 0;

export const modelDeepseekR1_14b = 'deepseek-r1:14b';
export const modelDeepseekR1_70b = 'deepseek-r1:70b';

export const model = modelDeepseekR1_14b;

/**
 * Returns the number of available Ollama servers
 * @returns Number of configured Ollama servers
 */
export const getOllamaServerCount = (): number => {
  return OLLAMA_SERVERS.length;
};

export const requestOllama = async (prompt: string): Promise<string> => {
  // Get the next server in round-robin fashion and ensure it's a string
  const serverUrl: string = OLLAMA_SERVERS[currentServerIndex] || DEFAULT_SERVER;

  // Update the index for the next request
  currentServerIndex = (currentServerIndex + 1) % OLLAMA_SERVERS.length;

  // Log which server we're using
  console.log(`Using Ollama server: ${serverUrl}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes in milliseconds

  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.6,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    // console.log('requestOllama - response:', response);

    const body = (await response.json()) as { response: string };
    // console.log('requestOllama - body:', body);
    // console.log('requestOllama - body.response:', body.response);
    return body.response;
  } finally {
    clearTimeout(timeoutId);
  }
};

// requestOllama("Hi!");

// const prompt = naturePrompt;

// const replacedPrompt = replacePlaceholders(prompt, {
//   "title": "Restore --no-mangling CLI option for next build #75921",

//   "description": `The --no-mangling CLI option for next build was originally introduced in #42633. However, we lost this feature during our migration from Terser to SWC. As part of broader improvements for debugging dynamic accesses with Dynamic I/O enabled, I needed this functionality back, so I restored it for Webpack and also added it to Turbopack.

// fixes #67037
// fixes #50208
// `,

//   "code_changes": `
// crates/napi/src/minify.rs
// -    opts.mangle = BoolOrDataConfig::from_obj(MangleOptions {
// -        reserved: vec!["AbortSignal".into()],
// -        ..Default::default()
// -    })

// +    if !opts.mangle.is_false() {
// +        let mut mangle = std::mem::take(&mut opts.mangle);
// +        if mangle.is_true() {
// +            mangle = BoolOrDataConfig::from_obj(MangleOptions::default());
// +        }
// +        opts.mangle = mangle.map(|mut mangle_opts| {
// +            mangle_opts.reserved.push("AbortSignal".into());
// +            mangle_opts
// +        });
// +    }
// }

// `,
// });

// const response = await requestOllama(replacedPrompt);

// console.log("Extracted JSON:");
// console.log(extractJsonFromDeepseekResponse(response));
