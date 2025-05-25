import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  model?: string;
}

// Groq API types
interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

interface GroqChatCompletion {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiChatModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.9,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 2048,
  }
});

// Simple in-memory rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

export async function POST(req: Request) {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return NextResponse.json(
        { error: 'Please wait a moment before sending another message' },
        { status: 429 }
      );
    }
    lastRequestTime = now;

    const { messages, model = "groq" } = await req.json() as RequestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    if (model === "gemini") {
      try {
        const chat = geminiChatModel.startChat({
          history: messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })),
        });

        const result = await chat.sendMessage([{ text: messages[messages.length - 1].content }]);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Empty response from Gemini API');
        }

        return NextResponse.json({
          content: text,
          model: "gemini-1.5-pro"
        });
      } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      try {
        // Default to Groq
        const completion = await groq.chat.completions.create({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })) as GroqMessage[],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 2048,
          stream: false,
        }) as GroqChatCompletion;

        if (!completion.choices?.[0]?.message?.content) {
          throw new Error('Invalid response from Groq API');
        }

        return NextResponse.json({
          content: completion.choices[0].message.content,
          model: "llama-3.3-70b-versatile"
        });
      } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error(`Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
} 