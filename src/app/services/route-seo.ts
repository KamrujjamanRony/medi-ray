// route-seo.ts
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteSeo {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private document = inject(DOCUMENT);

  init() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        map(() => this.route),
        map(route => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        this.setMeta(data);
        this.setSchema(data);
      });
  }

  private setMeta(data: any) {
    if (data['title']) this.title.setTitle(data['title']);

    if (data['description']) {
      this.meta.updateTag({ name: 'description', content: data['description'] });
    }

    if (data['keywords']) {
      this.meta.updateTag({ name: 'keywords', content: data['keywords'] });
    }
  }

  private setSchema(data: any) {
    this.removeSchema();

    if (!data['schema']) return;

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      ...data['schema']
    });

    script.id = 'structured-data';
    this.document.head.appendChild(script);
  }

  private removeSchema() {
    const el = this.document.getElementById('structured-data');
    if (el) el.remove();
  }
  
}
