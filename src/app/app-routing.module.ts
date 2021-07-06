import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { PhotoComponent } from './photo/photo.component';

const routes: Routes = [
  {
    path:'camera/:cam',
    component: PhotoComponent
  },
  {
    path:'inicio',
    component: PagesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
