import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(request, { params }) {
  try {
    // The params object will have the property that matches your folder name [id]
    const type_id = params.id;
    
    const promisePool = mysqlPool.promise();
    const [rows, fields] = await promisePool.query(
      `SELECT * FROM RoomType WHERE Type_ID = ?`,
      [type_id]
    );
    
    // Check if any room was found
    if (rows.length === 0) {
      return NextResponse.json({ error: "Room type not found" }, { status: 404 });
    }
    
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching room type:", error);
    return NextResponse.json({ error: "Failed to fetch room type" }, { status: 500 });
  }
}