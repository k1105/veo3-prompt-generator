export function getApiKey(customApiKey?: string): string | null {
  // カスタムAPIキーが設定されている場合はそれを使用
  if (customApiKey && customApiKey.trim() !== "") {
    return customApiKey;
  }

  // 環境変数からAPIキーを取得
  const envApiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (envApiKey && envApiKey.trim() !== "") {
    return envApiKey;
  }

  return null;
}
