// pages/api/createThreadAndRun.ts
// Creates a thread and runs it in one request.
// Requires assistant_id and an optional thread object with messages and other properties.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { assistantId, thread, model, instructions, tools, metadata } = await req.json();

    console.log('Creating thread and running with assistant:', { assistantId, thread });

    const run = await openai.beta.threads.createAndRun({
      assistant_id: assistantId,
      thread: thread,
      model: model,
      instructions: instructions,
      tools: tools,
      metadata: metadata,
    });

    console.log('Thread created and run:', run);
    return NextResponse.json(run);
  } catch (error) {
    console.error('Error listing run steps:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
