// pages/api/listRunSteps.ts
// Lists the steps of a run.
// Requires thread_id and run_id. Optional query parameters for pagination.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { threadId, runId, limit, order, after, before } = await req.json();

    console.log('Listing run steps:', { threadId, runId, limit, order, after, before });

    const runSteps = await openai.beta.threads.runs.steps.list(threadId, runId, { limit, order, after, before });

    console.log('Run steps:', runSteps);
    return NextResponse.json(runSteps);
} catch (error) {
    console.error('Error listing run steps:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
