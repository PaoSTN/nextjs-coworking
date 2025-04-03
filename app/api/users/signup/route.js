// app/api/users/signup/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function POST(request) {
  try {
    // รับข้อมูลจากคำขอ
    const { 
      User_Name, 
      First_Name, 
      Last_Name, 
      U_Password, 
      U_Phone, 
      U_Email, 
      User_Type 
    } = await request.json();

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบหรือไม่
    if (!User_Name || !First_Name || !Last_Name || !U_Password || !U_Email) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const db = mysqlPool.promise();

    // ตรวจสอบรูปแบบเบอร์โทร
    if (U_Phone && (!/^\d{1,10}$/.test(U_Phone) || U_Phone.length > 10)) {
      return NextResponse.json(
        { error: "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้นและไม่เกิน 10 หลัก" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีชื่อผู้ใช้ซ้ำหรือไม่
    const [existingUsers] = await db.query(
      "SELECT User_ID FROM UserID WHERE User_Name = ?",
      [User_Name]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาเลือกชื่อผู้ใช้อื่น" },
        { status: 409 }
      );
    }

    // ตรวจสอบว่ามีอีเมลซ้ำหรือไม่
    const [existingEmails] = await db.query(
      "SELECT User_ID FROM UserID WHERE U_Email = ?",
      [U_Email]
    );

    if (existingEmails.length > 0) {
      return NextResponse.json(
        { error: "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น" },
        { status: 409 }
      );
    }
    
    // ตรวจสอบว่ามีเบอร์โทรศัพท์ซ้ำหรือไม่ (ถ้ามีการระบุเบอร์โทร)
    if (U_Phone) {
      const [existingPhones] = await db.query(
        "SELECT User_ID FROM UserID WHERE U_Phone = ?",
        [U_Phone]
      );

      if (existingPhones.length > 0) {
        return NextResponse.json(
          { error: "เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว กรุณาใช้เบอร์โทรศัพท์อื่น" },
          { status: 409 }
        );
      }
    }

    // เข้ารหัสรหัสผ่าน (ในสถานการณ์จริงควรใช้ bcrypt)
    // แต่หากยังไม่ได้ติดตั้ง bcrypt ให้ใช้วิธีนี้ก่อน
    // ในการทำงานจริง ให้ติดตั้ง bcrypt ด้วย: npm install bcryptjs
    
    // ถ้ามี bcrypt
    // const bcrypt = require('bcryptjs');
    // const hashedPassword = await bcrypt.hash(U_Password, 10);
    
    // ถ้าไม่มี bcrypt (ไม่แนะนำในระบบที่ใช้งานจริง)
    const hashedPassword = U_Password; // ควรเปลี่ยนเป็นการเข้ารหัสที่ปลอดภัย

    // เพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
    const [result] = await db.query(
      `INSERT INTO UserID (
        User_Name, 
        First_Name, 
        Last_Name, 
        U_Password, 
        U_Phone, 
        U_Email, 
        User_Type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        User_Name,
        First_Name,
        Last_Name,
        hashedPassword,
        U_Phone || null, // จัดการกรณีที่ไม่มีเบอร์โทร
        U_Email,
        User_Type || "User" // ใช้ค่าเริ่มต้นถ้าไม่มีการระบุ
      ]
    );

    // ตอบกลับด้วยข้อความสำเร็จ
    return NextResponse.json(
      { 
        message: "สร้างบัญชีผู้ใช้สำเร็จ",
        userId: result.insertId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ข้อผิดพลาดในการสมัครสมาชิก:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างบัญชีผู้ใช้ได้" },
      { status: 500 }
    );
  }
}