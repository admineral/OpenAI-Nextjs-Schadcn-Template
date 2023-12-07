import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('Starting the chat completion API call');

  const { messages } = await request.json();

  if (!messages) {
    console.error('No messages found in the request');
    return NextResponse.json({ success: false, message: 'No messages found' });
  }

  console.log('Received messages for chat completion');

  console.log('Sending request to OpenAI');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    console.log('Received response from OpenAI');
    console.log('Response:', JSON.stringify(response, null, 2));

    const reply = response?.choices[0]?.message?.content;
    console.log('Reply:', reply);

    return NextResponse.json({ success: true, reply: reply });
  } catch (error) {
    console.error('Error sending request to OpenAI:', error);
    return NextResponse.json({ success: false, message: 'Error sending request to OpenAI' });
  }
}