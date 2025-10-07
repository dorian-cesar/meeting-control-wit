"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

type DateNavigationProps = {
  startDate: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export function DateNavigation({ startDate, onPreviousWeek, onNextWeek, onToday }: DateNavigationProps) {
  const formatWeekRange = (date: Date) => {
    const endDate = new Date(date)
    endDate.setDate(date.getDate() + 13) // 2 semanas = 14 días

    const startStr = date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    const endStr = endDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    return `${startStr} - ${endStr}`
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousWeek}
          className="transition-all hover:scale-105 hover:bg-blue-500/10 bg-transparent"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          onClick={onToday}
          className="gap-2 transition-all hover:scale-105 hover:bg-blue-500/10 bg-transparent"
        >
          <Calendar className="h-4 w-4" />
          Hoy
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextWeek}
          className="transition-all hover:scale-105 hover:bg-blue-500/10 bg-transparent"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="text-sm font-medium text-muted-foreground">{formatWeekRange(startDate)}</div>
    </div>
  )
}
