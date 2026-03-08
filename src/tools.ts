import {z} from 'zod';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
    searchEmployees,
    getProjectsByStatus,
    getProjectMembers,
} from "./db.js";
import { text } from 'node:stream/consumers';

export function registerTools(server: McpServer) {
    server.tool(
        "search_employees",
        `search internal employee directory by name, email or role. returns matching employees`,
        {
            query: z.string().describe("search term for name, email or role"),
            department: z.string().optional().describe("optional department filter")
        },
        async ({query,department}) => {
            const employees = await searchEmployees(query, department);

            if(employees.length === 0){
                return {
                    content: [
                        {
                            type: "text",
                            text : "No employees found matching the search criteria."
                        },
                    ],
                };
            }

            const formatted = employees
        .map(
          (e) =>
            `- **\({e.name}** (\){e.email})\n  Role: \({e.role} | Dept: \){e.department} | Since: ${e.start_date}`
        )
        .join("\n");

            return {
        content: [
          {
            type: "text",
            text: `Found \({employees.length} employee(s):\n\n\){formatted}`,
          },
        ],
      };
    }
  );

  server.tool(
    "list_projects",
    `List internal projects filtered by status.
     Returns project name, lead, department, and deadline.
     Use this when the user asks about ongoing work, project status, or deadlines.`,
    {
      status: z
        .enum(["active", "completed", "on_hold"])
        .describe("Project status to filter by"),
    },
    async ({ status }) => {
      const projects = await getProjectsByStatus(status);

      if (projects.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No ${status} projects found.`,
            },
          ],
        };
      }

      const formatted = projects
        .map(
          (p) =>
            `- **\({p.name}** [\){p.status}]\n  Lead: \({p.lead_id} | Dept: \){p.department} | Deadline: ${p.deadline ?? "None"}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `\({projects.length} \){status} project(s):\n\n${formatted}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_project_team",
    `Get all team members assigned to a specific project.
     Returns employee details for each member.
     Use this when the user asks who is working on a project.`,
    {
      project_id: z
        .string()
        .uuid()
        .describe("The UUID of the project to look up"),
    },
    async ({ project_id }) => {
      const members = await getProjectMembers(project_id);

      if (members.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No team members found for this project.",
            },
          ],
        };
      }

      const formatted = members
        .map((m) => `- \({m.name} (\){m.role}, ${m.department})`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Project team (\({members.length} members):\n\n\){formatted}`,
          },
        ],
      };
    }
  );
}