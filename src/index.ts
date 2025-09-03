#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import OpenAI from "openai";
import { readFile, stat } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { dirname, join, resolve } from "path";

const execAsync = promisify(exec);

// Find the root of a Go project by walking up the directory tree to find go.mod
// Returns the root path if found, null if not found
async function findGoModRoot(filePath: string): Promise<string | null> {
  let currentDir = dirname(resolve(filePath));
  const root = resolve('/');

  while (currentDir !== root) {
    try {
      const goModPath = join(currentDir, 'go.mod');
      await stat(goModPath);
      return currentDir;
    } catch (error) {
      // go.mod not found in current directory, move up
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        // Reached the root without finding go.mod
        break;
      }
      currentDir = parentDir;
    }
  }

  // Return null if no go.mod found
  return null;
}

// Create the server
const server = new McpServer({
  name: "godoc-mcp",
  version: "1.0.0",
});

// Initialize OpenAI client
const getClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is required");
  }

  return new OpenAI({
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/herlon214/godoc-mcp",
      "X-Title": "GoDoc MCP",
    },
    apiKey,
    baseURL: "https://openrouter.ai/api/v1"
  });
};

// Register GoDoc tool
server.registerTool(
  "godoc",
  {
    title: "GoDoc Search",
    description: "Uses GoDoc to search for information about Go packages enhanced with AI",
    inputSchema: {
      filePath: z.string().describe("Path to the Go file to analyze"),
      model: z.string()
        .optional()
        .default("inception/mercury-coder")
        .describe("OpenRouter model to use")
    },
  },
  async ({ filePath, model = "inception/mercury-coder" }) => {
    try {
      // Find the root path by looking for go.mod (may be null)
      const rootPath = await findGoModRoot(filePath);

      // Read the Go file
      const fileContent = await readFile(filePath, 'utf-8');

      const client = getClient();

      // Create the prompt for generating go doc commands
      const prompt = `Given the following golang code, tell me things that could be useful for the context using \`go doc <>\`.
Usage of [go] doc:

# Local project
go doc MyFunction      # Function docs
go doc MyType          # Type docs
go doc MyType.MyMethod # Method docs
go doc MyVar           # Variable docs
go doc MyConst         # Constant docs

# External projects (stdlib & dependencies)
go doc fmt.Sprintf                 # Stdlib function
go doc net/http.Client             # Stdlib type
go doc net/http.Client.Do          # Stdlib method
go doc go.opentelemetry.io/otel.SetMeterProvider # Dependency function
go doc go.opentelemetry.io/otel/sdk/trace.TracerProvider # Dependency type
go doc go.opentelemetry.io/otel/sdk/trace.TracerProvider.Shutdown # Dependency method

\`\`\`
${fileContent}
\`\`\`

Just give me the \`go doc\` commands, separated one in each line. Do not say anything else. Avoid golang's standard library.`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }]
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error("No response received from OpenAI API");
      }

      // Parse the go doc commands from the response
      const commands = result.trim().split('\n').filter(cmd => cmd.trim().startsWith('go doc'));

      if (commands.length === 0) {
        return {
          content: [{ type: "text", text: "No go doc commands were generated from the file." }],
        };
      }

      // Execute all go doc commands concurrently
      const docResults = await Promise.all(
        commands.map(async (command) => {
          try {
            // Insert -C flag after "go doc" only if rootPath was found
            const modifiedCommand = rootPath
              ? command.trim().replace('go doc', `go doc -C ${rootPath}`)
              : command.trim();
            const { stdout } = await execAsync(modifiedCommand);
            return `=== ${modifiedCommand} ===\n${stdout}`;
          } catch {
            // Command returned non-zero exit code, skip this result
            return null;
          }
        })
      );

      // Filter out failed commands (null results)
      const successfulResults = docResults.filter(result => result !== null);

      if (successfulResults.length === 0) {
        return {
          content: [{ type: "text", text: "No documentation found for the external packages in this file." }],
        };
      }

      const finalResult = successfulResults.join('\n\n');

      return {
        content: [{ type: "text", text: finalResult }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true
      };
    }
  }
);

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);