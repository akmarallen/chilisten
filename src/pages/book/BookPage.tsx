import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MapPin,
  Star,
  BookOpen,
  User,
  Hash,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertOctagon,
  Tag,
} from "lucide-react";
import { useStore } from "zustand";
import authStore from "../../context/auth";
import { Book, BookPhoto, bookService } from "../../api/books.api";
import { User as IUser } from "../../api/users.api";
import { reviewService } from "../../api/reviews.api";
import { getConditionMap } from "../../utils/const/const";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { supabase } from "../../lib/supabase";
import ReportModal from "../../components/ReportModal/ReportModal";

const conditionClasses = {
  EXCELLENT: "bg-[#e8f5e9] text-[#2e7d32]",
  GOOD: "bg-[#e3f2fd] text-[#1565c0]",
  FAIR: "bg-[#fff8e1] text-[#f57f17]",
};

const PAGE_SIZE = 5;

const BookPage = () => {
  const { user } = useStore(authStore);
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setParams] = useSearchParams();
  const { t } = useTranslation();

  const [book, setBook] = useState<Book | null>(null);
  const [seller, setSeller] = useState<IUser | null>(null);
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPaginatedReviews = async (pageNum: number) => {
    try {
      const { data, count } = await reviewService.getReviewsPaginated({
        bookId: id!,
        page: pageNum,
        excludeUserId: user?.id,
      });
      setReviews(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      toast.error(t("book_detail.reviews.load_error"));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await bookService.getBookById(id!, user?.id);
        if (res.data) {
          setBook(res.data);
          setSeller(res.data.seller as IUser);
          setPhotos(res.data.photos as BookPhoto[]);
          setIsLiked(!!res.data?.is_liked?.length);

          if (user) {
            const myRev = await reviewService.getMyReviewForBook(id!, user.id);
            if (myRev) {
              setMyReview(myRev);
              setNewReview(myRev.comment as string);
              setRating(myRev.rating);
            }
          }
          await fetchPaginatedReviews(0);
        }
      } catch (error) {
        toast.error(t("book_detail.not_found"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login=true");
    if (!newReview.trim())
      return toast.error(t("book_detail.reviews.empty_error"));

    setSubmitting(true);
    try {
      if (myReview) {
        const { error } = await supabase
          .from("reviews")
          .update({ rating, comment: newReview, is_verified: false })
          .eq("id", myReview.id);
        if (error) throw error;
        toast.success(t("book_detail.reviews.update_success"));
      } else {
        const { error } = await supabase.from("reviews").insert({
          book_id: id!,
          reviewer_id: user.id as string,
          seller_id: seller?.id! as string,
          rating,
          comment: newReview,
        });
        if (error) throw error;
        toast.success(t("book_detail.reviews.post_success"));
      }

      const updatedMyRev = await reviewService.getMyReviewForBook(id!, user.id);
      setMyReview(updatedMyRev);
      fetchPaginatedReviews(page);
    } catch (err) {
      toast.error("Что-то пошло не так!");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return navigate("/login=true");
    const newState = !isLiked;
    setIsLiked(newState);

    try {
      const res = await bookService.toggleBookLike(id!);
      const finalState = res as boolean;
      setIsLiked(finalState);

      if (finalState) {
        toast.success(t("book_detail.added_to_favorites"));
      } else {
        toast.success(t("book_detail.removed_from_favorites"));
      }
    } catch (e) {
      setIsLiked(!newState);
      toast.error("Что-то пошло не так!");
    }
  };

  const handleContact = (platform: "wa" | "tg") => {
    if (!seller?.phone) return toast.error(t("book_detail.no_phone_alert"));
    const phone = seller.phone.replace(/\D/g, "");
    const text = t("book_detail.want_to_buy_this_book", { book: book?.title });

    if (platform === "wa") {
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } else {
      window.open(`https://t.me/+${phone}`, "_blank");
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fdf8f3] text-[#a07850]">
        {t("common.loading")}
      </div>
    );
  if (!book)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fdf8f3] gap-4">
        <BookOpen size={48} />
        <div className="text-xl">{t("book_detail.not_found")}</div>
      </div>
    );

  const condLabel = getConditionMap(t)[book.condition];
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const isSold = book.status === "SOLD";
  return (
    <div className="bg-[#fdf8f3] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-6 py-6 md:py-10">
        <button
          className="inline-flex items-center gap-2 text-sm text-[#8B5E3C] mb-6 hover:opacity-70"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> {t("common.back")}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-16">
          <div className="w-full">
            <div className="w-full aspect-3/4 max-h-[480px] rounded-2xl overflow-hidden bg-white flex items-center justify-center border border-[#b48c5a]/15 mb-3">
              <img
                src={photos[activePhoto]?.url || book.cover_url || "book image"}
                alt={book.title}
                className="w-full h-full object-contain bg-black"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${activePhoto === i ? "border-[#8B5E3C]" : "border-transparent"}`}
                  >
                    <img src={p.url} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div
              className={`inline-block self-start px-3 py-1 rounded-full text-[0.75rem] font-medium mb-3 ${conditionClasses[book.condition]}`}
            >
              {condLabel}
            </div>
            <h1 className="text-3xl font-semibold text-[#2d1a0e] mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-[#7a5030] mb-5">{book.author}</p>
            <div className="text-3xl font-semibold text-[#2d1a0e] mb-5">
              {book.price?.toLocaleString()}{" "}
              <span className="text-base text-[#a07850]">
                {t("book_detail.som")}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-6 text-sm text-[#7a5030]">
              <div className="flex items-center gap-2">
                <MapPin size={14} />{" "}
                {[book.district, book.city].filter(Boolean).join(", ")}
              </div>{" "}
              {book.genre && (
                <div className="flex items-center gap-2">
                  <BookOpen size={14} /> {book.genre}
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-2">
                  <Hash size={14} /> {t("book_detail.isbn")}: {book.isbn}
                </div>
              )}
              {book.description && (
                <div className="flex items-center gap-2">
                  <BookOpen size={14} /> {book.description}
                </div>
              )}
            </div>

            <div
              className={`inline-block self-start px-3 py-1 rounded-full text-[0.75rem] font-medium ${conditionClasses[book.condition]}`}
            >
              {condLabel}
            </div>

            <div className="flex mt-2 gap-3 mb-6 flex-wrap">
              {isSold ? (
                <button
                  disabled={isSold}
                  onClick={() => handleContact("wa")}
                  className={`flex-1 min-w-[140px] py-3 rounded-xl font-medium transition-all bg-gray-200 text-gray-400 cursor-not-allowed`}
                >
                  {t("book_detail.sold")}
                </button>
              ) : (
                <>
                  <button
                    disabled={isSold}
                    onClick={() => handleContact("wa")}
                    className={`flex-1 min-w-[140px] py-3 rounded-xl font-medium transition-all bg-green-600 text-white hover:bg-green-700`}
                  >
                    WhatsApp
                  </button>
                  <button
                    disabled={isSold}
                    onClick={() => handleContact("tg")}
                    className={`flex-1 min-w-[140px] py-3 rounded-xl font-medium transition-all bg-blue-500 text-white hover:bg-blue-600`}
                  >
                    Telegram
                  </button>
                </>
              )}
              <button
                onClick={toggleLike}
                className="w-12 h-12 rounded-xl border border-[#b48c5a]/25 bg-white flex items-center justify-center"
              >
                <Heart
                  size={20}
                  fill={isLiked ? "#e53935" : "none"}
                  color={isLiked ? "#e53935" : "#aaa"}
                />
              </button>
            </div>

            {seller && (
              <div className="bg-white rounded-2xl border border-[#b48c5a]/15 p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[0.7rem] uppercase tracking-widest text-[#a07850] font-medium">
                    {t("book_detail.seller_info")}
                  </div>

                  {seller.id !== user?.id && (
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="text-[0.7rem] uppercase tracking-widest font-medium text-[#a07850] hover:text-red-600 transition-colors p-1 gap-1 flex items-center"
                      title={t("seller.report.button")}
                    >
                      <AlertOctagon size={16} />
                      {t("seller.report.button")}
                    </button>
                  )}
                </div>
                <Link
                  to={`/seller/${seller.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#8B5E3C] to-[#C8874E] flex items-center justify-center overflow-hidden shrink-0">
                    {seller.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={seller.full_name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {seller.full_name?.charAt(0)?.toUpperCase() || (
                          <User size={22} />
                        )}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-[0.95rem] text-[#2d1a0e] group-hover:text-[#8B5E3C] transition-colors">
                      {seller.full_name || t("book_detail.seller_info")}
                    </div>
                    <div className="flex items-center gap-2 text-[0.75rem] text-[#a07850] mt-0.5">
                      {seller.city && <span>📍 {seller.city}</span>}
                      {Number(seller.rating) > 0 && (
                        <span className="flex items-center gap-1 text-[#c4956a]">
                          <Star
                            size={11}
                            fill="#c4956a"
                            className="text-[#c4956a]"
                          />
                          {seller.rating}
                        </span>
                      )}
                      {Number(seller.total_sales) > 0 && (
                        <span>
                          {seller.total_sales} {t("book_detail.seller_sales")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div id="reviews" className="border-t border-[#b48c5a]/20 pt-10">
          <h2 className="text-2xl font-semibold text-[#2d1a0e] mb-8 flex items-center gap-3">
            <Star className="text-[#c4956a]" /> {t("book_detail.reviews.title")}{" "}
            ({totalCount + (myReview ? 1 : 0)})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1">
              {user?.id === seller?.id ? (
                <div className="bg-white/50 p-6 rounded-2xl border border-dashed border-[#b48c5a]/30 text-center text-sm">
                  {t("book_detail.reviews.seller_no_review")}
                </div>
              ) : user ? (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white p-6 rounded-2xl border border-[#b48c5a]/15 sticky top-6"
                >
                  <h3 className="font-medium text-[#2d1a0e] mb-4">
                    {myReview
                      ? t("book_detail.reviews.edit_title")
                      : t("book_detail.reviews.write_title")}
                  </h3>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={20}
                        className="cursor-pointer"
                        fill={s <= rating ? "#c4956a" : "none"}
                        color={s <= rating ? "#c4956a" : "#ccc"}
                        onClick={() => setRating(s)}
                      />
                    ))}
                  </div>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder={t("book_detail.reviews.placeholder")}
                    className="w-full h-32 p-3 text-sm rounded-xl border border-[#b48c5a]/20 bg-[#fdf8f3] focus:outline-none mb-4 resize-none"
                  />
                  <button
                    disabled={submitting}
                    className="w-full py-3 bg-[#8B5E3C] text-white rounded-xl text-sm font-medium hover:bg-[#7a5030] disabled:opacity-50"
                  >
                    {submitting
                      ? "..."
                      : myReview
                        ? t("book_detail.reviews.btn_update")
                        : t("book_detail.reviews.btn_post")}
                  </button>
                </form>
              ) : (
                <div className="bg-white/50 p-6 rounded-2xl border border-dashed border-[#b48c5a]/30 text-center">
                  <p className="text-sm text-[#7a5030] mb-3">
                    {t("book_detail.reviews.login_required")}
                  </p>
                  <button
                    onClick={() => navigate(`/?login=true`)}
                    className="text-sm font-semibold text-[#8B5E3C] underline"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-6">
              {myReview && (
                <div className="bg-white border-2 border-[#c4956a]/30 p-5 rounded-2xl relative">
                  <span className="absolute -top-3 left-4 bg-[#c4956a] text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                    {t("book_detail.reviews.your_review")}
                  </span>
                  <ReviewItem rev={myReview} />
                </div>
              )}

              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white/40 p-5 rounded-2xl border border-[#b48c5a]/10"
                >
                  <ReviewItem rev={rev} />
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={page === 0}
                    onClick={() => {
                      setPage((p) => p - 1);
                      fetchPaginatedReviews(page - 1);
                    }}
                    className="p-2 disabled:opacity-30"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="text-sm">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => {
                      setPage((p) => p + 1);
                      fetchPaginatedReviews(page + 1);
                    }}
                    className="p-2 disabled:opacity-30"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}

              {reviews.length === 0 && !myReview && (
                <div className="text-center py-10 text-[#a07850] italic">
                  {t("book_detail.reviews.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sellerId={book.seller_id}
        bookId={book.id}
        bookTitle={book.title}
        reporterId={user?.id!}
        sellerName={seller?.full_name!}
      />
    </div>
  );
};
const ReviewItem = ({ rev }: { rev: any }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f5ede0] overflow-hidden">
            {rev.reviewer?.avatar_url ? (
              <img src={rev.reviewer.avatar_url} alt="" />
            ) : (
              <User size={16} className="m-auto mt-1" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              {rev.reviewer?.full_name || "User"}
              {rev.is_verified ? (
                <CheckCircle
                  size={14}
                  className="text-blue-500"
                  fill="currentColor"
                  fillOpacity={0.1}
                />
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-normal border border-gray-200">
                  {t("book_detail.reviews.not_verified")}
                </span>
              )}
            </div>
            <div className="mt-1 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < rev.rating ? "#c4956a" : "none"}
                  color={i < rev.rating ? "#c4956a" : "#ccc"}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-[0.7rem] text-[#a07850]">
          {new Date(rev.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-[#5a3520]">{rev.comment}</p>
    </>
  );
};

export default BookPage;
