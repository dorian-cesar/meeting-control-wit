"use client"

import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

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
  executive: string // display name used by calendar/list
  collaborator?: string
  location: "sala-wit" | "virtual" | "presencial"
  date: string
  startTime: string
  endTime: string
  start_at: string
  end_at: string

  // additional helpful fields parsed from backend:
  executive_id?: number
  collaborator_id?: number
  attendeesObjects?: { id: number; name: string; email: string }[] // resolved attendees for detail view
}

export type User = {
  id: number
  email: string
  name: string
  role: 'user' | 'salaWit'
  createdAt: string
  updatedAt: string
}

const ErrorToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  iconColor: '#ef4444',
  background: '#ffd4d1',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

const SuccessToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  iconColor: '#22c55e',
  background: '#d0f2c2',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

const parseMeetingFromBackend = (meetingData: any, usersById?: Map<number, User>): Meeting => {
  const startDate = new Date(meetingData.start_at)
  const endDate = new Date(meetingData.end_at)

  // executive name resolution - FIXED
  let executiveName = ""
  let executiveId: number | undefined = undefined
  if (meetingData.executive && typeof meetingData.executive === "object") {
    executiveName = meetingData.executive.name || ""
    executiveId = meetingData.executive.id
  } else if (meetingData.executive_id !== undefined) {
    executiveId = Number(meetingData.executive_id)
    const u = usersById?.get(executiveId)
    executiveName = u ? u.name : `Ejecutivo ${executiveId}`
  } else {
    executiveName = "Sin ejecutivo"
  }

  // collaborator resolution - FIXED
  let collaboratorName = ""
  let collaboratorId: number | undefined = undefined
  if (meetingData.collaborator && typeof meetingData.collaborator === "object") {
    collaboratorName = meetingData.collaborator.name || ""
    collaboratorId = meetingData.collaborator.id
  } else if (meetingData.collaborator_id !== undefined) {
    collaboratorId = Number(meetingData.collaborator_id)
    const u = usersById?.get(collaboratorId)
    collaboratorName = u ? u.name : `Colaborador ${collaboratorId}`
  }

  // attendees resolution
  let attendeesObjects: { id: number; name: string; email: string }[] = []
  if (Array.isArray(meetingData.attendees) && meetingData.attendees.length > 0) {
    if (typeof meetingData.attendees[0] === "object") {
      attendeesObjects = meetingData.attendees.map((a: any) => ({
        id: a.id,
        name: a.name,
        email: a.email
      }))
    } else {
      // array of ids -> try to resolve with usersById
      const ids = meetingData.attendees.map((x: any) => Number(x))
      attendeesObjects = ids.map((id: number) => {
        const u = usersById?.get(id)
        return u ? { id: u.id, name: u.name, email: u.email } : { id, name: `Usuario ${id}`, email: "" }
      })
    }
  }

  return {
    ...meetingData,
    id: meetingData.id.toString(),
    executive: executiveName,
    executive_id: executiveId,
    collaborator: collaboratorName || undefined,
    collaborator_id: collaboratorId,
    attendeesObjects,
    date: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),
    endTime: endDate.toTimeString().slice(0, 5),
    start_at: meetingData.start_at,
    end_at: meetingData.end_at,
  }
}

const prepareMeetingForBackend = (meeting: Omit<Meeting, "id">, usersByName: Map<string, User>) => {
  const startDateTime = new Date(`${meeting.date}T${meeting.startTime}:00`)
  const endDateTime = new Date(`${meeting.date}T${meeting.endTime}:00`)

  const payload: any = {
    title: meeting.title,
    client: meeting.client,
    location: meeting.location,
    start_at: startDateTime.toISOString(),
    end_at: endDateTime.toISOString(),
  }

  // CRITICAL FIX: Use executive_id instead of executive name
  if (meeting.executive) {
    const u = usersByName.get(meeting.executive)
    if (u) {
      payload.executive_id = u.id
    } else {
      console.warn("No se encontró ID para ejecutivo:", meeting.executive)
      // Si no encontramos el ID, no enviamos executive_id (backend validará)
    }
  }

  if (meeting.collaborator) {
    const u = usersByName.get(meeting.collaborator)
    if (u) {
      payload.collaborator_id = u.id
    } else {
      console.warn("No se encontró ID para colaborador:", meeting.collaborator)
    }
  }

  // attendees: usar IDs de los objetos de attendees
  if ((meeting as any).attendeesObjects && Array.isArray((meeting as any).attendeesObjects)) {
    payload.attendees = (meeting as any).attendeesObjects.map((a: any) => Number(a.id))
  }

  return payload
}


