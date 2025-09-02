import pool from "@/connectDB";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";
import CheckAuth from "../../../../middlewares/isAuth";
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
import path from "path";
import fs from "fs/promises";

export async function POST(req) {
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

    if (user.role !== "recruiter")
      return NextResponse.json(
        {
          message: "You are not recruiter",
        },
        {
          status: 400,
        }
      );

  // Check how many companies this recruiter already has
  // Use only SQL-compatible recruiterId
  const recruiterId = user.id;
    const { rows: companies } = await pool.query(
      'SELECT * FROM companies WHERE recruiter = $1',
      [recruiterId]
    );

  if (companies.length >= 3)
      return NextResponse.json(
        {
          message: "You have exceeded the limit of maximum company",
        },
        {
          status: 400,
        }
      );

  const formdata = await req.formData();

  const name = formdata.get("name");
  const description = formdata.get("description");
  const location = formdata.get("location");
  const website = formdata.get("website");
    const logo = formdata.get("logo");
    let companyLogoUrl = "";
    if (logo && typeof logo === "object" && logo.name && logo.arrayBuffer) {
      const buffer = Buffer.from(await logo.arrayBuffer());
      // Convert buffer to base64 for Cloudinary upload
      const base64Logo = `data:${logo.type};base64,${buffer.toString('base64')}`;
      try {
        const uploadRes = await cloudinary.v2.uploader.upload(base64Logo, {
          folder: "company-logos",
          public_id: logo.name.split('.')[0],
          resource_type: "image",
        });
        companyLogoUrl = uploadRes.secure_url;
      } catch (err) {
        return NextResponse.json({ message: "Cloudinary upload failed: " + err.message }, { status: 500 });
      }
    } else if (typeof logo === "string" && logo.trim() !== "") {
      companyLogoUrl = logo.length > 255 ? logo.substring(0, 255) : logo;
    } else {
      companyLogoUrl = "";
    }

    // Check if company name already exists
    const { rows: existingCompany } = await pool.query(
      'SELECT * FROM companies WHERE name = $1',
      [name]
    );
    if (existingCompany.length > 0) {
      return NextResponse.json(
        {
          message: "this company already registered",
        },
        {
          status: 400,
        }
      );
    }

    // Store only logo file name if logo is a File object, else empty string
  // ...existing code...

    // Insert new company
    await pool.query(
      'INSERT INTO companies (name, description, location, company_logo, website, recruiter) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, description, location, companyLogoUrl, website, recruiterId]
    );

    return NextResponse.json(
      {
        message: "company Registered",
      },
      {
        status: 201,
      }
    );
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