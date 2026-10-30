import { z } from 'zod';
import { toJsonSchema } from '../utils/toJsonSchema.js';
import { chatCompletion } from './llm.service.js';
import { COACH_PROMPT, buildCoachInput } from '../prompts/coach.prompt.js';

const reportSchema = z.object({
  overallAssessment: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  fallacies: z.array(
    z.object({
      type: z.string(),
      quote: z.string(),
      explanation: z.string(),
    }),
  ),
  missedEvidence: z.array(z.string()),
  notesUsage: z.string(),
  modelAnswer: z.string(),
  tips: z.array(z.string()),
});

const responseFormat = {
  type: 'json_schema',
  json_schema: { name: 'debate_report', strict: true, schema: toJsonSchema(reportSchema) },
};

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function keepValidParts(data) {
  if (!data || typeof data !== 'object') return null;

  const report = {};
  let anyValid = false;
  for (const [field, fieldSchema] of Object.entries(reportSchema.shape)) {
    const result = fieldSchema.safeParse(data[field]);
    report[field] = result.success ? result.data : null;
    if (result.success) anyValid = true;
  }
  return anyValid ? report : null;
}

export async function generateDebrief({ motion, side, transcript, notes, signal }) {
  const messages = [
    { role: 'system', content: COACH_PROMPT },
    { role: 'user', content: buildCoachInput({ motion, side, transcript, notes }) },
  ];

  let lastAttempt = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const message = await chatCompletion({ messages, responseFormat, reasoningEffort: 'low', maxTokens: 4000, signal });
    const data = parseJson(message.content);
    const result = reportSchema.safeParse(data);

    if (result.success) {
      return { report: result.data, complete: true };
    }

    console.warn(`[coach] attempt ${attempt} returned an invalid report`);
    lastAttempt = data ?? lastAttempt;
  }

  const partial = keepValidParts(lastAttempt);
  if (!partial) {
    const error = new Error('The coach could not produce a report. Please try again.');
    error.status = 502;
    throw error;
  }
  return { report: partial, complete: false };
}