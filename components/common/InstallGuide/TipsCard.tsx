import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { PlatformGuide } from "./data";
import { LABELS } from "@/lib/constants/common";

interface TipsCardProps {
  currentGuide: PlatformGuide;
}

export function TipsCard({ currentGuide }: TipsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {LABELS.INSTALL_GUIDE_TIPS_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {(currentGuide.tips || []).map((tip, index) => (
            <motion.li
              key={`tip-${index}-${tip.substring(0, 20)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
