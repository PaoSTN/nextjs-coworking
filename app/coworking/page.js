'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CoworkingLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    User_Name: '',
    U_Password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // เปลี่ยนจาก useState เป็น useEffect
  useEffect(() => {
    // ตรวจสอบว่า window มีอยู่หรือไม่ก่อน
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')
      if (success) {
        // Show alert if success parameter exists
        alert(success)
        // Clear the URL parameter after showing the alert
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, []) 
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.User_Name || !formData.U_Password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'การเข้าสู่ระบบล้มเหลว')
      }
      
      const data = await response.json()
      
      // บันทึกข้อมูลผู้ใช้ใน localStorage (หรือใช้ cookie, session storage ตามที่ต้องการ)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // นำทางไปยังหน้าหลักหลังจากล็อกอินสำเร็จ
      router.push('/coworking/home')
      
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg max-w-md w-full p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Co Working Space</h1>
          <p className="mt-2 text-gray-600">ยินดีต้อนรับสู่บริการพื้นที่ทำงานร่วมของเรา</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="User_Name" className="block text-sm font-medium text-gray-700">
              ชื่อผู้ใช้
            </label>
            <input
              id="User_Name"
              name="User_Name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.User_Name}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="U_Password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              id="U_Password"
              name="U_Password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.U_Password}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ยังไม่มีบัญชีผู้ใช้งาน?{' '}
            <Link href="/coworking/signup" className="text-indigo-600 font-medium hover:text-indigo-500">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}