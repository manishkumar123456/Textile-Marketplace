import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";

export async function DELETE(req) {
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
    const skill = searchParams.get("skill");
    // Fetch current skills
    const { rows } = await pool.query("SELECT skills FROM users WHERE id = $1", [user.id]);
    if (!rows[0]) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    let skills = rows[0].skills || [];
    skills = skills.filter((s) => s !== skill);
    await pool.query("UPDATE users SET skills = $1 WHERE id = $2", [skills, user.id]);
    return NextResponse.json({
      message: "Skill Removed",
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