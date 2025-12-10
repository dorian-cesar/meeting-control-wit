"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Video, MapPin } from "lucide-react"

type MeetingFiltersProps = {
  executives: string[]
  selectedExecutive: string
  selectedLocation: string
  onExecutiveChange: (value: string) => void
  onLocationChange: (value: string) => void
  isMobileView?: boolean
}

export function MeetingFilters({
  executives,
  selectedExecutive,
  selectedLocation,
  onExecutiveChange,
  onLocationChange,
  isMobileView = false
}: MeetingFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="executive-filter">Ejecutivo</Label>
          <Select value={selectedExecutive} onValueChange={onExecutiveChange}>
            <SelectTrigger id="executive-filter">
              <SelectValue placeholder="Todos los ejecutivos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los ejecutivos</SelectItem>
              {executives.map((exec) => (
                <SelectItem key={exec} value={exec}>
                  {exec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-filter">Ubicación</Label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger id="location-filter">
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              <SelectItem value="sala-wit">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Sala Wit
                </div>
              </SelectItem>
              <SelectItem value="virtual">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Virtual
                </div>
              </SelectItem>
              <SelectItem value="presencial">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Presencial
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {
          !isMobileView && (
            <div className="lg:col-span-2 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">Sala Wit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-500"></div>
                <span className="text-muted-foreground">Virtual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                <span className="text-muted-foreground">Presencial</span>
              </div>
            </div>
          )
        }
      </div>
    </Card>
  )
}