// Hand-maintained types mirroring supabase/migrations. Keep in sync with the SQL.
// (Once the cloud project exists, these can be regenerated via `supabase gen types`.)

export type EventStatus = 'draft' | 'live' | 'closed' | 'archived'
export type QuestionStatus = 'pending' | 'approved' | 'answering' | 'answered' | 'rejected'
export type ModerationMode = 'pre' | 'auto'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; display_name: string | null; created_at: string }
        Insert: { id: string; email?: string | null; display_name?: string | null }
        Update: { email?: string | null; display_name?: string | null }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          owner_id: string
          code: string
          slug: string
          title: string
          subtitle: string | null
          status: EventStatus
          moderation: ModerationMode
          created_at: string
          starts_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          code: string
          slug: string
          title: string
          subtitle?: string | null
          status?: EventStatus
          moderation?: ModerationMode
          starts_at?: string | null
        }
        Update: {
          title?: string
          subtitle?: string | null
          status?: EventStatus
          moderation?: ModerationMode
          starts_at?: string | null
        }
        Relationships: []
      }
      branding: {
        Row: { event_id: string; logo_url: string | null; primary_color: string | null }
        Insert: { event_id: string; logo_url?: string | null; primary_color?: string | null }
        Update: { logo_url?: string | null; primary_color?: string | null }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          event_id: string
          body: string
          author_name: string | null
          status: QuestionStatus
          vote_count: number
          anon_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          body: string
          author_name?: string | null
          status?: QuestionStatus
          anon_id: string
        }
        Update: { status?: QuestionStatus; body?: string }
        Relationships: []
      }
      votes: {
        Row: { id: string; question_id: string; event_id: string; anon_id: string; created_at: string }
        Insert: { id?: string; question_id: string; event_id: string; anon_id: string }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      event_status: EventStatus
      question_status: QuestionStatus
      moderation_mode: ModerationMode
    }
  }
}

// Convenience row aliases
export type EventRow = Database['public']['Tables']['events']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type BrandingRow = Database['public']['Tables']['branding']['Row']
