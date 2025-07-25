import React from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { VisitorSettings } from "@/lib/types/visitor";
import type { VisitorFormData } from "@/lib/utils/validation/visitor-validation";
import { LABELS } from "@/lib/constants/visitor";

interface ImageSectionProps {
  settings: VisitorSettings;
  formData: VisitorFormData;
  uploadedImageUrl: string | null;
  onImageUpload: (
    file: File
  ) => Promise<{ publicUrl: string; fileName: string } | void>;
  onImageDelete?: (fileName: string) => Promise<void>;
}

export const ImageSection = ({
  settings,
  formData,
  uploadedImageUrl,
  onImageUpload,
  onImageDelete,
}: ImageSectionProps) => {
  if (!settings.requireVisitorPhoto) {
    return null;
  }

  return (
    <div className="mb-3 sm:mb-6 w-full flex flex-col items-center">
      <ImageUpload
        id="visitor-image-upload"
        onUpload={onImageUpload}
        onDelete={onImageDelete ? () => onImageDelete("") : undefined}
        currentImage={uploadedImageUrl || formData.profilePhotoUrl || null}
        required={settings.requireVisitorPhoto}
        avatarSize="lg"
        hideGuidelines={true}
        label={LABELS.PROFILE_PHOTO}
      />
    </div>
  );
};
