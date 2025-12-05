import React, { useRef, useState } from "react";
import ReactCardFlip from "react-card-flip";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { Badge } from "../ui/badge";
import { FaVolumeLow } from "react-icons/fa6";

interface FlashCardProps {
  data: {
    word: string;
    meaning: string;
    description?: {
        usage: string;
        example: string;
        translation: string;
    }[];
  };
}

const FlashCard: React.FC<FlashCardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const playSound = () => {
    audioRef.current?.play();
  };

  return (
    <div className="w-full ">
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Mặt trước */}
        <Card className="rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-center">{data.word}</h2>
            <Button variant="ghost" onClick={playSound}>
              <FaVolumeLow />
            </Button>
            <audio ref={audioRef} src={"/flashcard/sample.mp3"} />
          </div>
          <div className="flex items-center justify-center w-full gap-2">
            <Badge>Đã học 3 lần</Badge>
            <Button variant={"ghost"} onClick={() => setIsFlipped(true)}>
                <LiaExchangeAltSolid />
            </Button>
          </div>
        </Card>

        {/* Mặt sau */}
        <Card className="w-full rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer">
          <h2 className="text-3xl font-bold text-center">{data.meaning}</h2>
          {data.description && data.description.map((desc, index) => (
            <div key={index} className="mt-4 w-full">
              <h3 className="text-xl font-semibold">{desc.usage}</h3>
                <p className="mt-2 italic">"{desc.example}"</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc.translation}</p>
            </div>
          ))}
          <Button variant={"ghost"} onClick={() => setIsFlipped(false)}>
            <LiaExchangeAltSolid />
          </Button>
        </Card>
      </ReactCardFlip>
    </div>
  );
};

export default FlashCard;
