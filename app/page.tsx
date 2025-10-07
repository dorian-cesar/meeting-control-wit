"use client"

import { useState, useEffect } from "react"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { AddMeetingDialog } from "@/components/add-meeting-dialog"
import { MeetingDetailDialog } from "@/components/meeting-detail-dialog"
import { MeetingFilters } from "@/components/meeting-filters"
import { DateNavigation } from "@/components/date-navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"

export type Meeting = {
  id: string
  title: string
  client: string
  executive: string
  collaborator?: string
  location: "sala-wit" | "virtual" | "presencial"
  date: string
  startTime: string
  endTime: string
}

const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: "1",
    title: "Presentación Proyecto Q1",
    client: "Empresa ABC",
    executive: "Carlos Mendoza",
    collaborator: "María González",
    location: "sala-wit",
    date: "2025-01-13",
    startTime: "09:00",
    endTime: "10:30",
  },
  {
    id: "2",
    title: "Revisión Estratégica",
    client: "Tech Solutions",
    executive: "María González",
    location: "virtual",
    date: "2025-01-13",
    startTime: "11:00",
    endTime: "12:00",
  },
  {
    id: "3",
    title: "Reunión con Cliente",
    client: "Global Corp",
    executive: "Juan Pérez",
    collaborator: "Ana Silva",
    location: "presencial",
    date: "2025-01-14",
    startTime: "14:00",
    endTime: "15:30",
  },
  {
    id: "4",
    title: "Planning Mensual",
    client: "Interno",
    executive: "Ana Silva",
    location: "sala-wit",
    date: "2025-01-14",
    startTime: "10:00",
    endTime: "11:30",
  },
  {
    id: "5",
    title: "Demo Producto",
    client: "StartUp XYZ",
    executive: "Carlos Mendoza",
    collaborator: "Juan Pérez",
    location: "virtual",
    date: "2025-01-15",
    startTime: "15:00",
    endTime: "16:00",
  },
]

export default function MeetingControlPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username: string; name: string } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [selectedExecutive, setSelectedExecutive] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date>(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1))
    return monday
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setIsCheckingAuth(false)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("meetings")
    if (stored) {
      setMeetings(JSON.parse(stored))
    } else {
      setMeetings(SAMPLE_MEETINGS)
      localStorage.setItem("meetings", JSON.stringify(SAMPLE_MEETINGS))
    }
  }, [])

  const handleLogin = (user: { username: string; name: string }) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
    localStorage.setItem("currentUser", JSON.stringify(user))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const handleAddMeeting = (meeting: Omit<Meeting, "id">) => {
    const newMeeting = {
      ...meeting,
      id: Date.now().toString(),
    }
    const updatedMeetings = [...meetings, newMeeting]
    setMeetings(updatedMeetings)
    localStorage.setItem("meetings", JSON.stringify(updatedMeetings))
    setIsDialogOpen(false)
  }

  const handleDeleteMeeting = (id: string) => {
    const updatedMeetings = meetings.filter((m) => m.id !== id)
    setMeetings(updatedMeetings)
    localStorage.setItem("meetings", JSON.stringify(updatedMeetings))
  }

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setIsDetailDialogOpen(true)
  }

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    const updatedMeetings = meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m))
    setMeetings(updatedMeetings)
    localStorage.setItem("meetings", JSON.stringify(updatedMeetings))
  }

  const filteredMeetings = meetings.filter((meeting) => {
    if (selectedExecutive !== "all" && meeting.executive !== selectedExecutive) {
      return false
    }
    if (selectedLocation !== "all" && meeting.location !== selectedLocation) {
      return false
    }
    return true
  })

  const executives = Array.from(new Set(meetings.map((m) => m.executive)))

  const handlePreviousWeek = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
  }

  const handleNextWeek = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
  }

  const handleToday = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1))
    setStartDate(monday)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Control de Reuniones</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sala Wit - Agenda Semanal
                {currentUser && <span className="ml-2">• {currentUser.name}</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="lg"
                className="gap-2 transition-all hover:scale-105 bg-transparent"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </Button>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 transition-all hover:scale-105">
                <Plus className="h-5 w-5" />
                Nueva Reunión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <MeetingFilters
          executives={executives}
          selectedExecutive={selectedExecutive}
          selectedLocation={selectedLocation}
          onExecutiveChange={setSelectedExecutive}
          onLocationChange={setSelectedLocation}
        />

        <div className="mt-4">
          <DateNavigation
            startDate={startDate}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            onToday={handleToday}
          />
        </div>

        <WeeklyCalendar
          meetings={filteredMeetings}
          onDeleteMeeting={handleDeleteMeeting}
          onMeetingClick={handleMeetingClick}
          startDate={startDate}
        />
      </div>

      <AddMeetingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddMeeting={handleAddMeeting}
        executives={executives}
      />

      <MeetingDetailDialog
        meeting={selectedMeeting}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onUpdateMeeting={handleUpdateMeeting}
        executives={executives}
      />
    </div>
  )
}
