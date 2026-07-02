export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return date.toLocaleString("pt-BR");
}

export function formatRelativeTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "agora mesmo";
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `Há ${diffDays} d`;

  return formatDate(isoDateTime);
}
