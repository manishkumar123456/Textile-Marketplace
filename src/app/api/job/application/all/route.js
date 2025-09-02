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

  // Get applications for this user from PostgreSQL
  const applicationsResult = await pool.query('SELECT * FROM applications WHERE applicant = $1', [user.id]);
  const applications = applicationsResult.rows;
  return NextResponse.json(applications);
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