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

const BookRoom = () => {
  const [loading, setLoading] = useState(true);
  const [currentAllocation, setCurrentAllocation] = useState<RoomAllocation | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    fetchCurrentAllocationAndRooms();
  }, []);

  const fetchCurrentAllocationAndRooms = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if student has a current allocation
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

      // If student has an allocation, set it and return
      if (allocationData) {
        const typedData = allocationData as unknown as RoomAllocationResponse;
        setCurrentAllocation({
          id: typedData.id,
          start_date: typedData.start_date,
          end_date: typedData.end_date,
          room: typedData.rooms
        });
        return;
      }

      // If no allocation, fetch available rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .not('id', 'in', (
          supabase
            .from('room_allocations')
            .select('room_id')
            .is('end_date', null)
        ));

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError);
        throw roomsError;
      }

      setAvailableRooms(roomsData as Room[] || []);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch room details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async (roomId: string) => {
    try {
      setBookingInProgress(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: bookingError } = await supabase
        .from('room_allocations')
        .insert({
          student_id: user.id,
          room_id: roomId,
          start_date: new Date().toISOString(),
          end_date: null
        });

      if (bookingError) throw bookingError;

      // Refresh the data
      await fetchCurrentAllocationAndRooms();
      
    } catch (err) {
      console.error('Error booking room:', err);
      setError('Failed to book room. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

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

  if (currentAllocation) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Book a Room</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              You are currently allocated to Room {currentAllocation.room.room_number}
            </p>
            <p className="text-sm text-gray-500">
              You cannot book another room while you have an active allocation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Available Rooms</h2>
          
          {availableRooms.length === 0 ? (
            <div className="text-center text-gray-600">
              No rooms are available for booking at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRooms.map((room) => (
                <div key={room.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900">Room {room.room_number}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">Floor: {room.floor}</p>
                    <p className="text-sm text-gray-600">Capacity: {room.capacity} persons</p>
                    <p className="text-sm font-medium text-green-600">
                      ${room.price_per_month}/month
                    </p>
                  </div>
                  <button
                    onClick={() => handleBookRoom(room.id)}
                    disabled={bookingInProgress}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookRoom; 