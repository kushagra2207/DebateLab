import { chatCompletion } from './llm.service.js';
import { toolDefinitions } from '../tools/definitions.js';
import { runTool } from '../tools/executor.js';
import { buildOpponentPrompt, OPENING_REQUEST } from '../prompts/opponent.prompt.js';

const MAX_TOOL_CALLS = 3;
const TOOL_TIME_BUDGET_MS = 30000;
const HISTORY_MESSAGES_SENT = 8;

function throwIfCancelled(signal) {
  if (signal?.aborted) {
    const error = new Error('The request was cancelled by the client.');
    error.status = 499;
    throw error;
  }
}

export async function getOpponentReply({ motion, side, round, totalRounds, history, signal }) {
  const opponentSide = side === 'for' ? 'against' : 'for';
  const isOpening = history.length === 0;

  const messages = [
    { role: 'system', content: buildOpponentPrompt({ motion, opponentSide, round, totalRounds, isOpening }) },
  ];

  if (isOpening) {
    messages.push({ role: 'user', content: OPENING_REQUEST });
  } else {
    for (const turn of history.slice(-HISTORY_MESSAGES_SENT)) {
      messages.push({ role: turn.role === 'user' ? 'user' : 'assistant', content: turn.text });
    }
  }

  const startedAt = Date.now();
  let toolCallsUsed = 0;
  let forceAnswer = false;

  while (true) {
    throwIfCancelled(signal);

    const outOfTime = Date.now() - startedAt > TOOL_TIME_BUDGET_MS;
    const toolsAllowed = !forceAnswer && !outOfTime && toolCallsUsed < MAX_TOOL_CALLS;

    let message;
    try {
      message = await chatCompletion({
        messages,
        tools: toolDefinitions,
        toolChoice: toolsAllowed ? 'auto' : 'none',
        reasoningEffort: 'low',
        maxTokens: 2500,
        signal,
      });
    } catch (err) {
      if (err.code === 'TOOL_USE_FAILED' && toolsAllowed) {
        forceAnswer = true;
        continue;
      }
      if (err.code === 'TOOL_USE_FAILED') {
        const error = new Error('The opponent had trouble preparing a reply. Please send your argument again.');
        error.status = 502;
        throw error;
      }
      throw err;
    }

    const toolCalls = message.tool_calls || [];

    if (toolCalls.length === 0) {
      const reply = message.content?.trim();
      if (!reply) {
        const error = new Error('The opponent could not produce a reply. Please send your argument again.');
        error.status = 502;
        throw error;
      }
      console.log(`[opponent] reply ready (${toolCallsUsed} lookups, ${Date.now() - startedAt} ms)`);
      return reply;
    }

    if (!toolsAllowed) {
      const error = new Error('The opponent had trouble preparing a reply. Please send your argument again.');
      error.status = 502;
      throw error;
    }

    messages.push({ role: 'assistant', content: message.content || '', tool_calls: toolCalls });

    for (const call of toolCalls) {
      throwIfCancelled(signal);
      const result =
        toolCallsUsed < MAX_TOOL_CALLS
          ? await runTool(call.function?.name, call.function?.arguments)
          : JSON.stringify({ error: 'Lookup limit reached. Answer now without further lookups.' });
      toolCallsUsed++;
      messages.push({ role: 'tool', tool_call_id: call.id, name: call.function?.name, content: result });
    }
  }
}