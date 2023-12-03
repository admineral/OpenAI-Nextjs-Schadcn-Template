// app/api/listAssistants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// app/api/listAssistants/route.ts
export async function POST(req: NextRequest) {
    try {
      // Extract JSON data from the request
      const data = await req.json();
      const { limit, order, after, before } = data;
  
      // Log the received query parameters for debugging
      console.log(`Received request with query parameters: limit=${limit}, order=${order}, after=${after}, before=${before}`);
  
      // List the assistants using the OpenAI API
      const assistants = await openai.beta.assistants.list({
        limit,
        order,
        after,
        before,
      });
  
      // Log the retrieved assistants for debugging
      console.log(`Retrieved assistants: ${JSON.stringify(assistants)}`);
  
      // Return the retrieved assistants as a JSON response
      return NextResponse.json(assistants.data);
    } catch (error) {
      // Log any errors that occur during the process
      if (error instanceof Error) {
        console.error(`Error occurred while listing assistants: ${error}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        console.error(`An unknown error occurred while listing assistants.`);
        return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
      }
    }
  }