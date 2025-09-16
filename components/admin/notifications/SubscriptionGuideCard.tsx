import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { memo } from "react";
import { LABELS } from "@/lib/constants/notifications";

function SubscriptionGuideCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-muted-foreground">
              {LABELS.SUBSCRIPTION_REQUIRED}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {LABELS.SUBSCRIPTION_DESCRIPTION}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(SubscriptionGuideCard);
