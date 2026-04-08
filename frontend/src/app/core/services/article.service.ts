import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article } from '../../models/article';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles`);
  }

  getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/article/${id}`);
  }

  create(article: Article): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/addArt`, article);
  }

  update(article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/updateArt`, article);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteArt/${id}`);
  }

  getTotal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/totala`);
  }
}