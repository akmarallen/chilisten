import { supabase } from "../lib/supabase";
import { PAGE_SIZE } from "../utils/const/const";
import { Tables } from "./database.types";

export type Review = Tables<"reviews">;
export type ReviewInsert = Tables<"reviews">;

export const reviewService = {
  async getReviewsPaginated({
    bookId,
    sellerId,
    page,
    excludeUserId,
  }: {
    bookId?: string;
    sellerId?: string;
    page: number;
    excludeUserId?: string;
  }) {
    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        reviewer:reviewer_id (full_name, avatar_url)
      `,
        { count: "exact" },
      )
      .eq("is_verified", true);
    if (sellerId) query.eq("seller_id", sellerId);
    if (bookId) query.eq("book_id", bookId);
    query.order("created_at", { ascending: false });

    if (excludeUserId) {
      query = query.neq("reviewer_id", excludeUserId);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return { data, count, totalPages: Math.ceil((count || 0) / PAGE_SIZE) };
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw new Error(error.message);
  },

  async getMyReviewForBook(bookId: string, userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        reviewer:reviewer_id (full_name, avatar_url)
      `,
      )
      .eq("book_id", bookId)
      .eq("reviewer_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
