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
            </nav>
            <nav className="hidden md:flex space-x-4">
              <Link href="/coworking/topup/history" className="text-gray-600 hover:text-indigo-600 font-medium">
                Topup History
              </Link>
            </nav>
            <nav className="hidden md:flex space-x-4">
              <Link href="/coworking/bookinghistory" className="text-gray-600 hover:text-indigo-600 font-medium">
                booking History
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* แสดงยอดเงินในกระเป๋า */}
            
            {user && (
              <Link href="/coworking/topup" className="flex items-center bg-green-50 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition-colors">
                <span className="text-green-800 font-medium mr-1">ยอดเงิน:</span>
                <span className="text-green-600 font-bold">{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
              </Link>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              ออกจากระบบ
            </button>
          </div>
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
                <div>
                  <p className="text-sm text-gray-500">สถานะกระเป๋าเงิน</p>
                  <p className={`font-medium ${user.Wallet_Status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    {user.Wallet_Status === 'Active' ? 'ใช้งานได้' : 'ระงับการใช้งาน'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">วันที่ลงทะเบียน</p>
                  <p className="font-medium">
                    {new Date(user.Registration_Date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
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
              <h3 className="font-medium text-lg mb-2">Meeting Room Type A</h3>
              <p className="text-gray-600 text-sm mb-3">ห้องประชุมขนาดเล็ก (จำนวน6ห้อง)</p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• ความจุ 8 คน </li>
                <li>• โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้า</li>
                  <li>• จอแสดงผล 55 นิ้ว</li>
                  <li>• ระบบเสียงคุณภาพสูง</li>
                  <li>• ไวไฟความเร็วสูง</li>
                  <li>• ระบบประชุมทางไกล</li>
                   <br/> 
                  
                
               
              </ul>
              <Link href="/coworking/meetingroom/mta" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
                ดูรายละเอียด
              </Link>
            </div>
            
            {/* Training Room */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg mb-2">Meeting Room Type B</h3>
              <p className="text-gray-600 text-sm mb-3">ห้องประชุมขนาดกลาง (จำนวน6ห้อง)</p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>•ความจุ 14 คน</li>
                <li>• โต๊ะประชุมทรงตัวยู</li>
                  <li>• จอแสดงผล 65 นิ้ว</li>
                  <li>• ไวไฟความเร็วสูง</li>
                  <li>• ระบบประชุมทางไกล</li>
                  <li>• ไวไฟความเร็วสูง</li>
                  <li>• บริการเครื่องดื่ม</li>
                  
               
              </ul>
              <Link href="/coworking/trainingroom" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
                ดูรายละเอียด
              </Link>
            </div>
            
            {/* Event Room */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
              <h3 className="font-medium text-lg mb-2">Meeting Room Type C</h3>
              <p className="text-gray-600 text-sm mb-3">ห้องประชุมขนาดใหญ่ (จำนวน5ห้อง)</p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• ความจุ 20 คน</li>
                <li>• โต๊ะประชุมทรงสี่เหลี่ยมผืนผ้าขนาดใหญ่</li>
                  <li>• จอแสดงผล 75 นิ้ว</li>
                  <li>• ระบบประชุมทางไกลคุณภาพสูง</li>
                  <li>• ระบบเสียงรอบทิศทาง</li>
                  <li>• ไวไฟความเร็วสูง</li>
                  <li>• บริการเครื่องดื่มและอาหารว่าง</li>
                
                
              </ul>
              <Link href="/coworking/eventroom" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center transition duration-200">
                ดูรายละเอียด
              </Link>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md mt-6">
            <h3 className="font-medium text-gray-900 mb-2">ข้อมูลเพิ่มเติม</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• สามารถจองล่วงหน้าได้สูงสุด 30 วัน</li>
              <li>• ยกเลิกการจองฟรีล่วงหน้า 36 ชั่วโมง</li>
              <li>• ทุกห้องมีระบบปรับอากาศและระบบเสียง</li>
              <li>• มีบริการช่วยเหลือด้านเทคนิคตลอดเวลาทำการ</li>
              
            </ul>
          </div>
        </div>
        
        
        {/* Promotion Section */}
       
        
      </main>
    </div>
  )
}