import { Categorie } from './categorie';

export interface Article {
  id?: number;
  nom: string;
  description?: string | null;
  dajout?: string;
  prix: number;
  stockMin: number;
  stockMax: number;
  stockReel: number;
  etat?: string | null;
  categorie?: Categorie | null;
}