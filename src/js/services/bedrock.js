import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const MODEL_ID = 'us.deepseek.r1-v1:0';

let client = null;

export function initBedrockClient(accessKeyId, secretAccessKey, region = 'us-west-2') {
  client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

export async function generateAIResponse(prompt, options = {}) {
  if (!client) {
    console.warn('Bedrock client not initialized. Using mock AI response.');
    return getMockAIResponse(prompt);
  }

  try {
    const formattedPrompt = `<｜begin▁of▁sentence｜><｜User｜>${prompt}<｜Assistant｜><think>`;
    
    const body = JSON.stringify({
      prompt: formattedPrompt,
      max_tokens: options.maxTokens || 512,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
    });

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body,
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.completion || responseBody.text || 'AI response generated';
  } catch (error) {
    console.error('Bedrock API error:', error);
    return getMockAIResponse(prompt);
  }
}

function getMockAIResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('prioritize') || lowerPrompt.includes('sort')) {
    return 'Based on your tasks, I recommend focusing on high-priority items first, especially those with upcoming deadlines. Your exam preparation should be top priority this week.';
  }
  
  if (lowerPrompt.includes('budget') || lowerPrompt.includes('spending')) {
    return 'Your spending looks good this week. Consider setting aside more for savings if possible. Watch your data expenses - they\'re trending higher than usual.';
  }
  
  if (lowerPrompt.includes('today') || lowerPrompt.includes('plan')) {
    return 'Good morning! Today you have 3 high-priority tasks and 2 medium-priority items. I suggest starting with your assignment due tomorrow, then tackling your freelance project. You have ₦15,000 left in your weekly budget.';
  }
  
  return 'I\'m here to help you stay organized and reach your goals. Let me know what you need assistance with!';
}

export async function prioritizeTodos(todos) {
  const prompt = `Given these tasks: ${todos.map(t => `"${t.title}" (priority: ${t.priority}, due: ${t.dueDate || 'no date'})`).join(', ')}. 
  
  Suggest the optimal order to complete them, considering priority levels, deadlines, and typical student/young professional workflows. Return a brief recommendation.`;
  
  return await generateAIResponse(prompt, { maxTokens: 256 });
}

export async function analyzeBudget(transactions, budget) {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget - totalSpent;
  
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
