import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Extract JSON data from the request
    const data = await req.json();
    const assistantId = data.assistantId;

    // Log the received assistant ID for debugging
    console.log(`Received request with assistantId: ${assistantId}`);

    // Retrieve the assistant details for the given assistant ID using the OpenAI API
    const assistantDetails = await openai.beta.assistants.retrieve(assistantId);

    // Log the retrieved assistant details for debugging
    console.log(`Retrieved assistant details: ${JSON.stringify(assistantDetails)}`);

    // Return the retrieved assistant details as a JSON response
    return NextResponse.json(assistantDetails);
  } catch (error) {
    console.error(`Error occurred while retrieving assistant: ${error}`);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}