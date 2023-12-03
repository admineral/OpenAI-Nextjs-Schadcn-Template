// app/api/modifyAssistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    console.log('Received request:', req);
    try {
      const { assistantId, instructions, name, tools, model, file_ids, description, metadata } = await req.json();
      console.log('Request body:', { assistantId, instructions, name, tools, model, file_ids, description, metadata });
  
      const updatedAssistant = await openai.beta.assistants.update(assistantId, {
        instructions,
        name,
        tools,
        model,
        file_ids,
        description,
        metadata,
      });
  
      console.log(`Updated assistant: ${JSON.stringify(updatedAssistant)}`);
  
      return NextResponse.json(updatedAssistant);
    } catch (error) {
      console.error('Error modify:', error);
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
      }
    }
  }