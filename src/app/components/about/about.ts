import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { AboutStore } from '../../store/about.store';
import { About } from '../../store/about.slice';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  aboutStore = inject(AboutStore);
  about = signal<About>(this.aboutStore.about());
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // 2. Wrap the browser-specific code in a platform check
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
    }
  }
}
