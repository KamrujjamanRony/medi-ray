import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AboutM } from '../../utils/models';
import { AboutS } from '../../services/about-s';
import { SeoManager } from '../../services/seo-manager';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  aboutService = inject(AboutS);
  about = signal<AboutM>({} as AboutM);
  renderer = inject(Renderer2);
      seoManager = inject(SeoManager);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.setProductsSeoTags();
    this.aboutService.getAbout(3).subscribe(data => data && this.about.set(data));
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }

  setProductsSeoTags() {
    this.seoManager.updateSeoData({
      title: 'About Us',
      description: '',
      type: 'website',
    });
  }
}