export default function MeetingControlPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState("")

  // users: full user objects from backend
  const [users, setUsers] = useState<User[]>([])
  const [usersById, setUsersById] = useState<Map<number, User>>(new Map())
  const [usersByName, setUsersByName] = useState<Map<string, User>>(new Map())

  // executive names for existing dialogs (backwards-compatible)
  const [executiveNames, setExecutiveNames] = useState<string[]>([])

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

  const effectiveLocation = currentUser?.role === "salaWit" ? "sala-wit" : selectedLocation


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

        if (res.status === 401) {
          return handleUnauthorized()
        }
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


  // cargar meetings y users cuando cambie fecha / location o al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      // load users first so we can resolve ids <-> names
      (async () => {
        await fetchUsers()
        await fetchMeetings()
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, startDate, selectedLocation])


  const handleUnauthorized = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    setIsAuthenticated(false)
    setCurrentUser(null)
    ErrorToast.fire({
      icon: 'error',
      title: 'Sesión expirada. Por favor inicia sesión de nuevo.'
    })
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return handleUnauthorized()

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.status === 401) return handleUnauthorized()

      if (!res.ok) {
        ErrorToast.fire({
          icon: 'error',
          title: 'No se pudieron obtener los usuarios'
        })
        return
      }

      const raw = await res.json()
      // backend returns an array like you showed; ensure it's an array
      const usersArray: User[] = Array.isArray(raw) ? raw : (Array.isArray(raw.results) ? raw.results : [])
      setUsers(usersArray)

      // build maps
      const byId = new Map<number, User>(usersArray.map(u => [u.id, u]))
      setUsersById(byId)
      const byName = new Map<string, User>()
      usersArray.forEach(u => byName.set(u.name, u))
      setUsersByName(byName)

      // executive names for select controls (keep compatibility)
      const execNames = usersArray.map(u => u.name)
      setExecutiveNames(execNames)
      setError("")
    } catch (err) {
      console.error("Error obteniendo usuarios:", err)
      ErrorToast.fire({
        icon: 'error',
        title: 'No se pudieron cargar los usuarios'
      })
      // fallback: keep previous executiveNames or derive from meetings
      const fallback = Array.from(new Set(meetings.map((m) => m.executive))).filter(Boolean)
      setExecutiveNames(fallback)
    }
  }

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return handleUnauthorized()

      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(startDate)
      end.setDate(end.getDate() + 13) // 14 días en total
      end.setHours(23, 59, 59, 999)

      const params = new URLSearchParams()
      params.set("startDate", start.toISOString())
      params.set("endDate", end.toISOString())

      if (selectedLocation && selectedLocation !== "all") {
        params.set("location", selectedLocation)
      }

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/meetings?${params.toString()}`

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.status === 401) return handleUnauthorized()

      if (!res.ok) {
        throw new Error("Error obteniendo reuniones")
      }

      const data = await res.json()
      const meetingsRaw = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : [])
      // parse using usersById (may be empty on first load; parseMeetingFromBackend handles that)
      const formattedMeetings = meetingsRaw.map((m: any) => parseMeetingFromBackend(m, usersById))
      setMeetings(formattedMeetings)
      setError("")
    } catch (err) {
      console.error("Error obteniendo reuniones:", err)
      ErrorToast.fire({
        icon: 'error',
        title: 'No se pudieron cargar las reuniones'
      })
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


  const handleAddMeeting = async (meetingData: {
    title: string
    client: string
    executive: string
    collaborator?: string
    location: "sala-wit" | "virtual" | "presencial"
    date: string
    startTime: string
    endTime: string
  }) => {
    try {
      const token = localStorage.getItem("token")

      // Convertir meetingData al formato que necesita prepareMeetingForBackend
      const meetingForBackend = {
        ...meetingData,
        // Estos campos serán ignorados por prepareMeetingForBackend, pero mantienen la estructura
        id: "", // dummy value
        start_at: "", // dummy value  
        end_at: "", // dummy value
      } as Meeting

      const meetingPayload = prepareMeetingForBackend(meetingForBackend, usersByName)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(meetingPayload)
      })

      if (res.status === 401) return handleUnauthorized()

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (errorData.error === 'time_conflict') {
          ErrorToast.fire({
            icon: 'error',
            title: `Conflicto de horario: ${errorData.message}`
          })
          if (errorData.conflicts) {
            console.log("Conflictos:", errorData.conflicts)
          }
        } else {
          throw new Error(errorData.details?.[0] || "Error creando reunión")
        }
        return
      }

      await fetchMeetings()
      setIsDialogOpen(false)
      setError("")

      SuccessToast.fire({
        icon: 'success',
        title: 'Reunión creada correctamente'
      })
    } catch (err: any) {
      console.error("Error al crear reunión:", err)
      ErrorToast.fire({
        icon: 'error',
        title: `Error al crear la reunión: ${err.message}`
      })
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

      if (res.status === 401) return handleUnauthorized()

      if (!res.ok) {
        throw new Error("Error eliminando reunión")
      }

      // refresh to keep attendees/executive consistent
      await fetchMeetings()

      SuccessToast.fire({
        icon: 'success',
        title: 'Reunión eliminada correctamente'
      })
    } catch (err: any) {
      console.error("Error al eliminar reunión:", err)
      ErrorToast.fire({
        icon: 'error',
        title: `Error al eliminar la reunión: ${err.message}`
      })
    }
  }


  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setIsDetailDialogOpen(true)
  }

  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    try {
      const token = localStorage.getItem("token")
      const meetingData = prepareMeetingForBackend(updatedMeeting, usersByName)

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/meetings/${updatedMeeting.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(meetingData)
      })

      if (res.status === 401) return handleUnauthorized()

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (errorData.error === 'time_conflict') {
          ErrorToast.fire({
            icon: 'error',
            title: `Conflicto de horario: ${errorData.message}`
          })
        } else {
          throw new Error("Error actualizando reunión")
        }
        return
      }

      // refresh from server to get resolved relations
      await fetchMeetings()
      setIsDetailDialogOpen(false)
      setError("")

      SuccessToast.fire({
        icon: 'success',
        title: 'Reunión actualizada correctamente'
      })

    } catch (err: any) {
      console.error("Error al actualizar reunión:", err)
      ErrorToast.fire({
        icon: 'error',
        title: `Error al actualizar la reunión: ${err.message}`
      })
    }
  }


  const filteredMeetings = meetings.filter((meeting) => {
    if (selectedExecutive !== "all" && meeting.executive !== selectedExecutive) {
      return false
    }
    if (effectiveLocation !== "all" && meeting.location !== effectiveLocation) {
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
              {currentUser?.role !== "salaWit" && (
                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 transition-all hover:scale-105">
                  <Plus className="h-5 w-5" />
                  Nueva Reunión
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-30 py-6">

        <MeetingFilters
          executives={executiveNames}
          selectedExecutive={selectedExecutive}
          selectedLocation={effectiveLocation}  // forzado
          onExecutiveChange={setSelectedExecutive}
          onLocationChange={currentUser?.role === "salaWit" ? () => { } : setSelectedLocation}
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
        executives={executiveNames}
        users={users}
      />

      <MeetingDetailDialog
        meeting={selectedMeeting}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onUpdateMeeting={handleUpdateMeeting}
        executives={executiveNames}
        users={users}
      />
    </div>
  )
}
