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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          absence_date: string
          absence_type: string
          created_at: string
          end_time: string | null
          id: string
          is_justified: boolean
          justification: string | null
          justified_at: string | null
          justified_by: string | null
          recorded_by: string
          start_time: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          absence_date: string
          absence_type?: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_justified?: boolean
          justification?: string | null
          justified_at?: string | null
          justified_by?: string | null
          recorded_by: string
          start_time?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          absence_date?: string
          absence_type?: string
          created_at?: string
          end_time?: string | null
          id?: string
          is_justified?: boolean
          justification?: string | null
          justified_at?: string | null
          justified_by?: string | null
          recorded_by?: string
          start_time?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_justified_by_fkey"
            columns: ["justified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absences_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          end_time: string
          id: string
          location: string | null
          notes: string | null
          parent_id: string
          start_time: string
          status: string
          student_id: string | null
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          parent_id: string
          start_time: string
          status?: string
          student_id?: string | null
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          parent_id?: string
          start_time?: string
          status?: string
          student_id?: string | null
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachment_url: string | null
          class_name: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          max_points: number | null
          subject: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          class_name: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          max_points?: number | null
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          class_name?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          max_points?: number | null
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_groups: {
        Row: {
          class_name: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_groups_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string
          enrollment_date: string | null
          id: string
          school_year: string
          status: string | null
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          enrollment_date?: string | null
          id?: string
          school_year: string
          status?: string | null
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          enrollment_date?: string | null
          id?: string
          school_year?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_teachers: {
        Row: {
          class_id: string
          created_at: string
          id: string
          is_main_teacher: boolean | null
          school_year: string
          subject: string | null
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          is_main_teacher?: boolean | null
          school_year: string
          subject?: string | null
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          is_main_teacher?: boolean | null
          school_year?: string
          subject?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          code: string | null
          created_at: string
          establishment_id: string
          id: string
          level: string
          name: string
          room: string | null
          school_year: string
          section: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          establishment_id: string
          id?: string
          level: string
          name: string
          room?: string | null
          school_year: string
          section?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          establishment_id?: string
          id?: string
          level?: string
          name?: string
          room?: string | null
          school_year?: string
          section?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      competencies: {
        Row: {
          class_level: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          max_level: number
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          class_level: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          max_level?: number
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          class_level?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          max_level?: number
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_history: {
        Row: {
          created_at: string
          evaluated_by: string
          id: string
          new_level: number
          notes: string | null
          previous_level: number
          student_competency_id: string
        }
        Insert: {
          created_at?: string
          evaluated_by: string
          id?: string
          new_level: number
          notes?: string | null
          previous_level: number
          student_competency_id: string
        }
        Update: {
          created_at?: string
          evaluated_by?: string
          id?: string
          new_level?: number
          notes?: string | null
          previous_level?: number
          student_competency_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_history_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_history_student_competency_id_fkey"
            columns: ["student_competency_id"]
            isOneToOne: false
            referencedRelation: "student_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          establishment_id: string
          id: string
          name: string
          order_index: number | null
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          establishment_id: string
          id?: string
          name: string
          order_index?: number | null
          parent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          establishment_id?: string
          id?: string
          name?: string
          order_index?: number | null
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_groups: {
        Row: {
          code: string | null
          country_code: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      establishments: {
        Row: {
          address: string | null
          code: string | null
          country_code: string
          created_at: string
          email: string | null
          group_id: string | null
          id: string
          latitude: number | null
          levels: string | null
          logo_url: string | null
          longitude: number | null
          name: string
          options: string[] | null
          phone: string | null
          student_capacity: number | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          country_code?: string
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          latitude?: number | null
          levels?: string | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          options?: string[] | null
          phone?: string | null
          student_capacity?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          country_code?: string
          created_at?: string
          email?: string | null
          group_id?: string | null
          id?: string
          latitude?: number | null
          levels?: string | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          options?: string[] | null
          phone?: string | null
          student_capacity?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "establishment_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_sent: boolean
          remind_at: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_sent?: boolean
          remind_at: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_sent?: boolean
          remind_at?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "school_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          coefficient: number
          created_at: string
          description: string | null
          grade: number
          grade_type: string
          id: string
          school_year: string
          student_id: string
          subject: string
          teacher_id: string
          trimester: number
          updated_at: string
        }
        Insert: {
          coefficient?: number
          created_at?: string
          description?: string | null
          grade: number
          grade_type?: string
          id?: string
          school_year: string
          student_id: string
          subject: string
          teacher_id: string
          trimester: number
          updated_at?: string
        }
        Update: {
          coefficient?: number
          created_at?: string
          description?: string | null
          grade?: number
          grade_type?: string
          id?: string
          school_year?: string
          student_id?: string
          subject?: string
          teacher_id?: string
          trimester?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "class_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          is_moderated: boolean
          is_pinned: boolean
          moderated_at: string | null
          moderated_by: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          is_moderated?: boolean
          is_pinned?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_moderated?: boolean
          is_pinned?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "class_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          parent_message_id: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          parent_message_id?: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          parent_message_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          fee_id: string
          id: string
          paid_at: string
          payment_method: string
          student_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          fee_id: string
          id?: string
          paid_at?: string
          payment_method: string
          student_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          fee_id?: string
          id?: string
          paid_at?: string
          payment_method?: string
          student_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "school_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pedagogical_resources: {
        Row: {
          class_level: string
          created_at: string
          description: string | null
          downloads_count: number
          external_url: string | null
          file_url: string | null
          id: string
          is_public: boolean
          resource_type: string
          subject: string
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          class_level: string
          created_at?: string
          description?: string | null
          downloads_count?: number
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          resource_type?: string
          subject: string
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          class_level?: string
          created_at?: string
          description?: string | null
          downloads_count?: number
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean
          resource_type?: string
          subject?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedagogical_resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          code: string | null
          created_at: string
          department_id: string
          description: string | null
          id: string
          is_head: boolean | null
          name: string
          order_index: number | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department_id: string
          description?: string | null
          id?: string
          is_head?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department_id?: string
          description?: string | null
          id?: string
          is_head?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_demo: boolean
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          is_demo?: boolean
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_demo?: boolean
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          class_average: number | null
          created_at: string
          general_average: number | null
          generated_at: string
          generated_by: string | null
          id: string
          principal_comment: string | null
          rank: number | null
          school_year: string
          student_id: string
          teacher_comment: string | null
          trimester: number
          updated_at: string
        }
        Insert: {
          class_average?: number | null
          created_at?: string
          general_average?: number | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          principal_comment?: string | null
          rank?: number | null
          school_year: string
          student_id: string
          teacher_comment?: string | null
          trimester: number
          updated_at?: string
        }
        Update: {
          class_average?: number | null
          created_at?: string
          general_average?: number | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          principal_comment?: string | null
          rank?: number | null
          school_year?: string
          student_id?: string
          teacher_comment?: string | null
          trimester?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_comments: {
        Row: {
          content: string
          created_at: string
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          hidden_at: string | null
          hidden_by: string | null
          id: string
          is_flagged: boolean
          is_hidden: boolean
          parent_id: string | null
          resource_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          hidden_at?: string | null
          hidden_by?: string | null
          id?: string
          is_flagged?: boolean
          is_hidden?: boolean
          parent_id?: string | null
          resource_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          hidden_at?: string | null
          hidden_by?: string | null
          id?: string
          is_flagged?: boolean
          is_hidden?: boolean
          parent_id?: string | null
          resource_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_comments_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_comments_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resource_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_comments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_favorites: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_favorites_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_ratings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_views: {
        Row: {
          id: string
          resource_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_views_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "pedagogical_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          class_name: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          school_year: string
          start_time: string
          subject: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          school_year: string
          start_time: string
          subject: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          school_year?: string
          start_time?: string
          subject?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_events: {
        Row: {
          all_day: boolean
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_recurring: boolean
          location: string | null
          recurrence_rule: string | null
          start_date: string
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean
          location?: string | null
          recurrence_rule?: string | null
          start_date: string
          target_audience?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean
          location?: string | null
          recurrence_rule?: string | null
          start_date?: string
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      school_fees: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string
          fee_type: string
          id: string
          school_year: string
          status: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date: string
          fee_type?: string
          id?: string
          school_year: string
          status?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string
          fee_type?: string
          id?: string
          school_year?: string
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_public: boolean
          shared_with: string | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean
          shared_with?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean
          shared_with?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_documents_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_competencies: {
        Row: {
          competency_id: string
          created_at: string
          current_level: number
          evaluated_at: string
          evaluated_by: string
          id: string
          notes: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          competency_id: string
          created_at?: string
          current_level?: number
          evaluated_at?: string
          evaluated_by: string
          id?: string
          notes?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          competency_id?: string
          created_at?: string
          current_level?: number
          evaluated_at?: string
          evaluated_by?: string
          id?: string
          notes?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_competencies_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_competencies_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          attachment_url: string | null
          content: string | null
          created_at: string
          feedback: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          status: string
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          status?: string
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          status?: string
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subjects: {
        Row: {
          created_at: string
          id: string
          subject: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          ban_reason: string
          banned_at: string
          banned_by: string
          banned_until: string
          created_at: string
          id: string
          lifted_at: string | null
          lifted_by: string | null
          user_id: string
        }
        Insert: {
          ban_reason: string
          banned_at?: string
          banned_by: string
          banned_until: string
          created_at?: string
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          user_id: string
        }
        Update: {
          ban_reason?: string
          banned_at?: string
          banned_by?: string
          banned_until?: string
          created_at?: string
          id?: string
          lifted_at?: string | null
          lifted_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_lifted_by_fkey"
            columns: ["lifted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_establishments: {
        Row: {
          created_at: string
          establishment_id: string
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          establishment_id: string
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          establishment_id?: string
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_establishments_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_positions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          position_id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          position_id: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          position_id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_positions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_establishment: {
        Args: { _establishment_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "regional_admin"
        | "school_director"
        | "school_admin"
        | "cpe"
        | "main_teacher"
        | "teacher"
        | "external_tutor"
        | "student"
        | "parent_primary"
        | "parent_secondary"
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
      app_role: [
        "super_admin",
        "regional_admin",
        "school_director",
        "school_admin",
        "cpe",
        "main_teacher",
        "teacher",
        "external_tutor",
        "student",
        "parent_primary",
        "parent_secondary",
      ],
    },
  },
} as const
