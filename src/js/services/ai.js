import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { appState } from '../state/appState.js';
import { getRelativeTime } from '../utils/helpers.js';



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

// --- High-Level API ---

export async function prioritizeTodos(todos) {
  if (appState.aiMessages.todoPrioritization) {
    return appState.aiMessages.todoPrioritization;
  }
  const prompt = `Given these tasks: ${todos.map(t => `"${t.title}" (priority: ${t.priority}, due: ${t.dueDate || 'no date'})`).join(', ')}. 
  
  Suggest the optimal order to complete them, considering priority levels, deadlines, and typical student/young professional workflows. Return a brief recommendation.`;
  
  const result = await generateAIResponse(prompt, { maxTokens: 256 });
  appState.setAIMessage('todoPrioritization', result);
  return result;
}

export async function analyzeBudget(transactions, budget) {
  if (appState.aiMessages.budgetInsight) {
    return appState.aiMessages.budgetInsight;
  }
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const prompt = `A user has spent ₦${totalSpent} out of their ₦${budget} budget. Recent transactions: ${transactions.slice(0, 5).map(t => `₦${t.amount} on ${t.category}`).join(', ')}. 
  
  Provide brief spending insights and suggestions for a Nigerian student/young professional.`;
  
  const result = await generateAIResponse(prompt, { maxTokens: 200 });
  appState.setAIMessage('budgetInsight', result);
  return result;
}

export async function generateDailyBrief(todos, budget, todayEvents) {
  if (appState.aiMessages.dailyBrief) {
    return appState.aiMessages.dailyBrief;
  }

  const prompt = `As Theora, a financial copilot for a Nigerian student, create a brief, motivational daily game plan.

Here's the user's situation:
- **Budget:** ₦${budget} remaining for the week.
- **Urgent Tasks (${todos.length}):**
  ${todos.map(t => `- "${t.title}" (Due: ${getRelativeTime(t.dueDate)})`).join('\n  ')}
- **Today's Events (${todayEvents.length}):**
  ${todayEvents.map(e => `- "${e.title}" at ${e.time || 'All day'}`).join('\n  ')}}

Your tasks:
1.  **Acknowledge the user's hustle.**
2.  **Analyze the tasks and events.** Point out the most critical item for today based on urgency, content, and remaining time.
3.  **Provide a concrete, actionable suggestion.** What should they focus on first?
4.  **Keep it concise and encouraging (2-3 sentences).**

Example: "Morning! You've got a full plate today. That "${todos[0]?.title || 'assignment'}" is your top priority. Knock it out first, then you can focus on your meeting this afternoon. You've got this! Your budget is looking solid at ₦${budget}."`;

  const result = await generateAIResponse(prompt, { maxTokens: 250 });
  appState.setAIMessage('dailyBrief', result);
  return result;
}

export async function generateTimeManagementAdvice(todos, events) {
  // Combine todos and events for context
  const allItems = [
    ...todos.map(t => ({ type: 'todo', title: t.title, priority: t.priority, dueDate: t.dueDate, completed: t.completed })),
    ...events.map(e => ({ type: 'event', title: e.title, date: e.date, time: e.time, recurrence: e.recurrence }))
  ];

  const prompt = `As Theora, an AI productivity and financial copilot, provide concise time management advice (about 3 paragraphs) to a Nigerian student or young professional. Base your advice on the following current tasks and events:

${JSON.stringify(allItems, null, 2)}

Your advice should focus on:
1.  **Key Priorities:** Identify the most critical tasks/events based on urgency and importance.
2.  **Actionable Steps:** Suggest immediate, practical steps for managing their time effectively today/this week.
3.  **Theora's Role:** Briefly mention how Theora can assist in implementing these strategies.

Ensure the tone is encouraging, culturally relevant (e.g., acknowledging "hustle"), and highly actionable. The response should be well-structured into about 3 paragraphs.`

  const result = await generateAIResponse(prompt, { maxTokens: 300 }); // Adjusted maxTokens for ~3 paragraphs
  appState.setAIMessage('timeManagementAdvice', result);
  return result;
}