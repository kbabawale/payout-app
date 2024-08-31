export function generatePaymentReference() {
  return `reference-${Date.now()}`;
}
