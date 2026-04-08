import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Categorie } from '../../models/categorie';
import { CategorieService } from '../../core/services/categorie.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  standalone: false,
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private readonly refreshIntervalMs = 5000;
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  protected categories: Categorie[] = [];
  protected editingId: number | null = null;
  protected saving = false;
  protected feedback = '';
  protected errorFeedback = '';
  protected readonly form;
  @ViewChild('categoryFormCard') private categoryFormCard?: ElementRef<HTMLElement>;
  @ViewChild('categoryNameInput') private categoryNameInput?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly categorieService: CategorieService,
  ) {
    this.form = this.fb.group({
      id: [null as number | null],
      nom: ['', Validators.required],
      description: [''],
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
    this.form.reset({ id: null, nom: '', description: '' });
    this.scrollToFormAndFocus();
  }

  protected edit(category: Categorie): void {
    this.editingId = category.id ?? null;
    this.form.patchValue(category);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: Categorie = {
      id: value.id ?? undefined,
      nom: value.nom?.trim() ?? '',
      description: value.description?.trim() || null,
    };

    this.saving = true;
    const request$ = this.editingId ? this.categorieService.update(payload) : this.categorieService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedback = this.editingId ? 'Catégorie mise à jour.' : 'Catégorie ajoutée.';
        this.saving = false;
        this.startCreate();
        this.refresh();
      },
      error: () => {
        this.errorFeedback = 'L’opération sur les catégories a échoué.';
        this.saving = false;
      },
    });
  }

  protected remove(category: Categorie): void {
    if (!category.id || !window.confirm(`Supprimer la catégorie ${category.nom} ?`)) {
      return;
    }

    this.categorieService.delete(category.id).subscribe({
      next: () => {
        this.feedback = 'Catégorie supprimée.';
        this.refresh();
      },
      error: () => (this.errorFeedback = 'La suppression a échoué.'),
    });
  }

  private scrollToFormAndFocus(): void {
    this.categoryFormCard?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => this.categoryNameInput?.nativeElement.focus(), 120);
  }
}
