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

export async function searchEmployees(){
    
}