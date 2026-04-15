import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { BookForm, BookPhotoItem } from "../../components/BookForm/BookForm";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import { ArrowLeft, Loader } from "lucide-react";

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [data, setData] = useState<{
    book: any;
    photos: BookPhotoItem[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const { data: bookData, error: bookError } = await supabase
          .from("books")
          .select("*, book_photos(*)")
          .eq("id", id!)
          .single();

        if (bookError) throw bookError;

        const photos: BookPhotoItem[] = (bookData.book_photos || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((p: any) => ({
            id: p.id,
            url: p.url,
            type: "existing",
          }));

        setData({ book: bookData, photos });
      } catch (err: any) {
        toast.error(t("profile.books.fetch_error"));
        navigate("/profile/books");
      }
    };
    fetchBookData();
  }, [id, navigate, t]);

  const handleSave = async (
    book: any,
    photos: BookPhotoItem[],
    deletedIds: string[],
  ) => {
    setServerError(null);
    setSubmitting(true);

    const newlyUploadedPaths: string[] = [];

    try {
      const newPhotosForDb: { url: string; sort_order: number }[] = [];
      const existingSortUpdates: { id: string; sort_order: number }[] = [];
      let firstPhotoUrl = "";

      for (let i = 0; i < photos.length; i++) {
        const item = photos[i];

        if (item.type === "new" && item.file) {
          const ext = item.file.name.split(".").pop();
          const fileName = `${id}/${Date.now()}-${i}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("book_photos")
            .upload(fileName, item.file);

          if (upErr) throw upErr;
          newlyUploadedPaths.push(fileName);

          const { data: urlData } = supabase.storage
            .from("book_photos")
            .getPublicUrl(fileName);

          newPhotosForDb.push({ url: urlData.publicUrl, sort_order: i });
          if (i === 0) firstPhotoUrl = urlData.publicUrl;
        } else if (item.type === "existing" && item.id) {
          existingSortUpdates.push({ id: item.id, sort_order: i });
          if (i === 0) firstPhotoUrl = item.url;
        }
      }

      const { error: txError } = await supabase.rpc("update_book_complete", {
        p_book_id: id!,
        p_book_data: {
          title: book.title.trim(),
          author: book.author?.trim() || null,
          isbn: book.isbn?.trim() || null,
          genre: book.genre || null,
          description: book.description?.trim() || null,
          price: Number(book.price),
          condition: book.condition,
          city: book.city,
          district: book.district?.trim() || null,
          status: book.status,
          cover_url: firstPhotoUrl,
        },
        p_deleted_photo_ids: deletedIds,
        p_new_photos: newPhotosForDb,
        p_existing_sort_updates: existingSortUpdates,
      });

      if (txError) throw txError;

      if (deletedIds.length > 0) {
        const pathsToDelete = data?.photos
          .filter((p) => deletedIds.includes(p.id!))
          .map((p) => p.url.split("book_photos/").pop())
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          await supabase.storage.from("book_photos").remove(pathsToDelete);
        }
      }

      toast.success(t("edit_book.save_success"));
      navigate(-1);
    } catch (err: any) {
      console.error("Save failed:", err);
      if (newlyUploadedPaths.length > 0) {
        await supabase.storage.from("book_photos").remove(newlyUploadedPaths);
      }
      setServerError(err.message || t("edit_book.save_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center bg-[#fdf8f3]">
        <Loader className="animate-spin text-[#7a4020]" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 bg-[#fdf8f3] min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#a07850] hover:text-[#7a4020] mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> {t("common.back")}
      </button>

      <h1 className="text-3xl font-bold text-[#2d1a0e] mb-1">
        {t("common.edit")}
      </h1>
      {data.book.title && (
        <p className="text-sm text-[#a07850] mb-8">{data.book.title}</p>
      )}

      <BookForm
        type="edit"
        initialData={data.book}
        initialPhotos={data.photos}
        submitting={submitting}
        serverError={serverError}
        onCancel={() => navigate(-1)}
        onSubmit={handleSave}
      />
      <AiAssistant />
    </div>
  );
};

export default EditBook;
