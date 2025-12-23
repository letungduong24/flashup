import React from 'react'
import { Navbar01 } from './ui/shadcn-io/navbar-01'

export default function NavbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col h-screen'>
        <Navbar01 />
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
  )
}
