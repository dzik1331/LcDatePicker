import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {DatePickerConfig, ECalendarNavigation, ECalendarType} from './lc-date-picker-config-helper';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

export enum panels {
  Time,
  Day,
  Month,
  Year
}

@Component({
  selector: 'lc-datepicker',
  template: `
    <div [ngSwitch]="activePanel" class="calendar" *ngIf="opened">
      <lc-year-picker
        *ngSwitchCase="3"
        [newDate]="newDate"
        (selected)="onYearSelected($event)"
        (reset)="onResetDate()"
        [config]="config"
      ></lc-year-picker>

      <lc-month-picker
        *ngSwitchCase="2"
        [newDate]="newDate"
        (selected)="onMonthSelected($event)"
        (reset)="onResetDate()"
        [config]="config"
        (switchPannel)="onSwitchPannel($event)"
      ></lc-month-picker>

      <lc-day-picker
        *ngSwitchCase="1"
        [newDate]="newDate"
        (selected)="onDaySelected($event)"
        (reset)="onResetDate()"
        [config]="config"
        (switchPannel)="onSwitchPannel($event)"
      ></lc-day-picker>

      <lc-day-picker
        *ngSwitchCase="6"
        [newDate]="newDate"
        (selected)="onDaySelected($event)"
        (reset)="onResetDate()"
        [config]="config"
        (switchPannel)="onSwitchPannel($event)"
      ></lc-day-picker>

      <lc-time-picker
        *ngSwitchCase="0"
        [config]="config"
        (selected)="onTimeSelected($event)"
        (reset)="onResetDate()"
        [newDate]="newDate"
      ></lc-time-picker>

      <div class="dateTimeToggle" *ngIf="config.CalendarType === 1">
        <lc-time-picker-compact
          [config]="config"
          (selected)="onTimeSelected($event)"
          [newDate]="newDate"
        ></lc-time-picker-compact>
      </div>

      <div class="dateTimeToggle" *ngIf="config.CalendarType === 6">
        <lc-time-picker-seconds-compact
          [config]="config"
          (selected)="onTimeSelected($event)"
          [newDate]="newDate"
        ></lc-time-picker-seconds-compact>
      </div>

      <div class="confirmDate" *ngIf="config.CalendarType <= 1 || config.CalendarType == 6" [style.background]="config.PrimaryColor">
        <button (click)="confirm()">{{ config.ConfirmLabel }}</button>
      </div>
    </div>
    <div class="calendarBackground" *ngIf="opened" (click)="close()"></div>
  `,
  styleUrls: ['./lc-date-picker.component.style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LCDatePickerComponent implements OnInit, OnChanges, OnDestroy {
  public originalDate: moment.Moment;
  public newDate: moment.Moment;
  public activePanel: panels;
  public panels;
  public locale;

  @HostBinding('style.margin-top') componentMargin;

  @HostBinding('attr.tabindex')
  public tabIndex: number = 0;

  @Input() opened: boolean;
  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() config: DatePickerConfig;
  @Input() date: moment.Moment;
  @Input() appendById: string;
  @Output() dateChange: EventEmitter<string> = new EventEmitter<string>();

  private subscriptions: Array<Subscription> = [];

  constructor(private cd: ChangeDetectorRef, private _elementRef: ElementRef) {
    this.panels = panels;
  }

  ngOnInit() {
    this.config.setHostElement(this._elementRef.nativeElement);
    this.initCalendar();
  }

  initCalendar() {
    let format = this.config.Format || '';
    this.locale = this.config.Localization || 'hr';
    moment.locale(this.locale);
    this.originalDate =
      !this.date || !moment(this.date, <string>format).isValid()
        ? moment().locale(this.locale)
        : moment(this.date, <string>format).locale(this.locale);
    this.originalDate = this.isDateAvailable(this.originalDate);
    this.newDate =
      !this.date || !moment(this.date, <string>format).isValid()
        ? moment().locale(this.locale)
        : moment(this.date, <string>format).locale(this.locale);
    this.newDate = this.isDateAvailable(this.newDate);
    this.setPanel(this.config.CalendarType);

    if (moment(this.config.MaxDate).diff(moment(this.config.MinDate), 'days') < 1) {
      this.config.MinDate = this.config.DefaultMinDate;
      this.config.MaxDate = this.config.DefaultMaxDate;
      throw 'Invalid min/max date. Max date should be at least 1 day after min date';
    }

    this.subscriptions.push(this.config.navigationChanges.subscribe(dir => this.navigation(dir)));
    this.subscriptions.push(this.config.panelChanges.subscribe(type => this.setPanel(type)));

    this._elementRef.nativeElement.focus();
  }

  ngOnChanges(changes) {
    if (changes.date) {
      this.cd.markForCheck();
    }
    if (changes.opened && changes.opened.currentValue === true) {
      const windowHeight = window.innerHeight;
      const componentPosition = this._elementRef.nativeElement.parentNode.getBoundingClientRect();
      let scroll = 0;
      if (this.appendById != null) {
        const appendObj = document.getElementById(this.appendById);
        if (appendObj) {
          scroll = appendObj.scrollTop;
        }
      }
      if (windowHeight - componentPosition.top > this.calendarSize(this.config.CalendarType)) {
        this.componentMargin = 0 + (scroll * -1) + 'px';
      } else {
        this.componentMargin = (this.calendarSize(this.config.CalendarType) + scroll) * -1 + 'px';
      }
      this.initCalendar();
      this.cd.markForCheck();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.length = 0;
  }

  private navigation(dir: ECalendarNavigation): void {
    if (dir === ECalendarNavigation.Close) this.close();
  }

  setPanel(panel: ECalendarType) {
    switch (panel) {
      case ECalendarType.DateTime: {
        this.activePanel = panels.Day;
        break;
      }
      case ECalendarType.DateTimeSeconds: {
        this.activePanel = panels.Day;
        break;
      }
      case ECalendarType.Date: {
        this.activePanel = panels.Day;
        break;
      }
      case ECalendarType.MonthYear: {
        this.activePanel = panels.Month;
        break;
      }
      case ECalendarType.Year: {
        this.activePanel = panels.Year;
        break;
      }
      case ECalendarType.Time: {
        this.activePanel = panels.Time;
        break;
      }
    }
    this.cd.detectChanges();
  }

  onTimeSelected(date: moment.Moment) {
    this.newDate = date;
    if (this.config.CalendarType === ECalendarType.Time) {
      this.cd.markForCheck();
    }
    this.config.focus();
  }

  onDaySelected(date: moment.Moment) {
    this.newDate = date;
    if (this.config.CalendarType > 1 && this.config.CalendarType !== ECalendarType.DateTimeSeconds) {
      this.dateChange.emit(this.newDate.toISOString());
      this.config.focus();
    }
    if (this.config.CalendarType === ECalendarType.Date) {
      this.confirm();
    }
  }

  onMonthSelected(date: moment.Moment) {
    this.newDate.month(date.month());
    if (this.config.CalendarType > 1 && this.config.CalendarType === ECalendarType.MonthYear) {
      this.dateChange.emit(this.newDate.toISOString());
    }
    if (this.config.CalendarType !== ECalendarType.MonthYear) {
      this.onSwitchPannel(panels.Day);
    } else {
      this.confirm();
    }
  }

  onYearSelected(date: moment.Moment) {
    this.newDate = moment(moment.now()).year(date.year());
    if (this.config.CalendarType > 1 && this.config.CalendarType === ECalendarType.Year) {
      this.dateChange.emit(this.newDate.toISOString());
    }
    if (this.config.CalendarType !== ECalendarType.Year) {
      this.onSwitchPannel(panels.Month);
    } else {
      this.confirm();
    }
  }

  onSwitchPannel(panel: panels) {
    this.cd.markForCheck();
    this.activePanel = panel;
    this.cd.detectChanges();
    this.config.focus();
  }

  onResetDate() {
    this.newDate = this.isDateAvailable(moment(moment.now()));

    if (this.config.CalendarType > 1) {
      this.confirm();
    }
    this.cd.markForCheck();
  }

  private isDateAvailable(date: moment.Moment): moment.Moment {
    if (this.config.MinDate && this.config.MaxDate) {
      let minDate = moment(this.config.MinDate);
      let maxDate = moment(this.config.MaxDate);
      if (minDate.isSame(maxDate)) {
        return null;
      }
    }

    if (this.config.DisabledDates[date.format('YYYY-MM-DD')]) {
      return this.isDateAvailable(date.add(1, 'day'));
    }

    if (this.config.MinDate) {
      let minDate = moment(this.config.MinDate);

      if (date.isBefore(minDate)) {
        return this.isDateAvailable(minDate);
      }
    }

    if (this.config.MaxDate) {
      let maxDate = moment(this.config.MaxDate);

      if (date.isAfter(maxDate)) {
        return this.isDateAvailable(maxDate);
      }
    }

    return date;
  }

  confirm() {
    this.openedChange.emit(false);
    this.opened = false;
    this.dateChange.emit(
      this.config.Format
        ? moment(this.newDate.toISOString()).format(<string>this.config.Format)
        : this.newDate.toISOString()
    );
    this.cd.detectChanges();
  }

  close() {
    this.openedChange.emit(false);
    this.opened = false;
    this.cd.detectChanges();
  }

  calendarSize(type: ECalendarType) {
    let height = 5;
    if (this.config.CalendarType <= 1) {
      height += 20;
    }
    switch (type) {
      case ECalendarType.DateTime: {
        height += 280;
        break;
      }
      case ECalendarType.Date:
      case ECalendarType.MonthYear:
      case ECalendarType.Year: {
        height += 240;
        break;
      }
      case ECalendarType.Time: {
        height += 140;
        break;
      }
    }
    return height;
  }
}
