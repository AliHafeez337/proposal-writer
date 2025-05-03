const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

/**
 * Analyzes project documentation and generates a structured scope of work and deliverables
 * using OpenAI's chat completion API.
 * 
 * @param {string} description - The project documentation to be analyzed
 * @param {string} userRequirements - Additional user requirements for the project
 * @returns {Object} An object containing the scope of work and a list of deliverables
 */
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

  // Send the prompt to OpenAI
  const response = await openai.chat.completions.create({ // Using chat completion endpoint
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

// Analyze scope and deliverables with feedback
/**
 * Regenerates the scope of work and deliverables based on existing project details and user feedback.
 * 
 * @param {string} scopeOfWork - The current scope of work for the project
 * @param {Array} deliverables - The existing list of project deliverables
 * @param {string} userRequirements - Additional requirements from the user
 * @param {string} userFeeback - Feedback provided by the user to refine the project scope
 * @returns {Object} An updated JSON object containing refined scope of work and deliverables
 */
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

  // Send the prompt to OpenAI
  const response = await openai.chat.completions.create({ // Using chat completion endpoint
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

// Last pass - Full proposal generation
/**
 * Generates a full project proposal by analyzing the scope of work, deliverables, user requirements, and feedback.
 * 
 * @param {string} scopeOfWork - The overall scope of the project
 * @param {Array} deliverables - List of project deliverables
 * @param {string} userRequirements - Specific requirements from the user
 * @param {string} userFeeback - Any additional user feedback
 * @returns {Object} A comprehensive project proposal containing:
 *  - executiveSummary: A high-level overview of the project
 *  - requirements: Key technical and business requirements
 *  - workBreakdown: Detailed tasks with durations in days
 *  - timeline: Project phases with start and end dates
 */
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

  // Send the prompt to OpenAI
  const response = await openai.chat.completions.create({ // Using chat completion endpoint
    model: "gpt-3.5-turbo-1106",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { analyzeScopeAndDeliverables, analyzeScopeAndDeliverablesWithFeedback, generateFullProposal };