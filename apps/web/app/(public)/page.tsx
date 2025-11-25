'use client';
import CourseIntroduce from "@/components/section/course-introduce";
import FlashcardDemo from "@/components/section/flashcard-demo";
import Hero from "@/components/section/hero";
import Services from "@/components/section/services";
import TestIntroduce from "@/components/section/test-introduce";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import FlashCard from "@/components/ui/flashcard";
import { Footer2 } from "@/components/ui/footer";
import { BackgroundBeams } from "@/components/ui/shadcn-io/background-beams";
import { InteractiveGridPattern } from "@/components/ui/shadcn-io/interactive-grid-pattern";
import { useState } from "react";

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="relative flex flex-col gap-7 p-4">
      <InteractiveGridPattern 
        className="absolute inset-0 opacity-25"
        squares={[50, 50]}
      />
      <Hero />
      <FlashcardDemo />
      <CourseIntroduce />
      <TestIntroduce />
      <Footer2 />
    </div>
  );
}
