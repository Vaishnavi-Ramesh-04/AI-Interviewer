import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const FALLBACK_MODELS = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing GROQ_API_KEY. Add it to your environment and restart Next.js." },
        { status: 503 }
      );
    }

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

    const filteredMessages: ChatMessage[] = messages
      .filter((m: any) => m && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role === "assistant" || m.role === "system" ? m.role : "user",
        content: String(m.content).trim().slice(0, 4000),
      }))
      .filter((m: ChatMessage) => m.content.length > 0);

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...filteredMessages,
    ];

    if (chatMessages.length <= 1) {
      return NextResponse.json({ error: "No valid user message was provided." }, { status: 400 });
    }

    const groq = new Groq({ apiKey });

    const configuredModel = process.env.GROQ_MODEL?.trim();
    const modelCandidates = [configuredModel, ...FALLBACK_MODELS].filter(
      (m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i
    );

    let completion: any;
    let lastError: any;

    for (const model of modelCandidates) {
      try {
        completion = await groq.chat.completions.create({
          messages: chatMessages,
          model,
          temperature: 0.7,
          max_tokens: 250,
        });
        break;
      } catch (err: any) {
        lastError = err;
        const code = String(err?.code || err?.error?.code || "").toLowerCase();
        const msg = String(err?.message || err?.error?.message || "").toLowerCase();
        const isDecommissioned = code.includes("decommissioned") || msg.includes("decommissioned");
        if (!isDecommissioned) {
          throw err;
        }
      }
    }

    if (!completion) {
      throw lastError || new Error("No available Groq model succeeded.");
    }

    const reply = completion.choices[0]?.message?.content || "Could you repeat that? I didn't quite catch it.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Groq API Error:", error);

    const status = Number(error?.status) || Number(error?.code) || 500;
    const isClientConfigIssue = status === 400 || status === 401 || status === 403 || status === 404 || status === 429;
    const message = isClientConfigIssue
      ? String(error?.message || "Groq request failed.")
      : "Failed to generate AI response.";

    return NextResponse.json({ error: message }, { status: isClientConfigIssue ? status : 500 });
  }
}
