
export type Merchant = {
  id: string;
  name: string;
  business_type: string;
  contact_info: string;
  status: string;
  notes?: string;
  iso_id: string;
  created_at: string;
};

export type Lender = {
  id: string;
  name: string;
  interest_rate: number;
  type: string;
  status: string;
  created_at: string;
};

export type Application = {
  id: string;
  merchant_id: string;
  lender_id: string;
  iso_id: string;
  status: string;
  created_at: string;
  merchant_name?: string;
  lender_name?: string;
};
