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
  start_at: string
  end_at: string
}

export type User = {
  id: number
  email: string
  name: string
  role: 'user' | 'salaWit'
  createdAt: string
  updatedAt: string
}

const parseMeetingFromBackend = (meetingData: any): Meeting => {
  const startDate = new Date(meetingData.start_at)
  const endDate = new Date(meetingData.end_at)

  return {
    ...meetingData,
    id: meetingData.id.toString(),
    date: startDate.toISOString().split('T')[0], // YYYY-MM-DD
    startTime: startDate.toTimeString().slice(0, 5), // HH:MM
    endTime: endDate.toTimeString().slice(0, 5), // HH:MM
  }
}

const prepareMeetingForBackend = (meeting: Omit<Meeting, "id">): any => {
  const startDateTime = new Date(`${meeting.date}T${meeting.startTime}:00`)
  const endDateTime = new Date(`${meeting.date}T${meeting.endTime}:00`)

  return {
    title: meeting.title,
    client: meeting.client,
    executive: meeting.executive,
    collaborator: meeting.collaborator,
    location: meeting.location,
    start_at: startDateTime.toISOString(),
    end_at: endDateTime.toISOString(),
  }
}


export default function MeetingControlPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState("")

  const [executives, setExecutives] = useState<string[]>([])
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
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setIsAuthenticated(false)
        setIsCheckingAuth(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error("Token inválido")
        }

        const data = await res.json()
        setCurrentUser(data.user)
        setIsAuthenticated(true)
      } catch (err) {
        console.error("Error al verificar autenticación:", err)
        localStorage.removeItem("token")
        localStorage.removeItem("currentUser")
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])


  useEffect(() => {
    if (isAuthenticated) {
      fetchMeetings()
      fetchUsers()
    }
  }, [isAuthenticated])

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/meetings`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Error obteniendo reuniones")
      }

      const data = await res.json()
      // Convertir meetings del backend al formato del frontend
      const formattedMeetings = data.results.map(parseMeetingFromBackend)
      setMeetings(formattedMeetings)
    } catch (err) {
      console.error("Error obteniendo reuniones:", err)
      setError("Error al cargar las reuniones")
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Error obteniendo usuarios")
      }

      const users = await res.json()
      // Extraer los nombres de los usuarios para usarlos como ejecutivos
      const executiveNames = users.map((user: any) => user.name)
      setExecutives(executiveNames)
    } catch (err) {
      console.error("Error obteniendo usuarios:", err)
      // Si falla, usa los ejecutivos de las reuniones como fallback
      const executiveNames = Array.from(new Set(meetings.map((m) => m.executive)))
      setExecutives(executiveNames)
    }
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
    setError("")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    setError("")
  }

  const handleAddMeeting = async (meeting: Omit<Meeting, "id">) => {
    try {
      const token = localStorage.getItem("token")
      const meetingData = prepareMeetingForBackend(meeting)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(meetingData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.error === 'time_conflict') {
          setError(`Conflicto de horario: ${errorData.message}`)
        } else {
          throw new Error("Error creando reunión")
        }
        return
      }

      const newMeeting = await res.json()
      const formattedMeeting = parseMeetingFromBackend(newMeeting)
      setMeetings(prev => [...prev, formattedMeeting])
      setIsDialogOpen(false)
      setError("")
    } catch (err: any) {
      console.error("Error al crear reunión:", err)
      setError(err.message || "Error al crear la reunión")
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/meetings/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error("Error eliminando reunión")
      }

      setMeetings(prev => prev.filter(m => m.id !== id))
    } catch (err: any) {
      console.error("Error al eliminar reunión:", err)
      setError(err.message || "Error al eliminar la reunión")
    }
  }


  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setIsDetailDialogOpen(true)
  }

  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    try {
      const token = localStorage.getItem("token")
      const meetingData = prepareMeetingForBackend(updatedMeeting)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/meetings/${updatedMeeting.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(meetingData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.error === 'time_conflict') {
          setError(`Conflicto de horario: ${errorData.message}`)
        } else {
          throw new Error("Error actualizando reunión")
        }
        return
      }

      const meetingResponse = await res.json()
      const formattedMeeting = parseMeetingFromBackend(meetingResponse)
      setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? formattedMeeting : m))
      setError("")
    } catch (err: any) {
      console.error("Error al actualizar reunión:", err)
      setError(err.message || "Error al actualizar la reunión")
    }
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
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
            {error}
          </div>
        )}

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