"use client";

import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/error/error-boundary";
import { ERROR_CONFIGS } from "@/lib/constants/error";
import type { SystemSettings } from "@/lib/types/settings";
import {
  BrandingSection,
  LocalizationSection,
  DisplayFormatSection,
} from "../general";

interface GeneralTabProps {
  settings: SystemSettings;
  onUpdate: <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => void;
  isLoading: boolean;
}

export default function GeneralTab({
  settings,
  onUpdate,
  isLoading,
}: GeneralTabProps) {
  return (
    <ErrorBoundary
      title={ERROR_CONFIGS.LOADING.title}
      description={ERROR_CONFIGS.LOADING.description}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <BrandingSection
          settings={settings}
          onSettingChange={onUpdate}
          loading={isLoading}
        />

        <LocalizationSection
          settings={settings}
          onSettingChange={onUpdate}
          loading={isLoading}
        />

        <DisplayFormatSection
          settings={settings}
          onSettingChange={onUpdate}
          loading={isLoading}
        />
      </motion.div>
    </ErrorBoundary>
  );
}
