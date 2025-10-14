"use client"

import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Trash2, ArrowLeft, Pencil } from "lucide-react"

type User = {
    id: number
    email: string
    name: string
    role: "user" | "salaWit"
    createdAt?: string
    updatedAt?: string
}

const ErrorToast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    iconColor: "#ef4444",
    background: "white",
    didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer)
        toast.addEventListener("mouseleave", Swal.resumeTimer)
    }
})

const SuccessToast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    iconColor: "#22c55e",
    background: "white",
    didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer)
        toast.addEventListener("mouseleave", Swal.resumeTimer)
    }
})

export default function AdminPage() {
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [users, setUsers] = useState<User[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [creating, setCreating] = useState(false)
    const [editingUserId, setEditingUserId] = useState<number | null>(null)
    const isEditing = editingUserId !== null

    // form
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<User["role"]>("user")

    const router = useRouter()

    // Mantener la misma lógica de sessión/chequeo que en MeetingControlPage
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
                        Authorization: `Bearer ${token}`
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

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])

    const handleUnauthorized = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("currentUser")
        setIsAuthenticated(false)
        setCurrentUser(null)
        ErrorToast.fire({
            icon: "error",
            title: "Sesión expirada. Por favor inicia sesión de nuevo."
        })
    }

    const handleLogout = () => {
        setCurrentUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem("token")
        localStorage.removeItem("currentUser")
        SuccessToast.fire({
            icon: "success",
            title: "Cierre de sesión OK"
        })
    }

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true)
            const token = localStorage.getItem("token")
            if (!token) return handleUnauthorized()

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.status === 401) return handleUnauthorized()

            if (!res.ok) {
                throw new Error("Error obteniendo usuarios")
            }

            const raw = await res.json()
            const usersArray: User[] = Array.isArray(raw) ? raw : Array.isArray(raw.results) ? raw.results : []
            setUsers(usersArray)
        } catch (err) {
            console.error("Error obteniendo usuarios:", err)
            ErrorToast.fire({
                icon: "error",
                title: "No se pudieron cargar los usuarios"
            })
        } finally {
            setLoadingUsers(false)
        }
    }

    const handleCreateOrSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (isEditing) {
            await handleSaveEdit()
            return
        }
        // Crear nuevo usuario
        try {
            setCreating(true)
            const token = localStorage.getItem("token")
            if (!token) return handleUnauthorized()

            if (!name.trim() || !email.trim() || !password) {
                ErrorToast.fire({ icon: "error", title: "Completa nombre, email y contraseña" })
                return
            }

            const payload = { name: name.trim(), email: email.trim(), password, role }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.status === 401) return handleUnauthorized()

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                const message = err?.message || err?.errors?.[0] || "Error creando usuario"
                throw new Error(message)
            }

            SuccessToast.fire({ icon: "success", title: "Usuario creado" })
            clearForm()
            await fetchUsers()
        } catch (err: any) {
            console.error("Error creando usuario:", err)
            ErrorToast.fire({ icon: "error", title: `Error: ${err.message}` })
        } finally {
            setCreating(false)
        }
    }

    const handleSaveEdit = async () => {
        if (!editingUserId) return
        try {
            setCreating(true) // reuse spinner state
            const token = localStorage.getItem("token")
            if (!token) return handleUnauthorized()

            // build payload con sólo campos a actualizar
            const payload: any = {}
            if (name.trim() !== "") payload.name = name.trim()
            if (email.trim() !== "") payload.email = email.trim()
            if (role) payload.role = role
            // password opcional al editar
            if (password && password.length > 0) {
                if (password.length < 8) {
                    ErrorToast.fire({ icon: "error", title: "Contraseña debe tener al menos 8 caracteres" })
                    setCreating(false)
                    return
                }
                payload.password = password
            }

            if (Object.keys(payload).length === 0) {
                ErrorToast.fire({ icon: "error", title: "No hay cambios para guardar" })
                setCreating(false)
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${editingUserId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.status === 401) return handleUnauthorized()

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                const message = err?.message || err?.error || (err?.details && err.details.join(", ")) || "Error actualizando usuario"
                throw new Error(message)
            }

            SuccessToast.fire({ icon: "success", title: "Usuario actualizado" })
            clearForm()
            setEditingUserId(null)
            await fetchUsers()
        } catch (err: any) {
            console.error("Error actualizando usuario:", err)
            ErrorToast.fire({ icon: "error", title: `Error: ${err.message}` })
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteUser = async (id: number) => {
        const confirm = await Swal.fire({
            title: "Eliminar usuario",
            text: "¿Estás seguro? Esta acción es irreversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        })

        if (!confirm.isConfirmed) return

        try {
            const token = localStorage.getItem("token")
            if (!token) return handleUnauthorized()

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.status === 401) return handleUnauthorized()

            if (!res.ok) {
                throw new Error("Error eliminando usuario")
            }

            SuccessToast.fire({ icon: "success", title: "Usuario eliminado" })

            if (editingUserId === id) {
                clearForm()
                setEditingUserId(null)
            }
            await fetchUsers()

            await fetchUsers()
        } catch (err: any) {
            console.error("Error eliminando usuario:", err)
            ErrorToast.fire({ icon: "error", title: `Error: ${err.message}` })
        }
    }

    const handleEditClick = (u: User) => {
        setEditingUserId(u.id)
        setName(u.name ?? "")
        setEmail(u.email ?? "")
        setRole(u.role ?? "user")
        setPassword("") // password opcional al editar
    }

    // Cancela la edición
    const cancelEdit = () => {
        setEditingUserId(null)
        clearForm()
    }

    const clearForm = () => {
        setName("")
        setEmail("")
        setPassword("")
        setRole("user")
    }


    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Cargando...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        // Si quieres, puedes reutilizar tu LoginForm; aquí devuelvo texto simple para no romper dependencias.
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="mb-4">No autenticado. Por favor inicia sesión.</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen bg-background text-foreground"
            style={{ backgroundColor: "var(--background)" }}
        >
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="px-30 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-lg"
                        >
                            <ArrowLeft className="h-10 w-10" />
                            Volver
                        </Button>

                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Gestión de usuarios
                                {currentUser && <span className="ml-2">• {currentUser.name}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button onClick={handleLogout} variant="outline" size="lg" className="gap-2">
                            <LogOut className="h-5 w-5" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="md:col-span-1 bg-card p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5" /> {isEditing ? "Editar usuario" : "Crear usuario"}
                    </h2>

                    <form onSubmit={handleCreateOrSave} className="flex flex-col gap-3">
                        <label className="text-sm">
                            Nombre
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Nombre completo"
                                required={!isEditing}
                            />
                        </label>

                        <label className="text-sm">
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="usuario@ejemplo.com"
                                required={!isEditing}
                            />
                        </label>

                        <label className="text-sm">
                            Contraseña
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder={isEditing ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                                required={!isEditing}
                            />
                        </label>

                        <label className="text-sm">
                            Rol
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as User["role"])}
                                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="user">user</option>
                                <option value="salaWit">salaWit</option>
                            </select>
                        </label>

                        <div className="flex gap-2 mt-2 items-center justify-between">
                            <Button type="submit" disabled={creating}>
                                {creating
                                    ? isEditing
                                        ? "Guardando..."
                                        : "Creando..."
                                    : isEditing
                                        ? "Guardar cambios"
                                        : "Crear usuario"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (isEditing) cancelEdit()
                                    else clearForm()
                                }}
                            >
                                {isEditing ? "Cancelar" : "Limpiar"}
                            </Button>
                        </div>
                    </form>

                </section>

                <section className="md:col-span-2 bg-card p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Usuarios</h2>
                        <div className="text-sm text-muted-foreground">{loadingUsers ? "Cargando..." : `${users.length} usuarios`}</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-muted-foreground">
                                <tr>
                                    <th className="pb-2">ID</th>
                                    <th className="pb-2">Nombre</th>
                                    <th className="pb-2">Email</th>
                                    <th className="pb-2">Rol</th>
                                    <th className="pb-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="align-top border-t">
                                        <td className="py-3">{u.id}</td>
                                        <td className="py-3">{u.name}</td>
                                        <td className="py-3">{u.email}</td>
                                        <td className="py-3">{u.role}</td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    Eliminar
                                                </Button>
                                                <Button size="sm" variant="default" onClick={() => handleEditClick(u)}>
                                                    <Pencil className="h-4 w-4" />
                                                    Editar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loadingUsers && (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                            No hay usuarios
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    )
}
