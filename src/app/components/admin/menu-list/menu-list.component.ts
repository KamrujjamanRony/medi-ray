import {
  Component,
  ElementRef,
  inject,
  signal,
  computed,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FieldComponent } from '../../shared/field/field.component';
import { SearchComponent } from '../../shared/search/search.component';
import { PermissionService } from '../../../services/auth/permission.service';
import { MenuS } from '../../../services/auth/menu-s';

/* --------------------------------------------
   Optional typing for menu permissions
--------------------------------------------- */
interface Menu {
  id: number;
  menuName: string;
  moduleName?: string;
  parentMenuId?: number | null;
  url?: string;
  isActive: boolean;
  icon?: string;
  permissionsKey?: string[];
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FieldComponent,
    SearchComponent
  ],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css'
})
export class MenuListComponent {
  /* ---------------- DI ---------------- */

  private fb = inject(NonNullableFormBuilder);
  private menuService = inject(MenuS);
  private permissionService = inject(PermissionService);

  /* ---------------- SIGNAL STATE ---------------- */

  menus = signal<Menu[]>([]);
  searchQuery = signal('');

  filteredMenuList = computed(() => {
    const query = this.searchQuery().toLowerCase();

    return this.menus()
      .filter(menu =>
        menu.menuName?.toLowerCase().includes(query) ||
        menu.moduleName?.toLowerCase().includes(query) ||
        menu.url?.toLowerCase().includes(query) ||
        String(menu.parentMenuId ?? '').includes(query)
      )
      .reverse();
  });

  menuOptions = computed(() =>
    this.menus().map(menu => ({
      key: menu.id,
      value: menu.menuName
    }))
  );

  selectedMenu = signal<Menu | null>(null);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  highlightedTr = signal<number>(-1);
  isSubmitted = signal(false);

  options: string[] = ['View', 'Insert', 'Edit', 'Delete'];

  readonly inputRefs = viewChildren<ElementRef>('inputRef');
  readonly searchInput =
    viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  /* ---------------- FORM (TYPED) ---------------- */

  form = this.fb.group({
    menuName: this.fb.control('', Validators.required),
    moduleName: this.fb.control(''),
    parentMenuId: this.fb.control<number | null>(null),
    url: this.fb.control(''),
    isActive: this.fb.control(true),
    icon: this.fb.control(''),
    permissionsKey: this.fb.control<string[]>([]) // ✅ FIXED
  });

  /* ---------------- LIFECYCLE ---------------- */

  ngOnInit(): void {
    this.loadMenus();
    this.loadPermissions();

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    }, 10);
  }

  /* ---------------- LOADERS ---------------- */

  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('Menu'));
    this.isInsert.set(this.permissionService.hasPermission('Menu', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('Menu', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('Menu', 'delete'));
  }

  loadMenus() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.menuService.getAllMenu().subscribe({
        next: data => {
          this.menus.set((data as Menu[]) ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }

  /* ---------------- SEARCH ---------------- */

  onSearchMenu(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /* ---------------- FORM HELPERS ---------------- */

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  getParentMenuName(menuId: any): string {
    return (
      this.menuOptions().find(m => m.key === menuId)?.value ?? ''
    );
  }

  /* ---------------- KEYBOARD NAV ---------------- */

  handleEnterKey(event: Event, currentIndex: number) {
    event.preventDefault();
    const inputs = this.inputRefs()?.filter(
      i => !i.nativeElement.disabled
    );

    if (!inputs) return;

    if (currentIndex + 1 < inputs.length) {
      inputs[currentIndex + 1].nativeElement.focus();
    } else {
      this.onSubmit(event);
    }
  }

  handleSearchKeyDown(event: KeyboardEvent) {
    const list = this.filteredMenuList();
    if (!list.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedTr.update(i => (i + 1) % list.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedTr.update(i => (i - 1 + list.length) % list.length);
    }

    if (event.key === 'Enter' && this.highlightedTr() !== -1) {
      event.preventDefault();
      this.onUpdate(list[this.highlightedTr()]);
      this.highlightedTr.set(-1);
    }
  }

  /* ---------------- SUBMIT ---------------- */

  onSubmit(e: Event) {
    e.preventDefault();
    this.isSubmitted.set(true);

    if (!this.form.valid) return;

    const payload = {
      ...this.form.getRawValue(),
      parentMenuId: this.form.value.parentMenuId ?? null,
      permissionsKey: this.form.value.permissionsKey ?? []
    };

    const request$ = this.selectedMenu()
      ? this.menuService.updateMenu(this.selectedMenu()!.id, payload)
      : this.menuService.addMenu(payload);

    request$.subscribe(() => {
      this.loadMenus();
      this.formReset();
    });
  }

  /* ---------------- UPDATE ---------------- */

  onUpdate(menu: Menu) {
    this.selectedMenu.set(menu);

    this.form.patchValue({
      menuName: menu.menuName,
      moduleName: menu.moduleName ?? '',
      parentMenuId: menu.parentMenuId ?? null,
      url: menu.url ?? '',
      isActive: menu.isActive,
      icon: menu.icon ?? '',
      permissionsKey: menu.permissionsKey ?? []
    });

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    });
  }

  /* ---------------- DELETE ---------------- */

  onDelete(id: any) {
    if (!confirm('Are you sure you want to delete?')) return;

    this.menuService.deleteMenu(id).subscribe(() => {
      this.menus.update(list => list.filter(m => m.id !== id));
    });
  }

  /* ---------------- RESET ---------------- */

  formReset() {
    this.form.reset({
      menuName: '',
      moduleName: '',
      parentMenuId: null,
      url: '',
      isActive: true,
      icon: '',
      permissionsKey: []
    });

    this.selectedMenu.set(null);
    this.isSubmitted.set(false);
  }
}
