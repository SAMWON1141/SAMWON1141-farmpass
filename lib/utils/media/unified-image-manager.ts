/**
 * 통합 이미지 업로드 매니저
 * 단일 책임 원칙: 업로드 로직만 담당
 * 설정 기반 관리와 타입 안전성 보장
 */

import { supabase } from "@/lib/supabase/client";
import { devLog } from "@/lib/utils/logging/dev-logger";
import { handleError, mapRawErrorToCode } from "@/lib/utils/error";
import { UPLOAD_TYPE_CONFIGS, UploadType } from "@/lib/constants/upload";
import { getErrorMessage } from "../error/errorUtil";
import type {
  UploadState,
  UploadResult,
  UploadError,
} from "@/lib/types/upload";

export class UnifiedImageManager {
  private state: UploadState = {
    loading: false,
    progress: 0,
    error: null,
    result: null,
  };

  private uploadType: UploadType;
  private contextId?: string; // userId와 farmId를 통합한 contextId

  constructor(uploadType: UploadType, contextId?: string) {
    this.uploadType = uploadType;
    this.contextId = contextId; // contextId 저장
  }

  /**
   * 업로드 설정 가져오기
   */
  private getUploadConfig() {
    return UPLOAD_TYPE_CONFIGS[this.uploadType];
  }

  /**
   * 파일 검증
   */
  private validateFile(file: File): UploadError | null {
    const config = this.getUploadConfig();

    // 파일 크기 검증
    if (file.size > config.maxSize) {
      return {
        code: "SIZE_EXCEEDED",
        message: `파일 크기는 ${
          config.maxSize / (1024 * 1024)
        }MB 이하여야 합니다.`,
        details: { maxSize: config.maxSize, actualSize: file.size },
      };
    }

    // 파일 형식 검증
    if (!config.allowedTypes.includes(file.type as any)) {
      return {
        code: "INVALID_TYPE",
        message: `지원되지 않는 파일 형식입니다. ${config.allowedExtensions.join(
          ", "
        )} 만 업로드 가능합니다.`,
        details: { allowedTypes: config.allowedTypes, actualType: file.type },
      };
    }

    return null;
  }

  /**
   * 파일명에서 Storage 경로 추출
   */
  private extractStoragePath(url: string): string | null {
    const bucket = this.getUploadConfig().bucket;

    // Supabase Storage URL에서 경로 추출
    const match = url.match(
      new RegExp(`/storage/v1/object/public/${bucket}/(.+)`)
    );
    if (match) {
      return match[1];
    }

    // 기존 패턴 매칭 (하위 호환성)
    const legacyMatch = url.match(/(systems|[\w-]+)\/[\w\-.]+/);
    if (legacyMatch) {
      return legacyMatch[0];
    }

    return null;
  }

  /**
   * 기존 파일 삭제
   */
  private async deleteExistingFile(currentUrl: string): Promise<void> {
    const config = this.getUploadConfig();
    const fileName = this.extractStoragePath(currentUrl);

    if (fileName) {
      try {
        const { error } = await supabase.storage
          .from(config.bucket)
          .remove([fileName]);

        if (error) {
          devLog.warn("기존 파일 삭제 실패:", error);
        }
      } catch (error) {
        devLog.warn("기존 파일 삭제 중 오류:", error);
      }
    }
  }

