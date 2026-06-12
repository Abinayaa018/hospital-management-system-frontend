"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, Settings, LayoutDashboard, Users, UserCog, Calendar, Receipt, Pill, BarChart3, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Doctor", "Patient"] },
  { name: "Patients", href: "/dashboard/patients", icon: Users, roles: ["Admin", "Doctor"] },
  { name: "Doctors", href: "/dashboard/doctors", icon: UserCog, roles: ["Admin", "Patient"] },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["Admin", "Doctor", "Patient"] },
  { name: "Billing", href: "/dashboard/billing", icon: Receipt, roles: ["Admin", "Doctor"] },
  { name: "Pharmacy", href: "/dashboard/pharmacy", icon: Pill, roles: ["Admin"] },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, roles: ["Admin"] },
]

export function TopNavigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <img src="/kenko-logo.png" alt="Kenko logo" className="h-5 w-5" />
        </div>

        <span className="text-lg font-bold text-foreground">Kenko</span>
      </div>

      {/* Navigation Links */}
      <nav className="hidden items-center gap-1 md:flex">
        {navItems
          .filter((item) => item.roles.includes(user?.role || "Patient"))
          .map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 w-48 pl-8 text-sm lg:w-64"
          />
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium lg:inline">{user?.name || "Admin"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user?.role || "Administrator"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
