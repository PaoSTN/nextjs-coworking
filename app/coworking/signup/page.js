'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    User_Name: '',
    First_Name: '',
    Last_Name: '',
    U_Password: '',
    U_PasswordConfirm: '',
    U_Phone: '',
    U_Email: '',
    User_Type: 'User' // ค่าเริ่มต้นตามที่กำหนดในสคีมา
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    // ตรวจสอบรหัสผ่านตรงกัน
    if (formData.U_Password !== formData.U_PasswordConfirm) {
      setError('รหัสผ่านไม่ตรงกัน')
      return false
    }
    
    // ตรวจสอบว่าข้อมูลสำคัญครบถ้วน
    if (!formData.User_Name || !formData.First_Name || !formData.Last_Name || 
        !formData.U_Password || !formData.U_Email || !formData.U_Phone) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return false
    }
    
    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.U_Email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }
    
    // ตรวจสอบเบอร์โทรศัพท์ (ต้องกรอก)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.U_Phone)) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // ตรวจสอบข้อมูลก่อนส่ง
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // แยกข้อมูลยืนยันรหัสผ่านออกก่อนส่ง
      const { U_PasswordConfirm, ...dataToSubmit } = formData
      
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })
      
      // ตรวจสอบสถานะการตอบกลับ
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ไม่สามารถสร้างบัญชีได้')
      }
      
      // แสดงข้อความแจ้งเตือนแบบ alert เหมือน JOptionPane ใน Java
      alert('ลงทะเบียนสำเร็จ')
      
      // นำทางกลับไปยังหน้าหลัก coworking
      router.push('/coworking')
      
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            สร้างบัญชีผู้ใช้
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            หรือ{' '}
            <Link href="/coworking/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              เข้าสู่ระบบด้วยบัญชีที่มีอยู่
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Username */}
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
            
            {/* First Name */}
            <div>
              <label htmlFor="First_Name" className="block text-sm font-medium text-gray-700">
                ชื่อ
              </label>
              <input
                id="First_Name"
                name="First_Name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                value={formData.First_Name}
                onChange={handleChange}
              />
            </div>
            
            {/* Last Name */}
            <div>
              <label htmlFor="Last_Name" className="block text-sm font-medium text-gray-700">
                นามสกุล
              </label>
              <input
                id="Last_Name"
                name="Last_Name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                value={formData.Last_Name}
                onChange={handleChange}
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="U_Email" className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="U_Email"
                name="U_Email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                value={formData.U_Email}
                onChange={handleChange}
              />
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="U_Phone" className="block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์ (ตัวเลข 10 หลัก)
              </label>
              <input
                id="U_Phone"
                name="U_Phone"
                type="tel"
                maxLength="10"
                required
                pattern="\d{10}"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                value={formData.U_Phone}
                onChange={(e) => {
                  // อนุญาตให้ป้อนเฉพาะตัวเลขเท่านั้น
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setFormData({
                    ...formData,
                    U_Phone: value
                  });
                }}
              />
            </div>
            
            {/* Password */}
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
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="U_PasswordConfirm" className="block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="U_PasswordConfirm"
                name="U_PasswordConfirm"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                value={formData.U_PasswordConfirm}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {isSubmitting ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}