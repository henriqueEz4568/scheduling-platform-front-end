"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type CustomerOption = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
};

type CustomerSelectProps = {
  customers: CustomerOption[];
  value?: string | number | null;
  onChange: (customer: CustomerOption | null) => void;
  loading?: boolean;
};

const listHeightClasses = "min-h-[192px] max-h-[192px]";

export function CustomerSelect({
  customers,
  value,
  onChange,
  loading = false,
}: CustomerSelectProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);
  const normalizedValue = value != null ? String(value) : "";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      const haystack = `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [customers, debouncedSearch]);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => String(customer.id) === normalizedValue) ?? null;
  }, [customers, normalizedValue]);

  useEffect(() => {
    if (!filteredCustomers.length) {
      setFocusIndex(0);
      return;
    }

    const selectedIndex = filteredCustomers.findIndex(
      (customer) => String(customer.id) === normalizedValue
    );

    if (selectedIndex >= 0) {
      setFocusIndex(selectedIndex);
      return;
    }

    setFocusIndex((prev) => {
      if (prev >= filteredCustomers.length) {
        return filteredCustomers.length - 1;
      }
      return prev;
    });
  }, [filteredCustomers, normalizedValue]);

  const handleSelect = (customer: CustomerOption) => {
    onChange(customer);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!filteredCustomers.length) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        setFocusIndex((prev) => (prev + 1) % filteredCustomers.length);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        setFocusIndex((prev) =>
          prev - 1 < 0 ? filteredCustomers.length - 1 : prev - 1
        );
        break;
      }
      case "Home": {
        event.preventDefault();
        setFocusIndex(0);
        break;
      }
      case "End": {
        event.preventDefault();
        setFocusIndex(filteredCustomers.length - 1);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        const customer = filteredCustomers[focusIndex];
        if (customer) {
          handleSelect(customer);
        }
        break;
      }
      default:
        break;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join("");
  };

  const renderListContent = () => {
    if (loading) {
      return (
        <div className="space-y-2 py-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-[56px] w-full rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (!filteredCustomers.length) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
          <p className="text-sm font-medium">No customers found</p>
          <p className="text-xs">
            Try searching by name, email, or phone number.
          </p>
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-2 py-1">
        {filteredCustomers.map((customer, index) => {
          const isSelected = String(customer.id) === normalizedValue;
          const isFocused = index === focusIndex;

          return (
            <li key={customer.id}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                id={`customer-option-${customer.id}`}
                tabIndex={-1}
                onClick={() => handleSelect(customer)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md border border-transparent px-3 py-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isSelected
                    ? "border border-primary/50 bg-primary/5 shadow-sm"
                    : "hover:bg-muted/50",
                  isFocused ? "ring-2 ring-primary/40" : ""
                )}
              >
                <Avatar className="h-10 w-10 text-sm">
                  <AvatarFallback>
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight text-foreground truncate">
                    {customer.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.phone}
                  </p>
                </div>
                {isSelected && (
                  <span className="text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-4" aria-live="polite">
      <div className="space-y-2">
        <Label htmlFor="customer-search" className="sr-only">
          Search customers
        </Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="customer-search"
            placeholder="Search customers"
            aria-label="Search customers"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredCustomers.length}{" "}
            {filteredCustomers.length === 1 ? "customer" : "customers"}
          </span>
          {selectedCustomer && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onChange(null)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "rounded-lg border border-border/80 bg-card/80 px-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "transition-shadow overflow-y-auto thin-scrollbar",
          listHeightClasses
        )}
        role="listbox"
        tabIndex={0}
        aria-label="Customer list"
        aria-activedescendant={
          filteredCustomers[focusIndex]
            ? `customer-option-${filteredCustomers[focusIndex].id}`
            : undefined
        }
        onKeyDown={handleKeyDown}
      >
        {renderListContent()}
      </div>

      <p className="text-xs text-muted-foreground italic">
        Tip: search by name, email or phone.
      </p>
    </div>
  );
}
