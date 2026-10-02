"use client";

import { useEffect } from "react";

import { PageContainer } from "@/components/layout/page";
import { ErrorState } from "@/components/ui/feedback";
import { logger } from "@/lib/logger";

/** Fronteira de erro por rota: registra no logger (ponto de integração de monitoramento). */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("route.error", error, { digest: error.digest });
  }, [error]);
  return (
    <PageContainer width="narrow">
      <ErrorState
        title="Algo saiu do roteiro"
        description="Esta tela encontrou um erro inesperado. Tente de novo; seus dados continuam salvos."
        onRetry={reset}
        className="py-24"
      />
    </PageContainer>
  );
}
