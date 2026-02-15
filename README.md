# @tradekix/mcp-server 📊

Financial market data for Claude, Cursor, Windsurf, and any MCP-compatible AI tool.

Powered by [TradeKix](https://www.tradekix.ai) — market data built for AI agents.

## Quick Start

### 1. Get a free API key (100 calls/day)

```bash
curl -X POST https://tradekix-alpha.vercel.app/api/v1/connect \
  -H "Content-Type: application/json" \
  -d '{"agent_name": "MyClaude", "email": "you@example.com", "source": "mcp"}'
```

### 2. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%/Claude/claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "tradekix": {
      "command": "npx",
      "args": ["-y", "@tradekix/mcp-server"],
      "env": {
        "TRADEKIX_API_KEY": "tk_live_your_key_here"
      }
    }
  }
}
```

### 3. Ask Claude about markets

- "What's the market overview today?"
- "Show me AAPL price history for the last month"
- "Any congressional trades in NVDA recently?"
- "What's the social sentiment on Tesla?"
- "What economic events are coming up this week?"

## Available Tools

| Tool | Description |
|------|-------------|
| `tradekix_market_overview` | Full market snapshot — indices, forex, events, alerts, news |
| `tradekix_prices` | Stock & crypto prices (historical + current) |
| `tradekix_indices` | Major market indices by region/country |
| `tradekix_forex` | Forex exchange rates |
| `tradekix_earnings` | Earnings calendar |
| `tradekix_economic_events` | Economic events (FOMC, CPI, jobs) |
| `tradekix_congressional_trades` | Congressional stock trades with conflict detection |
| `tradekix_sentiment` | Social media sentiment |
| `tradekix_tweets` | Curated financial tweets |
| `tradekix_news` | AI-curated financial news |

## Works With

- **Claude Desktop** — Add as MCP server
- **Cursor** — Add to MCP config
- **Windsurf** — Add to MCP config
- **Cline** — Add to MCP config
- **Claude Code** — Add to MCP config
- **Any MCP-compatible tool**

## Pricing

| Tier | Calls/Day | Rate/Min | Price |
|------|-----------|----------|-------|
| Developer (MCP) | 100 | 15 | Free |
| Agent Pro | 2,000 | 60 | $9/mo |
| Enterprise | 50,000 | 300 | Contact us |

MCP signups automatically get the Developer tier — 100 calls/day free.

## Links

- **Website:** [tradekix.ai](https://www.tradekix.ai)
- **Agent Docs:** [tradekix.ai/ai-agent-access](https://www.tradekix.ai/ai-agent-access)
- **GitHub:** [github.com/TradekixAI/tradekix-mcp-server](https://github.com/TradekixAI/tradekix-mcp-server)
- **GPT Store:** [TradeKix GPT](https://chatgpt.com/g/g-698ed20af78c81919b089a51e0dc2cdf-tradekix-financial-data-for-ai)

## License

MIT
