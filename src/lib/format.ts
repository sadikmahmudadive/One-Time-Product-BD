/** ৳10.00 for small unit prices, ৳1,500 for pack-sized ones — matches the home-page design. */
export function formatPrice(n: number) {
  const whole = n >= 100;
  return `৳${n.toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}
