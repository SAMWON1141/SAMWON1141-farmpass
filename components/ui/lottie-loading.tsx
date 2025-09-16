"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Lottie 라이브러리를 동적 import로 최적화
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => <div className="w-16 h-16 bg-muted animate-pulse rounded" />,
});

interface LottieLoadingProps {
  text?: string;
  subText?: string;
  fullScreen?: boolean;
  animationPath?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function LottieLoading({
  text = "페이지를 불러오는 중...",
  subText,
  fullScreen = false,
  animationPath = "/lottie/cat_loading.json",
  size = "lg",
  showText = true,
}: LottieLoadingProps) {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dots, setDots] = useState("");

  // 애니메이션 파일 로드
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(animationPath);
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }
        const data = await response.json();
        setAnimationData(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load Lottie animation:", err);
        setError(true);
        setLoading(false);
      }
    };

    loadAnimation();
  }, [animationPath]);

  // 텍스트 점 애니메이션
  useEffect(() => {
    if (!showText) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [showText]);

  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-6",
    fullScreen ? "min-h-screen" : "flex-1",
    "bg-gradient-to-br from-background to-secondary/20"
  );

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-48 h-48",
    xl: "w-64 h-64",
  };

  // 로딩 중이거나 에러 시 폴백 UI
  if (loading || error || !animationData) {
    return (
      <div className={containerClasses}>
        {/* 로딩 중 또는 에러 시 스피너 */}
        <div className="w-16 h-16 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>

        {showText && (
          <div className="text-center">
            <p className="text-lg font-medium text-foreground/80">
              {text}
              {dots}
            </p>
            {subText && (
              <p className="text-sm text-muted-foreground mt-1">{subText}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Lottie 애니메이션 */}
      <div
        className={cn("flex items-center justify-center", sizeClasses[size])}
      >
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          className="drop-shadow-sm"
        />
      </div>

      {/* 로딩 텍스트 */}
      {showText && (
        <div className="text-center animate-fade-in">
          <p className="text-lg font-medium text-foreground/90 mb-2">
            {text}
            {dots}
          </p>
          {subText && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {subText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// 컴팩트 버전 (작은 영역용)
export function LottieLoadingCompact({
  text,
  size = "sm",
  animationPath = "/lottie/cat_loading.json",
}: Pick<LottieLoadingProps, "text" | "size" | "animationPath">) {
  return (
    <LottieLoading
      text={text}
      size={size}
      animationPath={animationPath}
      fullScreen={false}
      showText={!!text}
    />
  );
}

// 전체 화면 버전
export function LottieLoadingFullScreen({
  text = "페이지를 불러오는 중...",
  subText,
  animationPath = "/lottie/cat_loading.json",
}: Pick<LottieLoadingProps, "text" | "subText" | "animationPath">) {
  return (
    <LottieLoading
      text={text}
      subText={subText}
      animationPath={animationPath}
      fullScreen={true}
      size="xl"
      showText={true}
    />
  );
}
