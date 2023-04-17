import { adapterFactory as baseAdapterFactory } from 'calendar-utils/date-adapters/date-fns';
import {
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  getISOWeek,
  setDate,
  setMonth,
  setYear,
  getDate,
  getYear,
  addYears,
  subYears
} from 'date-fns';
import { DateAdapter } from '../date-adapter';

export function adapterFactory(): DateAdapter {
  return {
    ...baseAdapterFactory(),
    addWeeks,
    addYears,
    addMonths,
    subDays,
    subWeeks,
    subMonths,
    subYears,
    getISOWeek,
    setDate,
    setMonth,
    setYear,
    getDate,
    getYear,
  };
}
