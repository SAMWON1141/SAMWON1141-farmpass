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
import type { UpdateMemberData } from "@/lib/types/farm";

// PUT - 농장 멤버 역할 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: { farmId: string; memberId: string } }
) {
  let user = null;

  try {
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;
    const updateData: UpdateMemberData = await request.json();
    const { role } = updateData;

    // 농장 소유권 또는 관리자 권한 확인
    let farm;
    try {
      farm = await prisma.farms.findUnique({
        where: { id: params.farmId },
        select: { owner_id: true, farm_name: true },
      });
    } catch (farmError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "farm",
        },
        farmError
      );
    }

    if (!farm) {
      throwBusinessError("FARM_NOT_FOUND", {
        operation: "update_member_farm_check",
        farmId: params.farmId,
      });
    }

    // 시스템 관리자가 아닌 경우에만 농장별 권한 확인
    if (!authResult.isAdmin && farm.owner_id !== user.id) {
      let memberRole;
      try {
        memberRole = await prisma.farm_members.findFirst({
          where: {
            farm_id: params.farmId,
            user_id: user.id,
          },
          select: { role: true },
        });
      } catch (memberError) {
        throwBusinessError(
          "GENERAL_QUERY_FAILED",
          {
            resourceType: "member",
          },
          memberError
        );
      }

      if (!memberRole || memberRole.role !== "manager") {
        throwBusinessError("INSUFFICIENT_PERMISSIONS", {
          operation: "update_member_role",
          farmId: params.farmId,
          userId: user.id,
        });
      }
    }

    // 변경할 멤버 정보 조회
    let memberToUpdate;
    try {
      memberToUpdate = await prisma.farm_members.findUnique({
        where: { id: params.memberId },
        include: {
          profiles: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (memberError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "member",
        },
        memberError
      );
    }

    if (!memberToUpdate || memberToUpdate.farm_id !== params.farmId) {
      throwBusinessError("MEMBER_NOT_FOUND", {
        operation: "update_member_check",
        memberId: params.memberId,
        farmId: params.farmId,
      });
    }

    // 농장 소유자의 역할은 변경할 수 없음
    if (memberToUpdate.user_id === farm.owner_id) {
      throwBusinessError("CANNOT_CHANGE_OWNER_ROLE", {
        operation: "update_member_role",
        memberId: params.memberId,
        farmId: params.farmId,
      });
    }

    const oldRole = memberToUpdate.role;

    // 멤버 역할 업데이트 + 알림 트랜잭션 처리
    try {
      await prisma.$transaction(async (tx: any) => {
        await tx.farm_members.update({
          where: { id: params.memberId },
          data: { role },
        });
        const members = await tx.farm_members.findMany({
          where: { farm_id: params.farmId },
          select: { user_id: true },
        });
        await tx.notifications.createMany({
          data: members.map((m: any) => ({
            user_id: m.user_id,
            type: "member_updated",
            title: `멤버 역할 변경`,
            message: `${farm.farm_name} 농장 멤버 ${
              (memberToUpdate.profiles as any)?.name || ""
            }의 역할이 ${oldRole === "manager" ? "관리자" : "조회자"}에서 ${
              role === "manager" ? "관리자" : "조회자"
            }로 변경되었습니다.`,
            data: {
              farm_id: params.farmId,
              farm_name: farm.farm_name,
              member_id: params.memberId,
              old_role: oldRole,
              new_role: role,
            },
            link: `/admin/farms/${params.farmId}/members`,
          })),
        });
      });
    } catch (updateError) {
      throwBusinessError(
        "GENERAL_TRANSACTION_FAILED",
        {
          resourceType: "member",
          operationType: "update",
        },
        updateError
      );
    }

    // 농장 멤버 역할 변경 로그 기록
    await createSystemLog(
      "MEMBER_UPDATED",
      LOG_MESSAGES.MEMBER_ROLE_UPDATED(
        (memberToUpdate.profiles as any)?.name || "",
        (memberToUpdate.profiles as any)?.email || "",
        oldRole,
        role,
        farm.farm_name
      ),
      "info",
      { id: user.id, email: user.email || "" },
      "member",
      params.memberId,
      {
        action_type: "farm_event",
        event: "member_role_updated",
        member_id: params.memberId,
        member_email: (memberToUpdate.profiles as any)?.email || "",
        farm_id: params.farmId,
        farm_name: farm.farm_name,
        old_role: oldRole,
        new_role: role,
      },
      request
    );

    return NextResponse.json(
      {
        success: true,
        message: `${(memberToUpdate.profiles as any)?.name}의 역할이 ${
          oldRole === "manager" ? "관리자" : "조회자"
        }에서 ${role === "manager" ? "관리자" : "조회자"}로 변경되었습니다.`,
        member: {
          ...memberToUpdate,
          role: role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // 농장 멤버 역할 변경 실패 로그 기록
    await createSystemLog(
      "MEMBER_UPDATE_FAILED",
      LOG_MESSAGES.MEMBER_UPDATE_FAILED(
        params.memberId,
        params.farmId,
        errorMessage
      ),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "member",
      params.memberId,
      {
        action_type: "farm_event",
        event: "member_update_failed",
        farm_id: params.farmId,
        member_id: params.memberId,
        error_message: errorMessage,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "update_member_role",
      memberId: params.memberId,
      farmId: params.farmId,
      userId: user?.id,
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}

// DELETE - 농장 멤버 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: { farmId: string; memberId: string } }
) {
  let user = null;

  try {
    // 인증 확인
    const authResult = await requireAuth(false);
    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    user = authResult.user;

    // 농장 소유권 또는 관리자 권한 확인
    let farm;
    try {
      farm = await prisma.farms.findUnique({
        where: { id: params.farmId },
        select: { owner_id: true, farm_name: true },
      });
    } catch (farmError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "farm",
        },
        farmError
      );
    }

    if (!farm) {
      throwBusinessError("FARM_NOT_FOUND", {
        operation: "delete_member_farm_check",
        farmId: params.farmId,
      });
    }

    // 시스템 관리자가 아닌 경우에만 농장별 권한 확인
    if (!authResult.isAdmin && farm.owner_id !== user.id) {
      let memberRole;
      try {
        memberRole = await prisma.farm_members.findFirst({
          where: {
            farm_id: params.farmId,
            user_id: user.id,
          },
          select: { role: true },
        });
      } catch (memberError) {
        throwBusinessError(
          "GENERAL_QUERY_FAILED",
          {
            resourceType: "member",
          },
          memberError
        );
      }

      if (!memberRole || memberRole.role !== "manager") {
        throwBusinessError("INSUFFICIENT_PERMISSIONS", {
          operation: "delete_member",
          farmId: params.farmId,
          userId: user.id,
        });
      }
    }

    // 삭제할 멤버 정보 조회
    let memberToRemove;
    try {
      memberToRemove = await prisma.farm_members.findUnique({
        where: { id: params.memberId },
        include: {
          profiles: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (memberError) {
      throwBusinessError(
        "GENERAL_QUERY_FAILED",
        {
          resourceType: "member",
        },
        memberError
      );
    }

    if (!memberToRemove || memberToRemove.farm_id !== params.farmId) {
      throwBusinessError("MEMBER_NOT_FOUND", {
        operation: "delete_member_check",
        memberId: params.memberId,
        farmId: params.farmId,
      });
    }

    // 농장 소유자는 제거할 수 없음
    if (memberToRemove.user_id === farm.owner_id) {
      throwBusinessError("CANNOT_REMOVE_OWNER", {
        operation: "delete_member",
        memberId: params.memberId,
        farmId: params.farmId,
      });
    }

    // 멤버 삭제 + 알림 트랜잭션 처리
    try {
      await prisma.$transaction(async (tx: any) => {
        await tx.farm_members.delete({
          where: { id: params.memberId },
        });
        const members = await tx.farm_members.findMany({
          where: { farm_id: params.farmId },
          select: { user_id: true },
        });
        await tx.notifications.createMany({
          data: members.map((m: any) => ({
            user_id: m.user_id,
            type: "member_deleted",
            title: `멤버 정보 삭제`,
            message: `${farm.farm_name} 농장 멤버 ${
              (memberToRemove.profiles as any)?.name || ""
            }이(가) 제거되었습니다.`,
            data: {
              farm_id: params.farmId,
              farm_name: farm.farm_name,
              member_id: params.memberId,
              member_role: memberToRemove.role,
            },
            link: `/admin/farms/${params.farmId}/members`,
          })),
        });
      });
    } catch (deleteError) {
      throwBusinessError(
        "GENERAL_TRANSACTION_FAILED",
        {
          resourceType: "member",
          operationType: "delete",
        },
        deleteError
      );
    }
    // 농장 멤버 제거 로그 기록
    await createSystemLog(
      "MEMBER_DELETED",
      LOG_MESSAGES.MEMBER_DELETED(
        (memberToRemove.profiles as any)?.name || "",
        (memberToRemove.profiles as any)?.email || "",
        memberToRemove.role,
        farm.farm_name
      ),
      "info",
      { id: user.id, email: user.email || "" },
      "member",
      params.memberId,
      {
        action_type: "farm_event",
        event: "member_deleted",
        member_id: params.memberId,
        member_email: (memberToRemove.profiles as any)?.email || "",
        farm_id: params.farmId,
        farm_name: farm.farm_name,
        member_role: memberToRemove.role,
      },
      request
    );

    return NextResponse.json(
      {
        success: true,
        message: `${(memberToRemove.profiles as any)?.name || "구성원"}이(가) ${
          memberToRemove.role === "manager" ? "관리자" : "조회자"
        } 역할에서 제거되었습니다.`,
        removedMember: memberToRemove,
      },
      { status: 200 }
    );
  } catch (error) {
    // 농장 멤버 제거 실패 로그 기록
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createSystemLog(
      "MEMBER_DELETE_FAILED",
      LOG_MESSAGES.MEMBER_DELETE_FAILED(
        params.memberId,
        params.farmId,
        errorMessage
      ),
      "error",
      user?.id ? { id: user.id, email: user.email || "" } : undefined,
      "member",
      params.memberId,
      {
        action_type: "farm_event",
        event: "member_delete_failed",
        farm_id: params.farmId,
        member_id: params.memberId,
        error_message: errorMessage,
      },
      request
    );

    // 비즈니스 에러 또는 시스템 에러를 표준화된 에러 코드로 매핑
    const result = getErrorResultFromRawError(error, {
      operation: "delete_member",
      memberId: params.memberId,
      farmId: params.farmId,
      userId: user?.id,
    });

    return NextResponse.json(makeErrorResponseFromResult(result), {
      status: result.status,
    });
  }
}
