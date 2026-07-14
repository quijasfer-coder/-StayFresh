export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      coverage_zones: {
        Row: {
          id: string
          colonia: string
          cp: string | null
          alcaldia: string | null
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          colonia: string
          cp?: string | null
          alcaldia?: string | null
          active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          colonia?: string
          cp?: string | null
          alcaldia?: string | null
          active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          category: Database["public"]["Enums"]["item_category"]
          base_price_cents: number | null
          description: string | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: Database["public"]["Enums"]["item_category"]
          base_price_cents?: number | null
          description?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: Database["public"]["Enums"]["item_category"]
          base_price_cents?: number | null
          description?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          full_name: string
          phone: string
          address: string | null
          colonia: string | null
          cp: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          address?: string | null
          colonia?: string | null
          cp?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          address?: string | null
          colonia?: string | null
          cp?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pickups: {
        Row: {
          id: string
          client_id: string
          status: Database["public"]["Enums"]["pickup_status"]
          requested_at: string
          scheduled_date: string
          scheduled_window: string | null
          colonia: string
          cp: string | null
          address: string | null
          total_items: number
          total_price_cents: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          status?: Database["public"]["Enums"]["pickup_status"]
          requested_at?: string
          scheduled_date: string
          scheduled_window?: string | null
          colonia: string
          cp?: string | null
          address?: string | null
          total_items?: number
          total_price_cents?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          status?: Database["public"]["Enums"]["pickup_status"]
          requested_at?: string
          scheduled_date?: string
          scheduled_window?: string | null
          colonia?: string
          cp?: string | null
          address?: string | null
          total_items?: number
          total_price_cents?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_items: {
        Row: {
          id: string
          pickup_id: string
          category: Database["public"]["Enums"]["item_category"]
          quantity: number
          description: string | null
          service_id: string | null
          price_cents: number | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pickup_id: string
          category: Database["public"]["Enums"]["item_category"]
          quantity: number
          description?: string | null
          service_id?: string | null
          price_cents?: number | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pickup_id?: string
          category?: Database["public"]["Enums"]["item_category"]
          quantity?: number
          description?: string | null
          service_id?: string | null
          price_cents?: number | null
          photo_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_items_pickup_id_fkey"
            columns: ["pickup_id"]
            isOneToOne: false
            referencedRelation: "pickups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      price_tiers: {
        Row: {
          id: string
          category: Database["public"]["Enums"]["item_category"]
          quantity: number
          price_cents: number
          active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: Database["public"]["Enums"]["item_category"]
          quantity: number
          price_cents: number
          active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: Database["public"]["Enums"]["item_category"]
          quantity?: number
          price_cents?: number
          active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pickup_status_history: {
        Row: {
          id: string
          pickup_id: string
          status: Database["public"]["Enums"]["pickup_status"]
          changed_by: string | null
          changed_at: string
          notified_whatsapp: boolean
        }
        Insert: {
          id?: string
          pickup_id: string
          status: Database["public"]["Enums"]["pickup_status"]
          changed_by?: string | null
          changed_at?: string
          notified_whatsapp?: boolean
        }
        Update: {
          id?: string
          pickup_id?: string
          status?: Database["public"]["Enums"]["pickup_status"]
          changed_by?: string | null
          changed_at?: string
          notified_whatsapp?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pickup_status_history_pickup_id_fkey"
            columns: ["pickup_id"]
            isOneToOne: false
            referencedRelation: "pickups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_totals: {
        Row: {
          id: string
          full_name: string
          phone: string
          colonia: string | null
          cp: string | null
          total_pickups: number
          total_items: number
        }
        Relationships: []
      }
    }
    Functions: {
      check_coverage: {
        Args: { p_colonia: string | null; p_cp: string | null }
        Returns: boolean
      }
      create_public_booking: {
        Args: {
          p_full_name: string
          p_phone: string
          p_address: string | null
          p_colonia: string
          p_cp: string | null
          p_scheduled_date: string
          p_items: Json
        }
        Returns: string
      }
      update_pickup_status: {
        Args: {
          p_pickup_id: string
          p_status: Database["public"]["Enums"]["pickup_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "staff"
      item_category: "tenis" | "botas" | "gorras" | "bolsas"
      pickup_status:
        | "agendada"
        | "recolectado"
        | "en_proceso"
        | "listo"
        | "en_camino"
        | "entregado"
        | "cancelada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
