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
      ai_agent_logs: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          phone: string
          script: string | null
          status: string
          timestamp: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          phone: string
          script?: string | null
          status?: string
          timestamp?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          phone?: string
          script?: string | null
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          business_type: string | null
          campaign_id: string | null
          client_id: string | null
          created_at: string | null
          current_index: number | null
          greeting_script: string | null
          id: string
          lead_list: string | null
          name: string | null
          notes: string | null
          started_at: string | null
          status: string | null
          voice_style: string | null
        }
        Insert: {
          business_type?: string | null
          campaign_id?: string | null
          client_id?: string | null
          created_at?: string | null
          current_index?: number | null
          greeting_script?: string | null
          id?: string
          lead_list?: string | null
          name?: string | null
          notes?: string | null
          started_at?: string | null
          status?: string | null
          voice_style?: string | null
        }
        Update: {
          business_type?: string | null
          campaign_id?: string | null
          client_id?: string | null
          created_at?: string | null
          current_index?: number | null
          greeting_script?: string | null
          id?: string
          lead_list?: string | null
          name?: string | null
          notes?: string | null
          started_at?: string | null
          status?: string | null
          voice_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      "ai-agents": {
        Row: {
          created_at: string
          id: number
          Lead_list: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          Lead_list?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          Lead_list?: string | null
        }
        Relationships: []
      }
      automations: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"] | null
          created_at: string | null
          created_by: string | null
          id: string
          message_body: string | null
          status: Database["public"]["Enums"]["automation_status"] | null
          title: string
          trigger_type: Database["public"]["Enums"]["trigger_type"] | null
          trigger_value: string | null
        }
        Insert: {
          action_type?: Database["public"]["Enums"]["action_type"] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_body?: string | null
          status?: Database["public"]["Enums"]["automation_status"] | null
          title: string
          trigger_type?: Database["public"]["Enums"]["trigger_type"] | null
          trigger_value?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_body?: string | null
          status?: Database["public"]["Enums"]["automation_status"] | null
          title?: string
          trigger_type?: Database["public"]["Enums"]["trigger_type"] | null
          trigger_value?: string | null
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          number: string
          status: string
          timestamp: string | null
          type: Database["public"]["Enums"]["call_type"]
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          number: string
          status?: string
          timestamp?: string | null
          type: Database["public"]["Enums"]["call_type"]
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          number?: string
          status?: string
          timestamp?: string | null
          type?: Database["public"]["Enums"]["call_type"]
        }
        Relationships: []
      }
      campaign_logs: {
        Row: {
          campaign_id: string
          created_at: string
          delivery_status: string
          id: string
          message_type: string
          timestamp: string
          total_recipients: number
        }
        Insert: {
          campaign_id: string
          created_at?: string
          delivery_status: string
          id?: string
          message_type: string
          timestamp?: string
          total_recipients: number
        }
        Update: {
          campaign_id?: string
          created_at?: string
          delivery_status?: string
          id?: string
          message_type?: string
          timestamp?: string
          total_recipients?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          schedule_status: string | null
          scheduled_at: string | null
          script_id: string | null
          status: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          schedule_status?: string | null
          scheduled_at?: string | null
          script_id?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          schedule_status?: string | null
          scheduled_at?: string | null
          script_id?: string | null
          status?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      cleaned_leads: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_duplicate: boolean | null
          name: string | null
          phone: string | null
          source: string | null
          status: string
          validation_errors: Json | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_duplicate?: boolean | null
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          validation_errors?: Json | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_duplicate?: boolean | null
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          validation_errors?: Json | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          response: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          response?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          response?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      iso_leads: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          id: string
          iso_id: string
          lead_id: string
          notes: string | null
          status: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          id?: string
          iso_id: string
          lead_id: string
          notes?: string | null
          status?: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          id?: string
          iso_id?: string
          lead_id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "iso_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      scripts: {
        Row: {
          campaign_id: string | null
          client_id: string | null
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          type: string | null
        }
        Insert: {
          campaign_id?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          type?: string | null
        }
        Update: {
          campaign_id?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          error: string | null
          id: string
          lead_id: string | null
          message: string
          phone: string
          sid: string | null
          status: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          lead_id?: string | null
          message: string
          phone: string
          sid?: string | null
          status: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          lead_id?: string | null
          message?: string
          phone?: string
          sid?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_clients: {
        Row: {
          assigned_at: string | null
          client_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          client_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          client_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      process_ai_agent_calls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      action_type: "email" | "sms"
      automation_status: "active" | "paused"
      call_type: "inbound" | "outbound"
      trigger_type: "source" | "campaign" | "time_delay"
      user_role: "admin" | "client" | "agent"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: ["email", "sms"],
      automation_status: ["active", "paused"],
      call_type: ["inbound", "outbound"],
      trigger_type: ["source", "campaign", "time_delay"],
      user_role: ["admin", "client", "agent"],
    },
  },
} as const
