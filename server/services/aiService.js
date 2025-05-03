const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const analyzeScopeAndDeliverables = async (description, userRequirements) => {
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
    ${userRequirements}
  `;

  const response = await openai.chat.completions.create({ // Using chat completion endpoint
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

// Analyze scope and deliverables with feedback
const analyzeScopeAndDeliverablesWithFeedback = async (scopeOfWork, deliverables, userRequirements, userFeeback) => {
  const prompt = `
    Analyze this project scope and deliverables with provided feedback and regenerate:
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
    
    Scope of Work:
    ${scopeOfWork}

    Deliverables:
    ${deliverables}

    My Requirements:
    ${userRequirements}

    My Feedback:
    ${userFeeback}
  `;

  const response = await openai.chat.completions.create({ // Using chat completion endpoint
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

// Last pass - Full proposal generation
const generateFullProposal = async (scopeOfWork, deliverables, userRequirements, userFeeback) => {
  const prompt = `
    Analyze this project scope and deliverables and generate:
    1. Executive Summary (1 paragraph)
    2. Key Requirements (technical/business)
    3. Work Breakdown Structure - tasks with durations IN DAYS (not weeks)
    4. Timeline (phases with start and end dates, must specify dates)
    
    Example:
    "workBreakdown": [
      {
        "task": "UI Development",
        "duration": 14, // MUST BE NUMBER OF DAYS
        "dependencies": []
      }
    ]
    "timeline": [
      {
        "phase": "UI Development",
        "start": "2023-01-01",
        "end": "2023-01-15"
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
    ${userRequirements}

    My Feedback:
    ${userFeeback}
  `;

  const response = await openai.chat.completions.create({ // Using chat completion endpoint
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { analyzeScopeAndDeliverables, analyzeScopeAndDeliverablesWithFeedback, generateFullProposal };