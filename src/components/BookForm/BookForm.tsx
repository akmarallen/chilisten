import { useState, useEffect } from "react";
import {
  Loader,
  BookOpen,
  Image as ImageIcon,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  CircleDashed,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import BookFormFields from "./BookFormFields";
import { Book } from "../../api/books.api";
import { toast } from "react-toastify";

export type BookPhotoItem = {
  id?: string;
  url: string;
  file?: File;
  type: "existing" | "new";
};

interface BookFormProps {
  initialData?: any;
  initialPhotos?: BookPhotoItem[];
  onSubmit: (
    bookData: any,
    photos: BookPhotoItem[],
    deletedPhotoIds: string[],
  ) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  serverError?: string | null;

  type: "edit" | "create";
}

export const BookForm = ({
  initialData,
  initialPhotos = [],
  onSubmit,
  onCancel,
  submitting,
  serverError,
  type,
}: BookFormProps) => {
  const { t } = useTranslation();
  const [book, setBook] = useState(
    initialData || {
      title: "",
      author: "",
      price: "",
      city: "Бишкек",
      condition: "GOOD",
      status: "PENDING",
      district: "",
    },
  );
  const [items, setItems] = useState<BookPhotoItem[]>(initialPhotos);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) setBook(initialData);
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!book.title?.trim()) newErrors.title = t("sell.errors.title_required");
    if (!book.price || Number(book.price) <= 0)
      newErrors.price = t("sell.errors.invalid_price");
    if (!book.city) newErrors.city = t("sell.errors.city_required");
    if (items.length === 0) newErrors.photos = t("sell.photos.count_empty");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    await onSubmit(book, items, deletedIds);
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (items.length + files.length > 5) {
      toast.warn(t("sell.errors.max_photos"));
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setItems((prev) => [
          ...prev,
          {
            url: ev.target?.result as string,
            file: file,
            type: "new",
          },
        ]);
        if (errors.photos) setErrors((prev) => ({ ...prev, photos: "" }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const target = items[index];
    if (target.type === "existing" && target.id) {
      setDeletedIds((prev) => [...prev, target.id!]);
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (idx: number, dir: "left" | "right") => {
    const newItems = [...items];
    const targetIdx = dir === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
    setItems(newItems);
  };

  return (
    <div className="w-full">
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700 animate-pulse">
          <AlertCircle className="shrink-0" size={20} />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {type === "edit" && (
          <div className="bg-white rounded-2xl border border-orange-900/10 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${book.status === "SOLD" ? "bg-green-50 text-green-600" : "bg-stone-50 text-stone-400"}`}
                >
                  {book.status === "SOLD" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <CircleDashed size={20} />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#2d1a0e] uppercase tracking-wider">
                  {t("edit_book.status_sold")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBook((p: any) => ({
                    ...p,
                    status: p.status === "SOLD" ? "ACTIVE" : "SOLD",
                  }))
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${book.status === "SOLD" ? "bg-green-600" : "bg-stone-300"}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${book.status === "SOLD" ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        )}

        <div
          className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${errors.title || errors.price ? "border-red-300 ring-1 ring-red-100" : "border-orange-900/10"}`}
          data-error={!!(errors.title || errors.price)}
        >
          <div className="flex items-center gap-3 mb-5">
            <BookOpen
              size={20}
              className={errors.title ? "text-red-500" : "text-[#8b5e3c]"}
            />
            <h3 className="text-lg font-medium text-[#2d1a0e]">
              {t("sell.steps.book_info")}
            </h3>
          </div>
          <BookFormFields
            book={book as unknown as Book}
            onChange={(f, v) => {
              setBook((p: any) => ({ ...p, [f]: v }));
              if (errors[f])
                setErrors((prev) => {
                  const n = { ...prev };
                  delete n[f];
                  return n;
                });
            }}
          />
        </div>

        <div
          className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${errors.photos ? "border-red-300 bg-red-50/30" : "border-orange-900/10"}`}
          data-error={!!errors.photos}
        >
          <div className="flex items-center gap-3 mb-5">
            <ImageIcon
              size={20}
              className={errors.photos ? "text-red-500" : "text-[#8b5e3c]"}
            />
            <h3 className="text-lg font-medium text-[#2d1a0e]">
              {t("sell.steps.photos")} ({items.length}/5){" "}
              <span className="text-red-500">*</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-stone-100 group"
              >
                <img
                  src={item.url}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => movePhoto(idx, "left")}
                    disabled={idx === 0}
                    className="text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(idx, "right")}
                    disabled={idx === items.length - 1}
                    className="text-white disabled:opacity-30"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    ОБЛОЖКА
                  </div>
                )}
              </div>
            ))}
            {items.length < 5 && (
              <label
                className={`aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all ${errors.photos ? "border-red-300 bg-red-50" : "border-stone-200 hover:border-amber-500 hover:bg-amber-50"}`}
              >
                <ImageIcon className="text-stone-400 mb-2" />
                <span className="text-[10px] text-stone-500 font-medium">
                  ДОБАВИТЬ
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotos}
                />
              </label>
            )}
          </div>
          {errors.photos && (
            <p className="text-xs text-red-600 font-medium mt-1">
              {errors.photos}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-orange-900/20 bg-white text-[#7a5030] font-medium active:scale-95 transition-transform"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-2 py-3.5 rounded-xl bg-gradient-to-br from-[#7a4020] to-[#a0602a] text-white font-medium shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
          >
            {submitting ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
};
