import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";

export async function GET(req) {
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

    const id = searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Company ID must be a valid integer" }, { status: 400 });
    }
    const intId = parseInt(id, 10);
    const { rows } = await pool.query('SELECT * FROM companies WHERE id = $1', [intId]);
    if (rows.length === 0) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }
  return NextResponse.json({ company: rows[0] });
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