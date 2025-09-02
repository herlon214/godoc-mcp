# GoDoc MCP Server

An intelligent AI-powered Model Context Protocol (MCP) server that revolutionizes how you access Go documentation. Instead of manually searching through docs, this server analyzes your Go code and automatically fetches the most relevant documentation using AI.

## 🚀 What Makes This Different

Traditional documentation tools require you to know exactly what to search for. **GoDoc MCP Server** is smarter:

- **🧠 AI-Powered Analysis**: Analyzes your Go source code to understand what documentation would be most helpful
- **🎯 Context-Aware**: Intelligently determines which packages, types, and methods are relevant to your current work
- **⚡ High-Performance**: Uses the `inception/mercury-coder` model for optimal token throughput and fast responses
- **🔍 Smart Filtering**: Focuses on external dependencies and avoids standard library noise
- **🔄 Automatic Execution**: Generates and runs the right `go doc` commands for you

Instead of manually running `go doc package.Type` commands, just point it at your Go file and get comprehensive, contextual documentation automatically.

## 🌟 Features

- **Intelligent Documentation Retrieval**: AI analyzes your code and determines what documentation to fetch
- **External Package Focus**: Prioritizes third-party dependencies over standard library packages  
- **Batch Processing**: Executes multiple `go doc` commands and aggregates results
- **Project Context Awareness**: Works within your Go module structure (`go.mod`)
- **Error Handling**: Gracefully handles missing documentation and provides useful error messages
- **Customizable Models**: Support for different AI models via OpenRouter API

## 📦 Installation

### Prerequisites

