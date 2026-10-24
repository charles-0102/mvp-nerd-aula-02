export const priorities = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
} as const;
export const statuses = {
  open: "Aberta",
  in_progress: "Em andamento",
  completed: "Concluída",
} as const;
export type Priority = keyof typeof priorities;
export type Status = keyof typeof statuses;
export type Profile = {
  id: string;
  role: "requester" | "admin";
  email: string;
  display_name: string;
};
export type Demand = {
  id: string;
  number: string;
  title: string;
  description: string;
  author_id: string;
  author_label: string;
  status: Status;
  priority: Priority;
  version: number;
  created_at: string;
};
export type Comment = {
  id: string;
  author_id: string;
  author_label: string;
  body: string;
  kind: "comment" | "critical_opening" | "priority_change";
  previous_priority: Priority | null;
  new_priority: Priority | null;
  created_at: string;
};
export type Counts = Record<Status, number>;
export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const dateLabel = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
export function validText(value: string, max: number) {
  const length = [...value.trim()].length;
  return length >= 1 && length <= max;
}
export function errorLabel(error: unknown): string {
  const message = (error as { message?: string })?.message ?? "";
  if (message.includes("STALE_REQUEST"))
    return "Esta demanda mudou. A consulta foi atualizada. Reavalie a situação e a prioridade antes de tentar novamente; seu texto foi preservado.";
  if (message.includes("REQUEST_COMPLETED"))
    return "Esta demanda já foi concluída. Seu texto foi preservado, mas novos comentários e revisões não são permitidos.";
  if (message.includes("NOT_FOUND_OR_DENIED"))
    return "Demanda não encontrada ou acesso não permitido.";
  if (message.includes("SESSION_REQUIRED"))
    return "Seu acesso não está mais disponível. Entre novamente para continuar.";
  if (message.includes("INVALID_EMAIL"))
    return "Informe um e-mail válido, como nome@exemplo.com.";
  if (message.includes("INVALID_TEXT"))
    return "Revise os campos: preencha o texto e respeite os limites indicados.";
  if (message.includes("INVALID_TRANSITION"))
    return "A situação mudou ou essa transição não é permitida. Atualize a consulta.";
  if (message.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  if (message.includes("ACCESS_DENIED"))
    return "Esta conta não tem acesso administrativo.";
  if (message.includes("STORAGE_UNAVAILABLE"))
    return "O navegador não conseguiu guardar seu acesso. Habilite o armazenamento local para continuar.";
  if (message.includes("CONFIGURATION_MISSING"))
    return "A conexão ainda não foi configurada. Confira as variáveis públicas do projeto.";
  return "Não foi possível confirmar a operação. Seu texto foi preservado. Atualize a consulta antes de repetir um envio, pois ele pode ter sido salvo.";
}
