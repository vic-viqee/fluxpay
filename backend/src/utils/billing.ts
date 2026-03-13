import moment from 'moment';

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'annually';

export const calculateNextBillingDate = (
  currentDate: Date | string,
  frequency: BillingFrequency,
  billingDay: number
): Date => {
  const now = moment(currentDate).startOf('day');
  let nextDate = moment(now);

  if (frequency === 'daily') {
    nextDate.add(1, 'days');
  } else if (frequency === 'weekly') {
    nextDate.isoWeekday(billingDay % 7 || 7);
    if (nextDate.isSameOrBefore(moment(now))) {
      nextDate.add(1, 'weeks').isoWeekday(billingDay % 7 || 7);
    }
  } else if (frequency === 'monthly') {
    nextDate.date(billingDay);
    if (nextDate.isSameOrBefore(moment(now))) {
      nextDate.add(1, 'months').date(billingDay);
    }
  } else if (frequency === 'annually') {
    nextDate.add(1, 'years').date(billingDay);
    if (nextDate.isSameOrBefore(moment(now))) {
      nextDate.add(1, 'years').date(billingDay);
    }
  }

  return nextDate.startOf('day').toDate();
};
