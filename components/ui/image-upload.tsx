"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "./button";
import { Camera, Trash2, User, RefreshCw } from "lucide-react";
import { Loading } from "./loading";
import {
  IMAGE_UPLOAD_CONFIG,
  IMAGE_ERROR_MESSAGES,
  UPLOAD_TYPE_CONFIGS,
  UploadType,
  AVATAR_SIZE_MAP,
  CENTER_CIRCLE_SIZE_MAP,
  WHEEL_SIZE_MAP,
  UPLOAD_GUIDELINES,
  IMAGE_UPLOAD_DEFAULT_LABEL,
  IMAGE_UPLOAD_REQUIRED_MESSAGE,
  IMAGE_UPLOAD_MAX_SIZE,
  IMAGE_UPLOAD_FORMAT_SUPPORT,
} from "@/lib/constants/upload";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/utils/media/avatar";
import { devLog } from "@/lib/utils/logging";

export interface ImageUploadProps {
  onUpload: (file: File) => void;
  onDelete?: () => Promise<void>;
  onAvatarChange?: (seed: string) => Promise<void>; // 아바타 시드 변경 콜백 추가
  currentImage?: string | null;
  required?: boolean;
  className?: string;
  avatarSize?: "sm" | "md" | "lg" | "xl";
  label?: string;
  uploadType?: UploadType | "image";
  hideGuidelines?: boolean;
  id?: string; // 접근성을 위한 id 추가
  profile?: any; // 프로필 데이터 (아바타 시드 포함)
}

