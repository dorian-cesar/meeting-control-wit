"use client"

import type React from "react"

import { useState } from "react"
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
import type { Meeting } from "@/app/page"

type AddMeetingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMeeting: (meeting: Omit<Meeting, "id">) => void
  executives: string[]
}

export function AddMeetingDialog({ open, onOpenChange, onAddMeeting, executives }: AddMeetingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    executive: "",
    collaborator: "",
    location: "sala-wit" as Meeting["location"],
    date: "",
    startTime: "",
    endTime: "",
  })

  const [newExecutive, setNewExecutive] = useState("")
  const [isAddingNewExecutive, setIsAddingNewExecutive] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const executiveName = isAddingNewExecutive ? newExecutive : formData.executive

    if (!executiveName) {
      alert("Por favor selecciona o ingresa un ejecutivo")
      return
    }

    onAddMeeting({
      ...formData,
      executive: executiveName,
      collaborator: formData.collaborator || undefined,
    })

    setFormData({
      title: "",
      client: "",
      executive: "",
      collaborator: "",
      location: "sala-wit",
      date: "",
      startTime: "",
      endTime: "",
    })
    setNewExecutive("")
    setIsAddingNewExecutive(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle>Nueva Reunión</DialogTitle>
          <DialogDescription>Completa los datos para agregar una nueva reunión al calendario</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lugar *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value: Meeting["location"]) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger id="location" className="transition-all focus:ring-2 focus:ring-blue-500">
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
                <Label htmlFor="startTime">Hora Inicio *</Label>
                <Input
                  id="startTime"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Hora Fin *</Label>
                <Input
                  id="endTime"
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título de la Reunión *</Label>
              <Input
                id="title"
                required
                placeholder="Ej: Presentación Proyecto Q1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input
                id="client"
                required
                placeholder="Ej: Empresa ABC"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="executive">Ejecutivo *</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsAddingNewExecutive(!isAddingNewExecutive)}
                  className="transition-all hover:text-blue-400"
                >
                  {isAddingNewExecutive ? "Seleccionar existente" : "+ Agregar nuevo"}
                </Button>
              </div>

              {isAddingNewExecutive ? (
                <Input
                  id="newExecutive"
                  required
                  placeholder="Nombre del ejecutivo"
                  value={newExecutive}
                  onChange={(e) => setNewExecutive(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <Select
                  value={formData.executive}
                  onValueChange={(value) => setFormData({ ...formData, executive: value })}
                >
                  <SelectTrigger id="executive" className="transition-all focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Selecciona un ejecutivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {executives.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay ejecutivos. Agrega uno nuevo.
                      </SelectItem>
                    ) : (
                      executives.map((exec) => (
                        <SelectItem key={exec} value={exec}>
                          {exec}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collaborator">Colaborador (Opcional)</Label>
              <Select
                value={formData.collaborator}
                onValueChange={(value) => setFormData({ ...formData, collaborator: value })}
              >
                <SelectTrigger id="collaborator" className="transition-all focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Selecciona un colaborador" />
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
              onClick={() => onOpenChange(false)}
              className="transition-all hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button type="submit" className="transition-all hover:scale-105">
              Agregar Reunión
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
