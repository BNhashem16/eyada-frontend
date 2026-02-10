"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  showSearch?: boolean;
  maxHeight?: number;
  renderOption?: (
    option: SearchableSelectOption,
    isSelected: boolean,
  ) => React.ReactNode;
  /** When provided, search is delegated to the server (client-side filtering is disabled) */
  onSearchChange?: (search: string) => void;
  /** Whether there are more pages to load (shows load-more at bottom) */
  hasMore?: boolean;
  /** Called when user scrolls to the bottom of the list */
  onLoadMore?: () => void;
  /** Loading state for server-side search results */
  serverLoading?: boolean;
}

// Highlight matching text in search results
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  className,
  disabled = false,
  loading = false,
  clearable = true,
  showSearch = true,
  maxHeight = 280,
  renderOption,
  onSearchChange,
  hasMore,
  onLoadMore,
  serverLoading,
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("common.select");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.searchDots");
  const resolvedEmptyMessage = emptyMessage ?? t("common.noResultsFound");
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Debounced server-side search
  const handleSearchInput = React.useCallback(
    (value: string) => {
      setSearchQuery(value);
      setActiveIndex(-1);
      if (onSearchChange) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onSearchChange(value);
        }, 300);
      }
    },
    [onSearchChange],
  );

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Filter and group options (skip client-side filtering when server search is active)
  const filteredOptions = React.useMemo(() => {
    if (onSearchChange) return options; // server handles filtering
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label?.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query),
    );
  }, [options, searchQuery, onSearchChange]);

  // Infinite scroll: detect scroll to bottom
  const handleScroll = React.useCallback(() => {
    if (!hasMore || !onLoadMore || serverLoading) return;
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, serverLoading]);

  // Group options by group field
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SearchableSelectOption[]> = {};
    const ungrouped: SearchableSelectOption[] = [];

    filteredOptions.forEach((option) => {
      if (option.group) {
        if (!groups[option.group]) groups[option.group] = [];
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });

    return { groups, ungrouped };
  }, [filteredOptions]);

  const hasGroups = Object.keys(groupedOptions.groups).length > 0;

  // Focus input when popover opens
  React.useEffect(() => {
    if (open && showSearch) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    if (!open) {
      setSearchQuery("");
      setActiveIndex(-1);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (onSearchChange) onSearchChange("");
    }
  }, [open, showSearch, onSearchChange]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredOptions[activeIndex]) {
          const option = filteredOptions[activeIndex];
          if (!option.disabled) {
            onValueChange(option.value);
            setOpen(false);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`,
      );
      activeItem?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("");
  };

  const renderOptionItem = (option: SearchableSelectOption, index: number) => {
    const isSelected = value === option.value;
    const isActive = activeIndex === index;

    if (renderOption) {
      return (
        <button
          key={option.value}
          data-index={index}
          onClick={() => !option.disabled && handleSelect(option.value)}
          disabled={option.disabled}
          className={cn(
            "w-full text-start",
            option.disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {renderOption(option, isSelected)}
        </button>
      );
    }

    return (
      <button
        key={option.value}
        data-index={index}
        onClick={() => !option.disabled && handleSelect(option.value)}
        disabled={option.disabled}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center gap-3 rounded-lg py-2.5 px-3 text-sm outline-none transition-all duration-150",
          "hover:bg-primary-50 dark:hover:bg-primary-900/30",
          "focus:bg-primary-50 dark:focus:bg-primary-900/30",
          isSelected && "bg-primary-100 dark:bg-primary-900/50",
          isActive &&
            "bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-500/20",
          option.disabled &&
            "opacity-50 cursor-not-allowed hover:bg-transparent",
        )}
      >
        {/* Icon */}
        {option.icon && (
          <span className="flex-shrink-0 text-muted-foreground">
            {option.icon}
          </span>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "block truncate font-medium",
              isSelected && "text-primary-700 dark:text-primary-200",
            )}
          >
            <HighlightText text={option.label} query={searchQuery} />
          </span>
          {option.description && (
            <span className="block truncate text-xs text-muted-foreground mt-0.5">
              <HighlightText text={option.description} query={searchQuery} />
            </span>
          )}
        </div>

        {/* Check icon */}
        <Check
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-all duration-200",
            isSelected
              ? "opacity-100 scale-100 text-primary-600 dark:text-primary-400"
              : "opacity-0 scale-75",
          )}
        />
      </button>
    );
  };

  let flatIndex = 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            "w-full justify-between font-normal h-10 px-3",
            "border-border hover:border-primary-300 dark:hover:border-primary-700",
            "transition-all duration-200",
            !value && "text-muted-foreground",
            open && "ring-2 ring-primary-500/20 border-primary-500",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("common.loadingDots")}</span>
              </>
            ) : selectedOption ? (
              <>
                {selectedOption.icon && (
                  <span className="flex-shrink-0">{selectedOption.icon}</span>
                )}
                <span className="truncate">{selectedOption.label}</span>
              </>
            ) : (
              resolvedPlaceholder
            )}
          </span>

          <div className="flex items-center gap-1">
            {/* Clear button */}
            {clearable && value && !loading && (
              <span
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </span>
            )}

            {/* Chevron */}
            <ChevronsUpDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-lg border-border"
        align="start"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        {showSearch && (
          <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              ref={inputRef}
              placeholder={resolvedSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              inputMode="search"
              className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm placeholder:text-muted-foreground"
            />
            {serverLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
            )}
            {searchQuery && (
              <button
                onClick={() => handleSearchInput("")}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {showSearch && searchQuery && (
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border bg-muted/20">
            {filteredOptions.length === 0
              ? resolvedEmptyMessage
              : t("common.resultsCount", { count: filteredOptions.length })}
          </div>
        )}

        {/* Options List */}
        <div
          ref={listRef}
          className="overflow-y-auto p-1.5"
          style={{ maxHeight }}
          onScroll={handleScroll}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-8 text-center">
              <Search className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                {resolvedEmptyMessage}
              </p>
              {searchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("common.tryDifferentSearch")}
                </p>
              )}
            </div>
          ) : hasGroups ? (
            <>
              {/* Ungrouped options first */}
              {groupedOptions.ungrouped.map((option) => {
                const element = renderOptionItem(option, flatIndex);
                flatIndex++;
                return element;
              })}

              {/* Grouped options */}
              {Object.entries(groupedOptions.groups).map(
                ([groupName, groupOptions]) => (
                  <div key={groupName} className="mt-2 first:mt-0">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {groupName}
                    </div>
                    {groupOptions.map((option) => {
                      const element = renderOptionItem(option, flatIndex);
                      flatIndex++;
                      return element;
                    })}
                  </div>
                ),
              )}
            </>
          ) : (
            filteredOptions.map((option, index) =>
              renderOptionItem(option, index),
            )
          )}

          {/* Load more indicator */}
          {hasMore && (
            <div className="flex items-center justify-center py-2">
              {serverLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <button
                  onClick={onLoadMore}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t("common.loadMore")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {filteredOptions.length > 5 && (
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/20 flex items-center justify-between">
            <span>{t("common.useArrowsToNavigate")}</span>
            <Badge variant="secondary" className="text-[10px] h-5">
              {filteredOptions.length}
            </Badge>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
