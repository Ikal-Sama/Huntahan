import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function formatMessageTime(date){
  const dateObj = new Date(date);

  if (isNaN(dateObj)) return "Invalid Date";

  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });

}
