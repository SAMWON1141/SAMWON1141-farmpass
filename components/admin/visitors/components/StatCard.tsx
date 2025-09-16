import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconBg: string;
  description: string;
  trend: string;
  suffix?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  textColor,
  iconBg,
  description,
  trend,
  suffix = "",
}: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border ${borderColor} dark:border-slate-600 ${bgColor} dark:bg-slate-800 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
      />
      <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 dark:from-slate-400/20 dark:to-slate-600/5 opacity-30" />

      <CardContent className="p-3 sm:p-4 md:p-5 min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between h-full">
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 min-w-0 flex-1">
            <div
              className={`p-2 sm:p-2.5 md:p-3 rounded-lg ${iconBg} shadow-sm group-hover:shadow-md transition-shadow duration-200 flex-shrink-0`}
            >
              <Icon
                className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${textColor}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm sm:text-base md:text-lg font-medium ${textColor} dark:text-slate-100 truncate mb-1`}
              >
                {title}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground dark:text-slate-400 hidden lg:block">
                {description}
              </p>
            </div>
          </div>
          <div className="text-right md:text-right md:flex-shrink-0 md:ml-2 mt-2 md:mt-0">
            <div
              className={`text-lg sm:text-2xl md:text-3xl lg:text-3xl font-bold ${textColor} dark:text-slate-100 leading-none whitespace-nowrap`}
            >
              {value.toLocaleString()}
              {suffix}
            </div>
            <Badge
              variant="secondary"
              className={`${bgColor} dark:bg-slate-800 ${textColor} dark:text-slate-300 border-none text-xs sm:text-sm font-medium px-2 py-1 mt-2 hidden lg:inline-flex`}
            >
              {trend}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-4 lg:hidden">
          <span className="text-xs sm:text-sm md:text-base text-muted-foreground dark:text-slate-400">
            {description}
          </span>
          <Badge
            variant="secondary"
            className={`${bgColor} dark:bg-slate-800 ${textColor} dark:text-slate-300 border-none text-xs sm:text-sm font-medium px-2 py-1`}
          >
            {trend}
          </Badge>
        </div>
      </CardContent>

      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${color} opacity-60`}
      />
    </Card>
  );
}
