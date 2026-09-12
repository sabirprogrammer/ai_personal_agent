# Alyla AI Assistant

A Next.js and TypeScript project exploring AI-assisted productivity workflows, dashboards, scheduled tasks, authentication, and external-service integrations.

## Project Status

This is an active portfolio project. Features that require third-party credentials or services should be configured locally through environment variables and verified before production use.

## Technology Stack

Next.js, React, TypeScript, Tailwind CSS, Google GenAI, InsForge, Trigger.dev, and Baileys.

## Getting Started

```bash
git clone https://github.com/sabirprogrammer/ai_personal_agent.git
cd ai_personal_agent
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

Create a local environment file based on the variables required by the application. Keep all API keys, OAuth credentials, database keys, and passwords private. Never commit them to GitHub.

## Project Structure

```text
app/          Next.js routes and pages
components/   Reusable UI components
db/           Database-related code
lib/           Application utilities and integrations
trigger/      Background task definitions
public/       Static assets
```

## Key Areas

- AI-assisted chat and summaries
- Productivity dashboards
- Scheduling and background-workflow experiments
- Authentication and user-focused application flows
- External integration prototypes

## Demo

Add verified screenshots to `docs/screenshots/` and add a live demo link once deployed.

## Future Improvements

- Add automated tests
- Add a public demo environment with mock data
- Document integration setup per provider
- Add deployment and security verification notes

## Contributing

Open an issue before significant changes, create a focused branch, and submit a clear pull request.

## License

No license file is currently included. Add a license before reuse or distribution.
