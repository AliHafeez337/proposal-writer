require('dotenv').config();

const AI_PROVIDER = (process.env.AI_PROVIDER || 'mock').trim().toLowerCase(); // "openai" | "mock"
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim();

// Default to mock to keep local/dev running without billing surprises.
// Only call OpenAI when explicitly requested via AI_PROVIDER=openai.
const isMock = AI_PROVIDER !== 'openai' || !OPENAI_API_KEY;

function parseBullets(text, { max = 8 } = {}) {
  if (!text) return [];
  const lines = String(text)
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const bullets = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-*•\d.)\s]+/, '').trim();
    if (!cleaned) continue;
    bullets.push(cleaned);
    if (bullets.length >= max) break;
  }
  return bullets;
}

function normalizeDeliverables(deliverables) {
  if (!Array.isArray(deliverables)) return [];
  return deliverables
    .filter(Boolean)
    .map(d => ({
      item: String(d.item || 'Deliverable'),
      unit: String(d.unit || 'item'),
      count: Number.isFinite(Number(d.count)) ? Math.max(1, Math.trunc(Number(d.count))) : 1,
      description: String(d.description || ''),
    }));
}

function mockAnalyzeScopeAndDeliverables(description, userRequirements) {
  const reqBullets = parseBullets(userRequirements, { max: 6 });
  const scopeBullets = [
    'Review uploaded documentation and confirm objectives.',
    'Define functional and non-functional requirements.',
    'Prepare scope of work and delivery plan.',
    ...reqBullets.map(r => `Incorporate requirement: ${r}`),
  ].slice(0, 10);

  const deliverables = normalizeDeliverables([
    { item: 'Scope of Work', unit: 'document', count: 1, description: 'Structured scope of work based on inputs.' },
    { item: 'Deliverables List', unit: 'list', count: 1, description: 'Itemized deliverables with quantities.' },
    { item: 'Project Plan', unit: 'plan', count: 1, description: 'High-level plan and assumptions.' },
  ]);

  // Add a couple deliverables inferred from requirements keywords
  const reqText = (userRequirements || '').toLowerCase();
  if (/\b(ui|ux|frontend|dashboard)\b/.test(reqText)) {
    deliverables.push({ item: 'UI Screens', unit: 'screens', count: 5, description: 'Core screens/wireframes for the frontend.' });
  }
  if (/\b(api|backend|server)\b/.test(reqText)) {
    deliverables.push({ item: 'API Endpoints', unit: 'endpoints', count: 8, description: 'CRUD and supporting endpoints.' });
  }
  if (/\b(auth|login|signup|roles?)\b/.test(reqText)) {
    deliverables.push({ item: 'Authentication', unit: 'module', count: 1, description: 'Login/session and access control.' });
  }

  return {
    scopeOfWork: scopeBullets.map(b => `- ${b}`).join('\n'),
    deliverables: normalizeDeliverables(deliverables),
  };
}

function mockAnalyzeScopeAndDeliverablesWithFeedback(scopeOfWork, deliverables, userRequirements, userFeeback) {
  const feedbackBullets = parseBullets(userFeeback, { max: 6 });
  const baseScopeBullets = parseBullets(scopeOfWork, { max: 12 });
  const mergedScope = [
    ...baseScopeBullets,
    ...feedbackBullets.map(f => `Refine per feedback: ${f}`),
  ].slice(0, 14);

  const updatedDeliverables = normalizeDeliverables(Array.isArray(deliverables) ? deliverables : []);
  if (feedbackBullets.length) {
    updatedDeliverables.push({
      item: 'Revisions',
      unit: 'rounds',
      count: 1,
      description: 'One revision round applied based on provided feedback.',
    });
  }

  return {
    scopeOfWork: mergedScope.map(b => `- ${b}`).join('\n') || '- Refined scope of work based on feedback.',
    deliverables: normalizeDeliverables(updatedDeliverables.length ? updatedDeliverables : mockAnalyzeScopeAndDeliverables('', userRequirements).deliverables),
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mockGenerateFullProposal(scopeOfWork, deliverables, userRequirements, userFeeback) {
  const reqBullets = parseBullets(userRequirements, { max: 8 });
  const requirements = reqBullets.length ? reqBullets : [
    'Confirm goals, stakeholders, and success criteria.',
    'Deliver working features aligned with the scope.',
    'Provide documentation and handover.',
  ];

  const workBreakdown = [
    { task: 'Discovery & Requirements', duration: 3, dependencies: [] },
    { task: 'Solution Design', duration: 2, dependencies: ['Discovery & Requirements'] },
    { task: 'Implementation', duration: 10, dependencies: ['Solution Design'] },
    { task: 'Testing & Fixes', duration: 4, dependencies: ['Implementation'] },
    { task: 'Handover', duration: 1, dependencies: ['Testing & Fixes'] },
  ];

  const start = new Date();
  const phases = [
    { phase: 'Discovery & Design', days: 5, tasks: ['Discovery & Requirements', 'Solution Design'] },
    { phase: 'Build', days: 10, tasks: ['Implementation'] },
    { phase: 'QA & Handover', days: 5, tasks: ['Testing & Fixes', 'Handover'] },
  ];
  let cursor = start;
  const timeline = phases.map(p => {
    const phaseStart = cursor;
    const phaseEnd = addDays(phaseStart, p.days);
    cursor = phaseEnd;
    return {
      phase: p.phase,
      start: toISODate(phaseStart),
      end: toISODate(phaseEnd),
      tasks: p.tasks,
      milestones: [
        { name: `${p.phase} complete`, percentage: 100, dueDate: toISODate(phaseEnd) },
      ],
    };
  });

  const executiveSummary = [
    'This proposal outlines a practical plan to deliver the requested solution based on the uploaded documentation and your requirements.',
    'It defines the scope of work, deliverables, implementation approach, and a realistic timeline for execution.',
    userFeeback ? 'Feedback has been incorporated to refine scope and priorities.' : null,
  ].filter(Boolean).join(' ');

  return {
    executiveSummary,
    requirements,
    workBreakdown,
    timeline,
  };
}

function getOpenAIClient() {
  const OpenAI = require('openai');
  // openai@4 expects { apiKey }
  return new OpenAI({ apiKey: OPENAI_API_KEY });
}

/**
 * Analyzes project documentation and generates a structured scope of work and deliverables
 * using OpenAI's chat completion API.
 * 
 * @param {string} description - The project documentation to be analyzed
 * @param {string} userRequirements - Additional user requirements for the project
 * @returns {Object} An object containing the scope of work and a list of deliverables
 */
const analyzeScopeAndDeliverables = async (description, userRequirements) => {
  if (isMock) {
    return mockAnalyzeScopeAndDeliverables(description, userRequirements);
  }

  const openai = getOpenAIClient();
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
    model: OPENAI_MODEL,
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
  if (isMock) {
    return mockAnalyzeScopeAndDeliverablesWithFeedback(scopeOfWork, deliverables, userRequirements, userFeeback);
  }

  const openai = getOpenAIClient();
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
    model: OPENAI_MODEL,
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
  if (isMock) {
    return mockGenerateFullProposal(scopeOfWork, deliverables, userRequirements, userFeeback);
  }

  const openai = getOpenAIClient();
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
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { analyzeScopeAndDeliverables, analyzeScopeAndDeliverablesWithFeedback, generateFullProposal };