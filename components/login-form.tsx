"use client"

import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

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

const ErrorToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  iconColor: '#ef4444',
  background: 'white',
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
  background: 'white',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})


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

      const data = await res.json()

      if (!res.ok) {
        // Errores conocidos del backend
        if (res.status === 400) {
          const details = data.details?.join(', ') || data.error;
          ErrorToast.fire({ icon: 'error', title: details });
        } else if (res.status === 401) {
          ErrorToast.fire({ icon: 'error', title: 'Credenciales inválidas' });
        } else {
          ErrorToast.fire({ icon: 'error', title: data.error || 'Error del servidor' });
        }
        setIsLoading(false);
        return;
      }


      // Guardamos token y usuario en localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("currentUser", JSON.stringify(data.user))

      // Llamamos al callback para actualizar estado global
      onLogin(data.user)

      SuccessToast.fire({
        icon: 'success',
        title: `¡Bienvenido, ${data.user.name}!`
      })
    } catch (err: any) {
      console.error("Login error:", err)
      ErrorToast.fire({ icon: 'error', title: 'Error de conexión con el servidor' });
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
        </CardContent>
      </Card>
    </div>
  )
}
