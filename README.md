# GoDoc MCP Server

🤖 **AI-powered Go documentation** that understands your code and fetches exactly what you need.

Instead of manually searching `go doc`, this tool analyzes your Go files and automatically retrieves relevant documentation for the packages you're actually using.

## 🚀 Setup (2 minutes)

### 1. Add to Claude Code

Go to **Settings → MCP Servers** and add:

```json
{
  "name": "godoc-mcp",
  "command": "npx",
  "args": ["-y", "godoc-mcp"],
  "env": {
    "OPENROUTER_API_KEY": "your-key-here"
  }
}
```

### 2. Get API Key

- Sign up at [openrouter.ai](https://openrouter.ai)
- Add $5-10 credits
- Create an API key at [openrouter.ai/keys](https://openrouter.ai/keys)
- Replace `your-key-here` above

### 3. Restart Claude Code

Done! Now ask Claude to analyze any Go file and it will automatically fetch documentation.

## ⚡ Why Use This?

**Before:** Manually run `go doc github.com/gorilla/mux.Router`, `go doc go.uber.org/zap.Logger`, etc.

**After:** Just ask *"What do these packages do?"* and get comprehensive docs automatically.

### Smart Features

- 🧠 **AI analyzes your code** to determine what docs you need
- 🎯 **Context-aware** - only fetches relevant documentation  
- ⚡ **Fast** - uses optimized models for quick responses
- 🔍 **External focus** - prioritizes third-party packages over stdlib
- 📦 **No installation** - uses `npx` to always get latest version

## 💡 Example

```go
package main

import (
    "github.com/gorilla/mux"
    "go.uber.org/zap"
)

func main() {
    r := mux.NewRouter()
    logger := zap.NewProduction()
    // ...
}
```

Ask Claude: *"What do these packages do?"*

**Result:** Automatically gets documentation for `mux.Router`, `zap.NewProduction`, and other relevant functions without you having to know what to search for.

---

## 🔧 Advanced

**Different Models:** Change `inception/mercury-coder` to `anthropic/claude-3-haiku` or `openai/gpt-3.5-turbo` in the tool parameters.

**Local Development:** Clone repo → `npm install` → `npm run build`

---

**License:** MIT | **Issues:** [GitHub](https://github.com/herlon214/godoc-mcp/issues)