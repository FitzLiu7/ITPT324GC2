import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverallComponent } from './overall/overall.component';

const routes: Routes = [{ path: 'overall', component: OverallComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
