import pool from "@/connectDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    let fields = {};
    let files = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'object' && value instanceof File) {
          files[key] = value;
        } else {
          fields[key] = value;
        }
      }
    } else {
      fields = await request.json();
    }
    const { name, email, password, phoneNumber, role, bio, skills, savedJobs } = fields;
    // For files: files.profilePic, files.resume
    // You may need to handle file saving here

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert user into database
    await pool.query(
      `INSERT INTO users (name, email, password, phone_number, role, bio, skills, profile_picture, resume, saved_jobs)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        name,
        email,
        hash,
        phoneNumber,
        role,
        bio,
        Array.isArray(skills) ? skills : [],
        files.profilePic ? files.profilePic.name : null,
        files.resume ? files.resume.name : null,
        Array.isArray(savedJobs) ? savedJobs : []
      ]
    );

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          name,
          email,
          role,
          phoneNumber,
          bio,
          skills: Array.isArray(skills) ? skills : [],
          profilePic: files.profilePic ? files.profilePic.name : null,
          resume: files.resume ? files.resume.name : null,
          savedJobs: Array.isArray(savedJobs) ? savedJobs : [],
        },
        token: null // You may want to generate a token here if needed
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  }
}
