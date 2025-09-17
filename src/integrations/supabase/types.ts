export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: number
          user_id: number | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: number
          user_id?: number | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      borrow_history: {
        Row: {
          action: string
          condition_report: string | null
          created_at: string | null
          id: number
          performed_by: number | null
          remarks: string | null
          request_id: number | null
        }
        Insert: {
          action: string
          condition_report?: string | null
          created_at?: string | null
          id?: number
          performed_by?: number | null
          remarks?: string | null
          request_id?: number | null
        }
        Update: {
          action?: string
          condition_report?: string | null
          created_at?: string | null
          id?: number
          performed_by?: number | null
          remarks?: string | null
          request_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "borrow_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "borrow_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      borrow_requests: {
        Row: {
          created_at: string | null
          drone_id: number | null
          end_date: string
          id: number
          purpose: string
          start_date: string
          status: string
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          drone_id?: number | null
          end_date: string
          id?: number
          purpose: string
          start_date: string
          status?: string
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          drone_id?: number | null
          end_date?: string
          id?: number
          purpose?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "borrow_requests_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      drone_models: {
        Row: {
          created_at: string | null
          id: number
          manufacturer: string | null
          name: string
          specs: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          manufacturer?: string | null
          name: string
          specs?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: number
          manufacturer?: string | null
          name?: string
          specs?: Json | null
        }
        Relationships: []
      }
      drones: {
        Row: {
          created_at: string | null
          id: number
          image_url: string | null
          model_id: number | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          model_id?: number | null
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          model_id?: number | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drones_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "drone_models"
            referencedColumns: ["id"]
          }
        ]
      }
      maintenance_logs: {
        Row: {
          condition: string
          created_at: string | null
          drone_id: number | null
          id: number
          notes: string | null
          performed_by: number | null
        }
        Insert: {
          condition: string
          created_at?: string | null
          drone_id?: number | null
          id?: number
          notes?: string | null
          performed_by?: number | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          drone_id?: number | null
          id?: number
          notes?: string | null
          performed_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: number
          name: string
          password: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          name: string
          password: string
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          name?: string
          password?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database

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

// Convenience type exports
export type Profile = Tables<'profiles'>
export type DroneModel = Tables<'drone_models'>
export type Drone = Tables<'drones'>
export type BorrowRequest = Tables<'borrow_requests'>
export type BorrowHistory = Tables<'borrow_history'>
export type MaintenanceLog = Tables<'maintenance_logs'>
export type ActivityLog = Tables<'activity_logs'>

// Enum types for better type safety
export type DroneStatus = 'available' | 'borrowed' | 'damaged' | 'maintenance'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'returned'
export type UserRole = 'user' | 'admin' | 'superadmin'
export type BorrowAction = 'approved' | 'rejected' | 'returned'