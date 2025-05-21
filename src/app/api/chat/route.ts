import Groq from "groq-sdk";
import { NextRequest } from 'next/server';
import { Message } from '@/types/chat';

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY environment variable');
}

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Simple in-memory rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return new Response(
        JSON.stringify({ 
          error: 'Please wait a moment before sending another message',
          retryAfter: MIN_REQUEST_INTERVAL - (now - lastRequestTime)
        }),
        { 
          status: 429,
          headers: { 'Retry-After': '2' }
        }
      );
    }
    lastRequestTime = now;

    const { messages } = await request.json() as { messages: Message[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400 }
      );
    }

    try {
      // Only send the last few messages to reduce token usage
      const recentMessages = messages.slice(-4); // Keep last 4 messages for context
      
      // Format messages for Groq API
      const formattedMessages = recentMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;

      // Add system message
      formattedMessages.unshift({
        role: "system",
        content: "You are a helpful and knowledgeable AI assistant. You provide clear, accurate, and engaging responses while maintaining a professional and friendly tone."
      });

      // Send chat completion request
      const completion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.8,
        stream: false
      });

      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error('Empty response from Groq API');
      }

      return new Response(JSON.stringify({ content: responseText }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (groqError: any) {
      console.error('Groq API Error:', {
        error: groqError,
        message: groqError.message,
        details: groqError.details,
        stack: groqError.stack
      });

      // Check for rate limit errors
      if (groqError.message?.includes('429') || groqError.message?.toLowerCase().includes('rate limit')) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            details: {
              message: 'The API is temporarily unavailable due to high demand.',
              suggestion: 'Wait a few seconds and try again.'
            }
          }),
          { 
            status: 429,
            headers: { 'Retry-After': '60' }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: `Failed to generate response: ${groqError.message || 'Unknown error'}`,
          details: groqError.details || {} 
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
} 