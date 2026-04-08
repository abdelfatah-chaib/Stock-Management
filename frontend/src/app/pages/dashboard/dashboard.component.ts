import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Article } from '../../models/article';
import { ArticleService } from '../../core/services/article.service';
import { CategorieService } from '../../core/services/categorie.service';
import { DepartementService } from '../../core/services/departement.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: false,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly refreshIntervalMs = 5000;
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  protected loading = true;
  protected errorMessage = '';
  protected articleCount = 0;
  protected categoryCount = 0;
  protected userCount = 0;
  protected departmentCount = 0;
  protected articles: Article[] = [];
  protected lowStockArticles: Article[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly articleService: ArticleService,
    private readonly categorieService: CategorieService,
    private readonly userService: UserService,
    private readonly departementService: DepartementService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  protected loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      articles: this.articleService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] as Article[] })),
      ),
      categories: this.categorieService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] })),
      ),
      users: this.userService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] })),
      ),
      departments: this.departementService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] })),
      ),
    }).subscribe({
      next: (result) => {
        this.articles = result.articles.data;
        this.articleCount = result.articles.data.length;
        this.categoryCount = result.categories.data.length;
        this.userCount = result.users.data.length;
        this.departmentCount = result.departments.data.length;
        this.lowStockArticles = result.articles.data
          .filter((article) => article.stockReel <= article.stockMin)
          .slice(0, 5);

        if (!result.articles.ok || !result.categories.ok || !result.users.ok || !result.departments.ok) {
          this.errorMessage = 'Certaines donnees ne sont pas encore disponibles. Reessai automatique en cours...';
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les indicateurs du tableau de bord.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimerId = setInterval(() => this.loadDashboard(), this.refreshIntervalMs);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimerId !== null) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  protected stockBadge(article: Article): string {
    if (article.stockReel <= article.stockMin) {
      return 'badge-soft-danger';
    }

    if (article.stockReel <= article.stockMin + 2) {
      return 'badge-soft-warning';
    }

    return 'badge-soft-success';
  }
}
