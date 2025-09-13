import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { formatDateTime } from "@/lib/utils/datetime/date";
import { BUTTONS, LABELS } from "@/lib/constants/visitor";

interface SuccessCardProps {
  onGoHome?: () => void;
}

export const SuccessCard = ({ onGoHome }: SuccessCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-3 sm:px-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-lg rounded-lg sm:rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2 text-lg sm:text-xl">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            {LABELS.SUCCESS_CARD_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-base sm:text-lg font-semibold">
              {LABELS.SUCCESS_CARD_HEADER}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {LABELS.SUCCESS_CARD_NOTIFICATION}
            </p>

            {/* 회사 브랜딩 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
              <div className="text-center space-y-1.5 sm:space-y-2">
                <Logo className="justify-center" size="xl" />
                <p className="text-xs text-blue-600">
                  {LABELS.SUCCESS_CARD_POWERED_BY}{" "}
                  <span className="font-bold">
                    {LABELS.SUCCESS_CARD_SAMWON_KOREA}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="text-xs sm:text-sm">
            {LABELS.SUCCESS_CARD_REGISTRATION_TIME} {formatDateTime(new Date())}
          </Badge>

          {/* 완료 안내 */}
          <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {LABELS.SUCCESS_CARD_COMPLETION_GUIDE}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  window.open("http://www.swkukorea.com/", "_blank");
                }}
                className="w-full h-12 text-sm sm:text-base"
              >
                {BUTTONS.SUCCESS_CARD_VIEW_COMPANY}
              </Button>
              {onGoHome && (
                <Button
                  onClick={onGoHome}
                  variant="outline"
                  className="w-full h-12 text-sm sm:text-base"
                >
                  {BUTTONS.SUCCESS_CARD_GO_HOME}
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-3 sm:mt-4 space-y-1 text-center">
            <p>
              {LABELS.SUCCESS_CARD_SYSTEM_PROVIDER}{" "}
              <span className="font-semibold text-blue-600">
                {LABELS.SUCCESS_CARD_SAMWON_KOREA}
              </span>
              {LABELS.SUCCESS_CARD_PROVIDED_BY}
            </p>
            <p className="text-gray-500">{LABELS.SUCCESS_CARD_RECORD_SENT}</p>
            <p className="text-gray-500">
              {LABELS.SUCCESS_CARD_PRIVACY_DELETION}
            </p>
            <p className="text-gray-500">{LABELS.SUCCESS_CARD_CONTACT_GUIDE}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
