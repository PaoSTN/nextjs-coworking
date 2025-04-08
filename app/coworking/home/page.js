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
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Co Working Space</h1>
            <nav className="hidden md:flex space-x-4">
              <Link href="/coworking/meetingroom" className="text-gray-600 hover:text-indigo-600 font-medium">
                Meeting Room
              </Link>
              <Link href="/coworking/trainingroom" className="text-gray-600 hover:text-indigo-600 font-medium">
                Training Room
              </Link>
              <Link href="/coworking/eventroom" className="text-gray-600 hover:text-indigo-600 font-medium">
                Event Room
              </Link>
            </nav>
          </div>
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
        
        {/* Room Selection Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">บริการของเรา</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meeting Room */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg mb-2">Meeting Room</h3>
              <p className="text-gray-600 text-sm mb-3">ห้องประชุมหลากหลายขนาด พร้อมอุปกรณ์ทันสมัยรองรับการประชุมทุกรูปแบบ</p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Meeting Room Type A (ความจุ 8 คน) มี 4 ห้อง</li>
                <li>• Meeting Room Type B (ความจุ 14 คน) มี 4 ห้อง</li>
                <li>• Meeting Room Type C (ความจุ 20 คน) มี 3 ห้อง</li>
              </ul>
              <Link href="/coworking/meetingroom" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
                ดูรายละเอียด
              </Link>
            </div>
            
            {/* Training Room */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg mb-2">Training Room</h3>
              <p className="text-gray-600 text-sm mb-3">ห้องสำหรับการฝึกอบรม สัมมนา พร้อมสิ่งอำนวยความสะดวกครบครัน</p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Training Room Type A (ความจุ 30 คน) มี 2 ห้อง</li>
                <li>• Training Room Type B (ความจุ 50 คน) มี 1 ห้อง</li>
              </ul>
              <Link href="/coworking/trainingroom" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
                ดูรายละเอียด
              </Link>
            </div>
            
            {/* Event Room */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg mb-2">Event Room</h3>
              <p className="text-gray-600 text-sm mb-3">ห้องอเนกประสงค์ขนาดใหญ่สำหรับจัดงานสัมมนาและกิจกรรมพิเศษ</p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Event Room (ความจุ 220 คน) มี 1 ห้อง</li>
                <li>• พื้นที่ใช้สอย 300 ตารางเมตร</li>
                <li>• สามารถปรับรูปแบบการจัดได้หลากหลาย</li>
              </ul>
              <Link href="/coworking/eventroom" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        </div>
        
        {/* Promotion Section */}
       
        
      </main>
    </div>
  )
}