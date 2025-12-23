import { FaBoltLightning } from "react-icons/fa6";
import { Card } from "../ui/card";
import { FaStickyNote } from "react-icons/fa";
import { MdQuestionAnswer } from "react-icons/md";
import { IoIosDocument } from "react-icons/io";

const CourseIntroduce = () => {
  return (
    <div className="z-20 flex justify-center flex-col items-center gap-3">
      <h1 className='text-center text-2xl font-bold'>Khóa học đa dạng</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-6xl bg-gray-100 p-4 rounded-2xl dark:bg-zinc-800">
        <div className="w-full">
          <img className="w-full rounded-2xl" src="/1.png" alt="" />
        </div>
        <div className="w-full grid grid-cols-2 gap-4">
          <Card className="w-full flex justify-center items-start p-5 rounded-2xl">
            <FaBoltLightning  className="text-3xl"/>
            <p className="text-xl font-bold">Trợ lý AI</p>
            <p className="text-sm">Hỗ trợ tóm tắt & giải thích tài liệu</p>
          </Card>
          <Card className="w-full flex justify-center items-start p-7 rounded-2xl">
            <FaStickyNote  className="text-3xl"/>
            <p className="text-xl font-bold">Ghi chú</p>
            <p className="text-sm">Ghi chú theo thời gian video</p>
          </Card>
          <Card className="w-full flex justify-center items-start p-7 rounded-2xl">
            <MdQuestionAnswer  className="text-3xl"/>
            <p className="text-xl font-bold">Hỏi đáp</p>
            <p className="text-sm">Hỏi đáp với giảng viên</p>
          </Card>
          <Card className="w-full flex justify-center items-start p-7 rounded-2xl">
            <IoIosDocument  className="text-3xl"/>
            <p className="text-xl font-bold">Tài liệu</p>
            <p className="text-sm">Tài liệu chuẩn xác & mới nhất</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseIntroduce;
