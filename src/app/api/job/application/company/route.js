import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";

export async function GET(req) {
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

    if (user.role !== "recruiter")
      return NextResponse.json(
        {
          message: "You are not recruiter",
        },
        {
          status: 403,
        }
      );

    const jobId = searchParams.get("jobId");

    // Get job from PostgreSQL
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    const job = jobResult.rows[0];
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    if (user.id !== job.recruiter) {
      return NextResponse.json({ message: "You are not recruiter of this company" }, { status: 403 });
    }
    // Get applications for this job
    const applicationsResult = await pool.query('SELECT * FROM applications WHERE job = $1', [jobId]);
    const applications = applicationsResult.rows;
    // Return job details and all applications
    return NextResponse.json({
      job,
      applications
    });
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