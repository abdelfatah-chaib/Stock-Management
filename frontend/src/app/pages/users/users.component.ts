import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Departement } from '../../models/departement';
import { Role } from '../../models/role';
import { User } from '../../models/user';
import { DepartementService } from '../../core/services/departement.service';
import { RoleService } from '../../core/services/role.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false,
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly refreshIntervalMs = 5000;
  private refreshTimerId: ReturnType<typeof setInterval> | null = null;

  protected users: User[] = [];
  protected roles: Role[] = [];
  protected departments: Departement[] = [];
  protected editingId: string | null = null;
  protected saving = false;
  protected feedback = '';
  protected errorFeedback = '';
  protected readonly form;
  @ViewChild('userFormCard') private userFormCard?: ElementRef<HTMLElement>;
  @ViewChild('userNameInput') private userNameInput?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly departementService: DepartementService,
  ) {
    this.form = this.fb.group({
      id: [''],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roleNom: ['', Validators.required],
      departementId: [null as number | null, Validators.required],
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
    forkJoin({
      users: this.userService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] as User[] })),
      ),
      roles: this.roleService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] as Role[] })),
      ),
      departments: this.departementService.getAll().pipe(
        map((data) => ({ ok: true, data })),
        catchError(() => of({ ok: false, data: [] as Departement[] })),
      ),
    }).subscribe({
      next: (result) => {
        this.users = result.users.data;
        this.roles = result.roles.data;
        this.departments = result.departments.data;
        if (!result.users.ok || !result.roles.ok || !result.departments.ok) {
          this.errorFeedback = 'Certaines donnees utilisateurs ne sont pas encore disponibles. Reessai automatique...';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorFeedback = 'Impossible de charger les utilisateurs.';
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
      id: '',
      nom: '',
      email: '',
      password: '',
      roleNom: this.roles[0]?.nom ?? '',
      departementId: this.departments[0]?.id ?? null,
    });
    this.scrollToFormAndFocus();
  }

  protected edit(user: User): void {
    this.editingId = user.id ?? null;
    this.form.patchValue({
      id: user.id ?? '',
      nom: user.nom,
      email: user.email,
      password: user.password ?? '',
      roleNom: user.role?.nom ?? '',
      departementId: user.departement?.id ?? null,
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: User = {
      id: value.id || undefined,
      nom: value.nom?.trim() ?? '',
      email: value.email?.trim() ?? '',
      password: value.password ?? '',
      role: value.roleNom ? { nom: value.roleNom } : null,
      departement: value.departementId ? { id: Number(value.departementId), nomDep: '' } : null,
    };

    this.saving = true;
    const request$ = this.editingId ? this.userService.update(payload) : this.userService.create(payload);

    request$.subscribe({
      next: () => {
        this.feedback = this.editingId ? 'Utilisateur mis à jour.' : 'Utilisateur ajouté.';
        this.saving = false;
        this.startCreate();
        this.refresh();
      },
      error: () => {
        this.errorFeedback = 'L’opération sur les utilisateurs a échoué.';
        this.saving = false;
      },
    });
  }

  protected remove(user: User): void {
    if (!user.id || !window.confirm(`Supprimer l'utilisateur ${user.nom} ?`)) {
      return;
    }

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.feedback = 'Utilisateur supprimé.';
        this.refresh();
      },
      error: () => (this.errorFeedback = 'La suppression a échoué.'),
    });
  }

  private scrollToFormAndFocus(): void {
    this.userFormCard?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => this.userNameInput?.nativeElement.focus(), 120);
  }
}
