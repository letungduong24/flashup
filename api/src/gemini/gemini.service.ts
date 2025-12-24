import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export interface GenerateFlashcardResponse {
  name: string;
  meaning: string;
  usage: Array<{
    note?: string;
    example?: string;
    translate?: string;
  }>;
  tags: string[];
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Gemini features will not work.');
      console.warn('Please check your .env file in apps/api/.env');
    } else {
      // GoogleGenAI automatically reads from GEMINI_API_KEY environment variable
      this.genAI = new GoogleGenAI({});
    }
  }

  async generateFlashcardFromWord(word: string): Promise<GenerateFlashcardResponse> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
    }

    const prompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp. Hãy tạo thông tin flashcard cho từ "${word}" với định dạng JSON như sau:

{
  "name": "${word}",
  "meaning": "Nghĩa tiếng Việt của từ (ngắn gọn, dễ hiểu)",
  "usage": [
    {
      "note": "Ghi chú về cách dùng (ví dụ: danh từ, động từ, tính từ...)",
      "example": "Câu ví dụ bằng tiếng Anh",
      "translate": "Bản dịch tiếng Việt của câu ví dụ"
    }
  ],
  "tags": ["tag1", "tag2", "tag3"]
}

Yêu cầu:
- meaning: Nghĩa tiếng Việt ngắn gọn, dễ hiểu (1-2 câu)
- usage: Tối đa 3 ví dụ, mỗi ví dụ có note (loại từ/cách dùng), example (câu tiếng Anh), translate (dịch tiếng Việt)
- tags: 3-5 tags liên quan đến từ (ví dụ: danh từ, động từ, từ vựng thông dụng, v.v.)
- Chỉ trả về JSON, không có text thừa
- Đảm bảo JSON hợp lệ`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: prompt,
      });

      const text = response.text || '';

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Extract JSON from response (remove markdown code blocks if any)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonText) as GenerateFlashcardResponse;

      // Validate and ensure required fields
      if (!parsed.name || !parsed.meaning) {
        throw new Error('Invalid response from Gemini: missing required fields');
      }

      return {
        name: parsed.name,
        meaning: parsed.meaning,
        usage: parsed.usage || [],
        tags: parsed.tags || [],
      };
    } catch (error: any) {
      console.error('Error generating flashcard from Gemini:', error);
      throw new Error(`Failed to generate flashcard: ${error.message}`);
    }
  }

  async generateFolderWithFlashcards(folderName: string): Promise<{
    folderName: string;
    folderDescription: string;
    flashcards: GenerateFlashcardResponse[];
  }> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
    }

    const prompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp. Hãy tạo một Flashbook (Flashbook là một bộ sưu tập Flashcard) với chủ đề "${folderName}".

Yêu cầu:
1. Tạo mô tả ngắn gọn cho Flashbook (1-2 câu) (tiếng Việt). Tên Flashbook giữ nguyên người dùng nhập vào
2. Tạo 10-15 từ vựng tiếng Anh liên quan đến chủ đề "${folderName}"
3. Mỗi từ vựng cần có:
   - name: Từ tiếng Anh
   - meaning: Nghĩa tiếng Việt ngắn gọn, dễ hiểu (1-2 câu)
   - usage: Mảng các ví dụ (tối đa 3 ví dụ), mỗi ví dụ có:
     * note: Ghi chú về cách dùng (ví dụ: danh từ, động từ, tính từ...)
     * example: Câu ví dụ bằng tiếng Anh
     * translate: Bản dịch tiếng Việt của câu ví dụ
   - tags: 3-5 tags liên quan đến từ

Trả về JSON với định dạng:
{
  "folderName": "${folderName}",
  "folderDescription": "Mô tả Flashbook",
  "flashcards": [
    {
      "name": "từ vựng 1",
      "meaning": "Nghĩa tiếng Việt",
      "usage": [
        {
          "note": "Ghi chú",
          "example": "Câu ví dụ tiếng Anh",
          "translate": "Bản dịch tiếng Việt"
        }
      ],
      "tags": ["tag1", "tag2"]
    }
  ]
}

Chỉ trả về JSON, không có text thừa. Đảm bảo JSON hợp lệ.`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: prompt,
      });

      const text = response.text || '';

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Extract JSON from response (remove markdown code blocks if any)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonText) as {
        folderName: string;
        folderDescription: string;
        flashcards: GenerateFlashcardResponse[];
      };

      // Validate
      if (!parsed.folderName || !parsed.folderDescription || !Array.isArray(parsed.flashcards)) {
        throw new Error('Invalid response from Gemini: missing required fields');
      }

      // Validate each flashcard
      for (const flashcard of parsed.flashcards) {
        if (!flashcard.name || !flashcard.meaning) {
          throw new Error('Invalid response from Gemini: flashcard missing required fields');
        }
      }

      return {
        folderName: parsed.folderName,
        folderDescription: parsed.folderDescription,
        flashcards: parsed.flashcards,
      };
    } catch (error: any) {
      console.error('Error generating Flashbook with flashcards from Gemini:', error);
      throw new Error(`Failed to generate Flashbook with flashcards: ${error.message}`);
    }
  }
  async evaluateSentence(word: string, sentence: string): Promise<{
    status: 'correct' | 'minor-error' | 'suggestion' | 'wrong';
    suggestion: string;
    suggestionTranslation: string;
    explanation: string;
    wordUsageExplanation?: string;
    errorTag?: string;
  }> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
    }

    const prompt = `Bạn là giáo viên tiếng Anh chấm điểm bài tập đặt câu.
Từ khóa cần dùng: "${word}"
Câu người dùng viết: "${sentence}"

Hãy phân loại câu trả lời vào 1 trong 4 trạng thái sau:

1. "correct": Câu hoàn toàn chính xác về ngữ pháp, tự nhiên, độ dài hợp lý.
2. "minor-error": Câu về cơ bản hiểu được nhưng có lỗi nhỏ ngữ pháp hoặc chính tả.
3. "suggestion": Câu đúng ngữ pháp nhưng quá ngắn, quá đơn giản, hoặc diễn đạt chưa tự nhiên. Cần gợi ý một câu hay hơn.
4. "wrong": Câu sai cấu trúc nghiêm trọng, sai nghĩa, hoặc KHÔNG sử dụng từ khóa.

Nếu có lỗi (status khác "correct" và "suggestion"), hãy gắn NHÃN LỖI (errorTag) thuộc một trong các loại sau:
- "Tense" (Sai thì)
- "Subject–Verb Agreement" (Sai chia động từ)
- "Verb Pattern" (Sai mẫu động từ)
- "Article" (Sai mạo từ a/an/the)
- "Preposition" (Sai giới từ)
- "Word Usage" (Dùng từ sai)
- "Missing Word" (Thiếu từ)
- "Extra Word" (Thừa từ)
- "Sentence Structure" (Sai cấu trúc câu)
- "Unnatural Expression" (Diễn đạt không tự nhiên)

Yêu cầu trả về JSON (không giải thích thêm):
{
  "status": "correct" | "minor-error" | "suggestion" | "wrong",
  "suggestion": "Câu viết lại hoàn chỉnh. BẮT BUỘC có nội dung nếu status khác 'correct'. Nếu 'correct' thì để chuỗi rỗng.",
  "suggestionTranslation": "Dịch nghĩa tiếng Việt của câu suggestion. BẮT BUỘC có nội dung nếu status khác 'correct'. Nếu 'correct' thì để chuỗi rỗng.",
  "explanation": "Giải thích chi tiết lỗi sai hoặc lý do gợi ý câu mới (bằng tiếng Việt). BẮT BUỘC có nội dung nếu status khác 'correct'. Nếu 'correct' thì để chuỗi rỗng.",
  "wordUsageExplanation": "Hướng dẫn cách dùng từ khóa đúng (bằng tiếng Việt). BẮT BUỘC nếu status='wrong'. Các trường hợp khác có thể bỏ trống.",
  "errorTag": "Tense" | "Subject–Verb Agreement" | "Verb Pattern" | "Article" | "Preposition" | "Word Usage" | "Missing Word" | "Extra Word" | "Sentence Structure" | "Unnatural Expression" | null
}

Lưu ý:
- Nếu status="suggestion": explanation phải bắt đầu bằng: "Bạn đã làm rất tốt rồi, nhưng..."
- Các trường explanation và wordUsageExplanation phải dùng tiếng Việt.
- Nếu status="correct" hoặc "suggestion" (không phải lỗi sai ngữ pháp), errorTag để null.
- Đảm bảo JSON hợp lệ.
`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: prompt,
      });

      const text = response.text || '';

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Extract JSON from response
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonText);

      return {
        status: parsed.status,
        suggestion: parsed.suggestion,
        suggestionTranslation: parsed.suggestionTranslation,
        explanation: parsed.explanation,
        wordUsageExplanation: parsed.wordUsageExplanation,
        errorTag: parsed.errorTag
      };
    } catch (error: any) {
      console.error('Error evaluating sentence with Gemini:', error);
      throw new Error(`Failed to evaluate sentence: ${error.message}`);
    }
  }
  async summarizeSession(history: { word: string; userSentence: string; evaluation: any }[]): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured.');
    }

    const historyText = history.map((item, index) => {
      return `${index + 1}. Từ: "${item.word}" - Câu: "${item.userSentence}" - Đánh giá: ${item.evaluation.status} (${item.evaluation.errorTag || 'None'})`;
    }).join('\n');

    const prompt = `Bạn là giáo viên tiếng Anh tổng kết bài tập đặt câu.
Dưới đây là lịch sử bài làm của học viên:
${historyText}

Hãy tóm tắt bài viết của người học bằng 3 câu ngắn tiếng Việt theo cấu trúc sau:
1. 1 điểm mạnh (ngắn gọn, động viên).
2. 1-3 lỗi chính phổ biến nhất mà học viên mắc phải trong bài này (nếu có).
3. 1 lời khuyên hoặc gợi ý nhẹ nhàng để cải thiện.

Yêu cầu:
- Giữ giọng văn trung tính, tích cực, không phán xét.
- Không giải thích dài, không dạy ngữ pháp chi tiết.
- Trả về đúng 3 câu, mỗi ý 1 dòng hoặc đoạn văn ngắn.
- Output chỉ là text thuần, không json.
`;

    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemma-3-27b-it',
        contents: prompt,
      });

      return response.text || 'Không thể tạo tổng kết.';
    } catch (error: any) {
      console.error('Error summarizing session:', error);
      return 'Có lỗi khi tạo tổng kết.';
    }
  }
}

