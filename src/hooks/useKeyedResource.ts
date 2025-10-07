import { use, useEffect, useRef, useState } from "react";

// 基本的に fetchers の更新に合わせて fetcher を再実行し、結果を返す。
// ここで、前回の key が同じものが同じ item として扱われ、実行がスキップされる
// fetcher の長さと結果の長さは常に等しく、Promise の解決前は fallback が入る
export function useKeyedResource<K, V>(
  fetchers: { key: K; fetcher: () => Promise<V>; fallback: V }[]
): V[] {
  const [, setTick] = useState(0);
  const results = useRef<Map<K, V>>(new Map());

  useEffect(() => {
    let isCurrent = true;

    fetchers.forEach((f) => {
      // 前回の key と同じならスキップ
      const prev = results.current.get(f.key);

      if (prev !== undefined) {
        return;
      }

      // fetcher 実行
      f.fetcher()
        .then((value) => {
          if (!isCurrent) return;

          results.current.set(f.key, value);
          setTick((t) => t + 1);
        })
        .catch(() => {
          if (!isCurrent) return;

          // エラー時は fallback をセット
          results.current.set(f.key, f.fallback);
          setTick((t) => t + 1);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchers]);

  return fetchers.map((f) => results.current.get(f.key) ?? f.fallback);
}
