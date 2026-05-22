import type { UserRole } from "@/lib/constants";

export type AppStatus = "draft" | "published" | "rejected" | "flagged";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: UserRole;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      apps: {
        Row: {
          id: string;
          developer_id: string;
          category_id: string | null;
          name: string;
          package_name: string;
          version: string;
          description: string | null;
          tags: string[];
          privacy_policy_url: string | null;
          apk_url: string | null;
          icon_url: string | null;
          status: AppStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          developer_id: string;
          category_id?: string | null;
          name: string;
          package_name: string;
          version: string;
          description?: string | null;
          tags?: string[];
          privacy_policy_url?: string | null;
          apk_url?: string | null;
          icon_url?: string | null;
          status?: AppStatus;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["apps"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "apps_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "apps_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      app_versions: {
        Row: {
          id: string;
          app_id: string;
          version_name: string;
          version_code: number | null;
          apk_url: string | null;
          apk_size: number | null;
          changelog: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          version_name: string;
          version_code?: number | null;
          apk_url?: string | null;
          apk_size?: number | null;
          changelog?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_versions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "app_versions_app_id_fkey";
            columns: ["app_id"];
            isOneToOne: false;
            referencedRelation: "apps";
            referencedColumns: ["id"];
          }
        ];
      };
      app_screenshots: {
        Row: {
          id: string;
          app_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          image_url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_screenshots"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "app_screenshots_app_id_fkey";
            columns: ["app_id"];
            isOneToOne: false;
            referencedRelation: "apps";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          app_id: string;
          user_id: string;
          rating: number;
          body: string | null;
          developer_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          user_id: string;
          rating: number;
          body?: string | null;
          developer_response?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reviews_app_id_fkey";
            columns: ["app_id"];
            isOneToOne: false;
            referencedRelation: "apps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      downloads: {
        Row: {
          id: string;
          app_id: string;
          user_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          app_id: string;
          user_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["downloads"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "downloads_app_id_fkey";
            columns: ["app_id"];
            isOneToOne: false;
            referencedRelation: "apps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "downloads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          app_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          app_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_app_id_fkey";
            columns: ["app_id"];
            isOneToOne: false;
            referencedRelation: "apps";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
        Relationships: [];
      };
      upload_scans: {
        Row: {
          id: string;
          developer_id: string | null;
          package_name: string | null;
          folder: string;
          file_name: string;
          file_type: string | null;
          file_size: number | null;
          sha256: string;
          virus_total_status: string;
          virus_total_source: string | null;
          virus_total_analysis_id: string | null;
          malicious_count: number;
          suspicious_count: number;
          harmless_count: number;
          undetected_count: number;
          timeout_count: number;
          r2_bucket: string | null;
          r2_key: string | null;
          r2_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          developer_id?: string | null;
          package_name?: string | null;
          folder: string;
          file_name: string;
          file_type?: string | null;
          file_size?: number | null;
          sha256: string;
          virus_total_status: string;
          virus_total_source?: string | null;
          virus_total_analysis_id?: string | null;
          malicious_count?: number;
          suspicious_count?: number;
          harmless_count?: number;
          undetected_count?: number;
          timeout_count?: number;
          r2_bucket?: string | null;
          r2_key?: string | null;
          r2_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["upload_scans"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "upload_scans_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      app_status: AppStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
