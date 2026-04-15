import { useState } from "react";
import { Search, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ISBNSearchForm = ({
  onBookFound,
}: {
  onBookFound: (book: any) => void;
}) => {
  const [error, setError] = useState("");

  const { t } = useTranslation();
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("isbn");

  const handleSearchByISBN = async () => {
    if (!isbn.trim()) {
      setError(t("sell.search.error_empty_isbn"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.trim()}&maxResults=1`,
      );

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      if (data.items?.length > 0) {
        const book = data.items[0].volumeInfo;
        onBookFound({
          title: book.title || "",
          author: book.authors?.join(", ") || "",
          isbn: isbn.trim(),
          genre: book.categories?.[0] || "",
          description: book.description?.slice(0, 500) || "",
          cover_url: book.imageLinks?.thumbnail || null,
        });
        setIsbn("");
      } else {
        setError(t("sell.search.error_not_found"));
      }
    } catch (err) {
      setError(t("sell.search.error_not_found"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByTitle = async () => {
    if (!title.trim()) {
      setError(t("sell.search.error_empty_title"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=1`,
      );

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      if (data.items?.length > 0) {
        const book = data.items[0].volumeInfo;
        onBookFound({
          title: book.title || "",
          author: book.authors?.join(", ") || "",
          isbn: book.industryIdentifiers?.[0]?.identifier || "",
          genre: book.categories?.[0] || "",
          description: book.description?.slice(0, 500) || "",
          cover_url: book.imageLinks?.thumbnail || null,
        });
        setTitle("");
      } else {
        setError(t("sell.search.error_not_found"));
      }
    } catch (err) {
      setError(t("sell.search.error_network"));
    } finally {
      setLoading(false);
    }
  };

  const tabStyles = (mode: string) =>
    `flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm border-2 ${
      searchMode === mode
        ? "bg-[#8B5E3C] border-[#8B5E3C] text-white"
        : "bg-transparent border-[#e5d9c8] text-[#7a5030] hover:border-[#8B5E3C]/30"
    }`;

  const inputStyles =
    "flex-1 px-4 py-2.5 bg-white border border-[#e5d9c8] rounded-xl outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all text-sm placeholder:text-stone-400";

  const buttonStyles =
    "px-6 py-2.5 bg-linear-to-br from-[#7a4020] to-[#a0602a] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed whitespace-nowrap shadow-sm";

  return (
    <div className="p-6 bg-[#8B5E3C]/5 rounded-2xl border border-[#8B5E3C]/15">
      {/* TABS */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSearchMode("isbn")}
          className={tabStyles("isbn")}
        >
          {t("sell.search.tab_isbn")}
        </button>
        <button
          type="button"
          onClick={() => setSearchMode("title")}
          className={tabStyles("title")}
        >
          {t("sell.search.tab_title")}
        </button>
      </div>

      {/* SEARCH FORM */}
      <div className="flex flex-col sm:flex-row gap-2">
        {searchMode === "isbn" ? (
          <input
            type="text"
            placeholder="978-5-17..."
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearchByISBN()}
            className={inputStyles}
          />
        ) : (
          <input
            type="text"
            placeholder={t("sell.search.placeholder_title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearchByTitle()}
            className={inputStyles}
          />
        )}

        <button
          onClick={
            searchMode === "isbn" ? handleSearchByISBN : handleSearchByTitle
          }
          disabled={loading}
          className={buttonStyles}
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              {t("sell.search.loading")}
            </>
          ) : (
            <>
              <Search size={18} />
              {t("sell.search.button")}
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-[11px] text-red-500 opacity-80 leading-tight">
          {error}
        </p>
      )}
      {/* INFO */}
      <p className="mt-3 text-[11px] text-[#7a5030] opacity-80 leading-tight">
        {t("sell.search.hint")}
      </p>
    </div>
  );
};
