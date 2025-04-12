// app/api/bookings/check/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roomType = searchParams.get('roomType');
    
    if (!userId) {
      return NextResponse.json({ error: "ต้องระบุรหัสผู้ใช้" }, { status: 400 });
    }
    
    // กรณีที่ยังไม่มีการเชื่อมต่อกับฐานข้อมูล หรือต้องการข้อมูลทดสอบ
    const bookings = [];
    
    return NextResponse.json({
      success: true,
      bookings: bookings
    });
    
  } catch (error) {
    console.error("Error checking bookings:", error);
    return NextResponse.json(
      { error: `ไม่สามารถตรวจสอบการจองได้: ${error.message}` },
      { status: 500 }
    );
  }
}