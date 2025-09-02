import pool from "@/connectDB";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";

export async function POST(req) {
  try {
  // ...existing code...

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

    const id = searchParams.get("id");

    const job = await Job.findById(id);

    if (!job)
      return NextResponse.json(
        {
          message: "No job with this id",
        },
        {
          status: 400,
        }
      );

    if (job.recruiter.toString() !== user._id.toString())
      return NextResponse.json(
        {
          message: "You are not recruiter of this job",
        },
        {
          status: 400,
        }
      );

    const body = await req.json();

    const {
      title,
      description,
      role,
      salary,
      experience,
      location,
      openings,
      status,
    } = body;

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

    job.title = title;
    job.description = description;
    job.role = role;
    job.salary = validSalary;
    job.experience = experience;
    job.location = location;
    job.openings = openings;
    job.status = status;

    await job.save();
    return NextResponse.json({
      message: "Job updated Successfully",
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