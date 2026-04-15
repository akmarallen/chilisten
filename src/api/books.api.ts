import { supabase } from "../lib/supabase";
import { BookSearchFilters } from "../components/CatalogSection/CatalogSection";
import { PAGE_SIZE } from "../utils/const/const";
import { Tables } from "./database.types";

export type Book = Tables<"books">;
export type BookPhoto = Tables<"book_photos">;

export const bookService = {
  getBookById(bookId: string, userId?: string) {
    const query = supabase
      .from("books")
      .select(
        `
    *,
    seller:seller_id (
      id, full_name, avatar_url, rating, total_sales, city, phone, created_at 
    ),
    photos:book_photos (
      id,
      url,
      sort_order
    ),
    is_liked:favorites!left(id)
  `,
      )
      .eq("id", bookId)
      .order("sort_order", { foreignTable: "book_photos", ascending: true });

    if (userId) {
      query.eq("favorites.user_id", userId);
    }

    return query.single();
  },

  async getMyBooks(userId: string, page: number) {
    const queryBuilder = supabase
      .from("books")
      .select("*", { count: "exact" })
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    return queryBuilder.range(from, to);
  },

  async getBooks(filters: BookSearchFilters, page: number) {
    const baseSelect = `
      *,
      seller:seller_id (
        rating
      ), liked:favorites!left(id)
    `;

    let queryBuilder = supabase
      .from("books")
      .select(baseSelect, { count: "exact" });

    if (filters.search) {
      queryBuilder = queryBuilder.textSearch("search_vector", filters.search, {
        config: "russian",
        type: "plain",
      });
    }

    if (filters.genre) queryBuilder = queryBuilder.eq("genre", filters.genre);
    queryBuilder = queryBuilder.eq("status", "ACTIVE");
    if (filters.city) queryBuilder = queryBuilder.eq("city", filters.city);
    if (filters.condition)
      queryBuilder = queryBuilder.eq("condition", filters.condition);
    if (filters.minPrice)
      queryBuilder = queryBuilder.gte("price", parseInt(filters.minPrice));
    if (filters.maxPrice)
      queryBuilder = queryBuilder.lte("price", parseInt(filters.maxPrice));

    const currentUserId =
      filters.userId || "00000000-0000-0000-0000-000000000000";

    queryBuilder = queryBuilder.eq("favorites.user_id", currentUserId);

    if (filters.sort === "price_asc")
      queryBuilder = queryBuilder.order("price", { ascending: true });
    else if (filters.sort === "price_desc")
      queryBuilder = queryBuilder.order("price", { ascending: false });
    else if (filters.sort === "date_asc")
      queryBuilder = queryBuilder.order("created_at", { ascending: true });
    else queryBuilder = queryBuilder.order("created_at", { ascending: false });

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    return queryBuilder.range(from, to);
  },

  async toggleBookLike(bookId: string) {
    const { data: isNowLiked, error } = await supabase.rpc(
      "toggle_book_favorite",
      { target_book_id: bookId },
    );
    return isNowLiked;
  },

  async getFavoriteBooks(userId: string, page: number) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: favIds } = await supabase
      .from("favorites")
      .select("book_id")
      .eq("user_id", userId);

    const bookIds = favIds?.map((f) => f.book_id) || [];

    if (bookIds.length === 0) return { data: [], count: 0, error: null };

    return supabase
      .from("books")
      .select(
        `
      *,
      seller:seller_id (rating),
      liked:favorites!inner(id)
    `,
        { count: "exact" },
      )
      .in("id", bookIds)
      .eq("favorites.user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
  },

  async deleteBook(bookId: string) {
    return supabase.from("books").delete().eq("id", bookId);
  },
};
