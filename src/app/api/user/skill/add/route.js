import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";

export async function POST(req) {
  try {
  // pool is already initialized and ready to use

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

    const userId = user.id || user._id;
    const body = await req.json();
    const { skill } = body;

    // Get current skills as Postgres array
    const { rows } = await pool.query('SELECT skills FROM users WHERE id = $1', [userId]);
    let skills = rows[0]?.skills || [];
    // Check for duplicate skill
    if (skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())) {
      return NextResponse.json({ message: "Skill Already Added" }, { status: 400 });
    }
    // Add new skill
    skills.push(skill);
    await pool.query('UPDATE users SET skills = $1 WHERE id = $2', [skills, userId]);
    return NextResponse.json({ message: "Skill Added" });
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