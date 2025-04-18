export interface Campaign {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
  script_id?: string;
  client_id?: string;
  scheduled_at?: string;
  description?: string;
  schedule_status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'failed';
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: string;
  client_id?: string;
  created_at?: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  campaign_id?: string;
  client_id?: string;
  type?: string;
  created_at?: string;
}

export type SimpleCampaign = {
  id: string;
  title: string;
  status: string;
  type: string;
  created_at: string;
  script_id?: string;
  client_id?: string;
  scheduled_at?: string;
  description?: string;
  schedule_status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'failed';
};

export type SimpleLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status?: string;
};

export type SimpleScript = {
  id: string;
  title: string;
  content: string;
};
