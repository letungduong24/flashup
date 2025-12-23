'use client';
import { Button } from '../ui/button';
const Hero = () => {
  return (
    <div className="z-20 flex flex-col items-center mt-5 gap-3">
        <div className='text-foreground flex flex-col items-center gap-2 text-center mx-4'>
            <h3 className='text-4xl font-bold'>Học tiếng Anh cùng FlashUp.</h3>
            <p>Học tiếng Anh cùng AI mọi lúc, mọi nơi, tiến bộ từng ngày.</p>
        </div>
        <div className='flex gap-3'>
            <Button size='lg' className='bg-primary text-primary-foreground hover:bg-primary/90'>Bắt đầu</Button>
        </div>
    </div>
  )
}

export default Hero