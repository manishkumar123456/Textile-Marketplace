
import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";

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

    if (user.role !== "recruiter")
      return NextResponse.json(
        {
          message: "You are not recruiter",
        },
        {
          status: 400,
        }
      );

    const body = await req.json();
    const companyId = searchParams.get("company");

    // Find company by id
    const companyResult = await pool.query("SELECT * FROM companies WHERE id = $1", [companyId]);
    const companyData = companyResult.rows[0];

    if (!companyData)
      return NextResponse.json(
        {
          message: "No Company with this id",
        },
        {
          status: 404,
        }
      );

    const { title, description, role, salary, experience, location, openings } = body;
    // Validate salary: must be a number or null
    let validSalary = null;
    if (salary === null || salary === "" || typeof salary === "undefined") {
      validSalary = null;
    } else if (typeof salary === "number") {
      validSalary = salary;
    } else if (!isNaN(Number(salary))) {
      validSalary = Number(salary);
    } else {
      return NextResponse.json(
        {
          message: "Invalid salary: must be a number or empty",
        },
        {
          status: 400,
        }
      );
    }

    await pool.query(
      `INSERT INTO jobs (title, description, role, salary, experience, location, openings, company, company_logo, recruiter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [title, description, role, validSalary, experience, location, openings, companyData.id, companyData.logo, user.id]
    );

    return NextResponse.json({
      message: "Job created Successfully",
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