import createClient, { Client } from "openapi-fetch";
import type { paths } from "@/generated/api";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * ゆめみフロントエンドコーディング試験 API クライアント
 *
 * 型安全なAPIクライアント。OpenAPI定義から自動生成された型を使用します。
 */
export const createApiClient: () => Promise<Client<paths>> = async () => {
  const { env } = await getCloudflareContext({ async: true });
  return createClient<paths>({
    baseUrl: "https://yumemi-frontend-engineer-codecheck-api.vercel.app",
    headers: {
      "X-API-KEY": env.YUMEMI_API_KEY,
    },
  });
};
