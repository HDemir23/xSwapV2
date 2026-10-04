# Contributing to xSwap

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

## Project Structure

- `frontend/` - Next.js frontend
- `backend/` - Express API
- `shared/` - Shared types and constants
- `bot-skills/` - Bot integration code

## Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Keep components small and focused
- Write tests for new features

## Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Run tests and lint
4. Submit PR with description

## Testing

```bash
npm run test           # Run all tests
npm run test:frontend  # Frontend only
npm run test:backend   # Backend only
```
