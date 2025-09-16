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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          client_op_id: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          owner: string | null
          priority: Database["public"]["Enums"]["action_priority"] | null
          session_id: string
          status: Database["public"]["Enums"]["action_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          client_op_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          owner?: string | null
          priority?: Database["public"]["Enums"]["action_priority"] | null
          session_id: string
          status?: Database["public"]["Enums"]["action_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          client_op_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          owner?: string | null
          priority?: Database["public"]["Enums"]["action_priority"] | null
          session_id?: string
          status?: Database["public"]["Enums"]["action_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_session: {
        Row: {
          id: string
          is_active: boolean
          label: string
          started_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          label: string
          started_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          label?: string
          started_at?: string
        }
        Relationships: []
      }
      app_state: {
        Row: {
          session_id: string
          state: Json
          updated_at: string | null
        }
        Insert: {
          session_id: string
          state?: Json
          updated_at?: string | null
        }
        Update: {
          session_id?: string
          state?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          after_data: Json | null
          at: string
          before_data: Json | null
          by_user: string | null
          entity: Database["public"]["Enums"]["audit_entity"]
          entity_id: string
          id: string
          operation: Database["public"]["Enums"]["audit_operation"]
          session_id: string
        }
        Insert: {
          after_data?: Json | null
          at?: string
          before_data?: Json | null
          by_user?: string | null
          entity: Database["public"]["Enums"]["audit_entity"]
          entity_id: string
          id?: string
          operation: Database["public"]["Enums"]["audit_operation"]
          session_id: string
        }
        Update: {
          after_data?: Json | null
          at?: string
          before_data?: Json | null
          by_user?: string | null
          entity?: Database["public"]["Enums"]["audit_entity"]
          entity_id?: string
          id?: string
          operation?: Database["public"]["Enums"]["audit_operation"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          attachments: Json | null
          audience: string
          author: string | null
          client_op_id: string | null
          id: string
          message: string
          sent_at: string | null
          session_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          audience: string
          author?: string | null
          client_op_id?: string | null
          id?: string
          message: string
          sent_at?: string | null
          session_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          audience?: string
          author?: string | null
          client_op_id?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          session_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          client_op_id: string | null
          decided_at: string
          id: string
          option_chosen: string
          question: string
          rationale: string | null
          related_action_ids: string[] | null
          related_journal_ids: string[] | null
          session_id: string
          tags: string[] | null
          updated_at: string
          validator: string | null
        }
        Insert: {
          client_op_id?: string | null
          decided_at?: string
          id?: string
          option_chosen: string
          question: string
          rationale?: string | null
          related_action_ids?: string[] | null
          related_journal_ids?: string[] | null
          session_id: string
          tags?: string[] | null
          updated_at?: string
          validator?: string | null
        }
        Update: {
          client_op_id?: string | null
          decided_at?: string
          id?: string
          option_chosen?: string
          question?: string
          rationale?: string | null
          related_action_ids?: string[] | null
          related_journal_ids?: string[] | null
          session_id?: string
          tags?: string[] | null
          updated_at?: string
          validator?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_events: {
        Row: {
          at: string
          attachments: Json | null
          by_user: string | null
          category: Database["public"]["Enums"]["journal_category"]
          client_op_id: string | null
          details: string | null
          id: string
          session_id: string
          title: string
          updated_at: string
        }
        Insert: {
          at?: string
          attachments?: Json | null
          by_user?: string | null
          category: Database["public"]["Enums"]["journal_category"]
          client_op_id?: string | null
          details?: string | null
          id?: string
          session_id: string
          title: string
          updated_at?: string
        }
        Update: {
          at?: string
          attachments?: Json | null
          by_user?: string | null
          category?: Database["public"]["Enums"]["journal_category"]
          client_op_id?: string | null
          details?: string | null
          id?: string
          session_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          display_name: string
          id: string
          joined_at: string
          presence: Json | null
          role: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          display_name: string
          id?: string
          joined_at?: string
          presence?: Json | null
          role?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          display_name?: string
          id?: string
          joined_at?: string
          presence?: Json | null
          role?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          code: string
          created_at: string
          id: string
          operational_checklist: Json | null
          order_index: number
          session_id: string
          strategic_checklist: Json | null
          subtitle: string | null
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          operational_checklist?: Json | null
          order_index: number
          session_id: string
          strategic_checklist?: Json | null
          subtitle?: string | null
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          operational_checklist?: Json | null
          order_index?: number
          session_id?: string
          strategic_checklist?: Json | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      resource_item: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          session_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          session_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          session_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_item_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "app_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_item_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dashboard_kpis"
            referencedColumns: ["session_id"]
          },
        ]
      }
      resources: {
        Row: {
          added_at: string
          added_by: string | null
          blob_key: string | null
          client_op_id: string | null
          id: string
          kind: Database["public"]["Enums"]["resource_kind"]
          mime_type: string | null
          note: string | null
          session_id: string
          size_bytes: number | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          blob_key?: string | null
          client_op_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["resource_kind"]
          mime_type?: string | null
          note?: string | null
          session_id: string
          size_bytes?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          blob_key?: string | null
          client_op_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["resource_kind"]
          mime_type?: string | null
          note?: string | null
          session_id?: string
          size_bytes?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rida_entry: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          owner: string | null
          session_id: string
          status: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          session_id: string
          status?: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          session_id?: string
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rida_entry_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "app_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rida_entry_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dashboard_kpis"
            referencedColumns: ["session_id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          mode: Database["public"]["Enums"]["session_mode"]
          severity: Database["public"]["Enums"]["session_severity"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mode: Database["public"]["Enums"]["session_mode"]
          severity: Database["public"]["Enums"]["session_severity"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["session_mode"]
          severity?: Database["public"]["Enums"]["session_severity"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_kpis: {
        Row: {
          ressources_total: number | null
          rida_clos: number | null
          rida_en_cours: number | null
          rida_total: number | null
          session_id: string | null
          session_label: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_member: {
        Args: { sess: string }
        Returns: boolean
      }
    }
    Enums: {
      action_priority: "low" | "med" | "high"
      action_status: "todo" | "doing" | "done"
      audit_entity: "journal" | "action" | "decision" | "comm" | "resource"
      audit_operation: "create" | "update" | "delete"
      journal_category:
        | "detection"
        | "containment"
        | "eradication"
        | "recovery"
        | "communication"
        | "decision"
        | "legal"
        | "incident"
        | "action"
        | "note"
      resource_kind: "file" | "link"
      session_mode: "exercise" | "real"
      session_severity: "low" | "moderate" | "high" | "critical"
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

export const Constants = {
  public: {
    Enums: {
      action_priority: ["low", "med", "high"],
      action_status: ["todo", "doing", "done"],
      audit_entity: ["journal", "action", "decision", "comm", "resource"],
      audit_operation: ["create", "update", "delete"],
      journal_category: [
        "detection",
        "containment",
        "eradication",
        "recovery",
        "communication",
        "decision",
        "legal",
        "incident",
        "action",
        "note",
      ],
      resource_kind: ["file", "link"],
      session_mode: ["exercise", "real"],
      session_severity: ["low", "moderate", "high", "critical"],
    },
  },
} as const
