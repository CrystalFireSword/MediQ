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
      appointments: {
        Row: {
          id: string
          patient_name: string
          phone_number: string
          appointment_time: string
          queue_number: number
          status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
          service_type: 'general' | 'specialist' | 'followup' | 'testing'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          phone_number: string
          appointment_time: string
          queue_number?: number
          status?: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
          service_type?: 'general' | 'specialist' | 'followup' | 'testing'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          phone_number?: string
          appointment_time?: string
          queue_number?: number
          status?: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
          service_type?: 'general' | 'specialist' | 'followup' | 'testing'
          notes?: string | null
          created_at?: string
          updated_at?: string
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
  }
}