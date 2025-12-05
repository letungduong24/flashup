import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getCambridgeUsVoice(word: string): Promise<{ audioUrl: string | null; wordExists: boolean }> {
  try {
    const originalUrl = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word.toLowerCase().trim())}`;
    
    const response = await axios.get(originalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    // Kiểm tra URL cuối cùng sau redirect
    const finalUrl = response.request?.res?.responseUrl || response.request?.responseURL || response.config?.url || originalUrl;
    const baseUrl = 'https://dictionary.cambridge.org/dictionary/english/';
    
    // Nếu URL cuối cùng là base URL (không có từ), nghĩa là từ không tồn tại
    if (finalUrl === baseUrl || finalUrl === baseUrl.slice(0, -1)) {
      return { audioUrl: null, wordExists: false };
    }

    const $ = cheerio.load(response.data);
    
    // Kiểm tra xem có phải là trang chủ không (có thể có title hoặc heading đặc biệt)
    const pageTitle = $('title').text().toLowerCase();
    const hasWordDefinition = $('.entry-body__el, .def-block, .ddef_h').length > 0;
    
    // Nếu không có định nghĩa từ, nghĩa là từ không tồn tại
    if (!hasWordDefinition && (pageTitle.includes('cambridge dictionary') && !pageTitle.includes(word.toLowerCase()))) {
      return { audioUrl: null, wordExists: false };
    }
    
    // Lấy voice giọng Mỹ (US)
    const audioPath = $('source[type="audio/mpeg"]').first().attr('src');
    
    if (!audioPath) {
      return { audioUrl: null, wordExists: true };
    }
    
    // Xử lý URL
    let audioUrl: string;
    if (audioPath.startsWith('http')) {
      audioUrl = audioPath;
    } else if (audioPath.startsWith('//')) {
      audioUrl = 'https:' + audioPath;
    } else {
      audioUrl = 'https://dictionary.cambridge.org' + audioPath;
    }
    
    return { audioUrl, wordExists: true };
  } catch (error: any) {
    console.error(`Error fetching Cambridge voice for word "${word}":`, error.message || error);
    return { audioUrl: null, wordExists: false };
  }
}

