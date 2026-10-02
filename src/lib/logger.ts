/**
 * Logger estruturado com "sinks" plugáveis. Na Fase 1 escreve no console;
 * em produção um sink pode enviar para Sentry/Datadog/OpenTelemetry sem que o
 * restante do código mude.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: unknown;
  timestamp: string;
}

export type LogSink = (entry: LogEntry) => void;

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function resolveLevel(raw: string | undefined): LogLevel {
  return raw && raw in LEVEL_ORDER ? (raw as LogLevel) : "info";
}

const consoleSink: LogSink = ({ level, message, context, error }) => {
  if (process.env.NODE_ENV === "test") return;
  const verbose = level === "debug" || level === "info";
  // Logs informativos ficam fora do console de produção; um sink remoto os coleta.
  if (verbose && process.env.NODE_ENV === "production") return;
  const write = level === "error" ? console.error : console.warn;
  write(`[${level}] ${message}`, ...(context ? [context] : []), ...(error ? [error] : []));
};

class Logger {
  private sinks: LogSink[] = [consoleSink];
  private minLevel: LogLevel = resolveLevel(process.env.NEXT_PUBLIC_LOG_LEVEL);

  addSink(sink: LogSink): () => void {
    this.sinks.push(sink);
    return () => {
      this.sinks = this.sinks.filter((s) => s !== sink);
    };
  }

  private emit(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: unknown,
  ) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;
    const entry: LogEntry = { level, message, context, error, timestamp: new Date().toISOString() };
    for (const sink of this.sinks) sink(entry);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.emit("debug", message, context);
  }
  info(message: string, context?: Record<string, unknown>) {
    this.emit("info", message, context);
  }
  warn(message: string, context?: Record<string, unknown>) {
    this.emit("warn", message, context);
  }
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.emit("error", message, context, error);
  }
}

export const logger = new Logger();
