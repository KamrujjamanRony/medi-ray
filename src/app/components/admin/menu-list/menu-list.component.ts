import { Component, ElementRef, inject, signal, computed, viewChild, viewChildren, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';
import { PermissionService } from '../../../services/auth/permission.service';
import { MenuS } from '../../../services/auth/menu-s';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface Menu {
  id: number;
  menuName: string;
  parentMenuId?: any;
  url?: string;
  isActive: boolean;
  icon?: string;
  permissionsKey: string[];
  postBy: string;
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, Field, FormsModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css'
})
export class MenuListComponent implements OnInit {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  /* ---------------- DI ---------------- */
  private menuService = inject(MenuS);
  private permissionService = inject(PermissionService);

  /* ---------------- SIGNAL STATE ---------------- */
  menus = signal<Menu[]>([]);
  searchQuery = signal('');
  permissionsKey: any;

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

  options = [
    { key: 'view', value: 'View' },
    { key: 'create', value: 'Insert' },
    { key: 'edit', value: 'Edit' },
    { key: 'delete', value: 'Delete' },
  ];

  readonly inputRefs = viewChildren<ElementRef>('inputRef');
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  /* ---------------- FORM MODEL ---------------- */
  menuModel = signal({
    menuName: '',
    parentMenuId: '',
    url: '',
    isActive: 'true', // Use string 'true'/'false'
    icon: '',
    permissionsKey: ["view"] as any,
    postBy: ''
  });

  /* ---------------- SIGNAL FORM ---------------- */
  menuForm = form(this.menuModel, (schemaPath) => {
    required(schemaPath.menuName, {message: 'Menu Name is required'});
    required(schemaPath.url, {message: 'Menu URL is required'});
    validate(schemaPath.url, ({value}) => {
      if (!value().startsWith('/')) {
        return {
          kind: 'https',
          message: 'URL must start with / symbol'
        }
      }
      return null
    })

    // Debounce form updates for better performance
    debounce(schemaPath.menuName, 300);
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
  getParentMenuName(menuId: any): string {
    return this.menuOptions().find(m => m.key === menuId)?.value ?? '';
  }

  /* ---------------- SUBMIT ---------------- */
  onSubmit(event: Event) {
    event.preventDefault();
    if (this.menuForm().valid()) {
      this.isSubmitted.set(true);

      // Create the payload with proper types
      const formValue = this.menuForm().value();

      const payload = {
        menuName: formValue.menuName,
        parentMenuId: formValue.parentMenuId ? Number(formValue.parentMenuId) : null, // Convert here
        url: formValue.url,
        isActive: formValue.isActive === 'true', // Convert string to boolean
        icon: formValue.icon,
        permissionsKey: this.permissionsKey, // Use the separate signal
        postBy: formValue.postBy
      };

      console.log('Form values:', formValue);
      console.log('Payload to send:', payload);

      const request$ = this.selectedMenu()
        ? this.menuService.updateMenu(this.selectedMenu()!.id, payload)
        : this.menuService.addMenu(payload);

      request$.subscribe(() => {
        this.loadMenus();
        this.formReset();
      });
    } else {
      alert("Form is Invalid!")
    }

  }

  /* ---------------- UPDATE ---------------- */
  onUpdate(menu: Menu) {
    this.selectedMenu.set(menu);
    this.permissionsKey = menu.permissionsKey ?? []

    // Update the form model
    this.menuModel.update(current => ({
      ...current,
      menuName: menu.menuName,
      parentMenuId: menu.parentMenuId ?? '',
      url: menu.url ?? '',
      isActive: menu.isActive ? 'true' : 'false',
      icon: menu.icon ?? '',
      permissionsKey: menu.permissionsKey ?? []
    }));

    // Reset validation states
    this.menuForm().reset();

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
    // Reset the model
    this.menuModel.set({
      menuName: '',
      parentMenuId: '',
      url: '',
      isActive: 'true',
      icon: '',
      permissionsKey: [],
      postBy: '',
    });
    this.permissionsKey = [];
    this.selectedMenu.set(null);
    this.isSubmitted.set(false);
    // Reset the form state
    this.menuForm().reset();
  }
}