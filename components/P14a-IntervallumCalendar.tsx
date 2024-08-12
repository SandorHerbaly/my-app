import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isAfter, isBefore, endOfMonth } from "date-fns";

interface IntervalCalendarProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearch: () => void; // Új prop a keresés gombhoz
  isSearchButtonVisible: boolean; // Új prop a gomb állapotának kezeléséhez
}

const IntervalCalendar: React.FC<IntervalCalendarProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  isSearchButtonVisible,
}) => {
  const now = new Date();

  return (
    <div className="flex space-x-4 items-end">
      {/* Kezdő dátum kiválasztása */}
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, "yyyy. MMMM dd.")
              ) : (
                <span>Kezdő dátum</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              disabled={(date) => 
                isAfter(date, now) || (endDate && isAfter(date, endDate))
              }
              toDate={endOfMonth(now)}
              defaultMonth={endDate || now}  // Ha van végdátum, azt használjuk alapértelmezett hónapnak
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Végdátum kiválasztása */}
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-[200px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                format(endDate, "yyyy. MMMM dd.")
              ) : (
                <span>Vég dátum</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              disabled={(date) => 
                isAfter(date, now) || (startDate && isBefore(date, startDate))
              }
              toDate={endOfMonth(now)}
              defaultMonth={startDate || now}  // Ha van kezdő dátum, azt használjuk alapértelmezett hónapnak
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Keresés gomb */}
      <Button 
        className="ml-4 mt-0" // Az mt-0 biztosítja, hogy a gomb ne legyen eltolva vertikálisan
        onClick={onSearch} 
        disabled={!isSearchButtonVisible} // Passzív, amíg nincs mindkét dátum megadva
      >
        Számlák keresése
      </Button>
    </div>
  );
};

export default IntervalCalendar;
