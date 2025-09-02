import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";

export async function POST(req) {
  try {
  // ...existing code...

    const { searchParams } = new URL(req.url);

    const token = searchParams.get("token");

    const user = await CheckAuth(token);

    if (!user)
      return NextResponse.json(
        {
          message: "Please Login",
        },
        {
          status: 403,
        }
      );

    const id = searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Job ID must be a valid integer" }, { status: 400 });
    }
    const jobId = Number(id);
    // Get job from PostgreSQL
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    const job = jobResult.rows[0];
    if (!job) {
      return NextResponse.json({ message: "No Job with this id" }, { status: 404 });
    }
    if (job.status === "closed") {
      return NextResponse.json({ message: "Status is Closed for this job" }, { status: 400 });
    }
    // Check if user already applied
    const appCheck = await pool.query('SELECT * FROM applications WHERE job = $1 AND applicant = $2', [jobId, user.id]);
    if (appCheck.rows.length > 0) {
      return NextResponse.json({ message: "You already applied for this job" }, { status: 403 });
    }
    // Create application
    await pool.query(
      'INSERT INTO applications (job, applicant, jobName, jobSalary) VALUES ($1, $2, $3, $4)',
      [jobId, user.id, job.title, job.salary]
    );
    return NextResponse.json({ message: "Application Submitted" });
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