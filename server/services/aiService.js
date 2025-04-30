const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const analyzeScopeAndDeliverables = async (description, requirements) => {
  const prompt = `
    Analyze this project documentation and generate:
    1. Scope of Work (bullet points)
    2. Deliverables - MUST include:
      - item: string
      - unit: string
      - count: NUMBER (no text, only digits)
      - description: string
    
    Example:
    "deliverables": [
      {
        "item": "Web Pages",
        "unit": "pages",
        "count": 5,  // MUST BE A NUMBER
        "description": "Responsive landing pages"
      }
    ]

    Return JSON with this structure:
    {
      "scopeOfWork": string,
      "deliverables": [{
        "item": string,
        "unit": string,
        "count": number,
        "description": string
      }]
    }
    
    Project Documentation:
    ${description}

    My Requirements:
    ${requirements}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

// Second pass - Full proposal generation
const generateFullProposal = async (scopeOfWork, deliverables, requirements) => {
  const prompt = `
    Analyze this project documentation and generate:
    1. Executive Summary (1 paragraph)
    2. Key Requirements (technical/business)
    3. Work Breakdown Structure - tasks with durations IN DAYS (not weeks)
    4. Timeline (phases with start/end dates)
    
    Example:
    "workBreakdown": [
      {
        "task": "UI Development",
        "duration": 14, // MUST BE NUMBER OF DAYS
        "dependencies": []
      }
    ]

    Return JSON with this structure:
    {
      "executiveSummary": "...",
      "requirements": ["..."],
      "workBreakdown": [...],
      "timeline": [...]
    }
    
    Scope of Work:
    ${scopeOfWork}

    Deliverables:
    ${deliverables}

    My Requirements:
    ${requirements}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { analyzeScopeAndDeliverables, generateFullProposal };