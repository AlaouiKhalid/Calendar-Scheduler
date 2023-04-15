import {
  ChangeDetectorRef, Component, LOCALE_ID,
  EventEmitter, Inject, Input, OnInit, Output, TemplateRef, OnChanges, OnDestroy
} from '@angular/core';
import { CalendarEvent, MonthView, MonthViewDay, WeekDay, validateEvents } from 'calendar-utils';

import * as moment from 'moment';
import { PlacementArray } from 'positioning';
import { Subject, Subscription } from 'rxjs';
import { CalendarEventTimesChangedEventType, CalendarMonthViewBeforeRenderEvent, CalendarMonthViewEventTimesChangedEvent, CalendarUtils, DateAdapter } from '../../calendar.module';

export interface CelluleCalendrier {
  date: Date;
  jour: string;
}
export interface AbsenceResultat {
  id: number;
  debut: moment.Moment;
  fin: moment.Moment;
}

export interface MoisCalendrier {
  nom: string,
  index: number,
  premierJour: number,
  totalJours: number,
  weekends: number[],
  celluleDebut?: number,
  celluleFin?: number
}

@Component({
  selector: 'mwl-calendar-year-view',
  templateUrl: './calendar-year-view.component.html',
  styleUrls: ['./calendar-year-view.component.scss']
})
export class CalendarYearViewComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
   * An array of events to display on view.
   * The schema is available here: https://github.com/mattlewis92/calendar-utils/blob/c51689985f59a271940e30bc4e2c4e1fee3fcb5c/src/calendarUtils.ts#L49-L63
   */
  @Input() events: CalendarEvent[] = [];

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
   */
  @Input() excludeDays: number[] = [];

  /**
   * Whether the events list for the day of the `viewDate` option is visible or not
   */
  @Input() activeDayIsOpen: boolean = false;

  /**
   * If set will be used to determine the day that should be open. If not set, the `viewDate` is used
   */
  @Input() activeDay: Date;

  /**
   * An observable that when emitted on will re-render the current view
   */
  @Input() refresh: Subject<any>;

  /**
   * The locale used to format dates
   */
  @Input() locale: string;

  /**
   * The placement of the event tooltip
   */
  @Input() tooltipPlacement: PlacementArray = 'auto';

  /**
   * A custom template to use for the event tooltips
   */
  @Input() tooltipTemplate: TemplateRef<any>;

  /**
   * Whether to append tooltips to the body or next to the trigger element
   */
  @Input() tooltipAppendToBody: boolean = true;

  /**
   * The delay in milliseconds before the tooltip should be displayed. If not provided the tooltip
   * will be displayed immediately.
   */
  @Input() tooltipDelay: number | null = null;

  /**
   * The start number of the week.
   * If using the moment date adapter this option won't do anything and you'll need to set it globally like so:
   * ```
   * moment.updateLocale('en', {
   *   week: {
   *     dow: 1, // set start of week to monday instead
   *     doy: 0,
   *   },
   * });
   * ```
   */
  @Input() weekStartsOn: number;

  /**
   * A custom template to use to replace the header
   */
  @Input() headerTemplate: TemplateRef<any>;

  /**
   * A custom template to use to replace the day cell
   */
  @Input() cellTemplate: TemplateRef<any>;

  /**
   * A custom template to use for the slide down box of events for the active day
   */
  @Input() openDayEventsTemplate: TemplateRef<any>;

  /**
   * A custom template to use for event titles
   */
  @Input() eventTitleTemplate: TemplateRef<any>;

  /**
   * A custom template to use for event actions
   */
  @Input() eventActionsTemplate: TemplateRef<any>;

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
   */
  @Input() weekendDays: number[];

  /**
   * An output that will be called before the view is rendered for the current month.
   * If you add the `cssClass` property to a day in the body it will add that class to the cell element in the template
   */
  @Output() beforeViewRender =
    new EventEmitter<CalendarMonthViewBeforeRenderEvent>();

  /**
   * Called when the day cell is clicked
   */
  @Output() dayClicked = new EventEmitter<{
    day: MonthViewDay;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  /**
   * Called when the event title is clicked
   */
  @Output() eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  /**
   * Called when a header week day is clicked. Returns ISO day number.
   */
  @Output() columnHeaderClicked = new EventEmitter<{
    isoDayNumber: number;
    sourceEvent: MouseEvent | KeyboardEvent;
  }>();

  /**
   * Called when an event is dragged and dropped
   */
  @Output()
  eventTimesChanged =
    new EventEmitter<CalendarMonthViewEventTimesChangedEvent>();

  /**
   * @hidden
   */
  columnHeaders: WeekDay[];

  /**
   * @hidden
   */
  view: MonthView;

  /**
   * @hidden
   */
  openRowIndex: number;

  /**
   * @hidden
   */
  openDay: MonthViewDay;

  /**
   * @hidden
   */
  refreshSubscription: Subscription;

  intervalleAbsence?: AbsenceResultat;
  jourSelectionne?: CelluleCalendrier;
  selectionDirecteEnCours?: boolean;

  //anneeCourante = this.viewDate.getFullYear();

  datesCalendrier: CelluleCalendrier[][] = [];

  moiss: MoisCalendrier[] = [];
  jours: string[] = [];
  nomsJours: string[] = ["D", "L", "Ma", "Me", "J", "V", "S"];
  nomsMois: string[] = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
  ];

  maximumSemainesAnnee: number = 0;
  constructor(
    protected cdr: ChangeDetectorRef,
    protected utils: CalendarUtils,
    @Inject(LOCALE_ID) locale: string,
    protected dateAdapter: DateAdapter
  ) {
    this.locale = locale;
  }
  /**
   * @hidden
   */
  trackByRowOffset = (index: number, offset: number) =>
    this.view.days
      .slice(offset, this.view.totalDaysVisibleInWeek)
      .map((day) => day.date.toISOString())
      .join('-');

  /**
   * @hidden
   */
  trackByDate = (index: number, day: MonthViewDay) => day.date.toISOString();

  /**
   * @hidden
   */
  ngOnInit(): void {
    this.visualiserCalendrier(this.viewDate.getFullYear());
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * @hidden
   */
  ngOnChanges(changes: any): void {
    const refreshHeader =
      changes.viewDate || changes.excludeDays || changes.weekendDays;
    const refreshBody =
      changes.viewDate ||
      changes.events ||
      changes.excludeDays ||
      changes.weekendDays;

    if (refreshHeader) {
      this.refreshHeader();
    }

    // if (changes.events) {
    //   validateEvents(this.events);
    // }

    if (refreshBody) {
      this.refreshBody();
    }

    if (refreshHeader || refreshBody) {
      this.emitBeforeViewRender();
    }

    if (
      changes.activeDayIsOpen ||
      changes.viewDate ||
      changes.events ||
      changes.excludeDays ||
      changes.activeDay
    ) {
      this.checkActiveDayIsOpen();
    }
    this.visualiserCalendrier(this.viewDate.getFullYear());

  }

  /**
   * @hidden
   */
  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * @hidden
   */
  toggleDayHighlight(event: CalendarEvent, isHighlighted: boolean): void {
    this.view.days.forEach((day) => {
      if (isHighlighted && day.events.indexOf(event) > -1) {
        day.backgroundColor =
          (event.color && event.color.secondary) || '#D1E8FF';
      } else {
        delete day.backgroundColor;
      }
    });
  }

  /**
   * @hidden
   */
  eventDropped(
    droppedOn: MonthViewDay,
    event: CalendarEvent,
    draggedFrom?: MonthViewDay
  ): void {
    if (droppedOn !== draggedFrom) {
      const year: number = this.dateAdapter.getYear(droppedOn.date);
      const month: number = this.dateAdapter.getMonth(droppedOn.date);
      const date: number = this.dateAdapter.getDate(droppedOn.date);
      const newStart: Date = this.dateAdapter.setDate(
        this.dateAdapter.setMonth(
          this.dateAdapter.setYear(event.start, year),
          month
        ),
        date
      );
      let newEnd: Date;
      if (event.end) {
        const secondsDiff: number = this.dateAdapter.differenceInSeconds(
          newStart,
          event.start
        );
        newEnd = this.dateAdapter.addSeconds(event.end, secondsDiff);
      }
      this.eventTimesChanged.emit({
        event,
        newStart,
        newEnd,
        day: droppedOn,
        type: CalendarEventTimesChangedEventType.Drop,
      });
    }
  }

  protected refreshHeader(): void {
    this.columnHeaders = this.utils.getWeekViewHeader({
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays,
    });
  }

  protected refreshBody(): void {
    this.view = this.utils.getMonthView({
      events: this.events,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays,
    });
  }

  protected checkActiveDayIsOpen(): void {
    if (this.activeDayIsOpen === true) {
      const activeDay = this.activeDay || this.viewDate;
      this.openDay = this.view.days.find((day) =>
        this.dateAdapter.isSameDay(day.date, activeDay)
      );
      const index: number = this.view.days.indexOf(this.openDay);
      this.openRowIndex =
        Math.floor(index / this.view.totalDaysVisibleInWeek) *
        this.view.totalDaysVisibleInWeek;
    } else {
      this.openRowIndex = null;
      this.openDay = null;
    }
  }

  protected refreshAll(): void {
    this.refreshHeader();
    this.refreshBody();
    this.emitBeforeViewRender();
    this.checkActiveDayIsOpen();
  }

  protected emitBeforeViewRender(): void {
    if (this.columnHeaders && this.view) {
      this.beforeViewRender.emit({
        header: this.columnHeaders,
        body: this.view.days,
        period: this.view.period,
      });
    }
  }

  ouvrirMenuContextuel(event: MouseEvent, jour: CelluleCalendrier) {

  }

  private visualiserCalendrier(anneeCourante: number): void {
    this.recupererJoursNonTravailles(anneeCourante);
    this.construireAnnee(anneeCourante);

    this.jours = [""];
    let premierJour = 1;
    let dernierJour = this.maximumSemainesAnnee + 1;
    for (let i = premierJour; i < dernierJour; i++)
      this.jours.push(this.nomsJours[i % 7])
  }

  private construireMoiss(anneeCourante: number): void {
    this.nomsMois.forEach((_, i) => {
      let premierJour = new Date(anneeCourante, i, 1);
      let totalJours = new Date(anneeCourante, i + 1, 0).getDate();
      let weekends = [];
      let index = premierJour.getDay() - 1;
      for (let jour = 1; jour <= totalJours; jour++) {
        if ((jour + index) % 7 === 0 || (jour + index) % 7 === 6) {
          weekends.push(jour);
        }
      }
      this.ajouterMoisAnnee(i, totalJours, weekends, premierJour.getDay());
    });
  }

  private ajouterMoisAnnee(indexMois: number, totalJours: number, weekends: number[], premierJour: number): void {
    this.moiss.push({
      nom: this.nomsMois[indexMois],
      index: indexMois,
      premierJour: premierJour,
      totalJours: totalJours,
      weekends: weekends
    });
  }

  private construireJourSemaine(anneeCourante: number, premierJourSemaine: number): void {
    this.moiss.forEach(mois => {
      mois.celluleDebut = (mois.premierJour - premierJourSemaine + 7) % 7;
      mois.celluleFin = mois.celluleDebut + mois.totalJours - 1;
      let joursMois = this.construireJoursMois(mois.index, anneeCourante);
      this.datesCalendrier.push(joursMois);
    })
  }

  private construireAnnee(anneeCourante: number): void {
    this.moiss = [];
    this.datesCalendrier = [];
    this.maximumSemainesAnnee = 0;

    this.construireMoiss(anneeCourante);

    let premierJourSemaine = this.recupererPremierJourSemaine();

    this.construireJourSemaine(anneeCourante, premierJourSemaine);
  }

  private recupererPremierJourSemaine(): number {
    let premierJourSemaine = this.moiss.reduce((resultat, index) => {
      if (index.premierJour === 0) {
        return resultat;
      }
      return index.premierJour < resultat ? index.premierJour : resultat;
    }, 6);

    this.calculerMaximumJoursMois(premierJourSemaine);
    return premierJourSemaine;
  }

  private calculerMaximumJoursMois(premierJourSemaine: number): void {
    this.maximumSemainesAnnee = this.moiss.reduce((resultat, index) => {
      let celluleAvantPremierJour = index.premierJour === 0
        ? 6
        : index.premierJour - premierJourSemaine;
      let totalSemaine = celluleAvantPremierJour + index.totalJours;
      return totalSemaine > resultat ? totalSemaine : resultat;
    }, 0);
  }

  private recupererJoursNonTravailles(anneeCourante: number): void {

  }

  private celluleCalendrierParDefaut(i: number, mois: MoisCalendrier, anneeCourante: number, indexJour: number, joursDuMois: CelluleCalendrier[]): number {
    let celluleJour = {} as CelluleCalendrier;
    celluleJour.jour = "";

    if (i >= mois.celluleDebut! && i <= mois.celluleFin!) {
      celluleJour.date = new Date(anneeCourante, mois.index, indexJour, 4);
      celluleJour.jour = "" + indexJour + "";
      indexJour++;
    }
    joursDuMois.push(celluleJour);
    return indexJour;
  }


  construireJoursMois(moisId: number, anneeCourante: number): CelluleCalendrier[] {
    let joursDuMois: CelluleCalendrier[] = [];

    let indexJour = 1;
    let mois = this.moiss[moisId];

    for (let i = 0; i < this.maximumSemainesAnnee; i++) {
      indexJour = this.celluleCalendrierParDefaut(i, mois, anneeCourante, indexJour, joursDuMois);
    }
    return joursDuMois;
  }

  selectionnerIntervalleAbsence(jour: CelluleCalendrier, event?: MouseEvent): void {

  }


  public annulerSelectionIndirecte(): void {

  }

  public reinitialiserSelectionAbsence(): void {

  }

  selectionnerJour(jourSelectionne: CelluleCalendrier): void {
    if (jourSelectionne.jour != "")
      this.jourSelectionne = jourSelectionne;
  }


}
