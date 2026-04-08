import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Departement } from '../../models/departement';

@Injectable({ providedIn: 'root' })
export class DepartementService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Departement[]> {
    return this.http.get<Departement[]>(`${this.apiUrl}/deps`);
  }

  create(departement: Departement): Observable<Departement> {
    return this.http.post<Departement>(`${this.apiUrl}/addDep`, departement);
  }

  update(departement: Departement): Observable<Departement> {
    return this.http.put<Departement>(`${this.apiUrl}/updateDep`, departement);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteDep/${id}`);
  }
}