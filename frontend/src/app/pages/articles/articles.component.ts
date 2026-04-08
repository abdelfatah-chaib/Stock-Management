import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Article } from '../../models/article';
import { Categorie } from '../../models/categorie';
import { ArticleService } from '../../core/services/article.service';
import { CategorieService } from '../../core/services/categorie.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
  standalone: false,
})
export class ArticlesComponent implements OnInit, OnDestroy {
  private readonly refreshIntervalMs = 5000;
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  protected articles: Article[] = [];
  protected categories: Categorie[] = [];
  protected editingId: number | null = null;
  protected saving = false;
  protected feedback = '';
  protected errorFeedback = '';
  protected readonly form;
  @ViewChild('articleFormCard') private articleFormCard?: ElementRef<HTMLElement>;
  @ViewChild('articleNameInput') private articleNameInput?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly articleService: ArticleService,
    private readonly categorieService: CategorieService,
  ) {
    this.form = this.fb.group({
      id: [null as number | null],
      nom: ['', Validators.required],
      description: [''],
      prix: [0, [Validators.required, Validators.min(0)]],
      stockMin: [0, [Validators.required, Validators.min(0)]],
      stockMax: [0, [Validators.required, Validators.min(0)]],
      stockReel: [0, [Validators.required, Validators.min(0)]],
      categorieId: [null as number | null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.refresh();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  protected refresh(): void {
    this.articleService.getAll().pipe(catchError(() => of([] as Article[]))).subscribe({
      next: (articles) => {
        this.articles = articles;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorFeedback = 'Impossible de charger les articles.';
        this.cdr.detectChanges();
      },
    });

    this.categorieService.getAll().pipe(catchError(() => of([] as Categorie[]))).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorFeedback = 'Impossible de charger les categories.';
        this.cdr.detectChanges();
      },
    });
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimerId = setInterval(() => this.refresh(), this.refreshIntervalMs);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimerId !== null) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  protected startCreate(): void {
    this.editingId = null;
    this.feedback = '';
    this.errorFeedback = '';
    this.form.reset({
      id: null,
      nom: '',
      description: '',
      prix: 0,
      stockMin: 0,
      stockMax: 0,
      stockReel: 0,
      categorieId: this.categories[0]?.id ?? null,
    });

    this.scrollToFormAndFocus();
  }

  private scrollToFormAndFocus(): void {
    this.articleFormCard?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => this.articleNameInput?.nativeElement.focus(), 120);
  }

  protected edit(article: Article): void {
    this.editingId = article.id ?? null;
    this.form.patchValue({
      id: article.id ?? null,
      nom: article.nom,
      description: article.description ?? '',
      prix: article.prix,
      stockMin: article.stockMin,
      stockMax: article.stockMax,
      stockReel: article.stockReel,
      categorieId: article.categorie?.id ?? null,
    });
  }

  protected cancelEdit(): void {
    this.editingId = null;
    this.startCreate();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: Article = {
      id: formValue.id ?? undefined,
      nom: formValue.nom?.trim() ?? '',
      description: formValue.description?.trim() || null,
      prix: Number(formValue.prix ?? 0),
      stockMin: Number(formValue.stockMin ?? 0),
      stockMax: Number(formValue.stockMax ?? 0),
      stockReel: Number(formValue.stockReel ?? 0),
      etat: this.computeStatus(Number(formValue.stockReel ?? 0), Number(formValue.stockMin ?? 0), Number(formValue.stockMax ?? 0)),
      categorie: formValue.categorieId ? { id: Number(formValue.categorieId), nom: '' } : null,
    };

    this.saving = true;
    const request$ = this.editingId ? this.articleService.update(payload) : this.articleService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedback = this.editingId ? 'Article mis à jour avec succès.' : 'Article ajouté avec succès.';
        this.saving = false;
        this.startCreate();
        this.refresh();
      },
      error: () => {
        this.errorFeedback = 'La sauvegarde de l’article a échoué.';
        this.saving = false;
      },
    });
  }

  protected remove(article: Article): void {
    if (!article.id || !window.confirm(`Supprimer l'article ${article.nom} ?`)) {
      return;
    }

    this.articleService.delete(article.id).subscribe({
      next: () => {
        this.feedback = 'Article supprimé avec succès.';
        this.refresh();
      },
      error: () => (this.errorFeedback = 'La suppression a échoué.'),
    });
  }

  protected statusClass(article: Article): string {
    if (article.stockReel <= article.stockMin) {
      return 'badge-soft-danger';
    }

    if (article.stockReel <= article.stockMin + 2) {
      return 'badge-soft-warning';
    }

    return 'badge-soft-success';
  }

  private computeStatus(stockReel: number, stockMin: number, stockMax: number): string {
    if (stockReel <= stockMin) {
      return 'Rupture';
    }

    if (stockReel >= stockMax) {
      return 'Saturé';
    }

    return 'Disponible';
  }
}
