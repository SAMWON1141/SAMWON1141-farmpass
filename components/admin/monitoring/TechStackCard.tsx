import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Database,
  Shield,
  Globe,
  Palette,
  Activity,
  BarChart3,
  Bell,
  Smartphone,
  Zap,
} from "lucide-react";
import { PAGE_HEADER } from "@/lib/constants/monitoring";
import type { TechStackData } from "@/lib/types/monitoring";

interface TechStackCardProps {
  data?: TechStackData;
}

export function TechStackCard({ data }: TechStackCardProps) {
  // 서버에서 받은 데이터 또는 기본값 사용
  const techStack = {
    framework: data?.framework || "Next.js 14.2.30",
    runtime: data?.runtime || "Node.js 22",
    react: data?.react || "React 18 + React DOM 18",
    typescript: data?.typescript || "TypeScript 5",
    database: data?.database || "Supabase + Prisma",
    authentication: data?.authentication || "Supabase Auth",
    deployment: data?.deployment || "Vercel",
    ui: data?.ui || "ShadCN UI + Tailwind CSS",
    state: data?.state || "React Query + Zustand",
    pwa: data?.pwa || "Serwist 9.2.0",
    pushNotifications: data?.pushNotifications || "Web Push 3.6.7",
    monitoring: data?.monitoring || "UptimeRobot",
    analytics: data?.analytics || "Google Analytics 4",
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "framework":
      case "runtime":
        return <Code className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "authentication":
        return <Shield className="h-4 w-4" />;
      case "deployment":
        return <Globe className="h-4 w-4" />;
      case "ui":
        return <Palette className="h-4 w-4" />;
      case "state":
        return <Activity className="h-4 w-4" />;
      case "pwa":
        return <Smartphone className="h-4 w-4" />;
      case "pushNotifications":
        return <Zap className="h-4 w-4" />;
      case "monitoring":
        return <BarChart3 className="h-4 w-4" />;
      case "analytics":
        return <Bell className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case "framework":
      case "runtime":
        return "default";
      case "database":
        return "secondary";
      case "authentication":
        return "destructive";
      case "deployment":
        return "outline";
      case "ui":
        return "default";
      case "state":
        return "secondary";
      case "pwa":
        return "default";
      case "pushNotifications":
        return "secondary";
      case "monitoring":
        return "outline";
      case "analytics":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Code className="h-5 w-5" />
          {PAGE_HEADER.TECH_STACK}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(techStack).map(([category, value]) => (
            <div
              key={category}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-shrink-0">{getIcon(category)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium capitalize">
                  {category.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {value}
                </div>
              </div>
              <Badge
                variant={getBadgeVariant(category)}
                className="flex-shrink-0"
              >
                {category}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
