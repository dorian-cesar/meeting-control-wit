"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Video, Building2, Trash2, Users } from "lucide-react"
import type { Meeting } from "@/app/page"

type WeeklyCalendarProps = {
  meetings: Meeting[]
  onDeleteMeeting: (id: string) => void
  onMeetingClick: (meeting: Meeting) => void
  startDate: Date // Added startDate prop to control which weeks to display
  isMobileView: boolean
}

const LOCATION_CONFIG = {
  "sala-wit": {
    label: "Sala Wit",
    icon: Building2,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  virtual: {
    label: "Virtual",
    icon: Video,
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  presencial: {
    label: "Presencial",
    icon: MapPin,
    color: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  },
}

export function WeeklyCalendar({ meetings, onDeleteMeeting, onMeetingClick, startDate, isMobileView }: WeeklyCalendarProps) {
  const weekDays = useMemo(() => {
    if (isMobileView) {
      // En vista móvil: mostrar solo el día actual
      return [new Date(startDate)]
    }

    const days: Date[] = []
    const currentDate = new Date(startDate)

    while (days.length < 10) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }, [startDate, isMobileView])

  const getMeetingsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return meetings.filter((m) => m.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const formatDate = (date: Date, includeYear: boolean = false) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: includeYear ? "numeric" : undefined,
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:grid-rows-2'} gap-3 ${isMobileView ? 'h-full' : 'mt-6 h-[calc(100vh-20rem)]'}`}>
      {weekDays.map((day, index) => {
        const dayMeetings = getMeetingsForDay(day)
        const isCurrentDay = isToday(day)

        return (
          <Card
            key={index}
            className={`p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${isCurrentDay ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20" : ""
              } flex flex-col h-full min-h-0`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${isMobileView ? 'text-xl' : 'text-lg'} ${isCurrentDay ? "text-blue-400" : "text-foreground"}`}>
                  {formatDate(day, isMobileView)}
                </h3>
                {isMobileView && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {day.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long"
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCurrentDay && (
                  <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Hoy
                  </Badge>
                )}
                {isMobileView && dayMeetings.length > 0 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {dayMeetings.length} {dayMeetings.length === 1 ? 'reunión' : 'reuniones'}
                  </Badge>
                )}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent`}>
              {dayMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">Sin reuniones programadas</p>
                  {isMobileView && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Este día no tiene reuniones agendadas
                    </p>
                  )}
                </div>
              ) : (
                dayMeetings.map((meeting) => {
                  const locationConfig = LOCATION_CONFIG[meeting.location]
                  const Icon = locationConfig.icon

                  return (
                    <div
                      key={meeting.id}
                      onClick={() => onMeetingClick(meeting)}
                      className={`p-3 rounded-lg border ${locationConfig.color} group relative transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs font-medium truncate">{locationConfig.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium bg-black/10 px-2 py-1 rounded">
                            {meeting.startTime} - {meeting.endTime}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteMeeting(meeting.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{meeting.title}</h4>

                      <p className="text-xs text-muted-foreground mb-2">{meeting.client}</p>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium">Ejecutivo:</span>
                          <span>{meeting.executive}</span>
                        </div>

                        {meeting.collaborator && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>Colaborador: {meeting.collaborator}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}