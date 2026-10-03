import { Text, TextInput, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  maxLength: number;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
};

export function FormField({
  label,
  value,
  onChangeText,
  error,
  maxLength,
  placeholder,
  multiline = false,
  editable = true,
}: Props) {
  return (
    <View className="mb-5">
      <View className="mb-1.5 flex-row items-end justify-between">
        <Text className="text-sm font-semibold text-gray-800">{label}</Text>
        <Text className="text-xs text-gray-400">
          {value.length}/{maxLength}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={maxLength}
        multiline={multiline}
        editable={editable}
        textAlignVertical={multiline ? "top" : "center"}
        accessibilityLabel={label}
        className={`rounded-xl border bg-white px-4 text-base text-gray-900 ${
          multiline ? "min-h-28 py-3" : "py-3"
        } ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}