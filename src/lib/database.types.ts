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
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          requirement_type: string
          requirement_value: number
          tier: string
          team_id: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          requirement_type: string
          requirement_value: number
          tier: string
          team_id?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          requirement_type?: string
          requirement_value?: number
          tier?: string
          team_id?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      journey_checkpoints: {
        Row: {
          id: string
          team_id: string
          name: string
          description: string | null
          distance_from_start: number
          latitude: number
          longitude: number
          is_reached: boolean
          reached_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          description?: string | null
          distance_from_start: number
          latitude: number
          longitude: number
          is_reached?: boolean
          reached_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          description?: string | null
          distance_from_start?: number
          latitude?: number
          longitude?: number
          is_reached?: boolean
          reached_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_checkpoints_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      media: {
        Row: {
          id: string
          user_id: string
          team_id: string
          url: string
          type: string
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id: string
          url: string
          type: string
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string
          url?: string
          type?: string
          caption?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_badge_requirements: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_team_distance: {
        Args: {
          team_id: string
          distance_to_add: number
        }
        Returns: undefined
      }
    }
    Enums: {
      badge_tier: "bronze" | "silver" | "gold"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}