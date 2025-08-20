import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { routes } from './app.routes';
import { CartStateClass } from './store/cart/cart.state';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    importProvidersFrom(
      NgxsModule.forRoot([CartStateClass]),
      NgxsStoragePluginModule.forRoot({
        key: ['cart'] // Автоматически сохраняет cart в localStorage
      }),
      NgxsReduxDevtoolsPluginModule.forRoot()
    )
  ]
};