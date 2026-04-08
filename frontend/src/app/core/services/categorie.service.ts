import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categorie } from '../../models/categorie';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`);
  }

  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/cateId/${id}`);
  }

  create(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.apiUrl}/addCategorie`, categorie);
  }

  update(categorie: Categorie): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/updateCategorie`, categorie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteCategorie/${id}`);
  }

  getTotal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/totalc`);
  }
}