// Database types — placeholder until `supabase gen types typescript` is available.
// Replace this file with auto-generated types once the Supabase project is set up.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuoteStatus =
  | "draft"
  | "new"
  | "contacted"
  | "in_progress"
  | "quoted"
  | "accepted"
  | "rejected"
  | "archived";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          company_name: string | null;
          role: "user" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          company_name?: string | null;
          role?: "user" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          company_name?: string | null;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          user_id: string | null;
          status: QuoteStatus;
          service_id: string;
          service_name: string;
          tier_key: string;
          tier_name: string;
          tier_price: number;
          add_ons: Json;
          features: Json;
          business_name: string | null;
          sector: string | null;
          style: string | null;
          color_palette: string[];
          description: string | null;
          reference_urls: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          contact_message: string | null;
          total_one_time: number;
          total_monthly: number;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: QuoteStatus;
          service_id: string;
          service_name: string;
          tier_key: string;
          tier_name: string;
          tier_price: number;
          add_ons?: Json;
          features?: Json;
          business_name?: string | null;
          sector?: string | null;
          style?: string | null;
          color_palette?: string[];
          description?: string | null;
          reference_urls?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_message?: string | null;
          total_one_time?: number;
          total_monthly?: number;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: QuoteStatus;
          user_id?: string | null;
          service_id?: string;
          service_name?: string;
          tier_key?: string;
          tier_name?: string;
          tier_price?: number;
          add_ons?: Json;
          features?: Json;
          business_name?: string | null;
          sector?: string | null;
          style?: string | null;
          color_palette?: string[];
          description?: string | null;
          reference_urls?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_message?: string | null;
          total_one_time?: number;
          total_monthly?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      previews: {
        Row: {
          id: string;
          quote_id: string | null;
          user_id: string | null;
          storage_path: string;
          prompt_hash: string | null;
          prompt_input: Json | null;
          file_size_bytes: number | null;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id?: string | null;
          user_id?: string | null;
          storage_path: string;
          prompt_hash?: string | null;
          prompt_input?: Json | null;
          file_size_bytes?: number | null;
          mime_type?: string;
          created_at?: string;
        };
        Update: {
          quote_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          id: number;
          key: string;
          action: string;
          window_start: string;
          count: number;
        };
        Insert: {
          key: string;
          action: string;
          window_start: string;
          count?: number;
        };
        Update: {
          count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_and_increment_rate_limit: {
        Args: {
          p_key: string;
          p_action: string;
          p_max_count: number;
          p_window_interval: unknown;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
