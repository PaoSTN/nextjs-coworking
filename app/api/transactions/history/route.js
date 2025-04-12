// app/api/transactions/history/route.js

import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "ต้องระบุรหัสผู้ใช้" }, { status: 400 });
    }
    
    const db = mysqlPool.promise();
    
    // ดึงข้อมูลประวัติธุรกรรม
    const [transactions] = await db.query(
      `SELECT * FROM Transaction_History 
       WHERE User_ID = ? 
       ORDER BY Transaction_Date DESC`,
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      transactions: transactions
    });
    
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return NextResponse.json(
      { error: `ไม่สามารถดึงข้อมูลประวัติธุรกรรมได้: ${error.message}` },
      { status: 500 }
    );
  }
}