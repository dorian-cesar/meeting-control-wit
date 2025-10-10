"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Calendar } from "lucide-react"

export type User = {
  id: number
  email: string
  name: string
  role: 'user' | 'salaWit'
  createdAt: string
  updatedAt: string
}

interface LoginFormProps {
  onLogin: (user: User) => void
}
export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const errData = await res.json()
        setError(errData.error || "Error iniciando sesión")
        setIsLoading(false)
        return
      }

      const data = await res.json()
      // Guardamos token y usuario en localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("currentUser", JSON.stringify(data.user))

      // Llamamos al callback para actualizar estado global
      onLogin(data.user)
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
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
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all focus:scale-[1.02]"
                autoComplete="email"
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
