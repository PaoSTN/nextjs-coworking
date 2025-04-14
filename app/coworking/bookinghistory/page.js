'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500 text-white";
      case "Cancelled":
        return "bg-red-500 text-white";
      case "Completed":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "Confirmed":
        return "ยืนยันแล้ว";
      case "Cancelled":
        return "ยกเลิกแล้ว";
      case "Completed":
        return "เสร็จสิ้น";
      default:
        return status;
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle()}`}>
      {translateStatus(status)}
    </span>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-60">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">กำลังโหลด...</p>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-lg p-10 text-center shadow-md border border-gray-200">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="w-16 h-16 mx-auto text-gray-400 mb-4"
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบประวัติการจอง</h3>
    <p className="text-gray-600 mb-6">คุณยังไม่เคยจองห้องประชุม</p>
    <Link href="/booking" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
      จองห้องประชุม
    </Link>
  </div>
);

const RoomTypeTag = ({ type }) => {
  const getBgColor = () => {
    switch (type) {
      case "Type A":
        return "bg-blue-100 text-blue-700";
      case "Type B":
        return "bg-green-100 text-green-700";
      case "Type C":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getBgColor()}`}>
      {type}
    </span>
  );
};

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return null;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return parsedUser;
      } catch (err) {
        console.error("Error parsing user data:", err);
        localStorage.removeItem("user");
        router.push("/login");
        return null;
      }
    };

    const fetchBookingHistory = async (userId) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bookings/history?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "ไม่สามารถดึงข้อมูลประวัติการจองได้");
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        console.error("Error fetching booking history:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const userData = checkAuth();
    if (userData) {
      fetchBookingHistory(userData.User_ID);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("th-TH", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return;

    try {
      const response = await fetch(`/api/bookings/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถยกเลิกการจองได้");
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.Booking_ID === bookingId
            ? { ...booking, Booking_Status: "Cancelled" }
            : booking
        )
      );

      alert("ยกเลิกการจองสำเร็จ");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/coworking/topup/history" className="text-gray-600 hover:text-indigo-600 font-medium">
                Topup History
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <Link href="/coworking/topup" className="flex items-center bg-green-50 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition-colors">
                <span className="text-green-800 font-medium mr-1">ยอดเงิน:</span>
                <span className="text-green-600 font-bold">
                  {parseFloat(user.Balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                </span>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ประวัติการจองห้อง</h1>
          <p className="text-gray-600 mt-1">รายการการจองห้องประชุมของคุณทั้งหมด</p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">ห้อง</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">ประเภท</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">ความจุ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">วันที่จอง</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">เวลา</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">ราคา</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.Booking_ID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{booking.Room_Number || booking.Room_ID}</td>
                      <td className="px-4 py-3 text-sm">
                        {booking.Room_Type ? <RoomTypeTag type={booking.Room_Type} /> : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{booking.Capacity ? `${booking.Capacity} คน` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(booking.Booking_Date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {booking.Start_Time && booking.End_Time ? `${formatTime(booking.Start_Time)} - ${formatTime(booking.End_Time)}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {typeof booking.Total_Price === 'number' ? `${booking.Total_Price.toFixed(2)} บาท` : `${parseFloat(booking.Total_Price).toFixed(2)} บาท`}
                      </td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={booking.Booking_Status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => router.push(`/booking/detail/${booking.Booking_ID}`)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">ดูรายละเอียด</button>
                          {booking.Booking_Status === "Confirmed" && (
                            <button onClick={() => handleCancelBooking(booking.Booking_ID)} className="text-red-600 hover:text-red-800 font-medium text-sm">ยกเลิก</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <div className="flex-1 flex justify-between">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>ก่อนหน้า</button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>ถัดไป</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