export function ImageUpload({
  onUpload,
  onDelete,
  onAvatarChange,
  currentImage,
  required = false,
  className = "",
  avatarSize = "lg",
  label = IMAGE_UPLOAD_DEFAULT_LABEL,
  uploadType = "image",
  hideGuidelines = false,
  id = "image-upload", // 기본 id 제공
  profile, // 프로필 데이터
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [imgError, setImgError] = useState(false);

  // currentImage가 바뀔 때마다 imgError 초기화
  useEffect(() => {
    setImgError(false);
  }, [currentImage]);

  // 설정 기반 업로드 설정 사용
  const getUploadConfig = () => {
    // uploadType이 설정 기반 타입인 경우 해당 설정 사용
    if (
      uploadType &&
      uploadType !== "image" &&
      UPLOAD_TYPE_CONFIGS[uploadType as UploadType]
    ) {
      const config = UPLOAD_TYPE_CONFIGS[uploadType as UploadType];
      return {
        config: {
          maxSize: config.maxSize,
          maxWidth: config.maxWidth,
          maxHeight: config.maxHeight,
          quality: config.quality,
          targetFormat: config.targetFormat,
          allowedTypes: config.allowedTypes,
          allowedExtensions: config.allowedExtensions,
        },
        errorMessage: UPLOAD_GUIDELINES.ERROR_MESSAGE(config.allowedExtensions),
        guideline: UPLOAD_GUIDELINES.GUIDELINE(
          config.maxWidth,
          config.maxHeight
        ),
      };
    }

    // 기본 설정 사용
    return {
      config: IMAGE_UPLOAD_CONFIG,
      errorMessage: UPLOAD_GUIDELINES.ERROR_MESSAGE(
        IMAGE_UPLOAD_CONFIG.allowedExtensions
      ),
      guideline: UPLOAD_GUIDELINES.GUIDELINE(
        IMAGE_UPLOAD_CONFIG.maxWidth,
        IMAGE_UPLOAD_CONFIG.maxHeight
      ),
    };
  };

  // 파일 처리 함수 - 검증 제거하고 바로 onUpload 호출
  const handleFile = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        setError(null);

        const { config, errorMessage } = getUploadConfig();

        // 파일 크기 검증
        if (file.size > config.maxSize) {
          setError(IMAGE_ERROR_MESSAGES.SIZE_EXCEEDED);
          return;
        }

        // 파일 형식 검증
        if (!config.allowedTypes.includes(file.type as any)) {
          setError(errorMessage);
          return;
        }

        onUpload(file);
      } catch (err) {
        setError(IMAGE_ERROR_MESSAGES.PROCESSING_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [onUpload, uploadType]
  );

  // 삭제 핸들러
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    try {
      setLoading(true);
      setError(null);

      await onDelete();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : IMAGE_ERROR_MESSAGES.DELETE_FAILED;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onDelete]);

  // 아바타 변경 핸들러
  const handleAvatarChange = useCallback(async () => {
    if (!profile?.name) return;

    try {
      // DB 업데이트 콜백이 있으면 실행 (시드 생성은 콜백에서 처리)
      if (onAvatarChange) {
        await onAvatarChange("");
      }

      // 로컬 상태는 콜백에서 처리된 후 업데이트됨
      setImgError(false);
    } catch (error) {
      devLog.error("아바타 변경 실패:", error);
    }
  }, [profile?.name, onAvatarChange]);

  // 파일 선택 핸들러 (카메라/갤러리)
  const handleFileSelectWithCamera = useCallback(
    (useCamera: boolean = false) => {
      const input = document.createElement("input");
      input.type = "file";

      const { config } = getUploadConfig();
      input.accept = config.allowedTypes.join(",");

      if (useCamera) {
        input.capture = "user";
      }
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setIsSpinning(true);
          setTimeout(async () => {
            await handleFile(file);
            setIsSpinning(false);
          }, 1000);
        }
      };
      input.click();
    },
    [handleFile, uploadType]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        {/* 휠형 업로드 - Apple 스타일 */}
        <div className={`relative ${WHEEL_SIZE_MAP[avatarSize]}`}>
          {/* 휠 중앙 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div
              className={cn(
                `${AVATAR_SIZE_MAP[avatarSize]} rounded-full border-4 border-gray-200 flex items-center justify-center transition-all duration-500`,
                isSpinning ? "animate-spin" : ""
              )}
            >
              <div
                className={`${
                  CENTER_CIRCLE_SIZE_MAP[avatarSize]
                } rounded-full flex items-center justify-center overflow-hidden ${
                  currentImage && currentImage !== "" && !imgError
                    ? "bg-gray-100" // 이미지가 있을 때는 중성적 배경
                    : "bg-gradient-to-br from-blue-500 to-purple-600" // 이미지가 없을 때는 그라데이션 배경
                }`}
              >
                {currentImage && currentImage !== "" && !imgError ? (
                  <img
                    src={currentImage}
                    alt={label}
                    className="w-full h-full rounded-full object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : loading ? (
                  <Loading spinnerSize={32} showText={false} minHeight="auto" />
                ) : profile?.name && !imgError ? (
                  <img
                    src={getAvatarUrl(profile, {
                      size: 128,
                    })}
                    alt={label}
                    className="w-full h-full rounded-full object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <User className="h-8 w-8 text-white" aria-label={label} />
                )}
              </div>
            </div>
          </div>

          {/* 카메라 버튼 - 우하단 (아바타에 가깝게) */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleFileSelectWithCamera()}
            disabled={loading}
            className="absolute bottom-3 right-3 bg-white shadow-lg border-2 border-blue-200 hover:border-blue-300 rounded-full w-10 h-10 p-0"
            aria-label="이미지 업로드"
          >
            <Camera className="h-4 w-4 text-blue-600" />
          </Button>

          {/* 삭제 버튼 - 우상단 */}
          {currentImage && onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className="absolute top-3 right-3 bg-white shadow-lg border-2 border-red-200 hover:border-red-300 rounded-full w-10 h-10 p-0"
              aria-label="이미지 삭제"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}

          {/* 아바타 변경 버튼 - 3시 방향 */}
          {profile?.name && !currentImage && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAvatarChange}
              disabled={loading}
              className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-white shadow-lg border-2 border-green-200 hover:border-green-300 rounded-full w-10 h-10 p-0"
              aria-label="아바타 변경"
            >
              <RefreshCw className="h-4 w-4 text-green-600" />
            </Button>
          )}

          {/* 휠 포인터 - 9시 방향 */}
          <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg" />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* 필수 항목 표시 */}
        {required && !currentImage && (
          <p className="text-xs text-muted-foreground">
            {IMAGE_UPLOAD_REQUIRED_MESSAGE.replace("{label}", label)}
          </p>
        )}

        {/* 안내 텍스트 */}
        {!hideGuidelines && (
          <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              <p>
                {IMAGE_UPLOAD_MAX_SIZE.replace(
                  "{size}",
                  (getUploadConfig().config.maxSize / (1024 * 1024)).toString()
                )}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <p>{getUploadConfig().guideline}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <p className="font-medium">
                {IMAGE_UPLOAD_FORMAT_SUPPORT.replace(
                  "{formats}",
                  getUploadConfig()
                    .config.allowedExtensions.map((ext) => ext.toUpperCase())
                    .join(", ")
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
