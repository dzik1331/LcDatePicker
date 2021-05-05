import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LCTimePickerComponent} from './time-picker/time-picker.component';
import {LCTimePickerCompactComponent} from './time-picker-compact/time-picker-compact.component';
import {LCDayPickerComponent} from './day-picker/day-picker.component';
import {LCMonthPickerComponent} from './month-picker/month-picker.component';
import {LCYearPickerComponent} from './year-picker/year-picker.component';
import {LCDatePickerComponent} from './lc-date-picker.component';
import {LCDateRangePickerComponent} from './lc-date-range-picker.component';
import {LCTimePickerSecondsCompactComponent} from './time-picker-seconds-compact/time-picker-seconds-compact.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    LCDatePickerComponent,
    LCTimePickerComponent,
    LCTimePickerCompactComponent,
    LCDayPickerComponent,
    LCMonthPickerComponent,
    LCYearPickerComponent,
    LCDateRangePickerComponent,
    LCTimePickerSecondsCompactComponent
  ],
  exports: [LCDatePickerComponent, LCDateRangePickerComponent]
})
export class LcDatePickerModule {
}

export * from './lc-date-picker-config-helper';
export * from './lc-date-picker.component';
export * from './lc-date-range-picker.component';
