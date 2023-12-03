import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

// Initialize OpenAI client using the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req: NextRequest) {
    try {
      // Extract JSON data from the request
      const data = await req.json();
  
      // Retrieve 'threadId' from JSON data
      const threadId = data.threadId;
  
      // Log the received thread ID for debugging
      console.log(`Received request with threadId: ${threadId}`);
  
      // Retrieve messages for the given thread ID using the OpenAI API
      const messages = await openai.beta.threads.messages.list(threadId);
      
      messages.data.forEach((message, index) => {
        console.log(`Message ${index + 1} content:`, message.content);
      });
      // Log the count of retrieved messages for debugging
      console.log(`Retrieved ${messages.data.length} messages`);
  
      // Return the retrieved messages as a JSON response
      return NextResponse.json({ ok: true, messages: messages.data });
    } catch (error) {
      // Log any errors that occur during the process
      console.error(`Error occurred: ${error}`);
      // Return the error as a JSON response
      return NextResponse.json({ ok: false, error: error.message });
    }
  }