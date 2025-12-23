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
}

