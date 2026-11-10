import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useProgressStore, getSavedPos } from '../lib/progressStore';
import { groupOf, GROUP_LABEL, chapterLabel, type HistoryGroup } from '../lib/format';
import { FiClock, FiTrash2, FiBookOpen, FiPlay, FiX } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import FallbackImg from '../components/FallbackImg';

const HistoryPage: React.FC = () => {
  const { history, clearHistory, removeFromHistory } = useHistoryStore();
  const progressData = useProgressStore((s) => s.data);
  const [confirmClear, setConfirmClear] = useState(false);

  const groups = useMemo(() => {
    void progressData;
    const map: Record<HistoryGroup, HistoryItem[]> = { today: [], yesterday: [], older: [] };
    history.forEach((item) => map[groupOf(item.readAt)].push(item));
    return map;
  }, [history, progressData]);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    clearHistory();
    setConfirmClear(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Lịch sử đọc" count={history.length} />
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className={`btn-ghost !min-h-0 !py-2 !px-3 !text-[13px] ${confirmClear ? 'text-danger' : ''}`}
            style={confirmClear ? { borderColor: 'var(--danger)', background: 'var(--danger-soft)' } : undefined}
          >
            <FiTrash2 size={14} />
            {confirmClear ? 'Chắc chắn xóa hết?' : 'Xóa toàn bộ'}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<FiClock size={26} />}
          title="Chưa có lịch sử đọc"
          description="Bắt đầu đọc truyện và tiến trình của bạn sẽ hiện ở đây."
          actionLabel="Khám phá truyện"
          actionTo="/ntr"
        />
      ) : (
        (['today', 'yesterday', 'older'] as HistoryGroup[]).map((g) =>
          groups[g].length === 0 ? null : (
            <section key={g} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">{GROUP_LABEL[g]}</h3>
              <div className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
                {groups[g].map((item) => {
                  const pos = getSavedPos(item.mangaId, item.chapterNumber);
                  const pageLabel = pos ? `trang ${Math.min(pos.page + 1, pos.total)}/${pos.total}` : '';
                  return (
                    <div key={item.mangaId} className="flex items-center gap-3 px-3 py-2.5">
                      <Link to={`/ntr/manga/${item.mangaSlug}`} className="shrink-0">
                        <div className="cover" style={{ width: 44, height: 66 }}>
                          <FallbackImg src={item.mangaPoster} alt={item.mangaTitle} />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/ntr/manga/${item.mangaSlug}`}>
                          <p className="text-sm font-semibold text-ink truncate hover:text-accent transition-colors">
                            {item.mangaTitle}
                          </p>
                        </Link>
                        <p className="text-xs text-ink-muted truncate mt-0.5">
                          {chapterLabel(item.chapterNumber, item.chapterTitle)}
                          {pageLabel ? ` · ${pageLabel}` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/ntr/manga/${item.mangaSlug}/chapter/${item.chapterNumber}`}
                        className="btn-primary !min-h-0 !py-1.5 !px-3 !text-xs shrink-0"
                      >
                        <FiPlay size={12} /> Tiếp tục
                      </Link>
                      <button
                        onClick={() => removeFromHistory(item.mangaId)}
                        className="p-2 text-ink-muted hover:text-danger transition-colors shrink-0"
                        aria-label={`Xóa ${item.mangaTitle} khỏi lịch sử`}
                        title="Xóa khỏi lịch sử"
                      >
                        <FiX size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        )
      )}

      {history.length > 0 && (
        <p className="text-center text-xs text-ink-muted pt-2">
          <FiBookOpen className="inline mr-1" size={12} />
          Đọc lại một truyện sẽ đưa nó lên đầu danh sách.
        </p>
      )}
    </div>
  );
};

export default HistoryPage;
