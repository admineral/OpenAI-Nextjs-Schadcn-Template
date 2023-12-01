// app/api/deleteAssistant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function DELETE(req: NextRequest) {
    console.log('Received request:', req);
    try {
      const { assistantId } = await req.json();
      console.log('Request body:', { assistantId });
  
      const deletedAssistant = await openai.beta.assistants.del(assistantId);
  
      console.log(`Deleted assistant: ${JSON.stringify(deletedAssistant)}`);
  
      return NextResponse.json(deletedAssistant);
    } catch (error) {
      console.error(`Error occurred while deleting assistant: ${error}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}