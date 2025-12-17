# Apify code sandbox

Isolated sandbox for running AI coding operations in a containerized environment. 🚀

## Use cases

- **🔒 Execute untrusted code safely:** Run potentially unsafe code in an isolated container with controlled resources and security boundaries
- **🤖 AI agent development:** Provide isolated and managed development environments where AI agents can code, test, and execute operations securely
- **📦 Sandboxed operations:** Execute system commands, file operations, and custom scripts in a contained environment

## How to run

### Start the Actor

1. Run it on the Apify platform through the [Console](https://console.apify.com/)
2. Check the Actor run log console for connection details (host, port, MCP endpoint URL)

### Connect to the sandbox

Once the Actor is running, you can interact with it in three ways:

#### MCP Client

Use a Model Context Protocol (MCP) client to interact with this sandbox. See [modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)

**Connect with Claude code:**

```bash
claude mcp add --transport http sandbox https://YOUR-RUN-ID.runs.apify.net/mcp
```

Replace `YOUR-RUN-ID` with the actual run ID from your Actor execution (found in the logs).

#### Apify SDK

Connect programmatically using the Apify SDK for direct integration. ⚠️ **Work in progress** - SDK integration is currently being built.

#### REST API

Access the sandbox directly via REST API endpoints. The complete list of available endpoints and their required arguments are documented in the Actor run logs.

## Configuration

- **Memory & timeout:** Configure run options to set memory allocation and execution timeout
- **Check logs:** Open the Actor run log console to view connection details and operation output

## Sandbox Environment Structure

The sandbox provides isolated execution environments for different code languages:

### Code Execution Directories

- **Python**: `/sandbox/py`
    - Python code executes in this isolated directory
    - Has access to Python virtual environment at `/sandbox/venv`
    - All pip packages installed in the venv

- **JavaScript/TypeScript**: `/sandbox/js-ts`
    - JS/TS code executes in this isolated directory
    - Has access to node_modules at `/sandbox/node_modules`
    - All npm packages installed in node_modules

- **General Commands**: `/sandbox` (root)
    - Shell commands via `/exec` endpoint run from sandbox root
    - Can access all subdirectories

### Dependency Installation

Specify dependencies to install via Actor input:

- **Node.js Dependencies**: npm packages for JS/TS code execution in native npm format
    - Input as a JSON object: `{"package-name": "version", ...}`
    - Example: `{"zod": "^3.0", "axios": "latest", "lodash": "4.17.21"}`
- **Python Requirements**: pip packages for Python code execution in requirements.txt format
    - Input as multi-line text: one package per line with optional version specifiers
    - Example:
        ```
        requests==2.31.0
        pandas>=2.0.0
        numpy
        ```

Dependencies are installed during Actor startup before any code execution, allowing your code to immediately use them.

### Customization with Init Script

Provide a bash script via the "Initialization Script" input to customize the sandbox:

- Runs **after** library installation
- Executes in `/sandbox` directory
- Can install system packages, create directories, set permissions, etc.
- Errors are logged but don't prevent Actor from starting

**Example init scripts:**

```bash
# Install system package
apt-get update && apt-get install -y curl

# Create custom directory with permissions
mkdir -p /sandbox/custom-data && chmod 755 /sandbox/custom-data
```

## Learn more

- [Apify Actor documentation](https://docs.apify.com/platform/actors)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Apify SDK reference](https://docs.apify.com/sdk)
