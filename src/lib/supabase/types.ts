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
