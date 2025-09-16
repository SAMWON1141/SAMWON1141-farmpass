import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { ReactNode } from "react";

interface CommonSelect {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}

interface CommonFiltersProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selects?: CommonSelect[];
  extra?: ReactNode;
}

export function CommonFilters({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  selects = [],
  extra,
}: CommonFiltersProps) {
  return (
    <div className="w-full">
      {/* 데스크톱: 한 줄에 모든 요소 배치, 모바일: extra만 다음 줄 */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4 w-full">
        <div className="relative flex-1 group">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 group-focus-within:text-blue-500 transition-colors duration-200" />
          <Input
            id="user-search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            className="pl-8 sm:pl-10"
          />
          {searchValue && (
            <button
              onClick={() =>
                onSearchChange({
                  target: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-7 p-0 rounded-full flex items-center justify-center"
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {(selects || []).map((select, idx) => (
          <Select
            key={idx}
            value={select.value}
            onValueChange={select.onChange}
          >
            <SelectTrigger
              className={
                select.className ||
                "sm:w-auto sm:min-w-[120px] lg:min-w-[140px] xl:min-w-[160px]"
              }
              aria-label={select.placeholder}
            >
              <SelectValue placeholder={select.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {(select.options || []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {/* 데스크톱에서만 한 줄에 표시 */}
        <div className="hidden sm:block">{extra}</div>
      </div>

      {/* 모바일에서만 extra를 다음 줄에 표시 */}
      {extra && (
        <div className="sm:hidden mt-3 w-full">
          {/* 모바일에서 extra 요소들이 가로 공간을 꽉 차도록 */}
          {extra}
        </div>
      )}
    </div>
  );
}
