
import jwt from "jsonwebtoken";
import pool from "@/connectDB";

export default async function CheckAuth(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    const userId = decoded.id;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    if (!user) return null;
    // Return user object with correct role
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      bio: user.bio,
      skills: user.skills,
      profilePic: user.profile_picture,
      resume: user.resume,
      savedJobs: user.saved_jobs,
    };
  } catch (err) {
    return null;
  }
}
