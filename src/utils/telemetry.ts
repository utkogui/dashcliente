type TelemetryEvent =
  | { type: 'card_open'; profissionalId: string }
  | { type: 'interest_click'; profissionalId: string; contratoId: string; acao: 'RENOVAR' | 'REDUZIR' | 'TROCAR' | 'ESPERAR' }
  | { type: 'filters_change'; payload: Record<string, string> }

export function track(event: TelemetryEvent) {
  try {
    const isProd = (import.meta as any).env?.PROD === true
    const flag = (import.meta as any).env?.VITE_TELEMETRY_ENABLED
    const enabled = isProd ? flag === 'true' : true
    if (!enabled) return
    // Futuro: enviar para API/analytics.
    // eslint-disable-next-line no-console
    console.debug('[telemetry]', event)
  } catch {
    // noop
  }
}


