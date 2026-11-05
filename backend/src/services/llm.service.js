import { fetchJson } from '../utils/fetchJson.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SERVICE_NAME = 'the AI service';

const MAX_RETRY_WAIT_SECONDS = 10;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function chatCompletion({ messages, tools, toolChoice, responseFormat, reasoningEffort = 'low', maxTokens = 2000, signal }) {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('The AI opponent is not configured on the server yet (GROQ_API_KEY is missing).');
    error.status = 503;
    throw error;
  }

  const body = {
    model: process.env.GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_completion_tokens: maxTokens,
    reasoning_effort: reasoningEffort,
    include_reasoning: false,
  };
  if (tools?.length) {
    body.tools = tools;
    body.tool_choice = toolChoice || 'auto';
  }
  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const request = () =>
    fetchJson(GROQ_URL, {
      serviceName: SERVICE_NAME,
      timeoutMs: 30000,
      signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

  let data;
  try {
    data = await request();
  } catch (err) {
    if (err.upstreamStatus === 429 && err.retryAfter && err.retryAfter <= MAX_RETRY_WAIT_SECONDS) {
      console.warn(`[llm] rate limited, retrying in ${err.retryAfter}s`);
      await wait(err.retryAfter * 1000);
      data = await request().catch((retryErr) => {
        throw translateError(retryErr);
      });
    } else {
      throw translateError(err);
    }
  }

  const message = data?.choices?.[0]?.message;
  if (!message) {
    const error = new Error('The AI service returned an empty response. Please try again.');
    error.status = 502;
    throw error;
  }
  return message;
}

function translateError(err) {
  if (err.name === 'AbortError') return err;

  const status = err.upstreamStatus;
  const upstreamError = err.upstreamBody?.error;

  if (status === 429) {
    const error = new Error('The AI is busy right now (free-tier rate limit reached). Please wait a minute and try again.');
    error.status = 503;
    return error;
  }
  if (status === 401 || status === 403) {
    const error = new Error('The AI service rejected the server API key. Check GROQ_API_KEY.');
    error.status = 503;
    return error;
  }
  if (status === 400 && (upstreamError?.code === 'tool_use_failed' || upstreamError?.failed_generation)) {
    const error = new Error('The AI made an invalid lookup.');
    error.status = 502;
    error.code = 'TOOL_USE_FAILED';
    return error;
  }
  if (status) {
    console.error('[llm] Groq error:', status, upstreamError?.message || err.upstreamBody);
    const error = new Error('The AI service returned an error. Please try again.');
    error.status = 502;
    return error;
  }
  return err;
}