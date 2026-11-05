export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      especies: {
        Row: {
          descripcion: string
          ecosistema: string
          endemica: boolean
          id: string
          luz: string
          luz_nivel: number
          nombre_cientifico: string
          nombre_comun: string
          orden: number
          riego: string
          riego_nivel: number
          slug: string
          sustrato: string
          sustrato_nivel: number
        }
        Insert: {
          descripcion?: string
          ecosistema: string
          endemica?: boolean
          id?: string
          luz: string
          luz_nivel?: number
          nombre_cientifico: string
          nombre_comun: string
          orden?: number
          riego: string
          riego_nivel?: number
          slug: string
          sustrato: string
          sustrato_nivel?: number
        }
        Update: {
          descripcion?: string
          ecosistema?: string
          endemica?: boolean
          id?: string
          luz?: string
          luz_nivel?: number
          nombre_cientifico?: string
          nombre_comun?: string
          orden?: number
          riego?: string
          riego_nivel?: number
          slug?: string
          sustrato?: string
          sustrato_nivel?: number
        }
        Relationships: []
      }
      kits: {
        Row: {
          descripcion: string
          destacado: boolean
          especie_id: string
          id: string
          nombre: string
          precio: number
        }
        Insert: {
          descripcion?: string
          destacado?: boolean
          especie_id: string
          id?: string
          nombre: string
          precio: number
        }
        Update: {
          descripcion?: string
          destacado?: boolean
          especie_id?: string
          id?: string
          nombre?: string
          precio?: number
        }
        Relationships: [
          {
            foreignKeyName: "kits_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "especies"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          cantidad: number
          id: string
          kit_id: string
          pedido_id: string
          precio: number
          user_id: string
        }
        Insert: {
          cantidad?: number
          id?: string
          kit_id: string
          pedido_id: string
          precio: number
          user_id: string
        }
        Update: {
          cantidad?: number
          id?: string
          kit_id?: string
          pedido_id?: string
          precio?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          created_at: string
          estado: string
          id: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: string
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          id?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      plantas_usuario: {
        Row: {
          created_at: string
          especie_id: string
          etapa: string
          fecha_siembra: string
          id: string
          nombre_personalizado: string
          user_id: string
        }
        Insert: {
          created_at?: string
          especie_id: string
          etapa?: string
          fecha_siembra?: string
          id?: string
          nombre_personalizado: string
          user_id: string
        }
        Update: {
          created_at?: string
          especie_id?: string
          etapa?: string
          fecha_siembra?: string
          id?: string
          nombre_personalizado?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plantas_usuario_especie_id_fkey"
            columns: ["especie_id"]
            isOneToOne: false
            referencedRelation: "especies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          analisis_mes: number
          created_at: string
          id: string
          mes_analisis: string
          nombre: string
          plan: string
        }
        Insert: {
          analisis_mes?: number
          created_at?: string
          id: string
          mes_analisis?: string
          nombre?: string
          plan?: string
        }
        Update: {
          analisis_mes?: number
          created_at?: string
          id?: string
          mes_analisis?: string
          nombre?: string
          plan?: string
        }
        Relationships: []
      }
      recordatorios: {
        Row: {
          completado: boolean
          created_at: string
          fecha: string
          id: string
          planta_id: string
          tipo: string
          user_id: string
        }
        Insert: {
          completado?: boolean
          created_at?: string
          fecha: string
          id?: string
          planta_id: string
          tipo: string
          user_id: string
        }
        Update: {
          completado?: boolean
          created_at?: string
          fecha?: string
          id?: string
          planta_id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordatorios_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "plantas_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      registros: {
        Row: {
          acciones: string[]
          created_at: string
          diagnostico: Json | null
          foto_path: string | null
          id: string
          nota: string | null
          planta_id: string
          user_id: string
        }
        Insert: {
          acciones?: string[]
          created_at?: string
          diagnostico?: Json | null
          foto_path?: string | null
          id?: string
          nota?: string | null
          planta_id: string
          user_id: string
        }
        Update: {
          acciones?: string[]
          created_at?: string
          diagnostico?: Json | null
          foto_path?: string | null
          id?: string
          nota?: string | null
          planta_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "plantas_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activar_premium: { Args: never; Returns: undefined }
      confirmar_pedido: { Args: { _kit_ids: string[] }; Returns: string }
      consumir_analisis: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
