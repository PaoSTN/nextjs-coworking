'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EventRoomPage() {
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
              <Link href="/coworking/trainingroom" className="text-gray-600 hover:text-indigo-600 font-medium">
                Training Room
              </Link>
              <Link href="/coworking/eventroom" className="text-indigo-600 font-medium">
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Room</h2>
          <p className="text-gray-600 mb-6">
            ห้องจัดงานอเนกประสงค์ขนาดใหญ่ เหมาะสำหรับการจัดงานประชุมสัมมนา งานเลี้ยง หรืองานอีเวนท์ต่างๆ ที่ต้องการพื้นที่กว้างขวาง
          </p>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200 mb-8">
            <div className="p-4">
              <h3 className="font-medium text-lg">Event Room</h3>
              <p className="text-gray-600 text-sm mt-1">ความจุ 220 คน (มี 1 ห้อง)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">รายละเอียดห้อง</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• พื้นที่ใช้สอย 300 ตารางเมตร</li>
                    <li>• ความสูงของเพดาน 3.5 เมตร</li>
                    <li>• ระบบปรับอากาศคุณภาพสูง</li>
                    <li>• ระบบเสียงและแสงสำหรับงานอีเวนท์</li>
                    <li>• เวทียกระดับสามารถปรับขนาดได้</li>
                    <li>• ห้องควบคุมระบบเสียงและแสงแยกส่วน</li>
                    <li>• พื้นที่เตรียมอาหารและบริการ</li>
                    <li>• ไวไฟความเร็วสูงครอบคลุมทั้งพื้นที่</li>
                    <li>• จุดชาร์จไฟและปลั๊กไฟจำนวนมาก</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">อุปกรณ์และบริการ</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• โปรเจคเตอร์ความละเอียดสูง 2 เครื่อง</li>
                    <li>• จอ LED ขนาดใหญ่</li>
                    <li>• ไมโครโฟนไร้สาย 8 ตัว</li>
                    <li>• ระบบเสียงคุณภาพสูง</li>
                    <li>• ระบบแสงสีปรับได้ตามต้องการ</li>
                    <li>• โต๊ะและเก้าอี้สำหรับผู้เข้าร่วมงาน</li>
                    <li>• ทีมงานด้านเทคนิคประจำงาน</li>
                    <li>• บริการต้อนรับและลงทะเบียน</li>
                    <li>• บริการอาหารและเครื่องดื่ม (คิดค่าบริการเพิ่มเติม)</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">รูปแบบการจัดห้อง</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• แบบการประชุม (Theater) - รองรับได้ถึง 220 คน</li>
                  <li>• แบบห้องเรียน (Classroom) - รองรับได้ถึง 150 คน</li>
                  <li>• แบบห้องประชุม (Boardroom) - รองรับได้ถึง 80 คน</li>
                  <li>• แบบจัดเลี้ยง (Banquet) - รองรับได้ถึง 180 คน</li>
                  <li>• แบบค็อกเทล (Cocktail) - รองรับได้ถึง 220 คน</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-2">อัตราค่าบริการ</h4>
                <div className="space-y-2">
                  <p className="text-indigo-600 font-semibold">ครึ่งวัน (4 ชั่วโมง): ฿15,000</p>
                  <p className="text-indigo-600 font-semibold">เต็มวัน (8 ชั่วโมง): ฿25,000</p>
                  <p className="text-indigo-600 font-semibold">ช่วงเย็น (18:00-22:00): ฿20,000</p>
                </div>
                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200">
                  จองห้องจัดงาน
                </button>
              </div>
            </div>
          </div>
          
          {/* Event Packages */}
          <div className="mb-8">
            <h3 className="font-medium text-lg text-gray-800 mb-4">แพ็คเกจงานอีเวนท์</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-700 mb-2">แพ็คเกจ Basic</h4>
                <ul className="space-y-1 text-sm text-gray-600 mb-4">
                  <li>• ห้อง Event Room (8 ชั่วโมง)</li>
                  <li>• ระบบเสียงและแสงพื้นฐาน</li>
                  <li>• น้ำดื่มสำหรับผู้เข้าร่วมงาน</li>
                  <li>• เจ้าหน้าที่เทคนิค 1 คน</li>
                </ul>
                <p className="text-indigo-600 font-semibold">฿28,000</p>
              </div>
              
              <div className="border border-indigo-100 bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-700 mb-2">แพ็คเกจ Standard</h4>
                <ul className="space-y-1 text-sm text-gray-600 mb-4">
                  <li>• ห้อง Event Room (8 ชั่วโมง)</li>
                  <li>• ระบบเสียงและแสงเต็มรูปแบบ</li>
                  <li>• อาหารว่าง 2 มื้อ</li>
                  <li>• น้ำดื่มและเครื่องดื่ม</li>
                  <li>• เจ้าหน้าที่เทคนิค 2 คน</li>
                  <li>• พนักงานต้อนรับ 2 คน</li>
                </ul>
                <p className="text-indigo-600 font-semibold">฿45,000</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-700 mb-2">แพ็คเกจ Premium</h4>
                <ul className="space-y-1 text-sm text-gray-600 mb-4">
                  <li>• ห้อง Event Room (12 ชั่วโมง)</li>
                  <li>• ระบบเสียงและแสงเต็มรูปแบบ</li>
                  <li>• อาหารว่าง 2 มื้อและอาหารกลางวัน</li>
                  <li>• น้ำดื่มและเครื่องดื่ม (รวมกาแฟ)</li>
                  <li>• เจ้าหน้าที่เทคนิค 3 คน</li>
                  <li>• พนักงานต้อนรับ 4 คน</li>
                  <li>• บริการบันทึกวิดีโอ</li>
                  <li>• บริการถ่ายภาพ</li>
                </ul>
                <p className="text-indigo-600 font-semibold">฿65,000</p>
              </div>
            </div>
          </div>
          
          {/* Additional Services */}
          <div className="mb-8">
            <h3 className="font-medium text-lg text-gray-800 mb-4">บริการเสริม</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">อาหารและเครื่องดื่ม</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• ชุดอาหารว่าง: ฿150 / คน</li>
                  <li>• บุฟเฟ่ต์อาหารกลางวัน: ฿350 / คน</li>
                  <li>• บุฟเฟ่ต์อาหารเย็น: ฿450 / คน</li>
                  <li>• น้ำดื่มและเครื่องดื่มไม่มีแอลกอฮอล์: ฿120 / คน</li>
                  <li>• บาร์เครื่องดื่ม (รวมแอลกอฮอล์): ฿250 / คน / ชั่วโมง</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">บริการด้านอีเวนท์</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• เจ้าหน้าที่ต้อนรับเพิ่มเติม: ฿800 / คน</li>
                  <li>• บริการแปลภาษา: ฿5,000 / ภาษา</li>
                  <li>• จุดลงทะเบียนพร้อมอุปกรณ์: ฿3,000</li>
                  <li>• บริการถ่ายภาพ: ฿6,000 / งาน</li>
                  <li>• บริการวิดีโอ: ฿10,000 / งาน</li>
                  <li>• ดอกไม้และการตกแต่ง: ราคาเริ่มต้น ฿5,000</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Additional information */}
          <div className="bg-gray-50 p-4 rounded-md mt-6">
            <h3 className="font-medium text-gray-900 mb-2">ข้อมูลเพิ่มเติมและเงื่อนไข</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• สามารถจองล่วงหน้าได้สูงสุด 90 วัน</li>
              <li>• ต้องชำระมัดจำ 50% เมื่อทำการจอง</li>
              <li>• ยกเลิกการจองล่วงหน้า 14 วันได้รับเงินมัดจำคืน 80%</li>
              <li>• ยกเลิกการจองล่วงหน้า 7 วันได้รับเงินมัดจำคืน 50%</li>
              <li>• ยกเลิกการจองล่วงหน้าน้อยกว่า 7 วันไม่สามารถคืนเงินมัดจำได้</li>
              <li>• สามารถเข้าติดตั้งและเตรียมงานล่วงหน้าได้ 2 ชั่วโมง</li>
              <li>• ต้องการบริการอาหารและเครื่องดื่มสามารถสั่งล่วงหน้าอย่างน้อย 3 วัน</li>
              <li>• มีส่วนลดพิเศษสำหรับการจองแบบต่อเนื่องหรือองค์กรที่เป็นสมาชิก</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}