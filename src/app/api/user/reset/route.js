
import pool from "@/connectDB";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const decodedData = jwt.verify(token, process.env.Forgot_sec);

    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [decodedData.email]);
    const user = result.rows[0];

    if (!user || user.reset_token !== token)
      return NextResponse.json(
        {
          message: "Invalid Token",
        },
        {
          status: 400,
        }
      );

    if (!user.reset_password_expire)
      return NextResponse.json(
        {
          message: "Token Expired",
        },
        {
          status: 400,
        }
      );

    if (user.reset_password_expire < Date.now()) {
      return NextResponse.json(
        {
          message: "Token Expired",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();
    const { password } = body;
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_password_expire = NULL, reset_token = NULL WHERE email = $2",
      [hash, decodedData.email]
    );

    return NextResponse.json({
      message: "Password Changed Successfully",
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