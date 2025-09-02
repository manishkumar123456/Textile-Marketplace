import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";

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
          status: 400,
        }
      );

    const id = searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Job ID must be a valid integer" }, { status: 400 });
    }
    const jobId = Number(id);
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    const job = jobResult.rows[0];
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
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