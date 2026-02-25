import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LocationDetailComponent } from './components/location-detail/location-detail.component';
import { LocationOverviewComponent } from './components/location-overview/location-overview.component';
import { TagOverviewComponent } from './components/tag-overview/tag-overview.component';
import { TagDetailComponent } from './components/tag-detail/tag-detail.component';
import { CategoryOverviewComponent } from './components/category-overview/category-overview.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'items', component: ItemListComponent },
      { path: 'locations', component: LocationOverviewComponent },
      { path: 'location/:id', component: LocationDetailComponent },
      { path: 'tags', component: TagOverviewComponent },
      { path: 'tag/:id', component: TagDetailComponent },
      { path: 'categories', component: CategoryOverviewComponent },
      { path: 'category/:id', component: CategoryDetailComponent },
      { path: 'settings', component: SettingsComponent }
    ]),
    provideHttpClient()
  ]
};
