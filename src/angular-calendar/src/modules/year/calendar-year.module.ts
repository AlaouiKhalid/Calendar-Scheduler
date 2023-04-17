import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { CalendarYearViewComponent } from './calender-year-view/calendar-year-view.component';

@NgModule({
  imports: [
    CommonModule,
    CalendarCommonModule
  ],
  declarations: [
    CalendarYearViewComponent
  ],
  exports: [
    CalendarYearViewComponent
  ]
})
export class CalendarYearModule { }
