# 🧪 Apify AI Sandbox

A suite of Apify Actors providing secure, containerized environments for AI coding agents.

[![Apify Actors](https://img.shields.io/badge/Apify-Actors-blue)](https://apify.com)
[![Node.js 24](https://img.shields.io/badge/Node.js-24-green)](https://nodejs.org)
[![Python 3](https://img.shields.io/badge/Python-3-blue)](https://python.org)

## Overview

This monorepo contains four Apify Actors designed for AI-powered coding workflows:

| Actor | Description | Use Case |
|-------|-------------|----------|
| **[AI Sandbox](./sandbox)** | Core containerized environment with REST API, MCP server, and interactive shell | General AI agent development, sandboxed code execution |
| **[Claude Code](./claude-code)** | One-click access to Anthropic's Claude Code | Instant Claude Code sessions on Apify |
| **[OpenCode](./opencode)** | One-click access to open-source OpenCode | Free/open-source AI coding with multiple AI models support |
| **[OpenClaw](./openclaw)** | Clears your inbox, sends emails, manages your calendar, checks you in for flights | All from Apify platform |

## Architecture

The **AI Sandbox** is the core Actor that provides the full execution environment:

- Debian Trixie container with Node.js 24 and Python 3
- RESTful filesystem API for file operations
- MCP (Model Context Protocol) server for AI agent integration
- Interactive browser-based terminal (ttyd)
- Dependency management for npm and pip packages

The **Claude Code** and **OpenCode** Actors are lightweight proxies that [metamorph](https://docs.apify.com/platform/actors/development/programming-interface/metamorph) into the AI Sandbox, automatically launching their respective CLI tools in the terminal.

## Quick Start

### Use on Apify Platform

1. **AI Sandbox**: [Run on Apify](https://apify.com/apify/ai-sandbox) - Full sandbox with API access
2. **Claude Code**: [Run on Apify](https://apify.com/apify/claude-code) - Auto-opens Claude Code CLI
3. **OpenCode**: [Run on Apify](https://apify.com/apify/opencode) - Auto-opens OpenCode CLI

### Connect to a Running Sandbox

Once running, connect via:

- **MCP Client**: `https://<RUN-ID>.runs.apify.net/mcp`
- **REST API**: `POST /exec`, `GET/PUT/DELETE /fs/*`
- **Interactive Shell**: `https://<RUN-ID>.runs.apify.net/shell/`

## Features

- **🔒 Secure Isolation**: Execute untrusted code safely in containerized environments
- **🤖 AI Agent Ready**: MCP server with tools for file operations and code execution
- **📦 Multi-Language**: JavaScript, TypeScript, Python, and shell command support
- **🖥️ Interactive Shell**: Browser-based terminal for real-time debugging
- **🔗 Actor Orchestration**: Agents can use the Apify token to run other Actors
- **📂 Filesystem API**: RESTful endpoints for file upload, download, and management
- **🔀 Dynamic Proxy**: Expose local services running in the container to external paths
- **⚡ Auto-Shutdown**: Configurable idle timeout for cost efficiency

## Repository Structure

```
├── sandbox/                 # Core AI Sandbox Actor
│   ├── src/                 # Express server, MCP, file operations
│   ├── artifacts/           # Configuration files (AGENTS.md, opencode.json)
│   └── README.md            # Full API documentation
│
├── claude-code/             # Claude Code proxy Actor
│   ├── src/main.ts          # Metamorph into sandbox
│   └── README.md            # Claude Code specific docs
│
├── opencode/                # OpenCode proxy Actor
│   ├── src/main.ts          # Metamorph into sandbox
│   └── README.md            # OpenCode specific docs
│
└── openclaw/                # OpenClaw proxy Actor
    ├── src/main.ts          # Metamorph into sandbox with OpenClaw init
    └── README.md            # OpenClaw specific docs
```

## Development

### Prerequisites

- Node.js 24+
- Docker (for local builds)

### Build

```bash
# Build all Actors
cd sandbox && npm install && npm run build
cd ../claude-code && npm install && npm run build
cd ../opencode && npm install && npm run build
cd ../openclaw && npm install && npm run build
```

### Deploy

```bash
# Deploy using Apify CLI
cd sandbox && apify push
cd ../claude-code && apify push
cd ../opencode && apify push
cd ../openclaw && apify push
```

## Documentation

- [AI Sandbox README](./sandbox/README.md) - Full API reference and usage examples
- [Claude Code README](./claude-code/README.md) - Claude Code integration details
- [OpenCode README](./opencode/README.md) - OpenCode integration details
- [OpenClaw README](./openclaw/README.md) - OpenClaw integration details

## Links

- [Apify Platform](https://apify.com)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Code](https://code.claude.com)
- [OpenCode](https://opencode.ai)
- [OpenClaw](https://openclaw.ai/)
