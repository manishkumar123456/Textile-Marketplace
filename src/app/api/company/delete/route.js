import { connectDb } from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";
import pool from "@/connectDB";

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const user = await CheckAuth(token);
    if (!user)
      return NextResponse.json({ message: "Please Login" }, { status: 400 });
    if (user.role !== "recruiter")
      return NextResponse.json({ message: "You are not recruiter" }, { status: 400 });
    const id = searchParams.get("id");
    // Check company ownership
    const companyRes = await pool.query("SELECT * FROM companies WHERE id = $1", [id]);
    const company = companyRes.rows[0];
    if (!company)
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    if (company.recruiter !== user.id)
      return NextResponse.json({ message: "You are not recruiter of this company" }, { status: 400 });
    // Find jobs for this company
    const jobsRes = await pool.query("SELECT id FROM jobs WHERE company = $1", [id]);
    const jobIds = jobsRes.rows.map(j => j.id);
    // Delete applications for these jobs
    if (jobIds.length > 0) {
      await pool.query(`DELETE FROM applications WHERE job = ANY($1::int[])`, [jobIds]);
      await pool.query(`DELETE FROM jobs WHERE id = ANY($1::int[])`, [jobIds]);
    }
    // Delete company
    await pool.query("DELETE FROM companies WHERE id = $1", [id]);
    return NextResponse.json({ message: "Company Delete" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}