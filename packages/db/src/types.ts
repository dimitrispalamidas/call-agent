export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrgRole = "owner" | "admin" | "member";

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export type CallStatus =
  | "in_progress"
  | "completed"
  | "transferred"
  | "failed"
  | "no_answer";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  system_prompt: string;
  greeting: string;
  transfer_policy: string;
  twilio_phone_number: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  org_id: string;
  role: OrgRole;
  created_at: string;
};

export type Employee = {
  id: string;
  org_id: string;
  name: string;
  phone_e164: string;
  is_available: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  org_id: string;
  title: string;
  storage_path: string;
  mime_type: string | null;
  status: DocumentStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentChunk = {
  id: string;
  document_id: string;
  org_id: string;
  content: string;
  chunk_index: number;
  embedding: string | null;
  created_at: string;
};

export type Call = {
  id: string;
  org_id: string;
  twilio_call_sid: string;
  from_number: string | null;
  to_number: string | null;
  status: CallStatus;
  transcript_summary: string | null;
  transferred_to: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type CallEvent = {
  id: string;
  call_id: string;
  type: string;
  payload: Json;
  created_at: string;
};

type Tables = {
  organizations: {
    Row: Organization;
    Insert: {
      id?: string;
      name: string;
      slug: string;
      system_prompt?: string;
      greeting?: string;
      transfer_policy?: string;
      twilio_phone_number?: string | null;
      timezone?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Organization>;
    Relationships: [];
  };
  memberships: {
    Row: Membership;
    Insert: {
      id?: string;
      user_id: string;
      org_id: string;
      role: OrgRole;
      created_at?: string;
    };
    Update: Partial<Membership>;
    Relationships: [];
  };
  employees: {
    Row: Employee;
    Insert: {
      id?: string;
      org_id: string;
      name: string;
      phone_e164: string;
      is_available?: boolean;
      priority?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Employee>;
    Relationships: [];
  };
  documents: {
    Row: Document;
    Insert: {
      id?: string;
      org_id: string;
      title: string;
      storage_path: string;
      mime_type?: string | null;
      status?: DocumentStatus;
      error_message?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Document>;
    Relationships: [];
  };
  document_chunks: {
    Row: DocumentChunk;
    Insert: {
      id?: string;
      document_id: string;
      org_id: string;
      content: string;
      chunk_index?: number;
      embedding?: string | null;
      created_at?: string;
    };
    Update: Partial<DocumentChunk>;
    Relationships: [];
  };
  calls: {
    Row: Call;
    Insert: {
      id?: string;
      org_id: string;
      twilio_call_sid: string;
      from_number?: string | null;
      to_number?: string | null;
      status?: CallStatus;
      transcript_summary?: string | null;
      transferred_to?: string | null;
      started_at?: string;
      ended_at?: string | null;
      created_at?: string;
    };
    Update: Partial<Call>;
    Relationships: [];
  };
  call_events: {
    Row: CallEvent;
    Insert: {
      id?: string;
      call_id: string;
      type: string;
      payload?: Json;
      created_at?: string;
    };
    Update: Partial<CallEvent>;
    Relationships: [];
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: {
      create_organization: {
        Args: { org_name: string; org_slug: string };
        Returns: Organization;
      };
      match_document_chunks: {
        Args: {
          query_embedding: string;
          match_org_id: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          document_id: string;
          content: string;
          similarity: number;
        }[];
      };
      is_org_member: {
        Args: { target_org: string };
        Returns: boolean;
      };
      is_org_admin: {
        Args: { target_org: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
