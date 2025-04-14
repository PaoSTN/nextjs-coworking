'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TopupHistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'Topup', 'Booking'
  const [sortOrder, setSortOrder] = useState('DESC') // 'DESC', 'ASC'
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  useEffect(() => {
    // ตรวจสอบการล็อกอินและดึงข้อมูลผู้ใช้
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // ถ้าไม่มีการล็อกอิน ให้เปลี่ยนเส้นทางไปหน้าล็อกอิน
          router.push('/coworking/login')
          return
        }
      } catch (err) {
        console.error('Error accessing localStorage:', err)
        setError('ไม่สามารถตรวจสอบการล็อกอินได้ กรุณาล็อกอินใหม่')
        return
      }
    }

  }, [router])

  // เมื่อข้อมูลผู้ใช้พร้อม ให้ดึงข้อมูลรายการธุรกรรม
  useEffect(() => {
    if (user && user.User_ID) {
      fetchTransactions()
    }
  }, [user, filter, sortOrder, dateRange])

  // ดึงข้อมูลรายการธุรกรรม
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // สร้าง URL parameters
      const params = new URLSearchParams()
      params.append('userId', user.User_ID)
      
      if (filter !== 'all') {
        params.append('type', filter)
      }
      
      if (dateRange.from) {
        params.append('fromDate', dateRange.from)
      }
      
      if (dateRange.to) {
        params.append('toDate', dateRange.to)
      }
      
      params.append('sortOrder', sortOrder)
      
      const response = await fetch(`/api/transactions/history?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.transactions || [])
      } else {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(`ไม่สามารถโหลดข้อมูลประวัติการทำรายการได้: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันช่วย
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }

  const formatAmount = (amount, type) => {
    const number = parseFloat(amount).toFixed(2)
    if (type === 'Topup') {
      return `+฿${number}`
    } else {
      return `-฿${number}`
    }
  }

  // ฟังก์ชันส่งออกข้อมูลเป็น CSV
  const exportToCSV = () => {
    const csvData = [
      ['วันที่', 'รายละเอียด', 'ประเภท', 'จำนวนเงิน', 'สถานะ'],
      ...transactions.map(t => [
        new Date(t.Transaction_Date).toLocaleDateString('th-TH'),
        t.Description,
        t.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง',
        t.Amount,
        t.Status === 'Success' ? 'สำเร็จ' : t.Status === 'Pending' ? 'รอดำเนินการ' : 'ยกเลิก'
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'topup-history.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ฟังก์ชันแสดงรายละเอียดธุรกรรม
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction)
  }

  // ฟังก์ชันปิดหน้าต่างรายละเอียด
  const handleCloseDetail = () => {
    setSelectedTransaction(null)
  }

  // แสดงหน้าจอโหลด
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  // แสดงหน้าจอเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-lg w-full">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ส่วนหัว */}
        <div className="mb-8">
          <Link href="/coworking/home" className="text-indigo-600 hover:text-indigo-800 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            กลับไปยังหน้าหลัก
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ประวัติการทำรายการ</h1>
              <p className="text-gray-600 mt-1">ดูประวัติการเติมเงินและการจองของคุณ</p>
            </div>
            
            {user && (
              <div className="bg-white px-4 py-2 rounded-md shadow-sm mt-4 sm:mt-0">
                <p className="text-sm text-gray-600">ยอดเงินคงเหลือ</p>
                <p className="text-xl font-bold text-green-600">฿{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* ตัวกรองและการค้นหา */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ตัวกรองประเภท */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                ประเภท
              </label>
              <select
                id="type-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="Topup">เติมเงิน</option>
                <option value="Booking">การจอง</option>
              </select>
            </div>
            
            {/* ช่วงวันที่ */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="flex-1">
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  id="date-from"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  id="date-to"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            {/* การเรียงลำดับและการส่งออก */}
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                  เรียงลำดับ
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="DESC">ล่าสุด</option>
                  <option value="ASC">เก่าสุด</option>
                </select>
              </div>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                ส่งออก CSV
              </button>
            </div>
          </div>
        </div>
        
        {/* ตารางรายการ */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รายละเอียด
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนเงิน
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.Transaction_Date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.Description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.Transaction_Type === 'Topup' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {transaction.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        transaction.Transaction_Type === 'Topup' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatAmount(transaction.Amount, transaction.Transaction_Type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.Status === 'Success' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.Status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.Status === 'Success' 
                            ? 'สำเร็จ' 
                            : transaction.Status === 'Pending' 
                              ? 'รอดำเนินการ' 
                              : 'สำเร็จ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* สรุปรายการ */}
          {transactions.length > 0 && (
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  แสดง {transactions.length} รายการ
                </p>
                <div className="text-right">
                  <p className="text-sm text-gray-600">รวมเติมเงิน: <span className="font-medium text-green-600">
                    +฿{transactions
                      .filter(t => t.Transaction_Type === 'Topup' && t.Status === 'Success')
                      .reduce((sum, t) => sum + parseFloat(t.Amount), 0)
                      .toFixed(2)}
                  </span></p>
                  <p className="text-sm text-gray-600">รวมค่าใช้จ่าย: <span className="font-medium text-red-600">
                    -฿{transactions
                      .filter(t => t.Transaction_Type === 'Booking' && t.Status === 'Success')
                      .reduce((sum, t) => sum + parseFloat(t.Amount), 0)
                      .toFixed(2)}
                  </span></p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* ปุ่มกลับไปยังหน้าเติมเงิน */}
        <div className="mt-6 flex justify-center space-x-4">
          <Link href="/coworking/topup" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            ไปที่หน้าเติมเงิน
          </Link>
          <Link href="/coworking/meetingroom" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm4-6a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            ไปยังหน้าจองห้องประชุม
          </Link>
        </div>
      </div>

      {/* Modal รายละเอียดธุรกรรม */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">รายละเอียดธุรกรรม</h3>
              <button 
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">หมายเลขธุรกรรม:</span>
                <span className="font-medium">{selectedTransaction.Transaction_ID}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">วันที่ทำรายการ:</span>
                <span className="font-medium">{formatDate(selectedTransaction.Transaction_Date)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">ประเภทธุรกรรม:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTransaction.Transaction_Type === 'Topup' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {selectedTransaction.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">จำนวนเงิน:</span>
                <span className={`font-medium ${
                  selectedTransaction.Transaction_Type === 'Topup' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {selectedTransaction.Transaction_Type === 'Topup' ? '+' : '-'}
                  ฿{parseFloat(selectedTransaction.Amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">สถานะ:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTransaction.Status === 'Success' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedTransaction.Status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {selectedTransaction.Status === 'Success' 
                    ? 'สำเร็จ' 
                    : selectedTransaction.Status === 'Pending' 
                      ? 'รอดำเนินการ' 
                      : 'ยกเลิก'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">วิธีชำระเงิน:</span>
                <span className="font-medium">{selectedTransaction.Payment_Method || '-'}</span>
              </div>
              {selectedTransaction.Reference_ID && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">เลขอ้างอิง:</span>
                  <span className="font-medium">{selectedTransaction.Reference_ID}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-800 mb-2">รายละเอียด</h4>
              <p className="text-gray-600">{selectedTransaction.Description}</p>
              
              {/* แสดงข้อมูลเพิ่มเติมเฉพาะกรณีจองห้อง */}
              {selectedTransaction.Transaction_Type === 'Booking' && selectedTransaction.BookingDetails && (
                <div className="mt-4 bg-blue-50 p-3 rounded-md">
                  <h5 className="font-medium text-blue-800 mb-1">ข้อมูลการจอง</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>ห้อง: {selectedTransaction.BookingDetails.roomNumber}</li>
                    <li>วันที่จอง: {selectedTransaction.BookingDetails.bookingDate}</li>
                    <li>ช่วงเวลา: {selectedTransaction.BookingDetails.timeSlot}</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              {selectedTransaction.Status === 'Pending' && (
                <button 
                  className="mr-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  onClick={() => {
                    // ในอนาคตสามารถเพิ่มฟังก์ชันยกเลิกธุรกรรมได้
                    alert('ฟังก์ชันยกเลิกธุรกรรมยังไม่เปิดให้ใช้งาน');
                  }}
                >
                  ยกเลิกธุรกรรม
                </button>
              )}
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                onClick={handleCloseDetail}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}