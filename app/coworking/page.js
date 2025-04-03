'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CoworkingPage() {
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState('')

  // Check URL for success parameter on component mount
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    if (success) {
      // Show alert if success parameter exists
      alert(success)
      // Clear the URL parameter after showing the alert
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSignupClick = () => {
    router.push('/coworking/signup')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg max-w-md w-full p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Co Working Space</h1>
          <p className="mt-2 text-gray-600">ยินดีต้อนรับสู่บริการพื้นที่ทำงานร่วมของเรา</p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSignupClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            สมัครสมาชิก
          </button>
          
          <Link href="/coworking/login">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-md transition duration-200">
              เข้าสู่ระบบ
            </button>
          </Link>
        </div>

      
      </div>
    </div>
  )
}