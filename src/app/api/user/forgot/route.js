
import pool from "@/connectDB";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import sendMail from "../../../../../middlewares/sendMail";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    // Find user by email
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

    const token = jwt.sign({ email }, process.env.Forgot_sec);
    const data = { email, token };
  await sendMail("TextileMarketplace", data);

    const expire = Date.now() + 5 * 60 * 1000;
    await pool.query(
      "UPDATE users SET reset_password_expire = $1, reset_token = $2 WHERE email = $3",
      [expire, token, email]
    );

    return NextResponse.json({
      message: "Reset Password Link is sent to your mail",
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