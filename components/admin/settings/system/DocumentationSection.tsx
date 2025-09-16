"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Zap,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { BUTTONS, LABELS, PAGE_HEADER } from "@/lib/constants/settings";
import SettingsCardHeader from "../SettingsCardHeader";

export function DocumentationSection() {
  const documentationLinks = [
    {
      title: LABELS.DOCUMENTATION_USER_MANUAL,
      description: LABELS.DOCUMENTATION_USER_MANUAL_DESC,
      icon: BookOpen,
      href: "/docs/user-manual.html",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: LABELS.DOCUMENTATION_QUICK_START,
      description: LABELS.DOCUMENTATION_QUICK_START_DESC,
      icon: Zap,
      href: "/docs/quick-start.html",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: LABELS.DOCUMENTATION_PRODUCT_OVERVIEW,
      description: LABELS.DOCUMENTATION_PRODUCT_OVERVIEW_DESC,
      icon: FileText,
      href: "/docs/product-overview.html",
      color: "text-green-700 dark:text-green-200",
      bgColor: "bg-green-50",
    },
    {
      title: LABELS.DOCUMENTATION_FAQ,
      description: LABELS.DOCUMENTATION_FAQ_DESC,
      icon: HelpCircle,
      href: "/docs/faq.html",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: LABELS.DOCUMENTATION_PWA_GUIDE,
      description: LABELS.DOCUMENTATION_PWA_GUIDE_DESC,
      icon: Smartphone,
      href: "/docs/pwa-guide.html",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const handleDocumentClick = (href: string) => {
    // 새 탭에서 문서 열기
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <SettingsCardHeader
          icon={BookOpen}
          title={PAGE_HEADER.DOCUMENTATION_SECTION_TITLE}
          description={PAGE_HEADER.DOCUMENTATION_SECTION_DESC}
        />
        <CardContent className="space-y-4">
          {/* 이하 기존 CardContent 내용 유지 */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(documentationLinks || []).map((doc) => (
              <motion.div
                key={doc.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <Card className="cursor-pointer border-2 border-transparent hover:border-gray-200 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${doc.bgColor}`}>
                        <doc.icon className={`h-5 w-5 ${doc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1 group-hover:text-blue-600 transition-colors">
                          {doc.title}
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm sm:text-base"
                          onClick={() => handleDocumentClick(doc.href)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {BUTTONS.DOCUMENTATION_OPEN_BUTTON}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
