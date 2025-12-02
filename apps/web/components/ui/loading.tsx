import React from 'react'
import { Spinner } from './spinner'

const Loading = () => {
  return (
    <div className='h-screen w-full flex justify-center items-center dark:bg-background'>
        <Spinner className='size-8' />
    </div>
  )
}

export default Loading