import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer(
    { name: "internal-data", version: "0.1.0" },
    { capabilities: {tools: {}, resources: {}}}
)

