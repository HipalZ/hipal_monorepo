import { useLogin } from '@/components/store/useLogin'
import React, { memo } from 'react'

const Rewards = memo(() => {

    const userDetails = useLogin((s) => s.userDetails)

    return (
        <div className='h-[18rem] bg-black'>

            <h3 className='pt-6 pl-4 text-xl text-white'>
                👋 Hi {userDetails.name}
            </h3>

            <section className='flex items-center gap-4 mx-4 mt-6 justify-evenly'>
                <article className='relative h-[10.75rem] max-h-[10.75rem] overflow-hidden rounded-2xl w-[100%] max-w-[7.75rem] bg-base-300'>
                    <center className='pt-2 text-xl text-white'>Rewards</center>
                    <button className='absolute bottom-0 px-4 py-2 text-sm bg-black'>sankalesh</button>
                </article>
                <article className='relative h-[10.75rem] max-h-[10.75rem] overflow-hidden rounded-2xl w-[100%] max-w-[7.75rem] bg-base-300'>
                    <center className='pt-2 text-xl text-white'>Rewards</center>
                    <button className='absolute bottom-0 px-4 py-2 text-sm bg-black'>sankalesh</button>
                </article>
                <article className='relative h-[10.75rem] max-h-[10.75rem] overflow-hidden rounded-2xl w-[100%] max-w-[7.75rem] bg-base-300'>
                    <center className='pt-2 text-xl text-white'>Rewards</center>
                    <button className='absolute bottom-0 px-4 py-2 text-sm bg-black'>sankalesh</button>
                </article>
            </section>
        </div>
    )
})

export default Rewards