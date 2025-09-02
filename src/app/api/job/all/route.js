import pool from "@/connectDB";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "";
    const location = searchParams.get("location") || "";
    let experience = searchParams.get("experience");
    experience = experience === null || experience === "" ? 15 : Number(experience);
    if (isNaN(experience)) experience = 15;

    // Build SQL query with filters
    let query = `SELECT * FROM jobs WHERE 1=1`;
    let params = [];
    if (title) {
      params.push(`%${title}%`);
      query += ` AND title ILIKE $${params.length}`;
    }
    if (location) {
      params.push(`%${location}%`);
      query += ` AND location ILIKE $${params.length}`;
    }
    if (experience !== undefined) {
      params.push(experience);
      query += ` AND experience <= $${params.length}`;
    }
    query += ` ORDER BY created_at DESC`;

    const jobsResult = await pool.query(query, params);
    const jobs = jobsResult.rows;

    // Top six jobs
    const topSixResult = await pool.query(`SELECT * FROM jobs ORDER BY created_at DESC LIMIT 6`);
    const topSix = topSixResult.rows;

    // Distinct locations
    const locationsResult = await pool.query(`SELECT DISTINCT location FROM jobs`);
    const locations = locationsResult.rows.map(row => row.location);

    return NextResponse.json({ jobs, locations, topSix });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}