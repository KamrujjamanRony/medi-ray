import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  },
  // {
  //   path: 'about',
  //   renderMode: RenderMode.Prerender,
  // },
  // {
  //   path: 'admin',
  //   renderMode: RenderMode.Client,
  // },

];
