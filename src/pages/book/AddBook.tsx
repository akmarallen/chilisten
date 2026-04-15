import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, CheckCircle, Search } from "lucide-react";
import { ISBNSearchForm } from "../../components/BookForm/ISBNSearchForm";
import { BookForm, BookPhotoItem } from "../../components/BookForm/BookForm";
import authStore from "../../context/auth";
import { useStore } from "zustand";
import { useTranslation } from "react-i18next";

const AddBook = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useStore(authStore, (state) => state.user);

  const [initialBookData, setInitialBookData] = useState<any>({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    description: "",
    price: "",
    city: user?.city || "Бишкек",
    condition: "GOOD",
    district: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addOneMore = () => {
    setInitialBookData({
      title: "",
      author: "",
      isbn: "",
      genre: "",
      description: "",
      price: "",
      city: user?.city || "Бишкек",
      condition: "GOOD",
      district: "",
    });
    setSuccess(false);
  };

  const handlePublish = async (
    bookData: any,
    photos: BookPhotoItem[],
    _deletedIds: string[],
  ) => {
    setSubmitting(true);
    setServerError(null);
    const newlyUploadedPaths: string[] = [];

    try {
      // 1. Insert the Book
      const { data: book, error: bookError } = await supabase
        .from("books")
        .insert([
          {
            seller_id: user!.id,
            title: bookData.title.trim(),
            author: bookData.author?.trim() || null,
            isbn: bookData.isbn?.trim() || null,
            genre: bookData.genre || null,
            description: bookData.description?.trim() || null,
            price: Number(bookData.price),
            condition: bookData.condition,
            city: bookData.city,
            district: bookData.district?.trim() || null,
            status: "PENDING",
          },
        ])
        .select()
        .single();

      if (bookError) throw bookError;

      if (photos.length > 0) {
        const photoRows = [];
        let firstUrl = "";

        for (let i = 0; i < photos.length; i++) {
          const item = photos[i];
          if (!item.file) continue;

          const ext = item.file.name.split(".").pop();
          const fileName = `${book.id}/${Date.now()}-${i}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("book_photos")
            .upload(fileName, item.file);

          if (upErr) throw upErr;
          newlyUploadedPaths.push(fileName);

          const { data: urlData } = supabase.storage
            .from("book_photos")
            .getPublicUrl(fileName);

          if (i === 0) firstUrl = urlData.publicUrl;
          photoRows.push({
            book_id: book.id,
            url: urlData.publicUrl,
            sort_order: i,
          });
        }

        if (photoRows.length > 0) {
          await supabase.from("book_photos").insert(photoRows);
          await supabase
            .from("books")
            .update({ cover_url: firstUrl })
            .eq("id", book.id);
        }
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (newlyUploadedPaths.length > 0) {
        await supabase.storage.from("book_photos").remove(newlyUploadedPaths);
      }
      setServerError(err.message || "Что-то пошло не так");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#fdf8f3] gap-5 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl text-[#2d1a0e] font-bold">
          {t("sell.success.title")}
        </h1>
        <p className="text-[#7a5030] max-w-sm font-light">
          {t("sell.success.description")}
        </p>
        <div className="bg-orange-900/5 rounded-xl px-5 py-2.5 text-sm text-orange-900">
          ⏱ {t("sell.success.time_info")}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate("/catalog")}
            className="bg-[#7a4020] text-white px-8 py-3 rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
          >
            {t("sell.success.go_to_catalog")}
          </button>
          <button
            onClick={addOneMore}
            className="border border-[#7a4020] text-[#7a4020] px-8 py-3 rounded-xl font-medium active:scale-95 transition-transform"
          >
            {t("sell.success.add_more")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 bg-[#fdf8f3] min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#a07850] hover:text-[#7a4020] mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> {t("common.back")}
      </button>
      <h1 className="text-3xl font-bold text-[#2d1a0e] mb-1">
        {t("sell.title")}
      </h1>

      <div className="pt-4">
        <div className="bg-white rounded-2xl border border-orange-900/10 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div>
              <h3 className="text-lg font-medium text-[#2d1a0e]">
                {t("sell.steps.isbn_search")}
              </h3>
              <p className="text-[11px] text-[#a07850]">
                {t("sell.steps.isbn_desc")}
              </p>
            </div>
            <Search size={18} className="text-[#c4956a] ml-auto" />
          </div>
          <ISBNSearchForm
            onBookFound={(data: any) => {
              setInitialBookData({
                ...initialBookData,
                title: data.title || "",
                author: data.author || "",
                isbn: data.isbn || "",
                genre: data.genre || "",
                description: data.description || "",
              });
            }}
          />
        </div>
      </div>
      <BookForm
        type="create"
        key={JSON.stringify(initialBookData)}
        initialData={initialBookData}
        submitting={submitting}
        serverError={serverError}
        onCancel={() => navigate(-1)}
        onSubmit={handlePublish}
      />
    </div>
  );
};

export default AddBook;
