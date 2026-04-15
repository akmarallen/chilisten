import { Heart, MapPin, Star, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Book } from "../../api/books.api";
import { getConditionMap } from "../../utils/const/const";
import { useTranslation } from "react-i18next";

const conditionStyles = {
  EXCELLENT: "bg-green-100 text-green-800",
  GOOD: "bg-blue-100 text-blue-800",
  FAIR: "bg-yellow-100 text-yellow-800",
};
type Props = {
  book: Book;
  isLiked?: boolean;
  onLikeToggle?: (bookId: string) => void;
};

const BookCard = ({ book, isLiked, onLikeToggle }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const conditionClass =
    conditionStyles[book.condition] || "bg-gray-100 text-gray-700";

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  const seller = (book as any)?.seller as { rating: number };
  const isSold = book.status === "SOLD";
  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer font-sans"
    >
      <div className="relative aspect-2/3 w-full overflow-hidden bg-linear-to-br from-[#f5ede0] to-[#e8d5c0]">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-[#fdf8f3] to-[#f5ede0] p-4 text-[#c4956a]">
            <BookOpen size={28} strokeWidth={1.5} />
            <div className="line-clamp-3 px-3 text-center text-sm font-semibold leading-tight text-[#5c3317]">
              {book.title}
            </div>
            {book.author && (
              <div className="text-[10px] font-light text-[#a07850]">
                {book.author}
              </div>
            )}
          </div>
        )}

        {isSold && (
          <div className="absolute inset-0 z-1 flex items-center justify-center bg-black/20">
            <div className="bg-red-600/90 text-white px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shadow-lg transform -rotate-12 border border-white/20">
              {t("book_detail.sold")}
            </div>
          </div>
        )}

        <div
          className={`absolute left-2 top-2 z-2 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm ${conditionClass}`}
        >
          {getConditionMap(t)[book.condition]}
        </div>

        {onLikeToggle && (
          <button
            title="В избранное"
            onClick={(e) => {
              e.stopPropagation();
              onLikeToggle?.(book.id);
            }}
            className="absolute right-2 top-2 z-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:scale-110 hover:bg-white active:scale-95"
            aria-label="В избранное"
          >
            <Heart
              size={14}
              fill={isLiked ? "#e53935" : "none"}
              stroke={isLiked ? "#e53935" : "#9ca3af"}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-neutral-900">
          {book.title}
        </h3>

        {book.author && (
          <p className="truncate text-xs font-light text-[#7a5030]">
            {book.author}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-neutral-900">
            {book.price?.toLocaleString("ru-RU")} сом
          </span>

          {(book.city || seller?.rating > 0) && (
            <div className="flex items-center gap-1 text-[10px] text-[#a07850]">
              {seller?.rating > 0 ? (
                <>
                  <Star size={10} fill="#c4956a" className="text-[#c4956a]" />
                  <span>{seller?.rating}</span>
                </>
              ) : (
                book.city && (
                  <>
                    <MapPin size={10} />
                    <span className="truncate max-w-[60px]">{book.city}</span>
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
