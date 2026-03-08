# Employee Data MCP Server

An internal employee data MCP (Model Context Protocol) server that provides tools for searching employees, viewing projects, and managing team assignments. Built with Express.js and PostgreSQL.

## Features

- **Search Employees**: Search the internal employee directory by name, email, or role with optional department filtering
- **List Projects**: Filter and view projects by status (active, completed, on_hold)
- **Get Project Team**: Retrieve all team members assigned to a specific project
- **Health Checks**: Monitor database connectivity and server health

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variable: `DATABASE_URL`

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd employee-data-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database connection:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/employee_db"
```

## Running the Server

### Local Development

```bash
npx tsx src/index.ts
```

The server will start on **port 3100** and log: `"MCP server running on port 3100"`

### Using Docker

Build and run with Docker (see Dockerfile for details):
```bash
docker build -t employee-data-mcp .
docker run -p 3100:3100 -e DATABASE_URL="postgresql://..." employee-data-mcp
```

## API Endpoints

### MCP Protocol
- **`POST /mcp`** - Main MCP endpoint for handling Model Context Protocol requests

### Health Check
- **`GET /health`** - Returns server and database health status
  ```json
  {
    "status": "healthy|degraded",
    "checks": {
      "database": true|false,
    },
    "uptime": 123.45
  }
  ```

## Available Tools

### search_employees
Search the employee directory by name, email, or role.

**Parameters:**
- `query` (string, required): Search term for name, email, or role
- `department` (string, optional): Filter results by department

**Returns:** List of matching employees with names, emails, roles, departments, and start dates

### list_projects
List projects filtered by status.

**Parameters:**
- `status` (string, required): One of `active`, `completed`, or `on_hold`

**Returns:** List of projects with name, lead, department, and deadline

### get_project_team
Get all team members assigned to a specific project.

**Parameters:**
- `project_id` (string, required): The project ID

**Returns:** List of employee details for all project members

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/database` |

## Project Structure

```
src/
├── index.ts       # Express server setup and MCP transport handling
├── tools.ts       # Tool definitions and handlers
├── db.ts          # Database queries and interfaces
├── server.ts      # MCP server initialization
└── resources.ts   # Resource definitions (placeholder)
```

## Database Schema

The server expects the following tables:

**employees**
- id (string)
- name (string)
- email (string)
- department (string)
- role (string)
- manager_id (string, nullable)
- start_date (date)

**projects**
- id (string)
- name (string)
- status (enum: active, completed, on_hold)
- lead_id (string)
- department (string)
- deadline (date, nullable)

**project_members**
- project_id (string)
- employee_id (string)

## Dependencies

- **@modelcontextprotocol/sdk** - MCP protocol implementation
- **express** - HTTP server framework
- **pg** - PostgreSQL client
- **zod** - Runtime type validation
- **typescript** - TypeScript compiler
- **tsx** - TypeScript execution for Node.js

## Development

To modify the tools or add new functionality:

1. Edit `src/tools.ts` for tool definitions
2. Update `src/db.ts` for database queries
3. Rebuild and restart the server

## Error Handling

- **404 (Session ID not found)**: Invalid or expired MCP session ID
- **503 (Service Degraded)**: Database connection failed (check health endpoint)

