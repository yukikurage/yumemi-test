async function fetchAndCachePopulation(
  prefCode: number,
  env: CloudflareEnv
): Promise<void> {
  const cacheKey = `population:${prefCode}`;

  try {
    const response = await fetch(
      `https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear?prefCode=${prefCode}`,
      {
        headers: {
          "X-API-KEY": env.YUMEMI_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // 7日間キャッシュ（データは年次なので長期でOK）
    await env.POPULATION_CACHE.put(cacheKey, JSON.stringify(data), {
      expirationTtl: 604800,
    });

    console.log(`✓ Cached prefCode ${prefCode}`);
  } catch (error) {
    console.error(`✗ Failed to cache prefCode ${prefCode}:`, error);
    throw error;
  }
}

async function warmCache(env: CloudflareEnv): Promise<Response> {
  console.log("Starting cache warming...");

  const results = [];

  for (let i = 1; i <= 47; i++) {
    try {
      await fetchAndCachePopulation(i, env);
      results.push({ prefCode: i, status: "success" });
    } catch (error) {
      results.push({ prefCode: i, status: "error", error: String(error) });
    }
  }

  return Response.json({
    message: "Cache warming completed",
    results,
  });
}

const handler = {
  async scheduled(event: ScheduledEvent, env: CloudflareEnv): Promise<void> {
    await warmCache(env);
  },
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const url = new URL(request.url);

    // セキュリティチェック（オプション）

    if (url.pathname === "/warm-cache") {
      return await warmCache(env);
    }

    return new Response(
      "Cache Warmer Worker\n\nEndpoints:\n- POST /warm-cache",
      {
        status: 200,
      }
    );
  },
};

export default handler;
