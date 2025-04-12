'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MeetingRoomTypeA() {
  const router = useRouter()
  const [rooms, setRooms] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // วันที่ขั้นต่ำและสูงสุดที่สามารถจองได้
  const today = new Date()
  const minDate = today.toISOString().split('T')[0]
  const maxDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0]

  useEffect(() => {
    // ตรวจสอบการล็อกอิน - แก้ไขให้ทำงานเฉพาะในฝั่ง client
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Error accessing localStorage:', err)
      }
    }
    
    // ดึงข้อมูลช่วงเวลาและตั้งค่าเริ่มต้น (จะทำแค่ครั้งแรกเท่านั้น)
    const fetchInitialData = async () => {
      try {
        // ดึงข้อมูลช่วงเวลา
        const timeSlotsResponse = await fetch('/api/timeslots')
        if (!timeSlotsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลช่วงเวลาได้')
        }
        const timeSlotsData = await timeSlotsResponse.json()
        
        setTimeSlots(timeSlotsData.timeSlots || [])
        if (timeSlotsData.timeSlots && timeSlotsData.timeSlots.length > 0 && !selectedTimeSlot) {
          setSelectedTimeSlot(timeSlotsData.timeSlots[0].Time_Slot_ID.toString() || '')
        }
        if (!selectedDate) {
          setSelectedDate(minDate) // ตั้งค่าวันที่เริ่มต้นเป็นวันนี้
        }
      } catch (err) {
        console.error('Error fetching timeslots:', err)
        setError('ไม่สามารถโหลดข้อมูลช่วงเวลา กรุณาลองใหม่อีกครั้ง')
      }
    }
    
    fetchInitialData()
  }, [minDate]) // ทำงานครั้งแรกเท่านั้น
  
  // แยกการดึงข้อมูลห้องเป็นอีก useEffect หนึ่ง ซึ่งจะทำงานเมื่อวันที่หรือช่วงเวลาเปลี่ยน
  useEffect(() => {
    // ดึงข้อมูลห้องประชุม
    const fetchRooms = async () => {
      if (!selectedDate || !selectedTimeSlot) return; // ไม่ดึงข้อมูลถ้ายังไม่มีการเลือกวันที่หรือช่วงเวลา
      
      try {
        setLoading(true)
        // ดึงข้อมูลห้องประชุมประเภท A พร้อมส่งวันที่และช่วงเวลาที่เลือก
        const roomsResponse = await fetch(`/api/rooms?type=Type%20A&date=${selectedDate}&timeSlot=${selectedTimeSlot}`)
        if (!roomsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลห้องประชุมได้')
        }
        const roomsData = await roomsResponse.json()
        
        setRooms(roomsData.rooms || [])
      } catch (err) {
        console.error('Error fetching rooms:', err)
        setError('ไม่สามารถโหลดข้อมูลห้อง กรุณาลองใหม่อีกครั้ง')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRooms()
  }, [selectedDate, selectedTimeSlot]) // ทำงานเมื่อวันที่หรือช่วงเวลาเปลี่ยน

  // คำนวณราคาตามช่วงเวลา
  const calculatePrice = (basePrice, slotId) => {
    // ตรวจสอบว่า basePrice เป็นตัวเลขหรือไม่
    if (typeof basePrice !== 'number') {
      basePrice = Number(basePrice) || 0
    }
    
    // ตรวจสอบว่า slotId ถูกต้องหรือไม่
    if (!slotId || !timeSlots.length) return basePrice
    
    const slotIdNum = parseInt(slotId)
    const slot = timeSlots.find(slot => slot.Time_Slot_ID === slotIdNum)
    if (!slot) return basePrice
    
    // ใช้ราคาตามที่กำหนด
    switch(slot.Slot_Name) {
      case 'Morning':
      case 'Afternoon':
        return basePrice
      case 'Full Day':
        return basePrice * 1.75
      default:
        return basePrice
    }
  }

  // ฟังก์ชันเมื่อกดปุ่มจองห้อง
  const handleBookingClick = (room) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจอง')
      router.push('/coworking/login')
      return
    }
    
    if (!selectedTimeSlot) {
      alert('กรุณาเลือกช่วงเวลาที่ต้องการจอง')
      return
    }
    
    if (!selectedDate) {
      alert('กรุณาเลือกวันที่ต้องการจอง')
      return
    }
    
    // เช็คว่ามีเงินพอหรือไม่
    const totalPrice = calculatePrice(room.Price, selectedTimeSlot)
    if (parseFloat(user.Balance) < totalPrice) {
      alert('ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำการจอง')
      return
    }
    
    // ตั้งค่าห้องที่เลือกและแสดงหน้าต่างยืนยัน
    setSelectedRoom(room)
    setShowConfirmModal(true)
  }

  // ฟังก์ชันยกเลิกการจอง
  const handleCancelBooking = () => {
    setShowConfirmModal(false)
    setSelectedRoom(null)
    setBookingError(null)
  }

  // ฟังก์ชันยืนยันการจอง
  const handleConfirmBooking = async () => {
    // แสดงว่ากำลังดำเนินการจอง
    setBookingInProgress(true)
    setBookingError(null)
    
    try {
      // คำนวณราคาทั้งหมด
      const totalPrice = calculatePrice(selectedRoom.Price, selectedTimeSlot)
      
      // เตรียมข้อมูลที่จะส่ง - ส่งข้อมูลผู้ใช้ไปด้วยเพื่อไม่ต้องใช้ localStorage ในฝั่ง server
      const bookingData = {
        userId: user.User_ID,
        roomId: selectedRoom.Room_ID,
        timeSlotId: parseInt(selectedTimeSlot),
        bookingDate: selectedDate,
        totalPrice: totalPrice,
        user: user // ส่งข้อมูลผู้ใช้ไปด้วย
      };
      
      console.log('Sending booking data:', bookingData);
      
      // ส่งข้อมูลไปยัง API เพื่อสร้างการจองและบันทึกลงฐานข้อมูล
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })
      
      // ตรวจสอบว่ามีข้อผิดพลาดหรือไม่
      if (!response.ok) {
        let errorMessage = 'ไม่สามารถจองห้องประชุมได้';
        
        // อ่าน response เป็นข้อความก่อน
        const responseText = await response.text();
        
        try {
          // ลองแปลงเป็น JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // ถ้าไม่ใช่ JSON ใช้ข้อความที่ได้มา
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // ถ้าสำเร็จ แปลงข้อมูลที่ได้รับกลับมา
      const responseText = await response.text();
      const data = JSON.parse(responseText);
        
      // อัพเดท localStorage ด้วยข้อมูลผู้ใช้ที่อัพเดทแล้ว - แก้ไขให้ตรวจสอบก่อนเรียกใช้
      if (typeof window !== 'undefined' && data.user) {
        try {
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch (err) {
          console.error('Error saving to localStorage:', err)
        }
      }
      
      // อัพเดทข้อมูลผู้ใช้ในหน้า
      if (data.user) {
        setUser(data.user)
      }
      
      // แสดงการจองสำเร็จ
      setBookingSuccess(true)
      
    } catch (err) {
      console.error('Booking error:', err)
      setBookingError(err.message || 'เกิดข้อผิดพลาดในการจองห้องประชุม กรุณาลองใหม่อีกครั้ง')
    } finally {
      setBookingInProgress(false)
    }
  }

  // ฟังก์ชันปิดหน้าต่างยืนยันหลังจากจองสำเร็จ
  const handleCloseSuccessModal = () => {
    setShowConfirmModal(false)
    setSelectedRoom(null)
    setBookingSuccess(false)
    
    // ดึงข้อมูลห้องประชุมใหม่เพื่ออัพเดตสถานะห้อง
    const fetchRooms = async () => {
      try {
        const roomsResponse = await fetch(`/api/rooms?type=Type%20A&date=${selectedDate}&timeSlot=${selectedTimeSlot}`)
        if (!roomsResponse.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลห้องประชุมได้')
        }
        const roomsData = await roomsResponse.json()
        setRooms(roomsData.rooms || [])
      } catch (err) {
        console.error('Error fetching rooms:', err)
      }
    }
    
    fetchRooms()
  }

  const getSelectedTimeSlotName = () => {
    const slot = timeSlots.find(slot => slot.Time_Slot_ID === parseInt(selectedTimeSlot))
    return slot ? `${slot.Slot_Name} (${slot.Start_Time.substring(0, 5)} - ${slot.End_Time.substring(0, 5)})` : ''
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

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
        <div className="mb-8">
          <Link href="/coworking/meetingroom" className="text-indigo-600 hover:text-indigo-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            กลับไปยังหน้าประเภทห้องประชุม
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Room Type A</h1>
            <h2 className="text-xl text-gray-700">ห้องประชุมขนาดเล็ก (จำนวน {rooms.length} ห้อง)</h2>
          </div>
          {user && (
            <div className="bg-green-50 px-4 py-2 rounded-md border border-green-200">
              <p className="text-sm text-green-800">ยอดเงินคงเหลือ</p>
              <p className="text-lg font-bold text-green-600">฿{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">รายละเอียดห้องประชุม</h3>
          <ul className="space-y-2 text-gray-600 mb-6">
            <li className="flex items-start">
              <span className="mr-2">•</span> ความจุ 8 คน
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> โต๊ะประชุมทรงสี่เหลี่ยมกับเก้าอี้
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> จอแสดงผล 55 นิ้ว
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> ระบบเสียงคุณภาพสูง
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> ไวไฟความเร็วสูง
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> ระบบประชุมทางไกล
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลเพิ่มเติม</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="mr-2">•</span> สามารถจองล่วงหน้าได้สูงสุด 30 วัน
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> ยกเลิกการจองฟรีล่วงหน้า 36 ชั่วโมง
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> ทุกห้องมีระบบปรับอากาศและระบบเสียง
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span> มีบริการช่วยเหลือด้านเทคนิคตลอดเวลาทำการ
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">เลือกวันและเวลา</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
                วันที่ต้องการจอง
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">* สามารถจองล่วงหน้าได้ไม่เกิน 30 วัน</p>
            </div>
            
            <div>
              <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-2">
                ช่วงเวลาที่ต้องการจอง
              </label>
              <select
                id="timeSlot"
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {timeSlots.map((slot) => (
                  <option key={slot.Time_Slot_ID} value={slot.Time_Slot_ID}>
                    {slot.Slot_Name} ({slot.Start_Time.substring(0, 5)} - {slot.End_Time.substring(0, 5)}) - {slot.Description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">ห้องที่ว่าง</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.Room_ID} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{room.Room_Number}</h4>
                <p className="text-gray-600 mb-4">{room.Description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>ความจุ: {room.Capacity} คน</span>
                  <span>ราคา: ฿{Number(calculatePrice(room.Price, selectedTimeSlot)).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    room.Status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.Status === 'Available' ? 'ว่าง' : 'ไม่ว่าง'}
                  </span>
                  <button
                    onClick={() => handleBookingClick(room)}
                    disabled={room.Status !== 'Available'}
                    className={`px-4 py-2 rounded text-white text-sm font-medium ${
                      room.Status === 'Available' 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {room.Status === 'Available' ? 'จองห้องนี้' : 'ไม่สามารถจองได้'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-8">
            <p>ไม่พบห้องประชุมประเภท A ที่ว่างในขณะนี้ กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
          </div>
        )}
      </div>

      {/* หน้าต่างยืนยันการจอง */}
      {showConfirmModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {!bookingSuccess ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ยืนยันการจองห้องประชุม</h3>
                
                {bookingError && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{bookingError}</span>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">รายละเอียดการจอง</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li><span className="font-medium">ห้องประชุม:</span> {selectedRoom.Room_Number}</li>
                    <li><span className="font-medium">วันที่:</span> {formatDate(selectedDate)}</li>
                    <li><span className="font-medium">ช่วงเวลา:</span> {getSelectedTimeSlotName()}</li>
                    <li><span className="font-medium">ราคา:</span> ฿{Number(calculatePrice(selectedRoom.Price, selectedTimeSlot)).toFixed(0)}</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md mb-4 border border-yellow-200">
                  <p className="text-yellow-700 text-sm">
                    ยอดเงินจะถูกหักจากกระเป๋าเงินของคุณทันที คุณต้องการดำเนินการต่อหรือไม่?
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingInProgress}
                    className="flex-1 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium disabled:bg-green-400"
                  >
                    {bookingInProgress ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={bookingInProgress}
                    className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                  >
                    ยกเลิก
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">จองห้องประชุมสำเร็จ</h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">รายละเอียดการจอง</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li><span className="font-medium">ห้องประชุม:</span> {selectedRoom.Room_Number}</li>
                    <li><span className="font-medium">วันที่:</span> {formatDate(selectedDate)}</li>
                    <li><span className="font-medium">ช่วงเวลา:</span> {getSelectedTimeSlotName()}</li>
                    <li><span className="font-medium">ราคา:</span> ฿{Number(calculatePrice(selectedRoom.Price, selectedTimeSlot)).toFixed(0)}</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-3 rounded-md mb-4 border border-green-200">
                  <p className="text-green-700 text-sm">
                    ยอดเงินได้ถูกหักจากกระเป๋าเงินของคุณเรียบร้อยแล้ว ยอดคงเหลือ: ฿{parseFloat(user.Balance).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
                
                <button
                  onClick={handleCloseSuccessModal}
                  className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  ตกลง
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}