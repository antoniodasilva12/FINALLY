import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { supabase } from '../../services/supabase';

interface Student {
  id: string;
  full_name: string;
  email: string;
  national_id: string;
}

interface Room {
  id: string;
  room_number: string;
  floor: number;
  capacity: number;
  price_per_month: number;
  is_occupied: boolean;
}

interface Allocation {
  id: string;
  student_id: string;
  room_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  student: Student;
  room: Room;
}

const RoomAllocation = () => {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const fetchAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('room_allocations')
        .select(`
          *,
          student:student_id(id, full_name, email, national_id),
          room:room_id(id, room_number, floor, capacity, price_per_month, is_occupied)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllocations(data || []);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      alert('Error fetching allocations. Please try again.');
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_occupied', false)
        .order('room_number');

      if (error) throw error;
      setAvailableRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Error fetching available rooms. Please try again.');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, national_id')
        .eq('role', 'student');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error fetching students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
    fetchAvailableRooms();
    fetchStudents();
  }, []);

  const handleAllocation = async () => {
    if (!selectedStudent || !selectedRoom) return;

    try {
      setLoading(true);

      // Create allocation
      const { error: allocationError } = await supabase
        .from('room_allocations')
        .insert({
          student_id: selectedStudent.id,
          room_id: selectedRoom.id,
          start_date: formData.startDate,
          end_date: formData.endDate || null
        });

      if (allocationError) throw allocationError;

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ is_occupied: true })
        .eq('id', selectedRoom.id);

      if (roomError) throw roomError;

      // Reset form and refresh data
      setSelectedStudent(null);
      setSelectedRoom(null);
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      setIsModalOpen(false);
      
      await Promise.all([
        fetchAllocations(),
        fetchAvailableRooms()
      ]);

      alert('Room allocated successfully!');
    } catch (error) {
      console.error('Error allocating room:', error);
      alert('Error allocating room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeallocate = async (allocation: Allocation) => {
    if (!window.confirm('Are you sure you want to deallocate this room?')) return;

    try {
      setLoading(true);

      // Update allocation end date
      const { error: allocationError } = await supabase
        .from('room_allocations')
        .update({ end_date: new Date().toISOString() })
        .eq('id', allocation.id);

      if (allocationError) throw allocationError;

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ is_occupied: false })
        .eq('id', allocation.room_id);

      if (roomError) throw roomError;

      await Promise.all([
        fetchAllocations(),
        fetchAvailableRooms()
      ]);

      alert('Room deallocated successfully!');
    } catch (error) {
      console.error('Error deallocating room:', error);
      alert('Error deallocating room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.national_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Room Allocation</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Allocate Room
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{allocation.student.full_name}</div>
                      <div className="text-sm text-gray-500">{allocation.student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Room {allocation.room.room_number}</div>
                      <div className="text-sm text-gray-500">Floor {allocation.room.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(allocation.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.end_date ? new Date(allocation.end_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!allocation.end_date && (
                        <button
                          onClick={() => handleDeallocate(allocation)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Deallocate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-6">Allocate Room</h2>
            
            {/* Student Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student by name, email, or ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute right-3 top-3 text-gray-400" />
              </div>
              
              {searchTerm && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-2 hover:bg-gray-50 cursor-pointer ${
                        selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
              <div className="grid grid-cols-3 gap-4">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500'
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="font-medium">Room {room.room_number}</div>
                    <div className="text-sm text-gray-500">Floor {room.floor}</div>
                    <div className="text-sm text-gray-500">{room.capacity} persons</div>
                    <div className="text-sm font-medium text-blue-600">${room.price_per_month}/month</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocation}
                disabled={!selectedStudent || !selectedRoom || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Allocating...' : 'Allocate Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAllocation; 