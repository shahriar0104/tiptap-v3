"use client";
import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  isSameMonth,
  getYear,
  setYear,
  setMonth
} from "date-fns";

interface DatePickerProps {
  selected?: Date | null;
  onSelect: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({ selected, onSelect, placeholder = "Select date", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearSelect(false);
        setShowMonthSelect(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateClick = (date: Date) => {
    onSelect(date);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    onSelect(today);
    setCurrentMonth(today);
    setIsOpen(false);
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
    setShowYearSelect(false);
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, monthIndex));
    setShowMonthSelect(false);
  };

  const generateYears = () => {
    const currentYear = getYear(new Date());
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelectedDay = selected && isSameDay(day, selected);
        const isTodayDay = isToday(day);

        days.push(
          <button
            key={day.toString()}
            type="button"
            onClick={() => handleDateClick(cloneDay)}
            className={`
              w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-all duration-200
              ${!isCurrentMonth
              ? 'text-gray-300 dark:text-gray-600'
              : isSelectedDay
                ? 'bg-blue-600 text-white font-semibold'
                : isTodayDay
                  ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/30 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
            `}
          >
            {format(day, dateFormat)}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full px-4 py-3 pr-12 text-left rounded-lg border border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
        "
      >
        {selected ? format(selected, 'MMMM d, yyyy') : placeholder}
      </button>

      {/* Calendar Icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <div className="p-4">
            {/* Header with Month/Year Selectors */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {/* Month Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMonthSelect(!showMonthSelect)}
                    className="px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    {format(currentMonth, 'MMM')}
                  </button>

                  {showMonthSelect && (
                    <div className="absolute top-full left-0 mt-1 w-32 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      {months.map((month, index) => (
                        <button
                          key={month}
                          type="button"
                          onClick={() => handleMonthChange(index)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowYearSelect(!showYearSelect)}
                    className="px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    {format(currentMonth, 'yyyy')}
                  </button>

                  {showYearSelect && (
                    <div className="absolute top-full left-0 mt-1 w-20 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      {generateYears().map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => handleYearChange(year)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1 mb-4">
              {renderCalendar()}
            </div>

            {/* Today Button - Bottom Right */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTodayClick}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors duration-200"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}