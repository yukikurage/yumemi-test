import createClient from "openapi-fetch";
import type { paths } from "@/generated/api";

/**
 * ゆめみフロントエンドコーディング試験 API クライアント
 *
 * 型安全なAPIクライアント。OpenAPI定義から自動生成された型を使用します。
 *
 * API Keyは各リクエストのheadersオプションで指定してください。
 * Cloudflare環境変数から取得するには `getCloudflareContext()` を使用します。
 *
 * @example
 * ```ts
 * import { getCloudflareContext } from "@opennextjs/cloudflare";
 *
 * const { env } = await getCloudflareContext();
 * const { data, error } = await client.GET("/api/v1/prefectures", {
 *   headers: {
 *     "X-API-KEY": env.YUMEMI_API_KEY,
 *   },
 * });
 * ```
 */
export const client = createClient<paths>({
  baseUrl: "https://yumemi-frontend-engineer-codecheck-api.vercel.app",
});
