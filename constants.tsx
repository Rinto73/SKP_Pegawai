
import { Employee, Role, RHK } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'admin-0', 
    nip: 'admin123', 
    name: 'Administrator BKPSDM', 
    position: 'Sistem Admin', 
    role: Role.ADMIN, 
    gender: 'L'
  },
  { 
    id: '1', 
    nip: '197001011990011001', 
    name: 'Drs. H. Adi Santoso, M.Si', 
    position: 'Sekretaris Daerah', 
    role: Role.SEKDA, 
    gender: 'L'
  },
  { 
    id: '2', 
    nip: '197502021995021002', 
    name: 'Ir. Bambang Heru', 
    position: 'Asisten Pemerintahan & Kesra', 
    role: Role.ASISTEN, 
    superiorId: '1', 
    gender: 'L'
  },
  { 
    id: '3', 
    nip: '198003032000032003', 
    name: 'Siti Rahmawati, SH', 
    position: 'Kepala Bagian Organisasi', 
    role: Role.KABAG, 
    superiorId: '2', 
    gender: 'P'
  },
  { 
    id: 'pt-1', 
    nip: 'PPPK-001', 
    name: 'Ahmad Faisal', 
    position: 'Tenaga Kebersihan (Paruh Waktu)', 
    role: Role.PELAKSANA, 
    superiorId: '1', 
    gender: 'L',
    isPartTime: true
  },
  { 
    id: 'pt-2', 
    nip: 'PPPK-002', 
    name: 'Siti Aminah', 
    position: 'Tenaga Administrasi (Paruh Waktu)', 
    role: Role.PELAKSANA, 
    superiorId: '1', 
    gender: 'P',
    isPartTime: true
  },
];

export const MOCK_RHKS: RHK[] = [
  {
    id: 'rhk-1',
    employeeId: '1',
    title: 'Meningkatkan Kualitas Reformasi Birokrasi Pemerintah Daerah',
    description: 'Tercapainya indeks reformasi birokrasi dengan predikat A.',
    type: 'Utama',
    status: 'Approved',
    indicators: [
      { id: 'ind-1', text: 'Indeks RB', target: '85.00', perspective: 'Kualitas' }
    ]
  }
];
