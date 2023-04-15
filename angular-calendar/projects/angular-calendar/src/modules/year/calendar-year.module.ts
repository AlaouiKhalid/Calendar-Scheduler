import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableModule } from 'angular-resizable-element';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { CalendarYearViewComponent } from './calender-year-view/calendar-year-view.component';

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DragAndDropModule,
    CalendarCommonModule,
  ],
  declarations: [
    CalendarYearViewComponent
  ],
  exports: [
    ResizableModule,
    DragAndDropModule,
    CalendarYearViewComponent
  ],
})
export class CalendarYearModule {}
