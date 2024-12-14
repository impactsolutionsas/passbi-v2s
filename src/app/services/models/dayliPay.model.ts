export interface DayliePaid {
  amount: number;
  code: string;
  isPaid?: boolean;
  paidTime?: string;
  paidBy?: string;
  paidName?: string;
  paidMethode?: string;
}
