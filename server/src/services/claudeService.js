import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools = [
  {
    name: "log_meal",
    description: "Log food the user says they ate, or that's visible in a photo. Estimate quantity directly in grams using your own knowledge of typical portion sizes.",
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

// Step 1: ask Haiku to read the message and decide whether it contains
// something to log. Returns any tool calls it made.
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

// Handles any photo sent in chat — the model itself decides whether it's
// a meal photo (logs it via log_meal) or a body/progress photo (gives
// coaching observations instead, no tool call).
export async function parsePhotoMessage(imageBase64, mediaType, caption, recentContext) {
  const systemPrompt = `You are a supportive fitness coach reviewing a photo the user sent.

First, determine what kind of photo this is:
- If it shows FOOD: call the log_meal tool with your best estimate of each food item and its quantity in grams based on typical portions and what's visible. Do not write a text reply yourself for this case — the app will generate a response after logging.
- If it shows a PERSON'S BODY (a progress/physique photo): do NOT call any tool. Instead, respond directly with general, encouraging observations about visible posture, areas of visible muscle development, and practical training suggestions.
  - Do NOT estimate body fat percentage, weight, or any precise numeric body measurement from the photo — these aren't reliably estimable from an image and would be misleading. If asked directly, explain this honestly and suggest calipers, a DEXA scan, or a doctor/trainer instead.
  - Do NOT comment on appearance/attractiveness, and avoid anything that could read as body-shaming or critical.
  - Do NOT suggest extreme calorie restriction, excessive exercise, or rapid body-change approaches.
  - Keep the tone like a real coach: encouraging, practical, specific to what's visible.
- If it's neither (unclear photo), say so honestly and ask the user to clarify or resend.

User's recent training/nutrition context:
${recentContext}`;

  const content = [
    { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
    { type: "text", text: caption || "Here's a photo." },
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: systemPrompt,
    tools: [tools[0]],
    messages: [{ role: "user", content }],
  });

  const toolCalls = response.content.filter((block) => block.type === "tool_use");
  const textReply = response.content.find((block) => block.type === "text")?.text || "";

  return { toolCalls, textReply };
}

// Step 2: ask Sonnet to write the actual coach reply, given the user's
// recent history and whatever was just logged.
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