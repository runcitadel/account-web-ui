export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Backups: {
        Row: {
          created_at: string | null;
          key: string;
          backup_id: string;
        };
        Insert: {
          created_at?: string | null;
          key: string;
          backup_id: string;
        };
        Update: {
          created_at?: string | null;
          key?: string;
          backup_id?: string;
        };
      };
      subdomains: {
        Row: {
          id: string;
          created_at: string | null;
          domain: string;
          secret: string;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          domain: string;
          secret: string;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          domain?: string;
          secret?: string;
        };
      };
      reverse_proxies: {
        Row: {
          id: number;
          target_url: string;
          host: string;
          owner: string;
          btcpay_compat: boolean;
        };
        Insert: {
          id?: number;
          target_url: string;
          host: string;
          owner: string;
          btcpay_compat?: boolean;
        };
        Update: {
          id?: number;
          target_url?: string;
          host?: string;
          owner?: string;
          btcpay_compat?: boolean;
        };
      };
      LightningAddresses: {
        Row: {
          id: number;
          proxyTarget: string | null;
          user_id: string | null;
          address: string | null;
          domain: string | null;
          provider: Database["public"]["Enums"]["provider"];
        };
        Insert: {
          id?: number;
          proxyTarget?: string | null;
          user_id?: string | null;
          address?: string | null;
          domain?: string | null;
          provider?: Database["public"]["Enums"]["provider"];
        };
        Update: {
          id?: number;
          proxyTarget?: string | null;
          user_id?: string | null;
          address?: string | null;
          domain?: string | null;
          provider?: Database["public"]["Enums"]["provider"];
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      sort_array: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
      unique_backup_uploads_today: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      unique_backup_uploads: {
        Args: { since: string; until: string };
        Returns: string;
      };
    };
    Enums: {
      provider: "lnme" | "alby" | "otheraddr" | "lnbits" | "bolt12" | "lnurl";
    };
  };
}

