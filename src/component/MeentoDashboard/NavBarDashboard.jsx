import React, { useContext } from 'react'
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../../lib/AuthContext";
import { useNavigate } from 'react-router-dom';

function NavBarDashboard() {

  const { upDatePage, activeComponent } = useContext(GlobalContext)
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className=' fixed top-0 left-0  h-full   pt-10 '>
      <div className=' w-full flex justify-center items-center '>
        <img src="/image/logo.png.png" className=' h-8' alt="" />
      </div>
      <div className=' mt-14 flex flex-col px-5 gap-6 '>
        <div onClick={() => upDatePage('OverView')} className={`${activeComponent === 'OverView' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/overViewIcon.png" className='h-7' alt="" /></span>
          Overview
        </div>
        <div onClick={() => upDatePage('Explore')} className={`${activeComponent === 'Explore' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/exploreIcon.png" className='h-7' alt="" /></span>
          Explore
        </div>
        <div onClick={() => upDatePage('Message')} className={`${activeComponent === 'Message' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/messagenavIcon.png" className='h-7' alt="" /></span>
          Message
        </div>
        <div onClick={() => upDatePage('Booking')} className={`${activeComponent === 'Booking' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 cursor-pointer font-medium items-center`}>
          <span><img src="/image/BookingIcon.png" className='h-7' alt="" /></span>
          Bookings
        </div>
        <div onClick={() => upDatePage('Profile')} className={`${activeComponent === 'Profile' ? 'text-customOrange' : 'text-gray-500'} flex gap-4 font-medium cursor-pointer items-center`}>
          <span><img src="/image/ProfileIcon.png" className='h-7' alt="" /></span>
          My Profile
        </div>
     
      </div>

      <div className=' mt-36 flex flex-col px-5 gap-4'>
        <h1 className=' text-customDarkBlue text-lg font-medium'>Manage Account</h1>
        <div className=' mt-8   flex flex-col gap-6'>
          <div onClick={() => upDatePage('Setting')} className={`${activeComponent === 'Setting' ? 'text-customOrange' : 'text-gray-500'}  flex  gap-4  cursor-pointer font-medium items-center`}>
            <span><img src="/image/navBarSettingIcon.png" className=' h-7' alt="" /></span> Settings
          </div>      
          <div onClick={handleLogout} className="flex gap-4 cursor-pointer font-medium items-center text-gray-500 hover:text-red-500">
            <span> <FontAwesomeIcon icon={faDeleteLeft}/> </span> Log Out
          </div>
        </div>
      </div>
    </section>
  );
}

export default NavBarDashboard;