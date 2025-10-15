import createClient, { Client } from "openapi-fetch";
import type { paths } from "@/generated/api";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * ゆめみフロントエンドコーディング試験 API クライアント
 *
 * 型安全なAPIクライアント。OpenAPI定義から自動生成された型を使用します。
 */
export const createApiClient: () => Promise<Client<paths>> = async () => {
  const key =
    process.env.YUMEMI_API_KEY ??
    (await getCloudflareContext({ async: true })).env.YUMEMI_API_KEY;

  return createClient<paths>({
    baseUrl: "https://yumemi-frontend-engineer-codecheck-api.vercel.app",
    headers: {
      "X-API-KEY": key,
    },
  });
};
