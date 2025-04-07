import React from 'react'
import { Button } from './button'
import { asset } from '@/assets/assets'
import { Link } from 'react-router-dom'

const Potential = () => {
  return (
    <div className='py-20 '>
      <div className="relative bg-[url('/Section5.png')] bg-center bg-cover sm:h-80 h-40 w-100 rounded-xl mx-6 sm:mx-10">
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-orange-50 '>
        <h2 className='text-[12px] sm:text-2xl lg:text-4xl font-bold'>Unlock Your Potential with <br /> Expert Guidance</h2>
        
      <Button as={Link} to="/sign-up" className='text-sm sm:text-lg sm:mt-10 mt-5 p-4 bg-orange-50 text-orange-500 rounded-xl'> Join Us Now</Button> 
      </div>
      
    </div>
    </div>
  )
}

export default Potential
