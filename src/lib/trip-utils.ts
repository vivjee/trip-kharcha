/**
 * Generates trip initials from the trip title:
 * - 2 letters if title has 2+ words (e.g. "Pokhara Trek" -> "PT")
 * - 1 letter if title is 1 word (e.g. "Chitwan" -> "C")
 */
export function getTripInitials(name: string): string {
  if (!name || !name.trim()) return 'TR';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0][0].toUpperCase();
}
