import { useRef, useEffect } from "react";

/**
 * マウスホイールで横スクロールを可能にするカスタムフック（スムーススクロール付き）
 * @returns スクロール可能な要素にアタッチする ref
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const targetScrollLeft = useRef<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 初期値を現在のスクロール位置に設定
    targetScrollLeft.current = element.scrollLeft;

    // スムーススクロールアニメーション
    const smoothScroll = () => {
      if (!element) return;

      const currentScroll = element.scrollLeft;
      const diff = targetScrollLeft.current - currentScroll;
      // 目標に近づいたら終了
      if (Math.abs(diff) <= 5) {
        element.scrollLeft = targetScrollLeft.current;
        scrollAnimationRef.current = null;
        // 終了時にも同期を取る
        targetScrollLeft.current = element.scrollLeft;
        return;
      }

      // イージング（0.15 = 減速の度合い、大きいほど速く減速）
      element.scrollLeft += diff * 0.1;
      scrollAnimationRef.current = requestAnimationFrame(smoothScroll);
    };

    // シークバーなどで直接スクロールされた場合に同期
    const handleScroll = () => {
      // アニメーション中でない場合のみ、targetScrollLeftを実際のscrollLeftに同期
      if (scrollAnimationRef.current === null) {
        targetScrollLeft.current = element.scrollLeft;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // 横スクロール可能な要素でない場合は何もしない
      if (element.scrollWidth <= element.clientWidth) return;

      // Shift キーが押されている場合もデフォルト動作だが、targetScrollLeftは更新する必要がある
      if (e.shiftKey) {
        // handleScrollで同期されるのでここでは何もしない
        return;
      }

      // 通常のホイールスクロールを横スクロールに変換
      e.preventDefault();

      // 目標スクロール位置を更新
      targetScrollLeft.current += e.deltaY;
      targetScrollLeft.current = Math.max(
        0,
        Math.min(
          targetScrollLeft.current,
          element.scrollWidth - element.clientWidth
        )
      );

      console.log("wheel", e.deltaY, targetScrollLeft.current);

      // アニメーションが実行中でなければ開始
      if (scrollAnimationRef.current === null) {
        console.log("start scroll animation");

        scrollAnimationRef.current = requestAnimationFrame(smoothScroll);
      }
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("scroll", handleScroll);

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("scroll", handleScroll);
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

  return ref;
}
