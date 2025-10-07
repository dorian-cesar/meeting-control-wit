"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Video, Building2, Calendar, Clock, User, Users, Briefcase } from "lucide-react"
import type { Meeting } from "@/app/page"

type MeetingDetailDialogProps = {
  meeting: Meeting | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateMeeting: (meeting: Meeting) => void
  executives: string[]
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

export function MeetingDetailDialog({
  meeting,
  open,
  onOpenChange,
  onUpdateMeeting,
  executives,
}: MeetingDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Meeting | null>(null)

  useEffect(() => {
    if (meeting) {
      setFormData(meeting)
      setIsEditing(false)
    }
  }, [meeting])

  if (!meeting || !formData) return null

  const locationConfig = LOCATION_CONFIG[meeting.location]
  const LocationIcon = locationConfig.icon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onUpdateMeeting(formData)
      setIsEditing(false)
      onOpenChange(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isEditing ? "Editar Reunión" : "Detalle de Reunión"}
            {!isEditing && (
              <Badge className={`${locationConfig.color} gap-1.5`}>
                <LocationIcon className="h-3 w-3" />
                {locationConfig.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos de la reunión" : "Información completa de la reunión"}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-location">Lugar *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value: Meeting["location"]) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger id="edit-location" className="transition-all focus:ring-2 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sala-wit">Sala de Reuniones Wit</SelectItem>
                      <SelectItem value="virtual">Reunión Virtual</SelectItem>
                      <SelectItem value="presencial">Presencial (Fuera de oficina)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Hora Inicio *</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">Hora Fin *</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title">Título de la Reunión *</Label>
                <Input
                  id="edit-title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-client">Cliente *</Label>
                <Input
                  id="edit-client"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-executive">Ejecutivo *</Label>
                <Select
                  value={formData.executive}
                  onValueChange={(value) => setFormData({ ...formData, executive: value })}
                >
                  <SelectTrigger id="edit-executive" className="transition-all focus:ring-2 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {executives.map((exec) => (
                      <SelectItem key={exec} value={exec}>
                        {exec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-collaborator">Colaborador (Opcional)</Label>
                <Select
                  value={formData.collaborator || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, collaborator: value === "none" ? undefined : value })
                  }
                >
                  <SelectTrigger id="edit-collaborator" className="transition-all focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sin colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin colaborador</SelectItem>
                    {executives.map((exec) => (
                      <SelectItem key={exec} value={exec}>
                        {exec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(meeting)
                }}
                className="transition-all hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button type="submit" className="transition-all hover:scale-105">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p className="text-base font-semibold capitalize">{formatDate(meeting.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horario</p>
                  <p className="text-base font-semibold">
                    {meeting.startTime} - {meeting.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Título</p>
                  <p className="text-base font-semibold">{meeting.title}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="text-base font-semibold">{meeting.client}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Ejecutivo</p>
                  <p className="text-base font-semibold">{meeting.executive}</p>
                </div>
              </div>

              {meeting.collaborator && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Colaborador</p>
                    <p className="text-base font-semibold">{meeting.collaborator}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="transition-all hover:bg-muted"
              >
                Cerrar
              </Button>
              <Button type="button" onClick={() => setIsEditing(true)} className="transition-all hover:scale-105">
                Editar Reunión
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
