import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";

const getAIResponse = async (messages) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.8,
  });

  return completion.choices[0].message.content?.trim() ?? "";
};


export { getAIResponse };