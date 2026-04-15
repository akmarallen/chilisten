export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      book_photos: {
        Row: {
          book_id: string
          id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          book_id: string
          id?: string
          sort_order?: number | null
          url: string
        }
        Update: {
          book_id?: string
          id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_photos_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          city: string | null
          condition: Database["public"]["Enums"]["book_condition"]
          cover_url: string | null
          created_at: string | null
          description: string | null
          district: string | null
          genre: string | null
          id: string
          isbn: string | null
          price: number
          search_vector: unknown
          seller_id: string
          status: Database["public"]["Enums"]["book_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          city?: string | null
          condition?: Database["public"]["Enums"]["book_condition"]
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          price: number
          search_vector?: unknown
          seller_id: string
          status?: Database["public"]["Enums"]["book_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          city?: string | null
          condition?: Database["public"]["Enums"]["book_condition"]
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          district?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          price?: number
          search_vector?: unknown
          seller_id?: string
          status?: Database["public"]["Enums"]["book_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "books_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          book_id: string | null
          created_at: string | null
          id: string
          reason: string
          reporter_id: string
          seller_id: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          reason: string
          reporter_id: string
          seller_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          seller_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          book_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Insert: {
          book_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating: number
          reviewer_id: string
          seller_id: string
        }
        Update: {
          book_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          reviewer_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          is_verified: boolean | null
          phone: string | null
          rating: number | null
          role: string
          total_sales: number | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          role?: string
          total_sales?: number | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          role?: string
          total_sales?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_approve_book: { Args: { book_id: string }; Returns: undefined }
      ensure_user_profile: { Args: { user_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      moderator_approve_book: { Args: { book_id: string }; Returns: undefined }
      moderator_reject_book:
        | { Args: { book_id: string }; Returns: undefined }
        | { Args: { book_id: string; reason?: string }; Returns: undefined }
      moderator_resolve_report:
        | { Args: { report_id: string }; Returns: undefined }
        | {
            Args: {
              new_status?: Database["public"]["Enums"]["report_status"]
              report_id: string
            }
            Returns: undefined
          }
      search_books: {
        Args: {
          max_price?: number
          min_price?: number
          p_city?: string
          p_condition?: Database["public"]["Enums"]["book_condition"]
          p_genre?: string
          p_limit?: number
          p_offset?: number
          query?: string
        }
        Returns: {
          author: string | null
          city: string | null
          condition: Database["public"]["Enums"]["book_condition"]
          cover_url: string | null
          created_at: string | null
          description: string | null
          district: string | null
          genre: string | null
          id: string
          isbn: string | null
          price: number
          search_vector: unknown
          seller_id: string
          status: Database["public"]["Enums"]["book_status"]
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "books"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      toggle_book_favorite: {
        Args: { target_book_id: string }
        Returns: boolean
      }
      update_book_complete: {
        Args: {
          p_book_data: Json
          p_book_id: string
          p_deleted_photo_ids: string[]
          p_existing_sort_updates: Json[]
          p_new_photos: Json[]
        }
        Returns: undefined
      }
    }
    Enums: {
      book_condition: "EXCELLENT" | "GOOD" | "FAIR"
      book_status: "ACTIVE" | "SOLD" | "PENDING" | "ARCHIVED" | "REJECTED"
      report_status: "NEW" | "PENDING" | "RESOLVED" | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      book_condition: ["EXCELLENT", "GOOD", "FAIR"],
      book_status: ["ACTIVE", "SOLD", "PENDING", "ARCHIVED", "REJECTED"],
      report_status: ["NEW", "PENDING", "RESOLVED", "REJECTED"],
    },
  },
} as const
