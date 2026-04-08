import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { finalize, timeout, catchError, of } from 'rxjs';
import { AIService, StockPrediction, AiArticleSummary } from '../../core/services/ai.service';
import { Article } from '../../models/article';

interface PredictionState {
  loading: boolean;
  analysis: string | null;
  errorMessage: string | null;
}

@Component({
  selector: 'app-ai-predictions',
  templateUrl: './ai-predictions.component.html',
  styleUrl: './ai-predictions.component.scss',
  standalone: false,
})
export class AiPredictionsComponent implements OnInit {
  // Data
  articles: Article[] = [];
  predictions: Map<number, PredictionState> = new Map();
  
  // UI State
  loading = false;
  errorMessage: string | null = null;

  // Pagination/Filtering
  searchKeyword = '';
  displayedArticles: Article[] = [];

  constructor(
    private aiService: AIService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  /**
   * Load all articles from the backend
   */
  loadArticles() {
    this.loading = true;
    this.errorMessage = null;
    console.log('Loading articles...');

    this.aiService.getArticles().subscribe({
      next: (data: AiArticleSummary[]) => {
        this.ngZone.run(() => {
          console.log('Articles received:', data);
          const mapped = [...(data as Article[])];
          this.articles = mapped;
          this.displayedArticles = [...mapped];
          this.loading = false;
          console.log('UI state after load:', {
            loading: this.loading,
            displayedArticles: this.displayedArticles.length,
          });
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error loading articles:', err);
          this.errorMessage = 'Loading articles timed out or failed. Check backend status.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Analyze a single article with external AI
   */
  predictArticle(article: Article) {
    if (!article.id) return;

    const key = article.id;
    this.errorMessage = null;
    console.log('Analyze clicked for articleId:', article.id);

    this.predictions.set(key, {
      loading: true,
      analysis: null,
      errorMessage: null
    });
    this.cdr.detectChanges();

    this.aiService.analyzeStock(article.id).pipe(
      timeout(12000),
      catchError((err) => {
        console.error('Error predicting article:', err);
        return of({
          status: 'error',
          articleId: article.id,
          article: article.nom,
          currentStock: article.stockReel,
          analysis: '',
          errorMessage: 'AI analysis temporarily unavailable'
        } as StockPrediction);
      }),
      finalize(() => {
        this.ngZone.run(() => {
          const current = this.predictions.get(key);
          if (current) {
            this.predictions.set(key, {
              ...current,
              loading: false
            });
            console.log('Analyze finalized for articleId:', article.id);
          }
          this.cdr.detectChanges();
        });
      })
    ).subscribe({
      next: (prediction: StockPrediction) => {
        this.ngZone.run(() => {
          console.log('Analyze response for articleId:', article.id, prediction);
          const analysisText = prediction.status === 'success'
            ? prediction.analysis
            : (prediction.errorMessage || 'AI analysis temporarily unavailable');

          this.predictions.set(key, {
            loading: false,
            analysis: analysisText,
            errorMessage: prediction.status === 'success' ? null : analysisText
          });
          this.cdr.detectChanges();
        });
      }
    });
  }

  /**
   * Filter articles by search keyword
   */
  onSearchChange() {
    if (!this.searchKeyword || this.searchKeyword.trim() === '') {
      this.displayedArticles = this.articles;
    } else {
      const keyword = this.searchKeyword.toLowerCase();
      this.displayedArticles = this.articles.filter(article =>
        article.nom.toLowerCase().includes(keyword)
      );
    }
  }

  /**
   * Clear all predictions
   */
  clearPredictions() {
    this.predictions.clear();
  }

  /**
   * Check if article has prediction
   */
  hasPrediction(articleId: number | undefined): boolean {
    return articleId != null && this.predictions.has(articleId);
  }

  /**
   * Get prediction for article
   */
  getPrediction(articleId: number | undefined): PredictionState | undefined {
    return articleId != null ? this.predictions.get(articleId) : undefined;
  }
}
