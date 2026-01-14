// seo-manager.ts
import { DOCUMENT, inject, Injectable, REQUEST } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoData } from '../utils/seo-model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SeoManager {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private request = inject(REQUEST, { optional: true });

  private readonly siteName = environment.companyName;
  private readonly domain = environment.webUrl;
  private readonly defaultDescription = `${this.siteName} is your go-to platform for managing medical records efficiently and securely.`;
  private readonly defaultImage = `https://www.dummyimage.com/600x400/000/fff&text=${this.siteName}`;

  updateSeoData(seo: SeoData) {
    const title = `${seo.title} | ${this.siteName}`;
    const description = seo.description || this.defaultDescription;
    const image = seo.image || this.defaultImage;
    const type = seo.type || 'website';
    const url = this.getFullUrl();

    /* -------- Title -------- */
    this.title.setTitle(title);

    /* -------- Basic SEO -------- */
    this.meta.updateTag({ name: 'description', content: description });

  /* -------- Keywords -------- */
  if (seo.keywords) {
    const keywords = Array.isArray(seo.keywords)
      ? seo.keywords.join(', ')
      : seo.keywords;

    this.meta.updateTag({
      name: 'keywords',
      content: keywords
    });
  } else {
    this.meta.removeTag("name='keywords'");
  }

    /* -------- Open Graph -------- */
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    /* -------- Twitter -------- */
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    /* -------- Canonical -------- */
    this.setCanonical(url);
  }

  private setCanonical(url: string) {
    let link = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private getFullUrl(): string {
    if (this.request) {
      const headers = this.request.headers as Headers;
      const proto = headers.get('x-forwarded-proto') || 'https';
      const host = headers.get('x-forwarded-host') || headers.get('host');
      return `${proto}://${host}${this.router.url}`;
    }
    return window.location.origin + this.router.url;
  }

  setSchema(schema: Record<string, any>) {
    this.removeSchema();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';

    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      ...schema
    });

    this.document.head.appendChild(script);
  }

  removeSchema() {
    const el = this.document.getElementById('structured-data');
    if (el) el.remove();
  }

}