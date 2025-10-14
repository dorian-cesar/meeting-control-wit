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

export function WeeklyCalendar({ meetings, onDeleteMeeting, onMeetingClick, startDate }: WeeklyCalendarProps) {
  const weekDays = useMemo(() => {
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
  }, [startDate])

  const getMeetingsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return meetings.filter((m) => m.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 lg:grid-rows-2 gap-3 mt-6 h-[calc(100vh-20rem)]">
      {weekDays.map((day, index) => {
        const dayMeetings = getMeetingsForDay(day)
        const isCurrentDay = isToday(day)

        return (
          <Card
            key={index}
            className={`p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${
              isCurrentDay ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20" : ""
            } flex flex-col h-full min-h-0`}
          >
            <div className="flex">
              <h3 className={`font-semibold text-lg ${isCurrentDay ? "text-blue-400" : "text-foreground"}`}>
                {formatDate(day)}
              </h3>
              {isCurrentDay && (
                <Badge variant="default" className="ml-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Hoy
                </Badge>
              )}
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent">
              {dayMeetings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin reuniones</p>
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

                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{meeting.title}</h4>

                      <p className="text-xs text-muted-foreground mb-2">{meeting.client}</p>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{meeting.executive}</span>
                          <span className="text-muted-foreground">
                            {meeting.startTime} - {meeting.endTime}
                          </span>
                        </div>

                        {meeting.collaborator && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{meeting.collaborator}</span>
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