- **Go** 1.19+ (for `go doc` command)
- An [OpenRouter](https://openrouter.ai) API key

### Quick Setup with npx (Recommended)

No installation required! Just use `npx` to run the latest version automatically.

## 🔑 OpenRouter Configuration

This project uses [OpenRouter](https://openrouter.ai) as the AI provider, which gives you access to multiple AI models through a unified API.

### What is OpenRouter?

OpenRouter is a unified API that provides access to various AI models including:
- GPT-4 and GPT-3.5 from OpenAI
- Claude models from Anthropic  
- Open-source models like Llama, Mixtral, and more
- Specialized coding models optimized for development tasks

### Getting Your API Key

1. **Sign up**: Visit [openrouter.ai](https://openrouter.ai) and create an account
2. **Add credits**: Add some credits to your account (typically $5-10 is plenty to start)
3. **Generate key**: Go to the [Keys](https://openrouter.ai/keys) page and create a new API key
4. **Set environment**: Add your key to the environment variable `OPENROUTER_API_KEY`

### Default Model: inception/mercury-coder

This project defaults to `inception/mercury-coder` because:

- **High Token Throughput**: Optimized for fast processing of large code contexts
- **Cost Effective**: Great balance between performance and pricing  
- **Code-Specialized**: Trained specifically for understanding and working with code
- **Reliable**: Consistent performance for documentation generation tasks

### Using Different Models

You can specify a different model when using the tool:

```json
{
  "filePath": "/path/to/your/file.go",
  "rootPath": "/path/to/your/go/project", 
  "model": "anthropic/claude-3-haiku"
}
```

Popular alternatives:
- `anthropic/claude-3-haiku` - Fast and economical
- `openai/gpt-3.5-turbo` - Well-rounded performance
- `meta-llama/codellama-34b-instruct` - Open-source alternative

## 🔧 Claude Code Integration

To use this MCP server with [Claude Code](https://claude.ai/code), you need to add it to your Claude Code configuration.

### Step 1: Add to MCP Settings

1. **Open Claude Code Settings**: In Claude Code, go to Settings → MCP Servers
2. **Add New Server**: Click "Add Server" and fill in the details:

```json
{
  "name": "godoc-mcp",
  "command": "npx",
  "args": ["-y", "godoc-mcp"],
  "env": {
    "OPENROUTER_API_KEY": "your-api-key-here"
  }
}
```

### Step 2: Get Your OpenRouter API Key

1. Visit [openrouter.ai](https://openrouter.ai) and create an account
2. Add credits to your account ($5-10 is plenty to start)
3. Go to [Keys](https://openrouter.ai/keys) and create an API key
4. Replace `your-api-key-here` with your actual API key

### Step 3: Restart Claude Code

After adding the server, restart Claude Code to load the new MCP server.

### Step 4: Verify Installation

You should see the "GoDoc Search" tool available when working with Go files. You can verify by:

1. Opening a Go project in Claude Code
2. Asking Claude to analyze a Go file's documentation  
3. Claude should automatically use the godoc tool to fetch relevant documentation

## 💡 Usage Examples

Once integrated with Claude Code, the tool works automatically when you're working with Go files. Here are some scenarios where it shines:

### Scenario 1: Understanding Third-Party Dependencies

When you're working with a Go file that imports external packages:

```go
package main

import (
    "github.com/gorilla/mux"
    "github.com/prometheus/client_golang/prometheus"
    "go.uber.org/zap"
)

func main() {
    r := mux.NewRouter()
    logger := zap.NewProduction()
    counter := prometheus.NewCounter(prometheus.CounterOpts{})
    // ... rest of your code
}
```

Just ask Claude: *"Can you help me understand what these packages do and show me their documentation?"*

The GoDoc MCP Server will automatically:
1. Analyze your code to identify key types and functions
2. Generate relevant `go doc` commands like:
   - `go doc github.com/gorilla/mux.Router`
   - `go doc go.uber.org/zap.NewProduction`
   - `go doc github.com/prometheus/client_golang/prometheus.Counter`
3. Execute these commands and return comprehensive documentation

### Scenario 2: Learning New APIs

When exploring unfamiliar codebases or trying to understand how specific functions work:

```go
func setupTracing(serviceName string) {
    tp := trace.NewTracerProvider(
        trace.WithBatcher(jaeger.NewExporter(jaeger.WithCollectorEndpoint())),
        trace.WithResource(resource.NewWithAttributes(
            semconv.ServiceNameKey.String(serviceName),
        )),
    )
    otel.SetTracerProvider(tp)
}
```

Ask Claude: *"Explain how this tracing setup works"* and get detailed documentation about each component automatically.

## 🔍 How It Works

### The AI Analysis Process

1. **Code Parsing**: The AI analyzes your Go source code to understand imports, types, functions, and their relationships

2. **Smart Command Generation**: Instead of generic documentation, it generates targeted `go doc` commands for:
   - External package types you're actually using
   - Methods being called on specific types  
   - Functions with complex signatures
   - Key interfaces and their implementations

3. **Intelligent Filtering**: The AI prompt specifically instructs to:
   - Focus on external dependencies (not standard library)
   - Prioritize code elements that provide context
   - Avoid redundant or obvious documentation

4. **Batch Execution**: All generated commands are executed in your project's context using `go doc -C /your/project/path`

### Technical Architecture

- **MCP Protocol**: Uses the Model Context Protocol for seamless integration with Claude Code
- **OpenRouter Integration**: Leverages OpenRouter's API for high-performance AI analysis
- **Go Module Awareness**: Respects your project's `go.mod` and executes commands in the correct context
- **Error Resilience**: Handles missing documentation gracefully and continues processing other commands

### Tool Parameters

The `godoc` tool accepts these parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | ✅ | Path to the Go file to analyze |
| `rootPath` | string | ✅ | Root path of Go project (where `go.mod` is) |
| `model` | string | ❌ | AI model to use (default: `inception/mercury-coder`) |

### Example Output

When you use the tool, you get structured documentation like:

```
=== go doc -C /your/project github.com/gorilla/mux.Router ===
type Router struct {
    // Has unexported fields.
}
Router registers routes to be matched and dispatches a handler.
...

=== go doc -C /your/project go.uber.org/zap.NewProduction ===  
func NewProduction(options ...Option) (*Logger, error)
NewProduction builds a sensible production Logger that writes InfoLevel and
above logs to standard error as JSON.
...
```

## 🚀 Contributing

Contributions are welcome! Here's how you can help:

### Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Make your changes** in the `src/` directory
4. **Build and test**: `npm run build && npm start`
5. **Submit a pull request**

### Ideas for Contributions

- **Model Support**: Add support for more AI models
- **Documentation Formats**: Support for different output formats (JSON, Markdown, etc.)
- **Caching**: Add intelligent caching to reduce API calls
- **Configuration**: More customizable prompt templates
- **Language Support**: Extend to other languages beyond Go

### Reporting Issues

If you encounter any issues:

1. Check if the issue already exists
2. Provide your Go version, Node.js version, and OS
3. Include example code that reproduces the issue
4. Share relevant error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for providing unified access to AI models
- **Model Context Protocol** for enabling seamless tool integration
- **Go team** for the excellent `go doc` tool
- **Claude Code** for making AI-powered development accessible

---

**Happy coding!** 🎉 If this tool helps you understand Go documentation better, consider giving it a ⭐ on GitHub.