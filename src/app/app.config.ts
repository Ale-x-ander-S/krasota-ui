import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { routes } from './app.routes';
import { CartStateClass } from './store/cart/cart.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      NgxsModule.forRoot([CartStateClass]),
      NgxsStoragePluginModule.forRoot({
        key: ['cart'] // Автоматически сохраняет cart в localStorage
      }),
      NgxsReduxDevtoolsPluginModule.forRoot()
    )
  ]
};
