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
      };
      apps: {
        Row: {
          id: string;
          developer_id: string;
          category_id: string | null;
          name: string;
          package_name: string;
          version: string;
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
          apk_url?: string | null;
          icon_url?: string | null;
          status?: AppStatus;
        };
        Update: Partial<Database["public"]["Tables"]["apps"]["Insert"]>;
      };
    };
  };
};

