import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Tool definitions — this is how we get Claude to return structured data
// instead of just free text, so we can actually save it to the database.
const tools = [
  {
    name: "log_meal",
    description: "Log food the user says they ate. Estimate quantity directly in grams using your own knowledge of typical portion sizes.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              food: { type: "string", description: "Simple food name, good for searching a nutrition database, e.g. 'chicken breast' not 'grilled chicken breast with herbs'" },
              quantity_g: { type: "number", description: "Estimated quantity in grams" },
            },
            required: ["food", "quantity_g"],
          },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "log_workout",
    description: "Log exercise the user says they did.",
    input_schema: {
      type: "object",
      properties: {
        exercise: { type: "string", description: "Exercise name, matching common naming e.g. 'Running', 'Bench Press'" },
        duration_min: { type: "number" },
        sets: { type: "number" },
        reps: { type: "number" },
        weight_kg: { type: "number" },
      },
      required: ["exercise"],
    },
  },
];

// Step 1: Ask Haiku (cheap, fast) to read the message and decide whether
// it contains something to log. Returns any tool calls it made, plus
// whether it made any at all.
export async function parseUserMessage(message) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: "The user's message may describe multiple separate things to log — for example, both a meal AND a workout in the same message. Check for each type independently, and call every matching tool (log_meal, log_workout) that applies, not just the first one you notice.",
      tools,
      messages: [{ role: "user", content: message }],
    });
  
    const toolCalls = response.content.filter((block) => block.type === "tool_use");
    return toolCalls;
  }

// Step 2: Ask Sonnet (better reasoning) to write the actual coach reply,
// given the user's recent history and whatever was just logged.
export async function generateCoachReply({ userMessage, recentContext, justLogged }) {
  const systemPrompt = `You are a supportive, knowledgeable fitness and nutrition coach inside a personal tracking app.
You have access to the user's recent workout and meal history below. Use it to give genuinely useful,
personalized responses — noticing patterns, encouraging consistency, and gently flagging things worth
adjusting. Keep replies conversational and fairly brief (2-4 sentences typically), like a real coach texting
back, not a clinical report. Avoid being preachy or giving medical advice — if something seems like a medical
concern, suggest they mention it to a doctor.

Recent history (last 7 days):
${recentContext}

${justLogged ? `Just logged from this message: ${JSON.stringify(justLogged)}` : ""}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  return response.content.find((block) => block.type === "text")?.text || "";
}