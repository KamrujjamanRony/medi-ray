import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('medi-ray');
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }
}
