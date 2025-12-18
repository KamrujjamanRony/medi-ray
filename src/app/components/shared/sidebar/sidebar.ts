import { Component, signal } from '@angular/core';
import { AllSvgComponent } from "../all-svg/all-svg.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  imports: [AllSvgComponent, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {



  sidebarData = signal<any[]>([
    {
      id: 0, label: 'Carousel', icon: 'settings', route: '/admin/carousel'
    },
    {
      id: 1, label: 'product', icon: 'settings', route: '/admin/product'
    },
    {
      id: 2, label: 'User', icon: 'users', route: '/admin/user'
    },
    {
      id: 3, label: 'Menu', icon: 'settings', route: '/admin/menu'
    },
    {
      id: 4, label: 'about', icon: 'settings', route: '/admin/about'
    },
    {
      id: 5, label: 'address', icon: 'settings', route: '/admin/address'
    },
  ]);

  menuState = signal<Record<number, boolean>>({});

  toggleMenu(itemId: number) {
    this.menuState.update(state => ({
      ...state,
      [itemId]: !state[itemId]
    }));
  }

  sidebarHovered = signal<boolean>(false);

  setSidebarHover(state: boolean) {
    this.sidebarHovered.set(state);

    // Close all submenus when hovering out
    if (!state) {
      this.menuState.set({});
    }
  }

}
