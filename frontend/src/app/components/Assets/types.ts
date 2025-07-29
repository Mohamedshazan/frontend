// File: components/Assets/types.ts
export type User = {
  id: number;
  name: string;
};

export type Department = {
  id: number;
  name: string;
};

export type Asset = {
  id: number;
  brand: string;
  model: string;
  device_name: string;
  os: string;
  serial_number: string;
  status: string;
  asset_type: string;
  location: string;
  user?: User | null;
  device?: string; 
  department?: Department;
};

export type Filters = {
  status: string;
  asset_type: string;
  department_id: string;
  start_date: string;
  end_date: string;
  user_id: string;
  created_from?: string;
  created_to?: string;
};

export type OptionType = {
  value: string;
  label: string;
};

export type DepartmentOption = OptionType;
