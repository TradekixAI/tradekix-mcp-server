#!/usr/bin/env node

/**
 * TradeKix MCP Server
 *
 * Provides financial market data to Claude, Cursor, Windsurf, and other
 * MCP-compatible AI tools via the TradeKix API.
 *
 * Get a free API key: https://www.tradekix.ai/ai-agent-access
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://tradekix-alpha.vercel.app/api/v1";

function getApiKey(): string {
  const key = process.env.TRADEKIX_API_KEY;
  if (!key) {
    throw new Error(
      "TRADEKIX_API_KEY environment variable is required.\n" +
      "Get a free key (100 calls/day) at https://www.tradekix.ai/ai-agent-access\n" +
      "Or run: curl -X POST https://tradekix-alpha.vercel.app/api/v1/connect " +
      '-H "Content-Type: application/json" ' +
      '-d \'{"agent_name":"MyClaude","email":"you@example.com","source":"mcp"}\''
    );
  }
  return key;
}

async function makeRequest(endpoint: string, params?: Record<string, string>): Promise<any> {
  const apiKey = getApiKey();
  const url = new URL(`${BASE_URL}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, v);
      }
    });
  }

  const resp = await fetch(url.toString(), {
    headers: { "X-API-Key": apiKey },
  });

  const data = await resp.json();

  if (!data.success) {
    return {
      error: data.error,
      ...(data.upgrade ? { upgrade: data.upgrade } : {}),
      ...(data.retry_after_seconds ? { retry_after_seconds: data.retry_after_seconds } : {}),
    };
  }

  return data.data;
}

// Create server
const server = new McpServer({
  name: "tradekix",
  version: "0.1.0",
});

// --- Market Overview ---
server.tool(
  "tradekix_market_overview",
  "Get a comprehensive market overview: major indices, forex rates, upcoming economic events, latest alerts, and news summaries. No parameters needed.",
  {},
  async () => {
    const data = await makeRequest("market/overview");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Stock/Crypto Prices ---
server.tool(
  "tradekix_prices",
  "Get historical and current price data for stocks and crypto. Requires a ticker symbol (e.g. AAPL, BTC-USD, TSLA).",
  {
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, BTC-USD, TSLA"),
    from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    to: z.string().optional().describe("End date (YYYY-MM-DD)"),
    limit: z.string().optional().describe("Number of results (default 30)"),
  },
  async ({ symbol, from, to, limit }) => {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    if (limit) params.limit = limit;
    const data = await makeRequest("market/prices", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Market Indices ---
server.tool(
  "tradekix_indices",
  "Get major market indices. Optionally filter by region (US, EU, APAC) or country code.",
  {
    region: z.string().optional().describe("Region filter: US, EU, APAC"),
    country: z.string().optional().describe("Country code filter"),
  },
  async ({ region, country }) => {
    const params: Record<string, string> = {};
    if (region) params.region = region;
    if (country) params.country = country;
    const data = await makeRequest("market/indices", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Forex ---
server.tool(
  "tradekix_forex",
  "Get forex exchange rates. Optionally filter by currency pair (e.g. EUR/USD).",
  {
    symbol: z.string().optional().describe("Currency pair, e.g. EUR/USD"),
  },
  async ({ symbol }) => {
    const params: Record<string, string> = {};
    if (symbol) params.symbol = symbol;
    const data = await makeRequest("market/forex", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Earnings Calendar ---
server.tool(
  "tradekix_earnings",
  "Get upcoming and recent earnings reports. No parameters needed.",
  {},
  async () => {
    const data = await makeRequest("events/earnings");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Economic Events ---
server.tool(
  "tradekix_economic_events",
  "Get economic events calendar: FOMC meetings, CPI releases, jobs data. Filter by country, impact level, and date range.",
  {
    country: z.string().optional().describe("Country code, e.g. US"),
    impact: z.enum(["low", "medium", "high"]).optional().describe("Impact level filter"),
    from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    to: z.string().optional().describe("End date (YYYY-MM-DD)"),
  },
  async ({ country, impact, from, to }) => {
    const params: Record<string, string> = {};
    if (country) params.country = country;
    if (impact) params.impact = impact;
    if (from) params.from = from;
    if (to) params.to = to;
    const data = await makeRequest("events/economic", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Congressional Trades ---
server.tool(
  "tradekix_congressional_trades",
  "Track stock trades made by US congress members with conflict-of-interest detection. Filter by ticker, politician, party, type, and date range.",
  {
    symbol: z.string().optional().describe("Filter by ticker symbol"),
    politician: z.string().optional().describe("Filter by politician name"),
    party: z.enum(["Democrat", "Republican"]).optional().describe("Filter by party"),
    type: z.enum(["buy", "sell"]).optional().describe("Transaction type"),
    from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    to: z.string().optional().describe("End date (YYYY-MM-DD)"),
  },
  async ({ symbol, politician, party, type, from, to }) => {
    const params: Record<string, string> = {};
    if (symbol) params.symbol = symbol;
    if (politician) params.politician = politician;
    if (party) params.party = party;
    if (type) params.type = type;
    if (from) params.from = from;
    if (to) params.to = to;
    const data = await makeRequest("trades/congressional", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Social Sentiment ---
server.tool(
  "tradekix_sentiment",
  "Get aggregated social media sentiment from financial discussions. Filter by sentiment and financial-only content.",
  {
    sentiment: z.enum(["bullish", "bearish", "neutral"]).optional().describe("Sentiment filter"),
    financial_only: z.boolean().optional().describe("Only financial content"),
  },
  async ({ sentiment, financial_only }) => {
    const params: Record<string, string> = {};
    if (sentiment) params.sentiment = sentiment;
    if (financial_only !== undefined) params.financial_only = String(financial_only);
    const data = await makeRequest("social/sentiment", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Financial Tweets ---
server.tool(
  "tradekix_tweets",
  "Get curated financial tweets and social posts. Filter by author, ticker, sentiment.",
  {
    author: z.string().optional().describe("Filter by author"),
    symbol: z.string().optional().describe("Filter by ticker symbol"),
    sentiment: z.enum(["bullish", "bearish", "neutral"]).optional().describe("Sentiment filter"),
    financial_only: z.boolean().optional().describe("Only financial content"),
  },
  async ({ author, symbol, sentiment, financial_only }) => {
    const params: Record<string, string> = {};
    if (author) params.author = author;
    if (symbol) params.symbol = symbol;
    if (sentiment) params.sentiment = sentiment;
    if (financial_only !== undefined) params.financial_only = String(financial_only);
    const data = await makeRequest("social/tweets", params);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- News Summary ---
server.tool(
  "tradekix_news",
  "Get AI-curated summary of latest financial news and market-moving events. No parameters needed.",
  {},
  async () => {
    const data = await makeRequest("news/summary");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TradeKix MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
