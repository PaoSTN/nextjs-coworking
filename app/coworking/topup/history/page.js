'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TopupHistoryPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [bookings, setBookings] = useState([])
  const [combinedData, setCombinedData] = useState([])
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
  const [selectedBooking, setSelectedBooking] = useState(null)

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

  // เมื่อข้อมูลผู้ใช้พร้อม ให้ดึงข้อมูลรายการธุรกรรมและการจอง
  useEffect(() => {
    if (user && user.User_ID) {
      fetchTransactions()
      fetchBookings()
    }
  }, [user, dateRange, sortOrder]) // ดึงข้อมูลใหม่เมื่อมีการเปลี่ยนแปลงเรื่องวันที่หรือการเรียงลำดับ

  // รวมข้อมูลและกรองตามประเภท
  useEffect(() => {
    if (transactions.length > 0 || bookings.length > 0) {
      const filteredData = []
      
      // เพิ่มธุรกรรมการเติมเงินหากไม่ได้กรองเฉพาะการจอง
      if (filter === 'all' || filter === 'Topup') {
        filteredData.push(...transactions.filter(t => t.Transaction_Type === 'Topup'))
      }
      
      // เพิ่มธุรกรรมการจองและข้อมูลการจองหากไม่ได้กรองเฉพาะการเติมเงิน
      if (filter === 'all' || filter === 'Booking') {
        // เพิ่มธุรกรรมการจองจากตาราง transactions
        filteredData.push(...transactions.filter(t => t.Transaction_Type === 'Booking'))
        
        // เพิ่มข้อมูลการจองจากตาราง bookings ที่แปลงเป็นรูปแบบธุรกรรม
        const bookingTransactions = bookings.map(booking => ({
          // สร้างข้อมูลธุรกรรมจำลองจากข้อมูลการจอง
          Transaction_ID: `B-${booking.Booking_ID}`,
          Transaction_Date: booking.Booking_Created || booking.Booking_Date,
          Transaction_Type: 'Booking',
          Description: `จองห้อง ${booking.Room_Number || booking.Room_ID} ${booking.Room_Type ? `(${booking.Room_Type})` : ''} วันที่ ${formatDate(booking.Booking_Date, false)}`,
          Amount: booking.Total_Price,
          Status: booking.Booking_Status,
          Payment_Method: booking.Payment_Method,
          Reference_ID: booking.Booking_ID,
          isBookingRecord: true,
          BookingDetails: {
            bookingId: booking.Booking_ID,
            roomId: booking.Room_ID,
            roomNumber: booking.Room_Number,
            roomType: booking.Room_Type,
            capacity: booking.Capacity,
            bookingDate: formatDate(booking.Booking_Date, false),
            timeSlot: booking.Start_Time && booking.End_Time ? `${booking.Start_Time} - ${booking.End_Time}` : '-',
            status: booking.Booking_Status
          },
          originalBooking: booking // เก็บข้อมูลการจองต้นฉบับไว้
        }))
        
        // กรองออกข้อมูลที่ซ้ำซ้อน (เฉพาะกรณีที่มีทั้งในตาราง transactions และ bookings)
        const existingBookingIds = new Set(
          transactions
            .filter(t => t.Transaction_Type === 'Booking' && t.Reference_ID)
            .map(t => t.Reference_ID)
        )
        
        const uniqueBookingTransactions = bookingTransactions.filter(
          bt => !existingBookingIds.has(bt.Reference_ID)
        )
        
        filteredData.push(...uniqueBookingTransactions)
      }
      
      // เรียงลำดับข้อมูลตามวันที่
      const sortedData = filteredData.sort((a, b) => {
        const dateA = new Date(a.Transaction_Date)
        const dateB = new Date(b.Transaction_Date)
        return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB
      })
      
      setCombinedData(sortedData)
    } else {
      setCombinedData([])
    }
  }, [transactions, bookings, filter, sortOrder])

  // ดึงข้อมูลรายการธุรกรรม
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // สร้าง URL parameters
      const params = new URLSearchParams()
      params.append('userId', user.User_ID)
      
      if (dateRange.from) {
        params.append('fromDate', dateRange.from)
      }
      
      if (dateRange.to) {
        params.append('toDate', dateRange.to)
      }
      
      params.append('sortOrder', sortOrder)
      
      const response = await fetch(`/api/transactions/history?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลธุรกรรมได้')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.transactions || [])
      } else {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(`ไม่สามารถโหลดข้อมูลประวัติการทำรายการได้: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ดึงข้อมูลประวัติการจอง
  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      // สร้าง URL parameters สำหรับการกรองวันที่ (ถ้ามี API รองรับ)
      const params = new URLSearchParams()
      params.append('userId', user.User_ID)
      
      // ดึงข้อมูลการจอง
      const response = await fetch(`/api/bookings/history?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลการจองได้')
      }
      
      const data = await response.json()
      setBookings(data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      // ไม่ set error ตรงนี้เพื่อให้ยังแสดงข้อมูลธุรกรรมได้แม้การดึงข้อมูลการจองมีปัญหา
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันช่วย
  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return '-'
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }
    
    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }

  const formatAmount = (amount, type) => {
    if (!amount) return '-'
    
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
      ['วันที่', 'รายละเอียด', 'ประเภท', 'จำนวนเงิน'],
      ...combinedData.map(t => [
        new Date(t.Transaction_Date).toLocaleDateString('th-TH'),
        t.Description,
        t.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง',
        t.Amount
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'transaction-history.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ฟังก์ชันแสดงรายละเอียดธุรกรรม/การจอง
  const handleViewDetail = (item) => {
    if (item.isBookingRecord) {
      setSelectedBooking(item.originalBooking)
    } else {
      setSelectedTransaction(item)
    }
  }

  // ฟังก์ชันปิดหน้าต่างรายละเอียด
  const handleCloseDetail = () => {
    setSelectedTransaction(null)
    setSelectedBooking(null)
  }

  // แสดงหน้าจอโหลด
  if (loading && combinedData.length === 0) {
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
  if (error && combinedData.length === 0) {
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
        
        {/* แสดงสถานะกำลังโหลดข้อมูลเพิ่มเติม */}
        {loading && combinedData.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังโหลดข้อมูลเพิ่มเติม...</span>
          </div>
        )}
        
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
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedData.length > 0 ? (
                  combinedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(item.Transaction_Date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.Description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.Transaction_Type === 'Topup' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.Transaction_Type === 'Topup' ? 'เติมเงิน' : 'จองห้อง'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        item.Transaction_Type === 'Topup' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatAmount(item.Amount, item.Transaction_Type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* สรุปรายการ */}
          {combinedData.length > 0 && (
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  แสดง {combinedData.length} รายการ
                </p>
                <div className="text-right">
                  <p className="text-sm text-gray-600">รวมเติมเงิน: <span className="font-medium text-green-600">
                    +฿{combinedData
                      .filter(t => t.Transaction_Type === 'Topup')
                      .reduce((sum, t) => sum + parseFloat(t.Amount || 0), 0)
                      .toFixed(2)}
                  </span></p>
                  <p className="text-sm text-gray-600">รวมค่าใช้จ่าย: <span className="font-medium text-red-600">
                    -฿{combinedData
                      .filter(t => t.Transaction_Type === 'Booking')
                      .reduce((sum, t) => sum + parseFloat(t.Amount || 0), 0)
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
                    <li>ห้อง: {selectedTransaction.BookingDetails.roomNumber || selectedTransaction.BookingDetails.roomId || '-'}</li>
                    {selectedTransaction.BookingDetails.roomType && <li>ประเภทห้อง: {selectedTransaction.BookingDetails.roomType}</li>}
                    {selectedTransaction.BookingDetails.capacity && <li>ความจุ: {selectedTransaction.BookingDetails.capacity} คน</li>}
                    <li>วันที่จอง: {selectedTransaction.BookingDetails.bookingDate || '-'}</li>
                    <li>ช่วงเวลา: {selectedTransaction.BookingDetails.timeSlot || '-'}</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
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

      {/* Modal รายละเอียดการจอง */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">รายละเอียดการจอง</h3>
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
                <span className="text-gray-600">รหัสการจอง:</span>
                <span className="font-medium">{selectedBooking.Booking_ID}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">วันที่จอง:</span>
                <span className="font-medium">{formatDate(selectedBooking.Booking_Date, false)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">วันที่ทำรายการ:</span>
                <span className="font-medium">{formatDate(selectedBooking.Booking_Created)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">ห้อง:</span>
                <span className="font-medium">{selectedBooking.Room_Number || selectedBooking.Room_ID}</span>
              </div>
              
              {selectedBooking.Room_Type && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">ประเภทห้อง:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedBooking.Room_Type === 'Type A' ? 'bg-blue-100 text-blue-800' :
                    selectedBooking.Room_Type === 'Type B' ? 'bg-green-100 text-green-800' :
                    selectedBooking.Room_Type === 'Type C' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBooking.Room_Type}
                  </span>
                </div>
              )}
              
              {selectedBooking.Capacity && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">ความจุ:</span>
                  <span className="font-medium">{selectedBooking.Capacity} คน</span>
                </div>
              )}
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">เวลา:</span>
                <span className="font-medium">
                  {selectedBooking.Start_Time && selectedBooking.End_Time 
                    ? `${selectedBooking.Start_Time} - ${selectedBooking.End_Time}` 
                    : '-'}
                </span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">ราคา:</span>
                <span className="font-medium text-red-600">฿{parseFloat(selectedBooking.Total_Price).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">วิธีชำระเงิน:</span>
                <span className="font-medium">{selectedBooking.Payment_Method || '-'}</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Link
                href={`/booking/detail/${selectedBooking.Booking_ID}`}
                className="mr-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                ดูรายละเอียดเพิ่มเติม
              </Link>
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