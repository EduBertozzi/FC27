import { Compass } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

export default function NotFound() {
  return (
    <PageContainer width="narrow">
      <EmptyState
        icon={<Compass />}
        title="Página fora de campo"
        description="O endereço não existe ou mudou. Volte para o início da sua carreira."
        action={
          <Button asChild>
            <Link href="/">Ir para o início</Link>
          </Button>
        }
        className="py-24"
      />
    </PageContainer>
  );
}
