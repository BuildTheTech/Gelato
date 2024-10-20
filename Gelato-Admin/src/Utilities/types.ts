export type SessionInfo = {
  start_time: number;
  end_time?: number;
  duration: number;
  time_increase_per_buy: number;
  max_length: number;
  min_deposit_required: number;
  number_of_winners: number;
  prize_percents: string;
  is_auto_pay: number;
  winners: string;
};
