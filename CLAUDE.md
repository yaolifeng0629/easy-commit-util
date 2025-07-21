# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**easy-commit-util** is a Node.js CLI tool that automates git commits with conventional commit format validation. It's designed to streamline the git workflow by enforcing commit message standards and handling the entire commit-push process automatically.

## Key Architecture

- **Single-file CLI**: All functionality is contained in `index.js` with ES6 modules
- **Git workflow automation**: Handles `git add .`, `git commit -m`, and `git push` in sequence
- **Conventional commits**: Enforces Angular-style commit messages via regex validation
- **Interactive prompts**: Uses Node.js readline for user input
- **Visual guides**: Boxen/chalk for formatted terminal output with Chinese/English support

## Development Commands

```bash
# Install dependencies
pnpm install

# Run the CLI locally
node index.js

# Global installation for testing
pnpm install -g .

# Start the tool
npm start

# Current test command (placeholder)
npm test
```

## Core Components

- **Commit Validation**: Regex pattern at `index.js:114` validates against 16 commit types
- **Git Operations**: Sync exec calls for git commands (add, commit, push)
- **Repository Detection**: Async git validation with proper error handling
- **Change Detection**: Multi-stage git status checking for uncommitted changes

## Design Patterns

- **Synchronous git operations** for simplicity in core workflow
- **Promise-based async** for repository detection
- **Centralized validation** with immediate exit on failure
- **Terminal-first UI** with color-coded feedback

## Supported Commit Types

feat, fix, docs, dx, style, refactor, perf, test, workflow, build, ci, chore, types, wip, release, revert

## Key Files

- `index.js`: Main CLI entry point with all functionality
- `package.json`: Node.js configuration with binary declaration
- `README.md`: Documentation in English/Chinese