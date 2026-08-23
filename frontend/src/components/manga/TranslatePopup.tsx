import { useState } from 'react';
import { FiGlobe, FiX } from 'react-icons/fi';

// Cache kết quả dịch trong session, tránh gọi lại API cho cùng 1 câu
const translationCache = new Map<string, string>();

const translateText = async (text: string): Promise<string> => {
  const cached = translationCache.get(text);
  if (cached) return cached;

  try {
    // API không chính thức của Google Translate - nhanh, chất lượng tốt
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!res.ok) throw new Error('Google Translate failed');
    const data = await res.json();
    const result = data[0].map((chunk: any) => chunk[0]).join('');
    translationCache.set(text, result);
    return result;
  } catch {
    // Fallback: MyMemory API (chính thức, ổn định hơn nhưng chất lượng thấp hơn)
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
    );
    const data = await res.json();
    const result = data.responseData.translatedText;
    translationCache.set(text, result);
    return result;
  }
};

interface TranslatePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TranslatePopup = ({ isOpen, onClose }: TranslatePopupProps) => {
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleTranslate = async () => {
    const text = inputText.trim();
    if (!text) return;

    setIsLoading(true);
    setError(false);
    try {
      const result = await translateText(text);
      setTranslation(result);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Cho phép bấm Enter để dịch (giữ Shift+Enter để xuống dòng)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-16 left-3 z-[150] card bg-base-100 shadow-xl border border-base-300 w-[280px] max-w-[85vw]"
    >
      <div className="card-body p-3 gap-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm flex items-center gap-1">
            <FiGlobe className="text-primary" /> Anh - Việt
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle" aria-label="Đóng">
            <FiX size={16} />
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập từ hoặc câu tiếng Anh..."
          className="textarea textarea-bordered textarea-sm w-full resize-none"
          rows={2}
          autoFocus
        />

        <button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isLoading}
          className="btn btn-primary btn-sm w-full"
        >
          {isLoading ? <span className="loading loading-dots loading-sm"></span> : 'Dịch'}
        </button>

        <div className="min-h-[2.5rem] bg-base-200 rounded-btn p-2 text-sm">
          {error && <p className="text-error text-xs">Không thể dịch, thử lại sau.</p>}
          {!error && translation && (
            <p className="text-primary font-medium">{translation}</p>
          )}
          {!error && !translation && (
            <p className="text-base-content/40 text-xs">Bản dịch sẽ hiện ở đây</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatePopup;