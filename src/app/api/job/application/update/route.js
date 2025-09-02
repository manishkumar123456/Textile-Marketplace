import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";

export async function PUT(req) {
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

    if (user.role !== "recruiter")
      return NextResponse.json(
        {
          message: "You are not recruiter",
        },
        {
          status: 400,
        }
      );

    const id = searchParams.get("id");
    const body = await req.json();
    const { value } = body;

    // Update application status in PostgreSQL
    const updateResult = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [value, id]
    );
    const updatedApplication = updateResult.rows[0];
    if (!updatedApplication) {
      return NextResponse.json({ message: "No application with this id" }, { status: 400 });
    }


  // Update job status in jobs table to match application status
  await pool.query('UPDATE jobs SET status = $1 WHERE id = $2', [value, updatedApplication.job]);

    // Return updated application
    return NextResponse.json({
      message: "application updated Successfully",
      application: updatedApplication
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