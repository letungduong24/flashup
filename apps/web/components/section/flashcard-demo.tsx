import React from 'react'
import FlashCard from '../ui/flashcard'
import { describe } from 'node:test'
import PromptInputDemo from '../ui/prompt-input-demo'
import AIResponseDemo from '../ui/ai-response-demo'
import { BackgroundGradient } from '../ui/shadcn-io/background-gradient'

const flashcardData = 
  {
    word: "Aberration",
    meaning: "Sự sai lệch khỏi tiêu chuẩn",
    description: [
      {
        usage: "Nghĩa chung, hành vi sai lệch / khác thường",
        example: "The scientist noted an aberration in the data that required further investigation.",
        translation: "Nhà khoa học đã ghi nhận một sự sai lệch trong dữ liệu cần được điều tra thêm." 
      },
      {
        usage: "Trong khoa học / quang học",
        example: "The telescope's lens suffered from chromatic aberration, causing the stars to appear blurred.",
        translation: "Ống kính của kính viễn vọng bị lỗi quang sai màu, làm các ngôi sao trông mờ." 
      }
    ]
  }

const FlashcardDemo = () => {
  return (
    <div className="z-20 flex justify-center flex-col items-center gap-3">
      <h1 className='text-center text-2xl font-bold z-30'>Học từ vựng bằng Flashcard</h1>
      <BackgroundGradient className='w-full max-w-6xl space-y-4 bg-gray-100 p-4 rounded-2xl dark:bg-zinc-800'>
        <div className="space-y-3">
          <FlashCard data={flashcardData}/>
        </div>
        <div className="w-full space-y-3">
          <PromptInputDemo />
          <AIResponseDemo />
        </div>
      </BackgroundGradient>
    </div>
  )
}

export default FlashcardDemo