import { Redirect, useRouter } from "expo-router";

import { MetadataForm } from "@/components/metadata-form";
import { useCreateVideo } from "@/hooks/use-create-video";
import { useCropStore } from "@/store/crop-store";
import { getTrimErrorMessage } from "@/utils/trim-error";

export default function DetailsScreen() {
  const router = useRouter();
  const sourceUri = useCropStore((s) => s.sourceUri);
  const sourceDuration = useCropStore((s) => s.sourceDuration);
  const startTime = useCropStore((s) => s.startTime);

  const { mutate, isPending, error } = useCreateVideo();

  if (!sourceUri) return <Redirect href="/crop/select" />;

  return (
    <MetadataForm
      submitLabel="Kırp ve kaydet"
      pendingLabel="Kırpılıyor…"
      isPending={isPending}
      errorMessage={error ? getTrimErrorMessage(error) : null}
      onSubmit={(values) =>
        mutate(
          { sourceUri, sourceDuration, startTime, ...values },
          { onSuccess: () => router.dismissTo("/") },
        )
      }
    />
  );
}