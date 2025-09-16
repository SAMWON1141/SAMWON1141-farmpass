import { NextRequest, NextResponse } from "next/server";
import { createSystemLog } from "@/lib/utils/logging/system-log";
import { requireAuth } from "@/lib/server/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getErrorResultFromRawError,
  makeErrorResponseFromResult,
  throwBusinessError,
} from "@/lib/utils/error/errorUtil";
import { LOG_MESSAGES } from "@/lib/utils/logging/log-templates";
import type { ProfileFormData } from "@/lib/utils/validation/profile-validation";
import type { CompanyFormData } from "@/lib/utils/validation/company-validation";
import { Prisma } from "@prisma/client";
import { profileSchema } from "@/lib/utils/validation/profile-validation";
import { companyFormSchema } from "@/lib/utils/validation/company-validation";

// PATCH: 프로필 정보 수정
export async function PATCH(request: NextRequest) {
  // 인증 확인
  const authResult = await requireAuth(false);
  if (!authResult.success || !authResult.user) {
    return authResult.response!;
  }

  const user = authResult.user;

  try {
    const data: Partial<ProfileFormData & CompanyFormData> =
      await request.json();

    // Zod 스키마 검증
    const profileData: Partial<ProfileFormData> = {};
    const companyData: Partial<CompanyFormData> = {};

    // ProfileFormData 필드들 분리 및 검증
    if (data.name !== undefined) profileData.name = data.name;
    if (data.email !== undefined) profileData.email = data.email;
    if (data.phone !== undefined) profileData.phone = data.phone;
    if (data.position !== undefined) profileData.position = data.position;
    if (data.department !== undefined) profileData.department = data.department;
    if (data.bio !== undefined) profileData.bio = data.bio;

    // CompanyFormData 필드들 분리 및 검증
    if (data.companyName !== undefined)
      companyData.companyName = data.companyName;
    if (data.companyAddress !== undefined)
      companyData.companyAddress = data.companyAddress;
    if (data.businessType !== undefined)
      companyData.businessType = data.businessType;
    if (data.company_description !== undefined)
      companyData.company_description = data.company_description;
    if (data.establishment_date !== undefined)
      companyData.establishment_date = data.establishment_date;
    if (data.employee_count !== undefined)
      companyData.employee_count = data.employee_count;
    if (data.company_website !== undefined)
      companyData.company_website = data.company_website;

    // ProfileFormData 스키마 검증 (필드가 있는 경우에만)
    if (Object.keys(profileData).length > 0) {
      const profileValidation = profileSchema.partial().safeParse(profileData);
      if (!profileValidation.success) {
        throwBusinessError("INVALID_FORM_DATA", {
          errors: profileValidation.error.errors,
          formType: "profile",
        });
      }
    }

    // CompanyFormData 스키마 검증 (필드가 있는 경우에만)
    if (Object.keys(companyData).length > 0) {
      const companyValidation = companyFormSchema
        .partial()
        .safeParse(companyData);
      if (!companyValidation.success) {
        throwBusinessError("INVALID_FORM_DATA", {
          errors: companyValidation.error.errors,
          formType: "company",
        });
      }
    }

    // Prisma 스키마에 맞게 데이터 변환
    const updateData: Prisma.profilesUpdateInput = {
      updated_at: new Date(),
    };

    // ProfileFormData 필드들 변환
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.bio !== undefined) updateData.bio = data.bio;

    // CompanyFormData 필드들 변환
    if (data.companyName !== undefined)
      updateData.company_name = data.companyName;
    if (data.companyAddress !== undefined)
      updateData.company_address = data.companyAddress;
    if (data.businessType !== undefined)
      updateData.business_type = data.businessType;
    if (data.company_description !== undefined)
      updateData.company_description = data.company_description;
    if (data.company_website !== undefined)
      updateData.company_website = data.company_website;

    // 타입 변환이 필요한 필드들
    if (data.employee_count !== undefined) {
      updateData.employee_count = data.employee_count
        ? parseInt(data.employee_count)
        : null;
    }

    if (data.establishment_date !== undefined) {
      updateData.establishment_date = data.establishment_date
        ? new Date(data.establishment_date)
        : null;
    }

    try {
      await prisma.profiles.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });
    } catch (updateError) {
      throwBusinessError(
        "GENERAL_UPDATE_FAILED",
        {
          resourceType: "profile",
        },
        updateError
      );
    }

    await createSystemLog(
      "PROFILE_UPDATED",
      LOG_MESSAGES.PROFILE_UPDATED(user.email || user.id),
      "info",
      { id: user.id, email: user.email || "" },
      "user",
      user.id,
      {
        action_type: "profile_event",
        event: "profile_updated",
        target_user_id: user.id,
        updated_fields: Object.keys(data),
      },
      request
    );
    return NextResponse.json(
      {
        success: true,
        message: "프로필 정보가 성공적으로 저장되었습니다.",
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "PROFILE_UPDATE_FAILED",
      LOG_MESSAGES.PROFILE_UPDATE_FAILED(user?.id || "unknown", errorMessage),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "user",
      user?.id,
      {
        action_type: "profile_event",
        event: "profile_update_failed",
        error_message: errorMessage,
        target_user_id: user?.id,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "update_profile",
      userId: user?.id,
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
