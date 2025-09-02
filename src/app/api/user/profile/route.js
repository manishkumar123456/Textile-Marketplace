
import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";

export async function GET(req) {
  try {
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
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const userProfile = result.rows[0];
    return NextResponse.json(userProfile);
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