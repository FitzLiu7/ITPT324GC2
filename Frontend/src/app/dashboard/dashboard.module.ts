import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { OverallComponent } from './overall/overall.component';

@NgModule({
  declarations: [OverallComponent],
  imports: [CommonModule, DashboardRoutingModule],
})
export class DashboardModule {}
