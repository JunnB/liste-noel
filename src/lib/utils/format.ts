/**
 * Formate un montant en euros
 * - Affiche sans décimales si c'est un nombre entier (ex: 50€)
 * - Affiche avec 2 décimales si nécessaire (ex: 32.50€)
 */
export function formatAmount(amount: number): string {
  return amount % 1 === 0 ? `${amount.toFixed(0)}€` : `${amount.toFixed(2)}€`;
}

/**
 * Formate un montant sans le symbole €
 */
export function formatAmountValue(amount: number): string {
  return amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
}

