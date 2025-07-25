export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number;
          checksum: string;
          finished_at: string | null;
          id: string;
          logs: string | null;
          migration_name: string;
          rolled_back_at: string | null;
          started_at: string;
        };
        Insert: {
          applied_steps_count?: number;
          checksum: string;
          finished_at?: string | null;
          id: string;
          logs?: string | null;
          migration_name: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Update: {
          applied_steps_count?: number;
          checksum?: string;
          finished_at?: string | null;
          id?: string;
          logs?: string | null;
          migration_name?: string;
          rolled_back_at?: string | null;
          started_at?: string;
        };
        Relationships: [];
      };
      farm_members: {
        Row: {
          created_at: string;
          farm_id: string;
          id: string;
          is_active: boolean;
          position: string | null;
          responsibilities: string | null;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          farm_id: string;
          id?: string;
          is_active?: boolean;
          position?: string | null;
          responsibilities?: string | null;
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          farm_id?: string;
          id?: string;
          is_active?: boolean;
          position?: string | null;
          responsibilities?: string | null;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "farm_members_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "farm_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      farms: {
        Row: {
          created_at: string;
          description: string | null;
          farm_address: string;
          farm_detailed_address: string | null;
          farm_name: string;
          farm_type: string | null;
          id: string;
          is_active: boolean;
          manager_name: string | null;
          manager_phone: string | null;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          farm_address: string;
          farm_detailed_address?: string | null;
          farm_name: string;
          farm_type?: string | null;
          id?: string;
          is_active?: boolean;
          manager_name?: string | null;
          manager_phone?: string | null;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          farm_address?: string;
          farm_detailed_address?: string | null;
          farm_name?: string;
          farm_type?: string | null;
          id?: string;
          is_active?: boolean;
          manager_name?: string | null;
          manager_phone?: string | null;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "farms_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          data: Json | null;
          id: string;
          link: string | null;
          message: string;
          read: boolean;
          title: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          link?: string | null;
          message: string;
          read?: boolean;
          title: string;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          id?: string;
          link?: string | null;
          message?: string;
          read?: boolean;
          title?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          account_type: string;
          avatar_seed: string | null;
          bio: string | null;
          business_type: string | null;
          company_address: string | null;
          company_description: string | null;
          company_name: string | null;
          company_website: string | null;
          created_at: string;
          department: string | null;
          email: string;
          employee_count: number | null;
          establishment_date: string | null;
          id: string;
          is_active: boolean;
          last_failed_login: string | null;
          last_login_at: string | null;
          last_login_attempt: string | null;
          login_attempts: number;
          login_count: number;
          name: string;
          password_changed_at: string | null;
          phone: string | null;
          position: string | null;
          profile_image_url: string | null;
          updated_at: string;
        };
        Insert: {
          account_type?: string;
          avatar_seed?: string | null;
          bio?: string | null;
          business_type?: string | null;
          company_address?: string | null;
          company_description?: string | null;
          company_name?: string | null;
          company_website?: string | null;
          created_at?: string;
          department?: string | null;
          email: string;
          employee_count?: number | null;
          establishment_date?: string | null;
          id: string;
          is_active?: boolean;
          last_failed_login?: string | null;
          last_login_at?: string | null;
          last_login_attempt?: string | null;
          login_attempts?: number;
          login_count?: number;
          name?: string;
          password_changed_at?: string | null;
          phone?: string | null;
          position?: string | null;
          profile_image_url?: string | null;
          updated_at?: string;
        };
        Update: {
          account_type?: string;
          avatar_seed?: string | null;
          bio?: string | null;
          business_type?: string | null;
          company_address?: string | null;
          company_description?: string | null;
          company_name?: string | null;
          company_website?: string | null;
          created_at?: string;
          department?: string | null;
          email?: string;
          employee_count?: number | null;
          establishment_date?: string | null;
          id?: string;
          is_active?: boolean;
          last_failed_login?: string | null;
          last_login_at?: string | null;
          last_login_attempt?: string | null;
          login_attempts?: number;
          login_count?: number;
          name?: string;
          password_changed_at?: string | null;
          phone?: string | null;
          position?: string | null;
          profile_image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string | null;
          created_at: string;
          deleted_at: string | null;
          device_id: string | null;
          endpoint: string;
          fail_count: number;
          id: string;
          is_active: boolean;
          last_fail_at: string | null;
          last_used_at: string | null;
          p256dh: string | null;
          updated_at: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          auth?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          device_id?: string | null;
          endpoint: string;
          fail_count?: number;
          id?: string;
          is_active?: boolean;
          last_fail_at?: string | null;
          last_used_at?: string | null;
          p256dh?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          auth?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          device_id?: string | null;
          endpoint?: string;
          fail_count?: number;
          id?: string;
          is_active?: boolean;
          last_fail_at?: string | null;
          last_used_at?: string | null;
          p256dh?: string | null;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      system_logs: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          level: Database["public"]["Enums"]["LogLevel"];
          message: string;
          metadata: Json | null;
          resource_id: string | null;
          resource_type: string | null;
          user_agent: string | null;
          user_email: string | null;
          user_id: string | null;
          user_ip: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          level?: Database["public"]["Enums"]["LogLevel"];
          message: string;
          metadata?: Json | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_agent?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          user_ip?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          level?: Database["public"]["Enums"]["LogLevel"];
          message?: string;
          metadata?: Json | null;
          resource_id?: string | null;
          resource_type?: string | null;
          user_agent?: string | null;
          user_email?: string | null;
          user_id?: string | null;
          user_ip?: string | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          accountLockoutDurationMinutes: number;
          created_at: string;
          dateFormat: string;
          debugMode: boolean;
          favicon: string | null;
          id: string;
          language: string;
          logLevel: Database["public"]["Enums"]["LogLevel"];
          logo: string | null;
          logRetentionDays: number;
          maintenanceContactInfo: string;
          maintenanceEstimatedTime: number;
          maintenanceMessage: string;
          maintenanceMode: boolean;
          maintenanceStartTime: string | null;
          maxLoginAttempts: number;
          maxVisitorsPerDay: number;
          notificationBadge: string | null;
          notificationIcon: string | null;
          passwordMinLength: number;
          passwordRequireLowerCase: boolean;
          passwordRequireNumber: boolean;
          passwordRequireSpecialChar: boolean;
          passwordRequireUpperCase: boolean;
          pushRequireInteraction: boolean;
          pushSoundEnabled: boolean;
          pushVibrateEnabled: boolean;
          requireVisitorContact: boolean;
          requireVisitorPhoto: boolean;
          requireVisitPurpose: boolean;
          reVisitAllowInterval: number;
          siteDescription: string;
          siteName: string;
          subscriptionCleanupDays: number;
          subscriptionCleanupInactive: boolean;
          subscriptionFailCountThreshold: number;
          subscriptionForceDelete: boolean;
          timezone: string;
          updated_at: string;
          vapidPrivateKey: string | null;
          vapidPublicKey: string | null;
          visitorDataRetentionDays: number;
          visitTemplate: string;
        };
        Insert: {
          accountLockoutDurationMinutes?: number;
          created_at?: string;
          dateFormat?: string;
          debugMode?: boolean;
          favicon?: string | null;
          id?: string;
          language?: string;
          logLevel?: Database["public"]["Enums"]["LogLevel"];
          logo?: string | null;
          logRetentionDays?: number;
          maintenanceContactInfo?: string;
          maintenanceEstimatedTime?: number;
          maintenanceMessage?: string;
          maintenanceMode?: boolean;
          maintenanceStartTime?: string | null;
          maxLoginAttempts?: number;
          maxVisitorsPerDay?: number;
          notificationBadge?: string | null;
          notificationIcon?: string | null;
          passwordMinLength?: number;
          passwordRequireLowerCase?: boolean;
          passwordRequireNumber?: boolean;
          passwordRequireSpecialChar?: boolean;
          passwordRequireUpperCase?: boolean;
          pushRequireInteraction?: boolean;
          pushSoundEnabled?: boolean;
          pushVibrateEnabled?: boolean;
          requireVisitorContact?: boolean;
          requireVisitorPhoto?: boolean;
          requireVisitPurpose?: boolean;
          reVisitAllowInterval?: number;
          siteDescription?: string;
          siteName?: string;
          subscriptionCleanupDays?: number;
          subscriptionCleanupInactive?: boolean;
          subscriptionFailCountThreshold?: number;
          subscriptionForceDelete?: boolean;
          timezone?: string;
          updated_at?: string;
          vapidPrivateKey?: string | null;
          vapidPublicKey?: string | null;
          visitorDataRetentionDays?: number;
          visitTemplate?: string;
        };
        Update: {
          accountLockoutDurationMinutes?: number;
          created_at?: string;
          dateFormat?: string;
          debugMode?: boolean;
          favicon?: string | null;
          id?: string;
          language?: string;
          logLevel?: Database["public"]["Enums"]["LogLevel"];
          logo?: string | null;
          logRetentionDays?: number;
          maintenanceContactInfo?: string;
          maintenanceEstimatedTime?: number;
          maintenanceMessage?: string;
          maintenanceMode?: boolean;
          maintenanceStartTime?: string | null;
          maxLoginAttempts?: number;
          maxVisitorsPerDay?: number;
          notificationBadge?: string | null;
          notificationIcon?: string | null;
          passwordMinLength?: number;
          passwordRequireLowerCase?: boolean;
          passwordRequireNumber?: boolean;
          passwordRequireSpecialChar?: boolean;
          passwordRequireUpperCase?: boolean;
          pushRequireInteraction?: boolean;
          pushSoundEnabled?: boolean;
          pushVibrateEnabled?: boolean;
          requireVisitorContact?: boolean;
          requireVisitorPhoto?: boolean;
          requireVisitPurpose?: boolean;
          reVisitAllowInterval?: number;
          siteDescription?: string;
          siteName?: string;
          subscriptionCleanupDays?: number;
          subscriptionCleanupInactive?: boolean;
          subscriptionFailCountThreshold?: number;
          subscriptionForceDelete?: boolean;
          timezone?: string;
          updated_at?: string;
          vapidPrivateKey?: string | null;
          vapidPublicKey?: string | null;
          visitorDataRetentionDays?: number;
          visitTemplate?: string;
        };
        Relationships: [];
      };
      user_notification_settings: {
        Row: {
          created_at: string;
          emergency_alerts: boolean;
          id: string;
          is_active: boolean;
          kakao_user_id: string | null;
          maintenance_alerts: boolean;
          notice_alerts: boolean;
          notification_method: string;
          updated_at: string;
          user_id: string;
          visitor_alerts: boolean;
        };
        Insert: {
          created_at?: string;
          emergency_alerts?: boolean;
          id?: string;
          is_active?: boolean;
          kakao_user_id?: string | null;
          maintenance_alerts?: boolean;
          notice_alerts?: boolean;
          notification_method: string;
          updated_at?: string;
          user_id: string;
          visitor_alerts?: boolean;
        };
        Update: {
          created_at?: string;
          emergency_alerts?: boolean;
          id?: string;
          is_active?: boolean;
          kakao_user_id?: string | null;
          maintenance_alerts?: boolean;
          notice_alerts?: boolean;
          notification_method?: string;
          updated_at?: string;
          user_id?: string;
          visitor_alerts?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      visitor_entries: {
        Row: {
          consent_given: boolean;
          created_at: string;
          disinfection_check: boolean;
          farm_id: string;
          id: string;
          notes: string | null;
          profile_photo_url: string | null;
          registered_by: string | null;
          session_token: string;
          updated_at: string;
          vehicle_number: string | null;
          visit_datetime: string;
          visitor_address: string;
          visitor_name: string;
          visitor_phone: string;
          visitor_purpose: string | null;
        };
        Insert: {
          consent_given?: boolean;
          created_at?: string;
          disinfection_check?: boolean;
          farm_id: string;
          id?: string;
          notes?: string | null;
          profile_photo_url?: string | null;
          registered_by?: string | null;
          session_token?: string;
          updated_at?: string;
          vehicle_number?: string | null;
          visit_datetime: string;
          visitor_address: string;
          visitor_name: string;
          visitor_phone: string;
          visitor_purpose?: string | null;
        };
        Update: {
          consent_given?: boolean;
          created_at?: string;
          disinfection_check?: boolean;
          farm_id?: string;
          id?: string;
          notes?: string | null;
          profile_photo_url?: string | null;
          registered_by?: string | null;
          session_token?: string;
          updated_at?: string;
          vehicle_number?: string | null;
          visit_datetime?: string;
          visitor_address?: string;
          visitor_name?: string;
          visitor_phone?: string;
          visitor_purpose?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "visitor_entries_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitor_entries_registered_by_fkey";
            columns: ["registered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auto_cleanup_expired_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: {
          execution_id: string;
          deleted_count: number;
          retention_days: number;
          cutoff_date: string;
          execution_time: unknown;
          status: string;
        }[];
      };
      auto_cleanup_expired_push_subscriptions: {
        Args: Record<PropertyKey, never>;
        Returns: {
          execution_id: string;
          cleaned_count: number;
          valid_count: number;
          total_checked: number;
          check_type: string;
          force_delete: boolean;
          delete_after_days: number;
          stats: Json;
          execution_time: unknown;
          status: string;
        }[];
      };
      auto_cleanup_expired_system_logs: {
        Args: Record<PropertyKey, never>;
        Returns: {
          execution_id: string;
          deleted_count: number;
          retention_days: number;
          cutoff_date: string;
          execution_time: unknown;
          status: string;
        }[];
      };
      auto_cleanup_expired_visitor_entries: {
        Args: Record<PropertyKey, never>;
        Returns: {
          execution_id: string;
          deleted_count: number;
          retention_days: number;
          cutoff_date: string;
          execution_time: unknown;
          status: string;
        }[];
      };
      can_access_farm: {
        Args: { farm_row: Database["public"]["Tables"]["farms"]["Row"] };
        Returns: boolean;
      };
      is_system_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      LogLevel: "error" | "warn" | "info" | "debug";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      LogLevel: ["error", "warn", "info", "debug"],
    },
  },
} as const;
