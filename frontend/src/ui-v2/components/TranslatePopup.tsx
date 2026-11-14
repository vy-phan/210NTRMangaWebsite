import React, { useState, useEffect } from 'react';
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
    // Fallback: MyMemory API
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
    );
    const data = await res.json();
    const result = data.responseData.translatedText;
    translationCache.set(text, result);
    return result;
  }
};

// Popup dịch Anh → Việt, style tối theo reader (độc lập theme app)
const TranslatePopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleTranslate = async () => {
    const text = inputText.trim();
    if (!text) return;
    setIsLoading(true);
    setError(false);
    try {
      setTranslation(await translateText(text));
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0 z-[149] transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.45)', opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-14 z-[150] w-[300px] max-w-[90vw] rounded-2xl overflow-hidden transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1B1E2E',
          border: '1px solid var(--reader-line)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          color: 'var(--reader-ink)',
        }}
        role="dialog"
        aria-modal="false"
        aria-label="Tra từ Anh - Việt"
      >
      <div className="p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <FiGlobe className="text-accent" size={15} /> Anh - Việt
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg reader-muted hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <FiX size={16} />
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập từ hoặc câu tiếng Anh…"
          rows={2}
          className="w-full resize-none rounded-xl px-3 py-2 text-base outline-none"
          style={{
            background: '#12141F',
            border: '1px solid var(--reader-line)',
            color: 'var(--reader-ink)',
          }}
        />

        <button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isLoading}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
        >
          {isLoading ? 'Đang dịch…' : 'Dịch'}
        </button>

        <div
          className="min-h-[2.5rem] rounded-xl p-2.5 text-sm"
          style={{ background: '#12141F' }}
        >
          {error && <p className="text-[12px]" style={{ color: '#FF6B6B' }}>Không thể dịch, thử lại sau.</p>}
          {!error && translation && <p className="font-medium" style={{ color: 'var(--accent)' }}>{translation}</p>}
          {!error && !translation && (
            <p className="text-[12px] reader-muted">Bản dịch sẽ hiện ở đây</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default TranslatePopup;
