export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'editor';
  isActive: boolean;
  createdAt: Date;
}

export const DUMMY_USERS: User[] = [
  {
    id: 1,
    username: 'dev_shola',
    email: 'shola@example.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 2,
    username: 'jdoe_99',
    email: 'j.doe@provider.net',
    role: 'user',
    isActive: true,
    createdAt: new Date('2026-02-10'),
  },
  {
    id: 3,
    username: 'tech_guru',
    email: 'guru@domain.org',
    role: 'editor',
    isActive: false,
    createdAt: new Date('2026-03-01'),
  },
  {
    id: 4,
    username: 'beta_tester',
    email: 'test@service.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2026-03-12'),
  },
];
