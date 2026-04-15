import { useTranslation } from "react-i18next";
import { getConditions, getGenres } from "../../utils/const/const";
import { Book } from "../../api/books.api";

const inputClasses =
  "w-full px-3 py-3 border border-[#ecf0f1] rounded-md text-[0.95rem] font-sans box-border focus:border-orange-900/30 focus:ring-0 outline-none transition-colors placeholder:text-slate-400";
const labelClasses = "block mb-2 font-semibold text-[#2c3e50]";

type Props = {
  book: Book;
  onChange: (field: string, value: string) => void;
};

export default function BookFormFields({ book, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6">
      <div>
        <label className={labelClasses}>Название книги *</label>
        <input
          type="text"
          placeholder="Война и мир"
          value={book.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>Автор *</label>
        <input
          type="text"
          placeholder="Лев Толстой"
          value={book.author || ""}
          onChange={(e) => onChange("author", e.target.value)}
          className={inputClasses}
          required
        />
      </div>

      {/* ISBN & GENRE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>ISBN</label>
          <input
            type="text"
            placeholder="978-5-..."
            value={book.isbn || ""}
            onChange={(e) => onChange("isbn", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="relative">
          <label className={labelClasses}>Жанр</label>
          <input
            list="genre-suggestions"
            type="text"
            placeholder="Выберите или введите..."
            value={book.genre || ""}
            onChange={(e) => onChange("genre", e.target.value)}
            className={inputClasses}
          />
          <datalist id="genre-suggestions">
            {getGenres(t).map((g) => (
              <option key={g.value} value={g.label} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className={labelClasses}>Описание</label>
        <textarea
          placeholder="Расскажите о книге..."
          value={book.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          className={`${inputClasses} resize-y min-h-[120px]`}
          maxLength={1000}
        />
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-slate-400 font-light">
            {book.description?.length || 0}/1000
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Цена (сом) *</label>
          <input
            type="number"
            placeholder="100"
            value={book.price || ""}
            onChange={(e) => onChange("price", e.target.value)}
            className={inputClasses}
            min="0"
            required
          />
        </div>

        <div>
          <label className={labelClasses}>Состояние *</label>
          <select
            value={book.condition || "GOOD"}
            onChange={(e) => onChange("condition", e.target.value)}
            className={`${inputClasses} bg-white appearance-none`}
            required
          >
            {getConditions(t).map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Город *</label>
          <select
            value={book.city || "Бишкек"}
            onChange={(e) => onChange("city", e.target.value)}
            className={`${inputClasses} bg-white appearance-none`}
            required
          >
            <option value="Бишкек">Бишкек</option>
            <option value="Ош">Ош</option>
            <option value="Джалалабад">Джалалабад</option>
            <option value="Каракол">Каракол</option>
            <option value="Нарын">Нарын</option>
            <option value="Талас">Талас</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Район</label>
          <input
            type="text"
            placeholder="Советский"
            value={book.district || ""}
            onChange={(e) => onChange("district", e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}
