import { Link } from 'react-router-dom';

interface ChapterBreadcrumbsProps {
  slug: string;
  chapterTitle: string;
  mangaTitle?: string;
}

const ChapterBreadcrumbs = ({ slug, chapterTitle, mangaTitle }: ChapterBreadcrumbsProps) => {
  return (
    <div className="text-sm breadcrumbs flex justify-center py-0 w-full max-w-full px-2">
      <ul className="min-w-0 max-w-full items-start">
        <li className="shrink-0">
          <Link to="/">Trang chủ</Link>
        </li>
        {mangaTitle && (
          <li className="min-w-0 max-w-[45vw] sm:max-w-[220px]">
            <Link
              to={`/manga/${slug}`}
              className="font-semibold whitespace-normal break-words leading-snug"
            >
              {mangaTitle}
            </Link>
          </li>
        )}
        <li className="min-w-0 max-w-[45vw] sm:max-w-[260px]">
          <span className="font-bold text-primary whitespace-normal break-words leading-snug">
            Chương {chapterTitle}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default ChapterBreadcrumbs;
