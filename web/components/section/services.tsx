import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

const Services = () => {
  return (
    <div>
        <div className="flex justify-center mx-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl">
            <Card className='w-full'>
              <CardHeader>
                <CardTitle>Hình ảnh minh họa</CardTitle>
                <CardDescription>Hình ảnh minh họa cho phần hero</CardDescription>
              </CardHeader>            
              <CardContent>
                <p>Hello</p>
              </CardContent>
            </Card>
            <Card className='w-full'>
              <CardHeader>
                <CardTitle>Hình ảnh minh họa</CardTitle>
                <CardDescription>Hình ảnh minh họa cho phần hero</CardDescription>
              </CardHeader>            
              <CardContent>
                <p>Hello</p>
              </CardContent>
            </Card>
            <Card className='w-full'>
              <CardHeader>
                <CardTitle>Hình ảnh minh họa</CardTitle>
                <CardDescription>Hình ảnh minh họa cho phần hero</CardDescription>
              </CardHeader>            
              <CardContent>
                <p>Hello</p>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}

export default Services