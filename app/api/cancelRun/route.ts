// pages/api/cancelRun.ts
// Cancels a run that is in progress.
// Requires thread_id and run_id.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { threadId, runId } = await req.json();

    console.log('Cancelling run:', { threadId, runId });

    const run = await openai.beta.threads.runs.cancel(threadId, runId);

    console.log('Run cancelled:', run);
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
