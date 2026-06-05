"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

export default function RegisterPage() {
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const router = useRouter()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.{8,})(?=.*[A-Za-z])(?=.*\d).*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!firstname.trim()) return setFormError("Please enter your first name.")
    if (!lastname.trim()) return setFormError("Please enter your last name.")
    if (!emailRegex.test(email)) return setEmailError("Please enter a valid email.")
    if (!passwordRegex.test(password)) return setPasswordError("Password must be at least 8 characters and include letters and numbers.")
    if (password !== confirmPassword) return setFormError("Passwords do not match.")

    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, email, password, role: "User" }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setFormError("An account with this email already exists.")
        return
      }
      if (!res.ok) {
        setFormError(data.message || "Failed to create account. Please try again.")
        return
      }
      router.push("/login")
    } catch {
      setFormError("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create account</h1>
          <p className="mt-2 text-muted-foreground">Register to access Kenko HMS</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>Enter your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First name</label>
                <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} className="h-11" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last name</label>
                <Input value={lastname} onChange={(e) => setLastname(e.target.value)} className="h-11" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError("") }}
                  onBlur={() => { if (email && !emailRegex.test(email)) setEmailError("Please enter a valid email.") }}
                  className="h-11"
                />
                {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError("") }}
                  onBlur={() => { if (password && !passwordRegex.test(password)) setPasswordError("Password must be at least 8 characters and include letters and numbers.") }}
                  className="h-11"
                />
                {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11" />
              </div>

              <Button type="submit" className="h-11 w-full" disabled={isLoading}>{isLoading ? "Creating..." : "Create account"}</Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <a className="text-primary" href="/login">Sign in</a></p>
      </div>
    </div>
  )
}
