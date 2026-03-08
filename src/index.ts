import express from "express"
import { randomUUID } from "node:crypto"
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { registerTools } from "./tools.ts";
import pg from "pg"; 


const app = express();
app.use(express.json());

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
})

const server = new McpServer(
    { name: "employee-data", version: "1.0.0"},
    { capabilities: { tools: {}, resources: {} } }
);

registerTools(server);

const transports = new Map<string, StreamableHTTPServerTransport>();

app.all("/mcp", async (req,res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if(sessionId && transports.has(sessionId)){
        const transport = transports.get(sessionId);
        await transport?.handleRequest(req,res);
        return;
    }

    if(sessionId && !transports.has(sessionId)){
        res.status(404).json({error: "Session ID not found"});
        return;
    }

    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
            transports.set(id,transport);
        },
    });

    transport.onclose = () => {
        if(transport.sessionId){
            transports.delete(transport.sessionId);
        }
    };

    await server.connect(transport);
    await transport.handleRequest(req,res);
});


app.get("/health", async (_req, res) => {
  const checks = {
    database: false,
    ticketingApi: false,
  };

  try {
    await pool.query("SELECT 1");
    checks.database = true;
  } catch {}
 
  const healthy = Object.values(checks).every(Boolean);
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    checks,
    uptime: process.uptime(),
  });
});

app.listen(3100, () => {
    console.log("MCP server running on port 3100");
})

