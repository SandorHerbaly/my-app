import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, startOfMonth, isBefore, isAfter, parse, endOfMonth, isSameMonth } from "date-fns";
import { hu } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntervalCalendarProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearch: () => void;
  isSearchButtonVisible: boolean;
  isLoading: boolean;
}

const IntervalCalendar: React.FC<IntervalCalendarProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  isSearchButtonVisible,
  isLoading
}) => {
  const today = new Date();
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [startCalendarDate, setStartCalendarDate] = useState<Date>(startDate || today);
  const [endCalendarDate, setEndCalendarDate] = useState<Date>(endDate || (startDate ? startDate : today));
  const selectContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startDate) {
      setStartCalendarDate(startDate);
      setEndCalendarDate(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) setEndCalendarDate(endDate);
  }, [endDate]);

  const getLastTwelveMonths = (isStartDate: boolean) => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      if (isBefore(date, today) || isSameMonth(date, today)) {
        const monthEnd = endOfMonth(date);
        const isDisabled = isStartDate
          ? false  // Kezdő dátumnál nincs korlátozás
          : (startDate && isBefore(monthEnd, startDate));
        months.push({
          value: format(date, 'yyyy-MM'),
          label: format(date, 'yyyy. MMMM', { locale: hu }),
          disabled: isDisabled,
          isCurrent: isSameMonth(date, today)
        });
      }
    }
    return months;
  };

  const handleQuickMonthSelect = (value: string, isStart: boolean) => {
    const selectedDate = startOfMonth(new Date(value));
    if (isStart) {
      setStartCalendarDate(selectedDate);
    } else {
      setEndCalendarDate(selectedDate);
    }
  };

  const scrollToTop = () => {
    if (selectContentRef.current) {
      selectContentRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [isStartDateOpen, isEndDateOpen]);

  const renderSelect = (isStart: boolean) => (
    <Select onValueChange={(value) => handleQuickMonthSelect(value, isStart)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Év, hónap választás" />
      </SelectTrigger>
      <SelectContent ref={selectContentRef} className="max-h-[200px] overflow-y-auto">
        {getLastTwelveMonths(isStart).map((month, index) => (
          <SelectItem 
            key={month.value} 
            value={month.value} 
            disabled={month.disabled}
            className={cn(
              month.isCurrent && "font-semibold",
              "py-2.5"
            )}
          >
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex space-x-4">
      {/* Kezdő dátum választó */}
      <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "yyyy. MMMM d.", { locale: hu }) : <span>Válassz kezdő dátumot</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {renderSelect(true)}
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              if (date) {
                onStartDateChange(date);
                setEndCalendarDate(date);
                if (endDate && isBefore(endDate, date)) {
                  onEndDateChange(undefined);
                }
              }
              setIsStartDateOpen(false);
            }}
            initialFocus
            month={startCalendarDate}
            onMonthChange={setStartCalendarDate}
            disabled={(date) => isAfter(date, today)}
            fromMonth={subMonths(today, 11)}
            toMonth={today}
            locale={hu}
          />
        </PopoverContent>
      </Popover>

      {/* Vég dátum választó */}
      <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "yyyy. MMMM d.", { locale: hu }) : <span>Válassz vég dátumot</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {renderSelect(false)}
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              if (date) {
                onEndDateChange(date);
              }
              setIsEndDateOpen(false);
            }}
            initialFocus
            month={endCalendarDate}
            onMonthChange={setEndCalendarDate}
            disabled={(date) => 
              isAfter(date, today) || 
              (startDate ? isBefore(date, startDate) : false)
            }
            fromMonth={startDate || subMonths(today, 11)}
            toMonth={today}
            locale={hu}
          />
        </PopoverContent>
      </Popover>

      {/* Keresés gomb */}
      <Button 
        onClick={onSearch} 
        disabled={!isSearchButtonVisible || isLoading}
      >
        {isLoading ? 'Keresés...' : 'Keresés'}
      </Button>
    </div>
  );
};

export default IntervalCalendar;