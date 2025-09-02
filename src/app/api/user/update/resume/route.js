import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../../middlewares/isAuth";
import uploadFile from "../../../../../../middlewares/upload";

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
    const formdata = await req.formData();
    const resume = formdata.get("resume");
    const resumeFile = await uploadFile(resume);
    await pool.query(
      "UPDATE users SET resume = $1 WHERE id = $2",
      [resumeFile.url, user.id]
    );
    return NextResponse.json({
      message: "Resume Updated",
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