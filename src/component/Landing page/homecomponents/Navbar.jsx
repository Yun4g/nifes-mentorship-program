import React from 'react'
import { NavLink } from 'react-router-dom'
import { asset } from '../../../assets/assets'

const Navbar = () => {
  return (
    <div>
      <div className='flex items-center justify-between px-10 py-4'>
      <ul className='flex items-center justify-between gap-x-5'>
        <img src={asset.logo} alt="" />
        <NavLink to="/mentee">Mentee</NavLink>
        <NavLink to="/mentor">Mentor</NavLink>
      </ul>
      <ul className='flex items-center justify-between gap-x-5'>
        <button to="/register" className='border border-orange-600 px-3 py-1 rounded-xl text-orange-600 '>Get started</button>
        <button className='border border-orange-600 px-3 py-1 rounded-xl bg-orange-600 text-orange-100'>Sign in</button>
      </ul>
      </div>
      <hr className='mb-16'/>
    </div>
  )
}

export default Navbar
