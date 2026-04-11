import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const { role, education, cvText } = context || {};

    // System instruction injected statically
    const systemPrompt = `You are "Aura", a highly professional, senior technical interviewer. 
You are interviewing the candidate for the position of: ${role || "Software Engineer"}.
The candidate's education level is: ${education || "Not provided"}.
Candidate's Resume/CV Context:
${cvText ? cvText.substring(0, 3000) : "No resume provided."}

INSTRUCTIONS:
1. Conduct a rigorous but fair interview based heavily on their CV and requested role.
2. Ask exactly ONE question at a time. Do NOT list multiple questions.
3. Keep your responses concise, conversational, and under 100 words. Do not give long speeches.
4. When they answer, critically evaluate their answer. If it was good, acknowledge it. If it lacked depth, ask a follow-up probing question.
5. Emulate human speech patterns (e.g., "That makes sense," "Interesting approach.").
6. Do NOT break character. You are the interviewer.`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const completion = await groq.chat.completions.create({
      messages: chatMessages,
      model: "llama3-8b-8192", // Fast and efficient model
      temperature: 0.7,
      max_tokens: 250,
    });

    const reply = completion.choices[0]?.message?.content || "Could you repeat that? I didn't quite catch it.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
