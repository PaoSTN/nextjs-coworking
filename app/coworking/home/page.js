'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CoworkingHomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // ตรวจสอบข้อมูลผู้ใช้จาก localStorage เมื่อโหลดหน้า
    const checkAuth = () => {
      const userData = localStorage.getItem('user')
      if (!userData) {
        // ถ้าไม่มีข้อมูลผู้ใช้ (ยังไม่ล็อกอิน) ให้กลับไปที่หน้าล็อกอิน
        router.push('/coworking')
      } else {
        try {
          // แปลงข้อมูลผู้ใช้จาก JSON string
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } catch (err) {
          console.error('Error parsing user data:', err)
          localStorage.removeItem('user')
          router.push('/coworking')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  const handleLogout = () => {
    // ล้างข้อมูลผู้ใช้จาก localStorage
    localStorage.removeItem('user')
    // นำทางกลับไปหน้าล็อกอิน
    router.push('/coworking')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Co Working Space</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลส่วนตัว</h2>
          
          {user && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ชื่อผู้ใช้</p>
                  <p className="font-medium">{user.User_Name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                  <p className="font-medium">{user.First_Name} {user.Last_Name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">อีเมล</p>
                  <p className="font-medium">{user.U_Email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                  <p className="font-medium">{user.U_Phone}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Room Booking Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">จองห้องประชุม</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg">ห้องประชุมขนาดเล็ก</h3>
              <p className="text-gray-600 text-sm mt-1">สำหรับ 4-8 คน</p>
              <p className="text-indigo-600 font-semibold mt-2">฿500 / ชั่วโมง</p>
              <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200">
                จองห้องประชุม
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg">ห้องประชุมขนาดกลาง</h3>
              <p className="text-gray-600 text-sm mt-1">สำหรับ 10-15 คน</p>
              <p className="text-indigo-600 font-semibold mt-2">฿800 / ชั่วโมง</p>
              <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200">
                จองห้องประชุม
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg">ห้องประชุมขนาดใหญ่</h3>
              <p className="text-gray-600 text-sm mt-1">สำหรับ 20-30 คน</p>
              <p className="text-indigo-600 font-semibold mt-2">฿1,200 / ชั่วโมง</p>
              <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200">
                จองห้องประชุม
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}