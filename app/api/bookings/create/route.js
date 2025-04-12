import { NextResponse } from 'next/server';
import { mysqlPool } from '@/utils/db';

export async function POST(request) {
  let connection;
  
  try {
    const { userId, roomId, timeSlotId, bookingDate, totalPrice } = await request.json();
    
    // ตรวจสอบข้อมูล
    if (!userId || !roomId || !timeSlotId || !bookingDate || !totalPrice) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }
    
    // เริ่มการเชื่อมต่อแบบใช้ promise
    connection = await mysqlPool.promise().getConnection();
    
    // ตรวจสอบความพร้อมใช้งานของห้อง
    const [checkAvailability] = await connection.execute(
      `SELECT * FROM Bookings 
       WHERE Room_ID = ? AND Time_Slot_ID = ? AND Booking_Date = ? AND Booking_Status = 'Confirmed'`,
      [roomId, timeSlotId, bookingDate]
    );
    
    if (checkAvailability.length > 0) {
      connection.release();
      return NextResponse.json({ error: 'ห้องนี้ถูกจองไปแล้ว กรุณาเลือกห้องอื่น' }, { status: 400 });
    }
    
    // ตรวจสอบยอดเงินของผู้ใช้
    const [userResult] = await connection.execute('SELECT * FROM Users WHERE User_ID = ?', [userId]);
    if (userResult.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ใช้' }, { status: 400 });
    }
    
    const user = userResult[0];
    if (parseFloat(user.Balance) < parseFloat(totalPrice)) {
      connection.release();
      return NextResponse.json({ error: 'ยอดเงินไม่เพียงพอ' }, { status: 400 });
    }
    
    // ใช้ transaction
    await connection.beginTransaction();
    
    // 1. สร้างข้อมูลการจอง
    await connection.execute(
      `INSERT INTO Bookings (User_ID, Room_ID, Time_Slot_ID, Booking_Date, Total_Price, Booking_Status, Payment_Method) 
       VALUES (?, ?, ?, ?, ?, 'Confirmed', 'Wallet')`,
      [userId, roomId, timeSlotId, bookingDate, totalPrice]
    );
    
    // 2. อัพเดทยอดเงินของผู้ใช้
    const newBalance = parseFloat(user.Balance) - parseFloat(totalPrice);
    await connection.execute(
      'UPDATE Users SET Balance = ? WHERE User_ID = ?',
      [newBalance.toFixed(2), userId]
    );
    
    // 3. อัพเดทสถานะห้อง (เพิ่มขั้นตอนนี้)
    await connection.execute(
      'UPDATE Rooms SET Status = "Unavailable" WHERE Room_ID = ?',
      [roomId]
    );
    
    await connection.commit();
    
    // ดึงข้อมูลผู้ใช้ที่อัพเดทแล้ว
    const [updatedUserResult] = await connection.execute('SELECT * FROM Users WHERE User_ID = ?', [userId]);
    const updatedUser = updatedUserResult[0];
    
    connection.release();
    
    return NextResponse.json({ 
      success: true, 
      message: 'จองห้องประชุมสำเร็จ',
      user: updatedUser 
    });
    
  } catch (error) {
    // ถ้ามีการเริ่ม transaction ให้ rollback
    if (connection) {
      try {
        await connection.rollback();
        connection.release();
      } catch (err) {
        console.error('Error during rollback:', err);
      }
    }
    
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการจองห้องประชุม' }, { status: 500 });
  }
}