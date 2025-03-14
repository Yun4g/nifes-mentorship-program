import React from 'react'
import { asset } from '../../../assets/assets'

const Hero = () => {
  return (
    <div className='flex items-center justify-between px-1'>
      <div>
          <ul className='grid grid-cols-2 gap-2'>
           <img src={asset.blackman1} alt="" />
           <img src={asset.people} alt="" />
           <img src={asset.closeup} alt="" />
           <img src={asset.frame17} alt="" />
          </ul>
      </div>
      <div className='text-center px-4'>
        <h1 className='text-6xl font-bold text-center'>1-on-1 <br/> 
            Strategic<br/>
            Mentorship
        </h1>
        <p>Experience life-changing mentorship, your path to extraordinary growth starts here.</p>
        <p>what do you want to get better at</p>
      </div>
      <div>
          <ul className='grid grid-cols-2 gap-2'>
           <img src={asset.young} alt="" />
           <img src={asset.confident} alt="" />
           <img src={asset.portrait} alt="" />
           <img src={asset.couple } alt="" />
          </ul>
      </div>
    </div>
  )
}

export default Hero
