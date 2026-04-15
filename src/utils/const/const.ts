import { TFunction } from "i18next";
import { Constants } from "../../api/database.types";

const CITIES = [
  "Бишкек",
  "Ош",
  "Жалал-Абад",
  "Каракол",
  "Токмок",
  "Нарын",
  "Талас",
  "Баткен",
];

export const getConditionMap = (
  t: TFunction<"ru">,
): Record<(typeof Constants.public.Enums.book_condition)[number], string> => {
  return {
    EXCELLENT: t("catalog.conditions.excellent"),
    GOOD: t("catalog.conditions.good"),
    FAIR: t("catalog.conditions.fair"),
  } as const;
};
export const getConditions = (
  t: TFunction<"ru">,
): {
  value: (typeof Constants.public.Enums.book_condition)[number];
  label: string;
}[] => {
  const map = getConditionMap(t);

  return Object.entries(map).map(([value, label]) => ({
    value: value as (typeof Constants.public.Enums.book_condition)[number],
    label,
  }));
};

export const getSortOptions = (t: TFunction<"ru">) => {
  return [
    { value: "date_desc", label: t("catalog.sort.newest") },
    { value: "date_asc", label: t("catalog.sort.oldest") },
    { value: "price_asc", label: t("catalog.sort.cheapest") },
    { value: "price_desc", label: t("catalog.sort.most_expensive") },
  ];
};

const PAGE_SIZE = 12;

const getGenres = (t: any) => {
  return [
    { value: "", label: t("genres.all"), emoji: "📚" },
    { value: "fiction", label: t("genres.fiction"), emoji: "✍️" },
    { value: "nonfiction", label: t("genres.nonfiction"), emoji: "🧠" },
    { value: "education", label: t("genres.education"), emoji: "🎓" },
    { value: "children", label: t("genres.children"), emoji: "🧸" },
    { value: "science", label: t("genres.science"), emoji: "🔬" },
    { value: "history", label: t("genres.history"), emoji: "🏛️" },
    { value: "psychology", label: t("genres.psychology"), emoji: "🧠" },
    { value: "business", label: t("genres.business"), emoji: "💼" },
  ];
};

const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";

export { getGenres, CITIES, PAGE_SIZE, GOOGLE_BOOKS_API_URL };
