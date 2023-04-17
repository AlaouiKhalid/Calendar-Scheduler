import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { CalendarMonthViewComponent } from './calendar-month-view/calendar-month-view.component';
import { CalendarMonthViewHeaderComponent } from './calendar-month-view/calendar-month-view-header/calendar-month-view-header.component';
import { CalendarMonthCellComponent } from './calendar-month-view/calendar-month-cell/calendar-month-cell.component';
import { CalendarOpenDayEventsComponent } from './calendar-month-view/calendar-open-day-events/calendar-open-day-events.component';
import { CalendarCommonModule } from '../common/calendar-common.module';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData, LocationStrategy, HashLocationStrategy } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { NZ_I18N, fr_FR } from 'ng-zorro-antd/i18n';
registerLocaleData(fr);

export {
  CalendarMonthViewComponent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarMonthViewEventTimesChangedEvent,
} from './calendar-month-view/calendar-month-view.component';
export { MonthViewDay as CalendarMonthViewDay } from 'calendar-utils';
export { collapseAnimation } from './calendar-month-view/calendar-open-day-events/calendar-open-day-events.component';

export { CalendarMonthCellComponent as ɵCalendarMonthCellComponent } from './calendar-month-view/calendar-month-cell/calendar-month-cell.component';
export { CalendarMonthViewHeaderComponent as ɵCalendarMonthViewHeaderComponent } from './calendar-month-view/calendar-month-view-header/calendar-month-view-header.component';
export { CalendarOpenDayEventsComponent as ɵCalendarOpenDayEventsComponent } from './calendar-month-view/calendar-open-day-events/calendar-open-day-events.component';

@NgModule({
  imports: [CommonModule, NzCalendarModule, DragAndDropModule, CalendarCommonModule, FormsModule,
    HttpClientModule,
    BrowserAnimationsModule],
  declarations: [
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent,

  ],
  exports: [
    NzCalendarModule,
    DragAndDropModule,
    CalendarMonthViewComponent,
    CalendarMonthCellComponent,
    CalendarOpenDayEventsComponent,
    CalendarMonthViewHeaderComponent
  ],
  providers: [{ provide: NZ_I18N, useValue: fr_FR }, { provide: LocationStrategy, useClass: HashLocationStrategy }],

})
export class CalendarMonthModule { }
