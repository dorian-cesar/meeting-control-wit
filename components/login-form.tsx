"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Calendar } from "lucide-react"

const USERS = [
  { username: "admin", password: "admin123", name: "Administrador" },
  { username: "carlos", password: "carlos123", name: "Carlos Mendoza" },
  { username: "maria", password: "maria123", name: "María González" },
  { username: "juan", password: "juan123", name: "Juan Pérez" },
  { username: "ana", password: "ana123", name: "Ana Silva" },
]

interface LoginFormProps {
  onLogin: (user: { username: string; name: string }) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simular delay de autenticación
    setTimeout(() => {
      const user = USERS.find((u) => u.username === username && u.password === password)

      if (user) {
        onLogin({ username: user.username, name: user.name })
      } else {
        setError("Usuario o contraseña incorrectos")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Control de Reuniones</CardTitle>
          <CardDescription className="text-base">Ingresa tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="transition-all focus:scale-[1.02]"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all focus:scale-[1.02]"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2 transition-all hover:scale-[1.02]"
              size="lg"
              disabled={isLoading}
            >
              <LogIn className="h-5 w-5" />
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground font-medium mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• admin / admin123</p>
              <p>• carlos / carlos123</p>
              <p>• maria / maria123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
