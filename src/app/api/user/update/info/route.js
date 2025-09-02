
import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";
 
export async function POST(req) {
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
    const body = await req.json();
    const { name, phoneNumber, bio } = body;
    await pool.query(
      "UPDATE users SET name = $1, phone_number = $2, bio = $3 WHERE id = $4",
      [name, phoneNumber, bio, user.id]
    );
    return NextResponse.json({
      message: "Profile Updated",
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