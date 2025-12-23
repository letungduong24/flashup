import { FaBoltLightning } from "react-icons/fa6";
import { Card } from "../ui/card";
import { IoIosDocument } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { MdQuestionAnswer } from "react-icons/md";

const TestIntroduce = () => {
  return (
    <div className="z-20 flex justify-center flex-col items-center gap-3">
      <h1 className='text-center text-2xl font-bold'>Thực hành với đề thi</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-6xl bg-gray-100 p-4 rounded-2xl dark:bg-zinc-800">
        <div className="w-full order-1 md:order-2">
          <img className="w-full rounded-2xl" src="/2.webp" alt="" />
        </div>
        <div className="w-full order-2 md:order-1 grid grid-cols-2 gap-4">
          <Card className="w-full flex justify-center items-start p-5 rounded-2xl">
            <FaBoltLightning  className="text-3xl"/>
            <p className="text-xl font-bold">Trợ lý AI</p>
            <p className="text-sm">Giải thích đáp án, hỗ trợ học tập</p>
          </Card>
          <Card className="w-full flex justify-center items-start p-7 rounded-2xl">
            <MdSpaceDashboard  className="text-3xl"/>
            <p className="text-xl font-bold">Trực quan</p>
            <p className="text-sm">Giao diện làm bài khoa học</p>
          </Card>
          <Card className="w-full flex justify-center items-start p-7 rounded-2xl">
            <MdQuestionAnswer  className="text-3xl"/>
            <p className="text-xl font-bold">Hỏi đáp</p>
            <p className="text-sm">Hỏi đáp với cộng đồng học</p>
          </Card>
          <Card className="w-full flex justify-center items-start p-7 rounded-2xl">
            <IoIosDocument  className="text-3xl"/>
            <p className="text-xl font-bold">Sát đề</p>
            <p className="text-sm">Luyện đề sát với đề thi thật</p>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default TestIntroduce;
