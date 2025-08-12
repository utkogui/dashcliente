type TelemetryEvent =
  | { type: 'card_open'; profissionalId: string }
  | { type: 'interest_click'; profissionalId: string; contratoId: string; acao: 'RENOVAR' | 'REDUZIR' | 'TROCAR' | 'ESPERAR' }
  | { type: 'filters_change'; payload: Record<string, string> }

export function track(event: TelemetryEvent) {
  try {
    // Placeholder: por enquanto apenas loga no console. Futuro: enviar para API/analytics.
    // eslint-disable-next-line no-console
    console.debug('[telemetry]', event)
  } catch {
    // noop
  }
}


