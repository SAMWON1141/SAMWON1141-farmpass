import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/common/logo";
import { LABELS, PAGE_HEADER } from "@/lib/constants/visitor";

interface FormHeaderProps {
  title?: string;
  description?: string;
  logoUrl?: string;
}

export const FormHeader = ({
  title = PAGE_HEADER.FORM_HEADER_DEFAULT_TITLE,
  description = PAGE_HEADER.FORM_HEADER_DEFAULT_DESCRIPTION,
  logoUrl = "/logo1.svg",
}: FormHeaderProps) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <Card className="mb-2 shadow-lg rounded-lg sm:rounded-2xl border border-gray-100 bg-white/95 max-w-lg mx-auto">
      <CardHeader className="pb-1 sm:pb-3 border-b border-gray-100 px-3 sm:px-6 pt-2 sm:pt-6">
        <CardTitle className="text-base sm:text-2xl text-center font-bold tracking-tight text-gray-900">
          {title}
        </CardTitle>
        <div className="flex flex-col items-center py-1.5">
          {!logoError ? (
            <img
              src={logoUrl}
              alt={LABELS.FORM_HEADER_COMPANY_LOGO_ALT}
              className="w-[60%] sm:w-80 h-auto max-w-[140px] sm:max-w-md mb-1.5 drop-shadow"
              style={{ objectFit: "contain" }}
              onError={() => setLogoError(true)}
              fetchPriority="high"
              loading="eager"
            />
          ) : (
            <Logo size="xl" className="mb-1.5 text-blue-500" />
          )}
        </div>
        <CardDescription className="text-center text-xs sm:text-base text-gray-600 px-2">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
