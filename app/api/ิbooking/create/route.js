// app/api/bookings/create/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const {
      userId,
      roomId,
      timeSlotId,
      bookingDate,
      totalPrice
    } = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!userId || !roomId || !timeSlotId || !bookingDate || totalPrice === undefined) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }
    
    // จำลองการดึงข้อมูลผู้ใช้เพื่อตรวจสอบยอดเงิน
    // ในระบบจริงจะต้องดึงข้อมูลจากฐานข้อมูล
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }
    
    const user = JSON.parse(storedUser);
    
    // ตรวจสอบว่ามีเงินพอหรือไม่
    if (parseFloat(user.Balance) < totalPrice) {
      return NextResponse.json(
        { error: "ยอดเงินในกระเป๋าไม่เพียงพอ" },
        { status: 400 }
      );
    }
    
    // จำลองการสร้างการจอง
    const bookingId = Math.floor(Math.random() * 10000);
    
    // จำลองการหักเงิน
    const newBalance = parseFloat(user.Balance) - totalPrice;
    const updatedUser = { ...user, Balance: newBalance };
    
    // จำลองการบันทึกประวัติธุรกรรม
    const transactionId = Math.floor(Math.random() * 10000);
    
    return NextResponse.json({
      success: true,
      message: "จองห้องประชุมสำเร็จ",
      bookingId: bookingId,
      transactionId: transactionId,
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: `ไม่สามารถจองห้องประชุมได้: ${error.message}` },
      { status: 500 }
    );
  }
}