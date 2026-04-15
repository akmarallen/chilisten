import { supabase } from "../lib/supabase";
import { Tables } from "./database.types";

export type User = Tables<"users">;

export type UpdateUserDto = Partial<
  Pick<
    User,
    "full_name" | "phone" | "city" | "avatar_url" | "role" | "is_suspended"
  >
>;

export const userService = {
  getCurrentSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  getCurrentUser: async () => {
    const session = await userService.getCurrentSession();
    if (!session?.user) return;
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();
    return user as User;
  },

  async getAllUsers(page: number, pageSize: number, search?: string) {
    let query = supabase.from("users").select("*", { count: "exact" });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data as User[], count };
  },

  async updateUser(userId: string, updates: UpdateUserDto) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  logout: async () => {
    return supabase.auth.signOut();
  },

  async getSellerProfile(sellerId: string, userId?: string) {
    const query = supabase
      .from("users")
      .select(
        `
        id, full_name, avatar_url, rating, total_sales, city, created_at,
        books!books_seller_id_fkey (
          *,
          liked:favorites!left (id)
        )
      `,
      )
      .eq("id", sellerId)
      .eq("books.status", "ACTIVE");

    if (userId) {
      query.eq("books.favorites.user_id", userId);
    }

    return query.single();
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw error;
    return true;
  },
  async updateAvatar(user: User, file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    try {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { data, error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (user?.avatar_url) {
        try {
          const oldUrlParts = user.avatar_url.split("/avatars/");
          if (oldUrlParts.length > 1) {
            const oldFilePath = oldUrlParts[1];
            await supabase.storage.from("avatars").remove([oldFilePath]);
          }
        } catch (cleanupError) {
          console.error("Failed to delete old avatar:", cleanupError);
        }
      }

      return { data: data as User };
    } catch (error) {
      await supabase.storage.from("avatars").remove([filePath]);
      throw error;
    }
  },
};
