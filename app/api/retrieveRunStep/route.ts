// pages/api/retrieveRunStep.ts
// Retrieves a specific run step.
// Requires thread_id, run_id, and step_id.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
      const { threadId, runId, stepId } = await req.json();
  
      console.log('Retrieving run step:', { threadId, runId, stepId });
  
      const runStep = await openai.beta.threads.runs.steps.retrieve(threadId, runId, stepId);
  
      console.log('Run step retrieved:', runStep);
      return NextResponse.json(runStep);
    } catch (error) {
      console.error('Error retrieving run step:', error);
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
      }
    }
  }