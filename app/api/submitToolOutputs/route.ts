// pages/api/submitToolOutputs.ts
// This route submits tool outputs for a specific run.
// Requires thread_id, run_id, and an array of tool_outputs.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { threadId, runId, toolOutputs } = await req.json();

    console.log('Submitting tool outputs for run:', { threadId, runId, toolOutputs });

    const run = await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      { tool_outputs: toolOutputs.map(({ toolCallId, output }) => ({ tool_call_id: toolCallId, output })) }
    );

    console.log('Tool outputs submitted:', run);
    return NextResponse.json(run);
  } catch (error) {
    console.error('Error submitting tool outputs:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}