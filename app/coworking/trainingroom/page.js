'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TrainingRoomPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check user data from localStorage when page loads
    const checkAuth = () => {
      const userData = localStorage.getItem('user')
      if (!userData) {
        // If no user data (not logged in), redirect to login page
        router.push('/coworking')
      } else {
        try {
          // Parse user data from JSON string
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
    // Clear user data from localStorage
    localStorage.removeItem('user')
    // Redirect to login page
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
            <Link href="/coworking/home" className="text-2xl font-bold text-gray-900">
              Co Working Space
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link href="/coworking/meetingroom" className="text-gray-600 hover:text-indigo-600 font-medium">
                Meeting Room
              </Link>
              <Link href="/coworking/trainingroom" className="text-indigo-600 font-medium">
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Training Room</h2>
          <p className="text-gray-600 mb-6">
            ห้องอบรมที่รองรับการจัดการฝึกอบรม สัมมนา และการเรียนรู้ในรูปแบบต่างๆ ด้วยอุปกรณ์ที่ทันสมัยและสิ่งอำนวยความสะดวกครบครัน
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Training Room Type A */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200">
              <div className="p-4">
                <h3 className="font-medium text-lg">Training Room Type A</h3>
                <p className="text-gray-600 text-sm mt-1">ความจุ 30 คน (มี 2 ห้อง)</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>• โต๊ะและเก้าอี้จัดเรียงแบบห้องเรียน</li>
                  <li>• โปรเจคเตอร์ความละเอียดสูง</li>
                  <li>• ระบบเสียงพร้อมไมโครโฟนไร้สาย 2 ตัว</li>
                  <li>• ไวท์บอร์ดและอุปกรณ์เขียน</li>
                  <li>• ไวไฟความเร็วสูง</li>
                  <li>• บริการน้ำดื่ม</li>
                </ul>
                <p className="text-indigo-600 font-semibold mt-4">฿2,500 / 4 ชั่วโมง</p>
                <p className="text-indigo-600 font-semibold">฿4,000 / 8 ชั่วโมง</p>
                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200">
                  จองห้องอบรม
                </button>
              </div>
            </div>
            
            {/* Training Room Type B */}
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200">
              <div className="p-4">
                <h3 className="font-medium text-lg">Training Room Type B</h3>
                <p className="text-gray-600 text-sm mt-1">ความจุ 50 คน (มี 1 ห้อง)</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  <li>• โต๊ะและเก้าอี้สามารถจัดรูปแบบได้หลากหลาย</li>
                  <li>• โปรเจคเตอร์ความละเอียดสูง 2 เครื่อง</li>
                  <li>• ระบบเสียงคุณภาพสูงพร้อมไมโครโฟนไร้สาย 4 ตัว</li>
                  <li>• จอทัชสกรีนขนาดใหญ่</li>
                  <li>• ไวท์บอร์ดและอุปกรณ์เขียน</li>
                  <li>• ไวไฟความเร็วสูง</li>
                  <li>• บริการน้ำดื่มและอาหารว่าง</li>
                  <li>• พื้นที่พักผ่อนส่วนตัว</li>
                </ul>
                <p className="text-indigo-600 font-semibold mt-4">฿4,500 / 4 ชั่วโมง</p>
                <p className="text-indigo-600 font-semibold">฿7,500 / 8 ชั่วโมง</p>
                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200">
                  จองห้องอบรม
                </button>
              </div>
            </div>
          </div>
          
          {/* Additional information */}
          <div className="bg-gray-50 p-4 rounded-md mt-6">
            <h3 className="font-medium text-gray-900 mb-2">ข้อมูลเพิ่มเติม</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• สามารถจองล่วงหน้าได้สูงสุด 60 วัน</li>
              <li>• ยกเลิกการจองฟรีล่วงหน้า 72 ชั่วโมง</li>
              <li>• มีบริการอาหารกลางวันและอาหารว่าง (คิดค่าใช้จ่ายเพิ่มเติม)</li>
              <li>• มีบริการผู้ช่วยด้านเทคนิคตลอดการใช้งาน</li>
              <li>• มีบริการอุปกรณ์สำนักงานเพิ่มเติม (เครื่องถ่ายเอกสาร, เครื่องพิมพ์)</li>
              <li>• มีส่วนลดพิเศษสำหรับการจองแบบรายเดือน</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}