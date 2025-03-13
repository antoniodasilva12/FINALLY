import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { supabase } from '../../services/supabase';
import Room from '../student/Room';
import BookRoom from '../student/BookRoom';

interface StudentRoom {
  room_number: string;
  type: string;
  floor: number;
}

interface StudentBooking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment_status: string;
}

const StudentDashboard = () => {
  const [room, setRoom] = useState<StudentRoom | null>(null);
  const [booking, setBooking] = useState<StudentBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get student's room
          const { data: roomData } = await supabase
            .from('profiles')
            .select('room_id')
            .eq('id', user.id)
            .single();

          if (roomData?.room_id) {
            const { data: room } = await supabase
              .from('rooms')
              .select('room_number, type, floor')
              .eq('id', roomData.room_id)
              .single();
            
            setRoom(room);
          }

          // Get student's latest booking
          const { data: bookingData } = await supabase
            .from('bookings')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          setBooking(bookingData);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="room" element={<Room />} />
        <Route path="book" element={<BookRoom />} />
      </Routes>
    </DashboardLayout>
  );
};

const StudentHome = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/student/room')}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">View My Room</h3>
          <p className="mt-2 text-sm text-gray-600">Check your current room details</p>
        </button>

        <button
          onClick={() => navigate('/student/book')}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">Book a Room</h3>
          <p className="mt-2 text-sm text-gray-600">Browse and book available rooms</p>
        </button>

        <button
          onClick={() => navigate('/student/bookings')}
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">My Bookings</h3>
          <p className="mt-2 text-sm text-gray-600">View your booking history</p>
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard; 