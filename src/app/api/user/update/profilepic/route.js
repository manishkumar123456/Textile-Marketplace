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
    const profilePic = formdata.get("profilePic");
    const profilePhoto = await uploadFile(profilePic);
    await pool.query(
      "UPDATE users SET profile_picture = $1 WHERE id = $2",
      [profilePhoto.url, user.id]
    );
    return NextResponse.json({
      message: "Photo Updated",
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