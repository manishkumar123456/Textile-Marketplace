import pool from "../../connectDB";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { name, email, password, phoneNumber, role, bio, skills, profilePicture, resume, savedJobs } = req.body;

      const result = await pool.query(
        "INSERT INTO users (name, email, password, phone_number, role, bio, skills, profile_picture, resume, saved_jobs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
        [name, email, password, phoneNumber, role, bio, skills, profilePicture, resume, savedJobs]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


// This file is not needed. Use src/connectDB.js and SQL queries for PostgreSQL access.