  /**
   * Canvas API를 사용한 이미지 처리
   * 리사이징, 품질 조절, 형식 변환을 수행합니다.
   */
  private async processImageWithCanvas(file: File): Promise<File> {
    const config = this.getUploadConfig();

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          // 원본 이미지 크기
          const originalWidth = img.width;
          const originalHeight = img.height;

          // 리사이징 계산 (비율 유지)
          let newWidth = originalWidth;
          let newHeight = originalHeight;
          let needsResize = false;

          if (
            originalWidth > config.maxWidth ||
            originalHeight > config.maxHeight
          ) {
            needsResize = true;
            const aspectRatio = originalWidth / originalHeight;

            if (originalWidth > originalHeight) {
              newWidth = Math.min(originalWidth, config.maxWidth);
              newHeight = newWidth / aspectRatio;

              if (newHeight > config.maxHeight) {
                newHeight = config.maxHeight;
                newWidth = newHeight * aspectRatio;
              }
            } else {
              newHeight = Math.min(originalHeight, config.maxHeight);
              newWidth = newHeight * aspectRatio;

              if (newWidth > config.maxWidth) {
                newWidth = config.maxWidth;
                newHeight = newWidth / aspectRatio;
              }
            }
          }

          // 형식 변환이 필요한지 확인
          const needsFormatConversion =
            config.targetFormat !== "original" &&
            !file.type.includes(config.targetFormat);

          // 리사이징이나 형식 변환이 필요하지 않으면 원본 반환
          if (!needsResize && !needsFormatConversion) {
            resolve(file);
            return;
          }

          // Canvas 크기 설정
          canvas.width = newWidth;
          canvas.height = newHeight;

          // 이미지 그리기 (고품질 리샘플링)
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // MIME 타입 결정
          const mimeType = this.getMimeType(config.targetFormat);

          // Blob 생성 (품질 설정)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // 처리된 파일 생성
              const processedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });

              resolve(processedFile);
            },
            mimeType,
            config.quality
          );
        } catch (error) {
          devLog.error("이미지 처리 중 오류:", error);
          resolve(file); // 오류 시 원본 반환
        }
      };

      img.onerror = () => {
        devLog.error("이미지 로드 실패. 원본 파일 반환");
        resolve(file);
      };

      // 이미지 로드 시작
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * targetFormat에 따른 MIME 타입 반환
   */
  private getMimeType(targetFormat: string): string {
    switch (targetFormat.toLowerCase()) {
      case "jpeg":
      case "jpg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "ico":
        return "image/x-icon";
      default:
        return "image/jpeg"; // 기본값
    }
  }

  /**
   * 이미지 업로드 실행
   */
  async uploadImage(options: {
    file: File;
    prevFileName?: string;
    onProgress?: (progress: number) => void;
  }): Promise<UploadResult> {
    const { file, prevFileName, onProgress } = options;
    const config = this.getUploadConfig();

    try {
      // 상태 초기화
      this.state = {
        loading: true,
        progress: 0,
        error: null,
        result: null,
      };

      // 파일 검증
      const validationError = this.validateFile(file);
      if (validationError) {
        this.state.error = validationError;
        throw new Error(validationError.message);
      }

      // 진행률 업데이트
      onProgress?.(10);
      this.state.progress = 10;

      // Canvas API를 사용한 이미지 처리
      const processedFile = await this.processImageWithCanvas(file);

      // 진행률 업데이트
      onProgress?.(30);
      this.state.progress = 30;

      // 기존 파일 삭제
      if (prevFileName) {
        await this.deleteExistingFile(prevFileName);
        onProgress?.(50);
        this.state.progress = 50;
      }

      // 파일명 생성 - contextId 전달 (처리된 파일 사용)
      const fileName = config.pathGenerator(processedFile, this.contextId);
      onProgress?.(60);
      this.state.progress = 60;

      // Supabase Storage에 업로드 (처리된 파일 사용)
      const { data, error: uploadError } = await supabase.storage
        .from(config.bucket)
        .upload(fileName, processedFile, {
          cacheControl: config.cacheControl,
          contentType: processedFile.type,
        });

      if (uploadError) {
        const errorCode = mapRawErrorToCode(uploadError, "storage");
        const message = getErrorMessage(errorCode);
        const error: UploadError = {
          code: "UPLOAD_FAILED",
          message: `이미지 업로드 중 오류가 발생했습니다: ${message}`,
          details: uploadError,
        };
        this.state.error = error;
        handleError(uploadError, "이미지 업로드");
        throw new Error(error.message);
      }

      onProgress?.(80);
      this.state.progress = 80;

      // 공개 URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from(config.bucket).getPublicUrl(data.path);

      const result: UploadResult = {
        publicUrl,
        fileName: data.path,
        fileSize: file.size,
        mimeType: file.type,
      };

      onProgress?.(100);
      this.state.progress = 100;
      this.state.result = result;

      return result;
    } catch (error) {
      const uploadError: UploadError = {
        code: "UNKNOWN_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        details: error,
      };
      this.state.error = uploadError;
      handleError(error, "이미지 업로드");
      throw error;
    } finally {
      this.state.loading = false;
    }
  }

  /**
   * 이미지 삭제
   */
  async deleteImage(currentUrl: string): Promise<void> {
    const config = this.getUploadConfig();

    try {
      this.state.loading = true;
      this.state.error = null;

      const fileName = this.extractStoragePath(currentUrl);

      if (fileName) {
        const { error } = await supabase.storage
          .from(config.bucket)
          .remove([fileName]);

        if (error) {
          const errorCode = mapRawErrorToCode(error, "storage");
          const message = getErrorMessage(errorCode);
          const uploadError: UploadError = {
            code: "DELETE_FAILED",
            message: `이미지 삭제 중 오류가 발생했습니다: ${message}`,
            details: error,
          };
          this.state.error = uploadError;
          handleError(error, "이미지 삭제");
          throw new Error(uploadError.message);
        }
      }
    } catch (error) {
      const uploadError: UploadError = {
        code: "DELETE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "이미지 삭제 중 알 수 없는 오류가 발생했습니다.",
        details: error,
      };
      this.state.error = uploadError;
      handleError(error, "이미지 삭제");
      throw error;
    } finally {
      this.state.loading = false;
    }
  }

  /**
   * 현재 상태 반환
   */
  getState(): UploadState {
    return { ...this.state };
  }

  /**
   * 상태 초기화
   */
  resetState(): void {
    this.state = {
      loading: false,
      progress: 0,
      error: null,
      result: null,
    };
  }
}

/**
 * UnifiedImageManager 팩토리 함수
 */
export function createImageManager(
  uploadType: UploadType,
  contextId?: string
): UnifiedImageManager {
  return new UnifiedImageManager(uploadType, contextId);
}
