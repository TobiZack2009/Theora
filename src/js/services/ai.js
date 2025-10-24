import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// --- Constants ---
const BEDROCK_MODEL_ID = 'us.deepseek.r1-v1:0';
const AI_PROVIDER = import.meta.env.AI_PROVIDER;

// --- Credentials from Rollup ---
const AWS_CREDENTIALS = {
  accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.AWS_REGION,
};

const EDEN_AI_CREDENTIALS = {
  apiKey: import.meta.env.EDEN_AI_API_KEY,
  model: import.meta.env.EDEN_AI_MODEL,
};

let bedrockClient = null;

// --- Initialization ---

/**
 * Initializes the AI clients based on available credentials.
 */
export function initAIClients() {
  if (AWS_CREDENTIALS.accessKeyId && AWS_CREDENTIALS.secretAccessKey) {
    try {
      bedrockClient = new BedrockRuntimeClient({
        region: AWS_CREDENTIALS.region,
        credentials: {
          accessKeyId: AWS_CREDENTIALS.accessKeyId,
          secretAccessKey: AWS_CREDENTIALS.secretAccessKey,
        },
      });
      console.log('AWS Bedrock client initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize AWS Bedrock client:', error);
    }
  } else {
    console.warn('AWS Bedrock credentials not found.');
  }

  if (EDEN_AI_CREDENTIALS.apiKey && EDEN_AI_CREDENTIALS.apiKey !== 'YOUR_EDEN_AI_API_KEY') {
    console.log('Eden AI configured.');
  } else {
    console.warn('Eden AI API key not found or is a placeholder.');
  }
}


// --- Bedrock API Call ---

async function fetchBedrockResponse(prompt, options) {
  if (!bedrockClient) {
    throw new Error('Bedrock client not initialized.');
  }
  
  const formattedPrompt = `<｜begin of sentence｜><｜User｜>${prompt}<｜Assistant｜><think>`;
  const body = JSON.stringify({
    prompt: formattedPrompt,
    max_tokens: options.maxTokens || 512,
    temperature: options.temperature || 0.7,
    top_p: options.topP || 0.9,
  });

  const command = new InvokeModelCommand({
    modelId: BEDROCK_MODEL_ID,
    body,
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const completion = responseBody.completion || responseBody.text;

  if (!completion) {
    throw new Error('Invalid response structure from Bedrock.');
  }
  return completion;
}

// --- Eden AI API Call ---

async function fetchEdenAIResponse(prompt, options) {
  if (!EDEN_AI_CREDENTIALS.apiKey || EDEN_AI_CREDENTIALS.apiKey === 'YOUR_EDEN_AI_API_KEY') {
    throw new Error('Eden AI API key not configured.');
  }

  const response = await fetch('https://api.edenai.run/v2/text/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${EDEN_AI_CREDENTIALS.apiKey}`,
    },
    body: JSON.stringify({
      providers: 'openai',
      text: prompt,
      model: EDEN_AI_CREDENTIALS.model,
      max_tokens: options.maxTokens || 512,
      temperature: options.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Eden AI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const generatedText = data.openai?.generated_text;

  if (!generatedText) {
    throw new Error('Invalid response structure from Eden AI.');
  }
  return generatedText;
}

// --- Main Generator Function ---

/**
 * Generates an AI response, trying the primary provider first, then falling back.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {object} options - Options like maxTokens, temperature.
 * @returns {Promise<string>} - The AI-generated response.
 */
export async function generateAIResponse(prompt, options = {}) {
  // Primary: Bedrock
  if (AI_PROVIDER === 'bedrock' && bedrockClient) {
    try {
      return await fetchBedrockResponse(prompt, options);
    } catch (error) {
      console.warn(`Bedrock request failed: ${error.message}. Falling back to Eden AI.`);
      // Fallback: Eden AI
      try {
        return await fetchEdenAIResponse(prompt, options);
      } catch (fallbackError) {
        console.error(`Eden AI fallback failed: ${fallbackError.message}. Using mock response.`);
        return getMockAIResponse(prompt);
      }
    }
  }

  // Primary: Eden AI
  if (AI_PROVIDER === 'edenai') {
    try {
      return await fetchEdenAIResponse(prompt, options);
    } catch (error) {
      console.warn(`Eden AI request failed: ${error.message}. Falling back to Bedrock.`);
      // Fallback: Bedrock
      if (bedrockClient) {
        try {
          return await fetchBedrockResponse(prompt, options);
        } catch (fallbackError) {
          console.error(`Bedrock fallback failed: ${fallbackError.message}. Using mock response.`);
          return getMockAIResponse(prompt);
        }
      } else {
        console.error('Bedrock client not available for fallback. Using mock response.');
        return getMockAIResponse(prompt);
      }
    }
  }
  
  // Default fallback if no provider is configured or the primary one fails without a fallback
  console.warn('No primary AI provider configured or available. Using mock response.');
  return getMockAIResponse(prompt);
}


// --- Mock Response ---

function getMockAIResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('prioritize') || lowerPrompt.includes('sort')) {
    return 'Based on your tasks, I recommend focusing on high-priority items first, especially those with upcoming deadlines. Your exam preparation should be top priority this week.';
  }
  
  if (lowerPrompt.includes('budget') || lowerPrompt.includes('spending')) {
    return "Your spending looks good this week. Consider setting aside more for savings if possible. Watch your data expenses - they're trending higher than usual.";
  }
  
  if (lowerPrompt.includes('today') || lowerPrompt.includes('plan')) {
    return 'Good morning! Today you have 3 high-priority tasks and 2 medium-priority items. I suggest starting with your assignment due tomorrow, then tackling your freelance project. You have ₦15,000 left in your weekly budget.';
  }
  
  return "I'm here to help you stay organized and reach your goals. Let me know what you need assistance with!";
}

// --- High-Level API (unchanged) ---

export async function prioritizeTodos(todos) {
  const prompt = `Given these tasks: ${todos.map(t => `"${t.title}" (priority: ${t.priority}, due: ${t.dueDate || 'no date'})`).join(', ')}. 
  
  Suggest the optimal order to complete them, considering priority levels, deadlines, and typical student/young professional workflows. Return a brief recommendation.`;
  
  return await generateAIResponse(prompt, { maxTokens: 256 });
}

export async function analyzeBudget(transactions, budget) {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const prompt = `A user has spent ₦${totalSpent} out of their ₦${budget} budget. Recent transactions: ${transactions.slice(0, 5).map(t => `₦${t.amount} on ${t.category}`).join(', ')}. 
  
  Provide brief spending insights and suggestions for a Nigerian student/young professional.`;
  
  return await generateAIResponse(prompt, { maxTokens: 200 });
}

export async function generateDailyBrief(todos, budget, todayEvents) {
  const highPriorityCount = todos.filter(t => t.priority === 'high' && !t.completed).length;
  const eventsCount = todayEvents.length;
  
  const prompt = `Create a brief daily motivational message for a Nigerian student/young professional. They have ${highPriorityCount} urgent tasks, ${eventsCount} events today, and ₦${budget} in their weekly budget. Keep it encouraging and practical.`;
  
  return await generateAIResponse(prompt, { maxTokens: 150 });
}