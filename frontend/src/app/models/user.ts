import { Departement } from './departement';
import { Role } from './role';

export interface User {
  id?: string;
  nom: string;
  password?: string;
  email: string;
  dateC?: string;
  role?: Role | null;
  departement?: Departement | null;
}