import { NextResponse } from "next/server";
import pool from "@/connectDB";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, password } = body;
    // Find user by email in PostgreSQL
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user)
      return NextResponse.json(
        {
          message: "No user with this email",
        },
        {
          status: 400,
        }
      );

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword)
      return NextResponse.json(
        {
          message: "Wrong Password",
        },
        {
          status: 400,
        }
      );

    const token = jwt.sign({ id: user.id }, process.env.JWT_SEC, {
      expiresIn: "5d",
    });

    return NextResponse.json({
      message: `Welcome back ${user.name}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone_number,
        bio: user.bio,
        skills: user.skills,
        profilePic: user.profile_picture,
        resume: user.resume,
        savedJobs: user.saved_jobs,
      },
      token,
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