// app/api/bookings/available/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('roomType');
    const date = searchParams.get('date');
    const timeSlotId = searchParams.get('timeSlotId');
    
    if (!roomType || !date) {
      return NextResponse.json(
        { error: "ต้องระบุประเภทห้องและวันที่" },
        { status: 400 }
      );
    }
    
    const db = mysqlPool.promise();
    
    // ดึงข้อมูลห้องทั้งหมดตามประเภท
    const [rooms] = await db.query(
      "SELECT * FROM Rooms WHERE Room_Type = ? AND Status = 'Available'",
      [roomType]
    );
    
    if (rooms.length === 0) {
      return NextResponse.json({
        success: true,
        availableRooms: []
      });
    }
    
    // ดึงข้อมูลการจองในวันและช่วงเวลาที่ระบุ
    let bookingsQuery = `
      SELECT Room_ID FROM Bookings 
      WHERE Booking_Date = ? 
      AND Booking_Status != 'Cancelled'
    `;
    
    const bookingParams = [date];
    
    if (timeSlotId) {
      bookingsQuery += " AND Time_Slot_ID = ?";
      bookingParams.push(timeSlotId);
    }
    
    const [bookings] = await db.query(bookingsQuery, bookingParams);
    
    // สร้างเซ็ตของรหัสห้องที่ถูกจองแล้ว
    const bookedRoomIds = new Set(bookings.map(booking => booking.Room_ID));
    
    // กรองห้องที่ว่าง
    const availableRooms = rooms.filter(room => !bookedRoomIds.has(room.Room_ID));
    
    return NextResponse.json({
      success: true,
      availableRooms: availableRooms
    });
    
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return NextResponse.json(
      { error: `ไม่สามารถดึงข้อมูลห้องว่างได้: ${error.message}` },
      { status: 500 }
    );
  }
}