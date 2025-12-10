"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, ChevronsLeft, ChevronsRight } from "lucide-react"

type DateNavigationProps = {
  startDate: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  isMobileView?: boolean
}

export function DateNavigation({ startDate, onPreviousWeek, onNextWeek, onToday, isMobileView = false }: DateNavigationProps) {
  const formatWeekRange = (date: Date) => {
    const endDate = new Date(date)
    if (isMobileView) {
      // En vista móvil: mostrar solo la fecha actual
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } else {
      // En vista desktop: mostrar rango de 2 semanas
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
  }

  return (
    <div className={`flex items-center ${isMobileView ? 'flex-col' : 'flex-row justify-between'} gap-4`}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousWeek}
          className="transition-all hover:scale-105 hover:bg-blue-500/10 bg-transparent"
          title={isMobileView ? "Día anterior" : "Semana anterior"}
        >
          {isMobileView ? <ChevronLeft className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          onClick={onToday}
          className="gap-2 transition-all hover:scale-105 hover:bg-blue-500/10 bg-transparent"
        >
          <Calendar className="h-4 w-4" />
          {isMobileView ? "Hoy" : "Ir a hoy"}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextWeek}
          className="transition-all hover:scale-105 hover:bg-blue-500/10 bg-transparent"
          title={isMobileView ? "Día siguiente" : "Semana siguiente"}
        >
          {isMobileView ? <ChevronRight className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
        </Button>
      </div>

      <div className={`font-medium ${isMobileView ? 'text-base' : 'text-sm text-muted-foreground'}`}>
        {formatWeekRange(startDate)}
      </div>
    </div>
  )
}