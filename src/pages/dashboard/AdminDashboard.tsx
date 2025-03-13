import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Students from '../admin/Students';
import Rooms from '../admin/Rooms';
import RoomAllocation from '../admin/RoomAllocation';
import { supabase } from '../../services/supabase';

interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  pendingBookings: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total students
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('role', 'student');

        // Fetch rooms data
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*');

        if (roomsError) throw roomsError;

        const totalRooms = roomsData?.length || 0;
        const occupiedRooms = roomsData?.filter(room => room.is_occupied)?.length || 0;

        // Update stats
        setStats(prev => ({
          ...prev,
          totalStudents: studentCount || 0,
          totalRooms,
          occupiedRooms,
          pendingBookings: 0 // This will be updated when we implement bookings
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout role="admin">
      <Routes>
        <Route path="/" element={
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Total Rooms</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.totalRooms}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Occupied Rooms</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">{stats.occupiedRooms}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-medium">Pending Bookings</h3>
                <p className="mt-2 text-3xl font-bold text-orange-600">{stats.pendingBookings}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate('students')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Manage Students
                </button>
                <button 
                  onClick={() => navigate('rooms')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Manage Rooms
                </button>
                <button 
                  onClick={() => navigate('allocations')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Room Allocations
                </button>
              </div>
            </div>
          </div>
        } />
        <Route path="students" element={<Students />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="allocations" element={<RoomAllocation />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard; 