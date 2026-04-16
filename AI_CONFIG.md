# AI Configuration & Integration

This project supports multiple AI providers for generating project proposals. You can switch between them using environment variables.

## Supported Providers

1.  **OpenAI**: Uses GPT models (e.g., `gpt-4o-mini`).
2.  **Deepseek**: An OpenAI-compatible provider, often more cost-effective.
3.  **Mock**: Returns pre-defined template data. Useful for development and testing without incurring costs.

---

## Environment Variables

Set these variables in your `server/.env` file or your hosting provider's dashboard (e.g., Render).

### 1. Provider Selection
- `AI_PROVIDER`: Set to `openai`, `deepseek`, or `mock` (default is `mock`).

### 2. OpenAI Configuration
- `OPENAI_API_KEY`: Your OpenAI API key.
- `OPENAI_MODEL`: (Optional) Defaults to `gpt-4o-mini`.

### 3. Deepseek Configuration
- `DEEPSEEK_API_KEY`: Your Deepseek API key.
- `DEEPSEEK_MODEL`: (Optional) Defaults to `deepseek-chat`.

---

## Automatic Fallback (Quota/Rate Limit)

The system is designed to be resilient. If the chosen AI provider (OpenAI or Deepseek) returns a **429 Quota/Rate Limit Exceeded** error, the application will:
1.  Log a warning message: `OpenAI quota/rate limit exceeded. Check your OpenAI plan and billing. Shifting to MOCK AI.`.
2.  Automatically fall back to the **Mock** provider for that request.
3.  Return a structured (but generic) response to ensure the user's workflow is not interrupted.

## Mock Behavior

When using the Mock provider (manually or via fallback):
- **Scope of Work**: Generates a set of standard project phases.
- **Deliverables**: Includes common items like "Project Plan" and "Scope Document", and intelligently adds deliverables based on keywords in your requirements (e.g., if you mention "API", it adds "API Endpoints").
- **Timeline**: Generates a realistic multi-week timeline based on the current date.

---

## Troubleshooting

- **Check Logs**: If you notice generic data being returned, check your server logs for the "Shifting to MOCK ai" warning.
- **API Keys**: Ensure your API keys are active and have sufficient balance.
- **Render Ephemeral Storage**: Remember that while AI data is saved to the database, any uploaded files are temporary on Render and may be cleared on restart.
