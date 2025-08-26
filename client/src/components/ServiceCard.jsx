import React from 'react'

export default function ServiceCard(props) {
  return (
     <div className='bg-primaryYellow px-5 pt-6 pb-10 rounded-3xl flex flex-col items-center justify-center gap-5 transition-transform hover:scale-105'>
        <img src={props.image} className='w-[220px] h-[240px] object-contain' />
        <div className="flex flex-col gap-3 items-center justify-center">
            <h3 className='text-5xl font-bold'>{props.title}</h3>
            <h4 className='w-[280px] h-[60px] text-center opacity-60'>{props.description}</h4>
        </div>
    </div>
  )
}
