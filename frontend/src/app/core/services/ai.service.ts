import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AiArticleSummary {
  id: number;
  nom: string;
  stockReel: number;
  stockMin: number;
  stockMax: number;
  prix: number;
}

export interface StockPrediction {
  status: string;
  errorMessage?: string;
  articleId: number;
  article: string;
  currentStock: number;
  analysis: string;
}

export interface HealthResponse {
  status: string;
  aiServiceReachable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly apiUrl = 'http://localhost:8083/api/ai';
  private readonly requestTimeoutMs = 10000;

  constructor(private http: HttpClient) { }

  private get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`).pipe(
      timeout(this.requestTimeoutMs),
      catchError(this.handleError)
    );
  }

  /**
   * Predict stock rupture for an article
   * @param articleId The ID of the article
   * @returns Observable of stock prediction
   */
  analyzeStock(articleId: number): Observable<StockPrediction> {
    return this.get<StockPrediction>(`/analyze/${articleId}`);
  }

  getArticles(): Observable<AiArticleSummary[]> {
    return this.get<AiArticleSummary[]>('/articles');
  }

  getArticlesForAnalysis(): Observable<AiArticleSummary[]> {
    return this.getArticles();
  }

  /**
   * Check the health of the AI service
   * @returns Observable of health status
   */
  checkHealth(): Observable<HealthResponse> {
    return this.get<HealthResponse>('/health');
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
