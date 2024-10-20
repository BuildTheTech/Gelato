import { isAddress } from "viem";

export const shortenAddress = (address: string, chars = 5) => {
  if (!isAddress(address)) return "";

  const prefix = address.slice(0, chars);
  const suffix = address.slice(-chars);
  return `${prefix}...${suffix}`;
};

export const shortenDecimal = (val: number, decimal = 2) => {
  const str = val.toString();
  if (str.indexOf(".") < 0) {
    return str;
  }

  const [int, dec] = str.split(".");
  return `${int}.${dec.slice(0, decimal)}`;
};

export const calculateTimeLeft = (timeDiff: number) => {
  let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (timeDiff > 0) {
    timeLeft = {
      days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((timeDiff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((timeDiff / 1000 / 60) % 60),
      seconds: Math.floor((timeDiff / 1000) % 60),
    };
  }

  return timeLeft;
};

export const formatNumber = (value: number | bigint): string => {
  if (typeof value === "bigint") {
    value = Number(value);
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(3)}M`;
  }

  return value.toLocaleString();
};

export const toLocalISOString = (date: Date) => {
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toISOString().slice(0, -1);
};
