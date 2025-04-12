'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TopupPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [amounts, setAmounts] = useState([])
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  useEffect(() => {
    // ตรวจสอบการล็อกอิน
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/coworking/login')
      return
    }
    
    // ดึงข้อมูลผู้ใช้
    setUser(JSON.parse(storedUser))
    
    // ดึงข้อมูลจำนวนเงินเติม
    const fetchAmounts = async () => {
      try {
        const response = await fetch('/api/topup/amounts')
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลจำนวนเงินเติมได้')
        }
        
        const data = await response.json()
        setAmounts(data.amounts)
      } catch (err) {
        console.error('Error fetching topup amounts:', err)
        setError('ไม่สามารถโหลดข้อมูลจำนวนเงินเติมได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAmounts()
  }, [router])
  
  const handleTopup = async () => {
    if (!selectedAmount) {
      setError('กรุณาเลือกจำนวนเงินที่ต้องการเติม')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.User_ID,
          amount: selectedAmount.Amount,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถเติมเงินได้')
      }
      
      // อัพเดท localStorage ด้วยข้อมูลผู้ใช้ที่อัพเดทแล้ว
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      // แสดงข้อความสำเร็จ
      setSuccess(`เติมเงินสำเร็จ จำนวน ${selectedAmount.Amount.toLocaleString('th-TH')} บาท`)
      
      // รีเซ็ตการเลือก
      setSelectedAmount(null)
    } catch (err) {
      console.error('Topup error:', err)
      setError(err.message || 'เกิดข้อผิดพลาดในการเติมเงิน กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
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
          </div>
          
          <div className="flex items-center space-x-4">
            {/* แสดงยอดเงินในกระเป๋า */}
            {user && (
              <div className="flex items-center bg-green-50 px-4 py-2 rounded-md border border-green-200">
                <span className="text-green-800 font-medium mr-1">ยอดเงิน:</span>
                <span className="text-green-600 font-bold">{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
              </div>
            )}
            
            <Link 
              href="/coworking/home"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">เติมเงินเข้ากระเป๋า</h2>
          
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">เลือกจำนวนเงินที่ต้องการเติม</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amounts.map(amount => (
                <button
                  key={amount.Amount_ID}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    selectedAmount && selectedAmount.Amount_ID === amount.Amount_ID
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAmount(amount)}
                >
                  <div className="text-xl font-bold mb-1">{amount.Amount.toLocaleString('th-TH')} บาท</div>
                  <div className="text-sm text-gray-500">{amount.Display_Text}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md mb-6">
            <div>
              <p className="text-sm text-gray-500">ยอดเงินปัจจุบัน</p>
              <p className="text-lg font-bold text-gray-700">{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</p>
            </div>
            {selectedAmount && (
              <div>
                <p className="text-sm text-gray-500">ยอดเงินหลังเติม</p>
                <p className="text-lg font-bold text-green-600">
                  {(parseFloat(user.Balance) + parseFloat(selectedAmount.Amount)).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleTopup}
            disabled={!selectedAmount || isSubmitting}
            className={`w-full py-3 rounded-md font-medium text-white ${
              !selectedAmount || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการเติมเงิน'}
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>* หมายเหตุ: ในระบบจริงจะต้องเชื่อมต่อกับระบบชำระเงิน เช่น บัตรเครดิต, QR Code, Internet Banking</p>
          </div>
        </div>
      </main>
    </div>
  )
}