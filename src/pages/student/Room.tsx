import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface Room {
  id: string;
  room_number: string;
  floor: number;
  capacity: number;
  price_per_month: number;
}

interface RoomAllocation {
  id: string;
  room: Room;
  start_date: string;
  end_date: string | null;
}

interface RoomAllocationResponse {
  id: string;
  start_date: string;
  end_date: string | null;
  rooms: Room;
}

const Room = () => {
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState<RoomAllocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentRoom = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        console.log('Fetching for user:', user.id);

        // Fetch room allocation with room details in a single query
        const { data: allocationData, error: allocationError } = await supabase
          .from('room_allocations')
          .select(`
            id,
            start_date,
            end_date,
            rooms!inner (
              id,
              room_number,
              floor,
              capacity,
              price_per_month
            )
          `)
          .eq('student_id', user.id)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (allocationError) {
          console.error('Error fetching allocation:', allocationError);
          throw allocationError;
        }

        console.log('Allocation data:', allocationData);

        if (allocationData) {
          const typedData = allocationData as unknown as RoomAllocationResponse;
          const formattedAllocation: RoomAllocation = {
            id: typedData.id,
            start_date: typedData.start_date,
            end_date: typedData.end_date,
            room: typedData.rooms
          };
          setAllocation(formattedAllocation);
        }
        
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch room details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentRoom();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Room</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-4">No room has been allocated to you yet.</p>
            <p className="text-sm text-gray-500">Please contact the hostel administration for room allocation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Room</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Room Number</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{allocation.room.room_number}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Floor</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{allocation.room.floor}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">{allocation.room.capacity} persons</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price per Month</h3>
                <p className="mt-1 text-lg font-semibold text-green-600">${allocation.room.price_per_month}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Allocated Since</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(allocation.start_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room; 