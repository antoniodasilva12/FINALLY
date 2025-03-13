import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { FiHome, FiLogOut } from 'react-icons/fi';
import { IoBedOutline } from 'react-icons/io5';
import { BsCalendarCheck, BsPersonCircle } from 'react-icons/bs';
import { MdOutlineBedroomParent } from 'react-icons/md';

interface SidebarProps {
  role: 'admin' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student', icon: <FiHome className="w-6 h-6" />, text: 'Dashboard' },
    { to: '/student/room', icon: <IoBedOutline className="w-6 h-6" />, text: 'My Room' },
    { to: '/student/book', icon: <MdOutlineBedroomParent className="w-6 h-6" />, text: 'Book Room' },
    { to: '/student/bookings', icon: <BsCalendarCheck className="w-6 h-6" />, text: 'My Bookings' },
    { to: '/student/profile', icon: <BsPersonCircle className="w-6 h-6" />, text: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <FiHome className="w-6 h-6" />, text: 'Dashboard' },
    { to: '/admin/students', icon: <BsPersonCircle className="w-6 h-6" />, text: 'Students' },
    { to: '/admin/rooms', icon: <IoBedOutline className="w-6 h-6" />, text: 'Rooms' },
    { to: '/admin/allocations', icon: <MdOutlineBedroomParent className="w-6 h-6" />, text: 'Room Allocations' },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Hostel Management</h1>
        </div>

        <nav className="flex-1 mt-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {link.icon}
              <span className="ml-3">{link.text}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <FiLogOut className="w-6 h-6" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 