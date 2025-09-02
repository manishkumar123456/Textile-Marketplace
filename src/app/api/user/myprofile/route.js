
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

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [user.id]);
    const loggedInUser = result.rows[0];
    if (!loggedInUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    // Fetch all applications for this user (jobseeker)
    let applications = [];
    if (loggedInUser.role === 'jobseeker') {
      const appRes = await pool.query('SELECT * FROM applications WHERE user_id = $1', [loggedInUser.id]);
      applications = appRes.rows;
    }
    // Return user object in { user: ... } format for Redux compatibility
    return NextResponse.json({
      user: {
        id: loggedInUser.id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        role: loggedInUser.role,
        phoneNumber: loggedInUser.phone_number,
        bio: loggedInUser.bio,
        skills: loggedInUser.skills,
        profilePic: loggedInUser.profile_picture,
        resume: loggedInUser.resume,
        savedJobs: loggedInUser.saved_jobs,
        applications: applications,
      }
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