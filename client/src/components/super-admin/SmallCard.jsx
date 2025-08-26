import React from 'react'

export default function SmallCard({size, number}) {
  return (
    <div className='flex flex-col justify-center items-center leading-tight bg-black rounded-lg p-5'>
        <p className='text-white font-bold text-2xl'>{size}</p>
        <h1 className='text-primaryYellow font-black text-fluid-4xl'>{number}</h1>
    </div>
  )
}
