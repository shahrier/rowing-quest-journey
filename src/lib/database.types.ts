export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          user_id: string
          team_id: string
          activity_type: string
          distance: number | null
          duration: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          activity_type: string
          distance?: number | null
          duration?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          activity_type?: string
          distance?: number | null
          duration?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          avatar_url: string | null
          role: string
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          avatar_url?: string | null
          role?: string
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          role?: string
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string
          description: string | null
          goal_distance: number | null
          current_distance: number
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
          description?: string | null
          goal_distance?: number | null
          current_distance?: number
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          description?: string | null
          goal_distance?: number | null
          current_distance?: number
        }
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