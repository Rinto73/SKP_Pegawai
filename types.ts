
export enum Role {
  ADMIN = 'ADMIN',
  SEKDA = 'SEKDA',
  ASISTEN = 'ASISTEN',
  KABAG = 'KABAG',
  KASUBAG = 'KASUBAG',
  PELAKSANA = 'PELAKSANA'
}

export interface Employee {
  id: string;
  nip: string; 
  name: string;
  position: string;
  role: Role;
  gender: 'L' | 'P';
  superiorId?: string;
  isPartTime?: boolean; // Flag untuk PPPK Paruh Waktu
}

export interface Indicator {
  id: string;
  text: string;
  target: string;
  perspective: 'Kualitas' | 'Kuantitas' | 'Waktu' | 'Biaya';
}

export interface RHK {
  id: string;
  employeeId: string;
  parentRhkId?: string;
  title: string;
  description: string;
  indicators: Indicator[];
  type: 'Utama' | 'Tambahan';
  status: 'Draft' | 'Review' | 'Approved';
}
