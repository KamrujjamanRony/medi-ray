import {
  Component,
  ElementRef,
  inject,
  signal,
  computed,
  viewChildren
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserService } from '../../../services/auth/user.service';
import { MenuService } from '../../../services/auth/menu.service';
import { DataFetchService } from '../../../services/auth/useDataFetch';
import { PermissionService } from '../../../services/auth/permission.service';

import { UserAccessTreeComponent } from '../../shared/user-access-tree/user-access-tree.component';
import { FieldComponent } from '../../shared/field/field.component';
import { SearchComponent } from '../../shared/search/search.component';
import { AllSvgComponent } from '../../shared/all-svg/all-svg.component';

/* --------------------------------------------
   Optional: Strong typing for menu permissions
--------------------------------------------- */
interface MenuPermission {
  menuId: number;
  PermissionKey: string[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UserAccessTreeComponent,
    FieldComponent,
    SearchComponent,
    AllSvgComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  /* ---------------- DI ---------------- */

  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  private menuService = inject(MenuService);
  private dataFetchService = inject(DataFetchService);
  private permissionService = inject(PermissionService);

  /* ---------------- SIGNAL STATE ---------------- */

  users = signal<any[]>([]);
  searchQuery = signal('');
  userAccessTree = signal<MenuPermission[]>([]);
  selectedUser = signal<any | null>(null);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  highlightedTr = signal<number>(-1);
  isSubmitted = signal(false);

  readonly inputRefs = viewChildren<ElementRef>('inputRef');

  /* ---------------- COMPUTED ---------------- */

  filteredUserList = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.users()
      .filter(u => u.username?.toLowerCase().includes(query))
      .slice(1); // remove first element
  });

  /* ---------------- FORM (FIXED TYPES) ---------------- */

  form = this.fb.group({
    username: this.fb.control('', Validators.required),
    password: this.fb.control(''),
    eId: this.fb.control<number | null>(null),
    isActive: this.fb.control(true),
    menuPermissions: this.fb.control<MenuPermission[]>([]) // ✅ FIXED
  });

  /* ---------------- LIFECYCLE ---------------- */

  ngOnInit(): void {
    this.loadPermissions();
    this.loadUsers();
    this.loadTreeData('');

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    }, 10);
  }

  /* ---------------- LOADERS ---------------- */

  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('User'));
    this.isInsert.set(this.permissionService.hasPermission('User', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('User', 'update'));
    this.isDelete.set(this.permissionService.hasPermission('User', 'delete'));
  }

  loadUsers() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dataFetchService
      .fetchData(this.userService.getUser(''))
      .data$
      .subscribe({
        next: data => {
          this.users.set(data ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }

  loadTreeData(userId: any) {
    this.menuService
      .generateTreeData()
      .subscribe(tree => this.userAccessTree.set(tree));
  }

  /* ---------------- SEARCH ---------------- */

  onSearchUser(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /* ---------------- FORM HELPERS ---------------- */

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  /* ---------------- SUBMIT ---------------- */

  onSubmit(e: Event) {
    e.preventDefault();
    this.isSubmitted.set(true);

    if (!this.form.valid) return;

    this.form.patchValue({
      menuPermissions: this.userAccessTree()
    });

    const request$ = this.selectedUser()
      ? this.userService.updateUser(
          this.selectedUser()!.id,
          this.form.getRawValue()
        )
      : this.userService.addUser(this.form.getRawValue());

    request$.subscribe(() => {
      this.loadUsers();
      this.formReset();
    });
  }

  /* ---------------- UPDATE ---------------- */

  onUpdate(user: any) {
    this.selectedUser.set(user);
    this.loadTreeData(user.id);

    this.form.patchValue({
      username: user.username,
      password: user.password,
      eId: user.eId,
      isActive: user.isActive,
      menuPermissions: user.menuPermissions ?? []
    });

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    });
  }

  /* ---------------- DELETE ---------------- */

  onDelete(id: any) {
    if (!confirm('Are you sure you want to delete?')) return;

    this.userService.deleteUser(id).subscribe(() => {
      this.users.update(list => list.filter(u => u.id !== id));
    });
  }

  /* ---------------- RESET ---------------- */

  formReset() {
    this.form.reset({
      username: '',
      password: '',
      eId: null,
      isActive: true,
      menuPermissions: [] // ✅ NO ERROR
    });

    this.selectedUser.set(null);
    this.isSubmitted.set(false);
    this.loadTreeData('');
  }

  /* ---------------- KEYBOARD NAV ---------------- */

  handleSearchKeyDown(event: KeyboardEvent) {
    const list = this.filteredUserList();
    if (!list.length) return;

    if (event.key === 'ArrowDown') {
      this.highlightedTr.update(i => (i + 1) % list.length);
    }

    if (event.key === 'ArrowUp') {
      this.highlightedTr.update(i => (i - 1 + list.length) % list.length);
    }

    if (event.key === 'Enter' && this.highlightedTr() !== -1) {
      this.onUpdate(list[this.highlightedTr()]);
      this.highlightedTr.set(-1);
    }
  }
}
