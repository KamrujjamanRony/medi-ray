import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AboutM } from '../../utils/models';
import { AboutS } from '../../services/about-s';

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
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.aboutService.getCompanyAbout(environment.companyCode).subscribe(data => data && this.about.set(data));
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }
}
