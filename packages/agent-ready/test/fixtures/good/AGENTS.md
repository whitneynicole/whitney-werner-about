# Agent guide: sample service

A tiny Node HTTP service used as a test fixture for agent-ready.

## Commands
- Install: `npm install`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## Conventions
- ES modules only. Keep files small and focused.
- Configuration comes from environment variables; see `.env.example`.
- Never commit secrets. Every change ships with a test.
