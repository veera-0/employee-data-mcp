import pg from "pg";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
})

export interface Employee {
    id: string,
    name: string,
    email: string, 
    department: string,
    role: string,
    manager_id: string | null,
    start_date: Date
}

export interface Project{
    id: string,
    name: string,
    status: "active" | "completed" | "on_hold",
    lead_id: string,
    department: string,
    deadline: String | null;
}

export async function searchEmployees(
    query: string,
    department?: string
): Promise<Employee[]> {
    const conditions = ["(name ILIKE \(1 OR email ILIKE \) OR role ILIKE $1)"];
    const params: string[] = [`%${query}%`];

    if (department) {
        conditions.push("department = $2");
        params.push(department);
    }

    const result = await pool.query<Employee>(
        `SELECT * FROM employees WHERE ${conditions.join(" AND ")}
        ORDER BY name ASC LIMIT 20`,
        params
    );
    return result.rows;
}

export async function getProjectsByStatus(
    status: string
): Promise<Project[]> {
    const result = await pool.query<Project>(
        `select id,name,status,lead_id,department,deadline
        from projects
        where status = $1
        order by deadline asc nulls last`,
        [status]
    );
    return result.rows;
}

export async function getProjectMembers(
    projectId: string
): Promise<Employee[]> {
    const result = await pool.query<Employee>(
        `SELECT e.id, e.name, e.email, e.department, e.role, e.manager_id, e.start_date
        FROM employees e
        JOIN project_members pm ON e.id = pm.employee_id
        WHERE pm.project_id = $1
        ORDER BY e.name ASC`,
        [projectId]
    );
    return result.rows;
}
