import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";

import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH } from "@/constants/app";
import { videoFormSchema, type VideoFormValues } from "@/schemas/video-schema";

import { FormField } from "./form-field";

type FieldErrors = Partial<Record<keyof VideoFormValues, string>>;

type Props = {
  initialValues?: VideoFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: VideoFormValues) => void;
};

export function MetadataForm({
  initialValues,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = () => {
    const parsed = videoFormSchema.safeParse({ name, description });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof VideoFormValues;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-5"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <FormField
        label="İsim"
        value={name}
        onChangeText={setName}
        error={errors.name}
        maxLength={NAME_MAX_LENGTH}
        placeholder="Örn. Sahilde gün batımı"
        editable={!isPending}
      />
      <FormField
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        placeholder="İstersen birkaç not ekle"
        multiline
        editable={!isPending}
      />

      {errorMessage ? (
        <Text className="mb-4 text-center text-sm text-red-600">
          {errorMessage}
        </Text>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isPending}
        accessibilityRole="button"
        className={`flex-row items-center justify-center rounded-full py-4 ${
          isPending ? "bg-indigo-400" : "bg-indigo-600 active:bg-indigo-700"
        }`}
      >
        {isPending ? <ActivityIndicator color="white" /> : null}
        <Text
          className={`text-base font-semibold text-white ${isPending ? "ml-2" : ""}`}
        >
          {isPending ? pendingLabel : submitLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}