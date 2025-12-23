import React from 'react'
import FlashCard from '../flashcard/flashcard'
import { FlashcardResponse } from '@/types/flashcard'
import PromptInputDemo from '../ui/prompt-input-demo'
import AIResponseDemo from '../ui/ai-response-demo'
import { BackgroundGradient } from '../ui/shadcn-io/background-gradient'

const flashcardData: FlashcardResponse = {
  id: 'clx1234567890abcdefghij',
  name: "Aberration",
  meaning: "Sự sai lệch khỏi tiêu chuẩn",
  review_count: 3,
  status: "new",
  interval: 0,
  nextReview: null,
  easeFactor: 2.5,
  lapseCount: 0,
  tags: ["noun", "science"],
  folder_id: null,
  audio_url: "https://dictionary.cambridge.org/vi/media/english/uk_pron/u/uka/ukabd/ukabdic009.mp3",
  createdAt: new Date(),
  updatedAt: new Date(),
  usage: [
    {
      note: "Nghĩa chung, hành vi sai lệch / khác thường",
      example: "The scientist noted an aberration in the data that required further investigation.",
      translate: "Nhà khoa học đã ghi nhận một sự sai lệch trong dữ liệu cần được điều tra thêm." 
    },
    {
      note: "Trong khoa học / quang học",
      example: "The telescope's lens suffered from chromatic aberration, causing the stars to appear blurred.",
      translate: "Ống kính của kính viễn vọng bị lỗi quang sai màu, làm các ngôi sao trông mờ." 
    }
  ]
}

const FlashcardDemo = () => {
  return (
    <div className="z-20 flex justify-center flex-col items-center gap-3">
      <h1 className='text-center text-2xl font-bold z-30'>Học từ vựng với Flashcard</h1>
      <BackgroundGradient className='w-full max-w-6xl space-y-4 bg-gray-100 p-4 rounded-2xl dark:bg-zinc-800'>
        <div className="space-y-3">
          <FlashCard flashcard={flashcardData} isMock={true}/>
        </div>
      </BackgroundGradient>
    </div>
  )
}

export default FlashcardDemo