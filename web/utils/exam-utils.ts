/**
 * Tính số câu hỏi bắt đầu cho mỗi part trong đề thi TOEIC
 * Số câu hỏi được đánh số liên tục qua các part
 */
export function getStartQuestionNumber(part: number): number {
  const partStarts: Record<number, number> = {
    1: 1,   // Part 1: câu 1-6 (6 câu)
    2: 7,   // Part 2: câu 7-31 (25 câu)
    3: 32,  // Part 3: câu 32-70 (39 câu)
    4: 71,  // Part 4: câu 71-100 (30 câu)
    5: 101, // Part 5: câu 101-130 (30 câu)
    6: 131, // Part 6: câu 131-146 (16 câu = 4 groups x 4)
    7: 147, // Part 7: câu 147-175 (29 câu type 1) hoặc 147-171 (25 câu type 2)
  };
  
  return partStarts[part] || 1;
}

/**
 * Tính số câu hỏi trong một group dựa trên part và group order
 */
export function getQuestionNumberInGroup(
  part: number,
  groupOrder: number,
  questionOrderInGroup: number
): number {
  const startQuestionNumber = getStartQuestionNumber(part);
  
  if (part === 1 || part === 2 || part === 5) {
    // Câu hỏi đơn, không có group
    return startQuestionNumber + questionOrderInGroup - 1;
  }
  
  if (part === 3) {
    // 13 groups, mỗi group 3 câu hỏi
    return startQuestionNumber + (groupOrder - 1) * 3 + questionOrderInGroup - 1;
  }
  
  if (part === 4) {
    // 10 groups, mỗi group 3 câu hỏi
    return startQuestionNumber + (groupOrder - 1) * 3 + questionOrderInGroup - 1;
  }
  
  if (part === 6) {
    // 4 groups, mỗi group 4 câu hỏi
    return startQuestionNumber + (groupOrder - 1) * 4 + questionOrderInGroup - 1;
  }
  
  if (part === 7) {
    // Part 7 có 2 dạng:
    // Type 1: 10 groups với distribution [3, 3, 3, 3, 3, 3, 3, 3, 2, 3] (tổng 29)
    // Type 2: 5 groups, mỗi group 5 câu hỏi (tổng 25)
    // Mặc định tính theo type 1, nhưng cần truyền thêm tham số type
    // Tạm thời tính theo type 1 (phổ biến hơn)
    const type1Distribution = [3, 3, 3, 3, 3, 3, 3, 3, 2, 3];
    let questionOffset = 0;
    for (let i = 0; i < groupOrder - 1; i++) {
      questionOffset += type1Distribution[i] || 0;
    }
    return startQuestionNumber + questionOffset + questionOrderInGroup - 1;
  }
  
  return startQuestionNumber + questionOrderInGroup - 1;
}

