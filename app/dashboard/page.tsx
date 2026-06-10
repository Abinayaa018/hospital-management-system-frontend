"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, UserCog, DollarSign, TrendingUp, TrendingDown, Activity, Clock, Heart, Shield, Award, Phone, Mail, MapPin, Star, ArrowRight, Stethoscope, Ambulance, Building2, Receipt } from "lucide-react"
import { api } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"

type DashboardData = {
  stats: {
    totalPatients: number
    todayAppointments: number
    totalAppointments: number
    availableDoctors: number
    monthlyRevenue: number
    patientGrowth: number
    appointmentGrowth: number
    revenueGrowth: number
  }
  patientTrends: { month: string; patients: number; appointments: number }[]
  departmentStats: { name: string; patients: number; color: string }[]
  upcomingAppointments: { _id: string; patientName: string; doctorName: string; time: string; status: string }[]
  featuredDoctors: { _id: string; name: string; specialty: string; rating?: number; patients?: number; status?: string; experience?: string }[]
  recentActivity: { id: string; action: string; patient: string; time: string; type: string }[]
}

const emptyDashboard: DashboardData = {
  stats: {
    totalPatients: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    availableDoctors: 0,
    monthlyRevenue: 0,
    patientGrowth: 0,
    appointmentGrowth: 0,
    revenueGrowth: 0,
  },
  patientTrends: [],
  departmentStats: [],
  upcomingAppointments: [],
  featuredDoctors: [],
  recentActivity: [],
}

const hospitalFeatures = [
  {
    icon: Heart,
    title: "Patient-Centered Care",
    description: "We prioritize your health and well-being with personalized treatment plans and compassionate care.",
  },
  {
    icon: Shield,
    title: "Advanced Technology",
    description: "State-of-the-art medical equipment and cutting-edge diagnostic tools for accurate results.",
  },
  {
    icon: Award,
    title: "Expert Medical Staff",
    description: "Board-certified physicians and experienced healthcare professionals dedicated to your recovery.",
  },
  {
    icon: Ambulance,
    title: "24/7 Emergency Services",
    description: "Round-the-clock emergency care with rapid response teams ready to help anytime.",
  },
]

const quickStats = [
  { label: "Years of Excellence", value: "25+" },
  { label: "Successful Surgeries", value: "50K+" },
  { label: "Happy Patients", value: "100K+" },
  { label: "Medical Awards", value: "15" },
]

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setDashboard(await api.get("/api/dashboard"))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const statsCards = useMemo(() => [
    {
      title: "Total Patients",
      value: dashboard.stats.totalPatients.toLocaleString(),
      change: dashboard.stats.patientGrowth,
      icon: Users,
    },
    {
      title: "Today's Appointments",
      value: dashboard.stats.todayAppointments,
      change: dashboard.stats.appointmentGrowth,
      icon: Calendar,
    },
    {
      title: "Available Doctors",
      value: dashboard.stats.availableDoctors,
      change: 0,
      icon: UserCog,
    },
    {
      title: "Monthly Revenue",
      value: `Rs. ${(dashboard.stats.monthlyRevenue / 1000).toFixed(1)}K`,
      change: dashboard.stats.revenueGrowth,
      icon: DollarSign,
    },
  ], [dashboard])

  const upcomingAppointments = dashboard.upcomingAppointments.slice(0, 5)
  const featuredDoctors = dashboard.featuredDoctors.slice(0, 3)
  const patientTrends = dashboard.patientTrends.length ? dashboard.patientTrends : [{ month: "Now", patients: 0, appointments: 0 }]
  const departmentStats = dashboard.departmentStats.length ? dashboard.departmentStats : [{ name: "No data", patients: 0, color: "#2a9d8f" }]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/reports">
            Download Report
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/appointments">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hero Section with Hospital Info */}
      <Card className="overflow-hidden border-border/50">
        {/* Image with overlapping text - always visible */}
        <div className="relative h-72 w-full">
          <Image
            src="/images/hospital-interior.jpg"
            alt="Kenko Hospital Interior"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/30" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold">Welcome to Kenko</h2>
              <p className="mt-2 text-base text-white/90">Your Trusted Hospital Management System</p>
              <p className="mt-2 text-lg text-white/90">Your Health, Our Priority</p>
            </div>
          </div>
        </div>
        {/* Text content below the image */}
        <CardContent className="p-6 lg:p-8">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Building2 className="h-4 w-4" />
            About Kenko Hospital
          </div>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
            Leading Healthcare Excellence Since 1999
          </h2>
          <p className="mt-3 text-muted-foreground">
            Kenko Hospital is a premier healthcare institution committed to providing exceptional medical services with compassion and innovation. Our state-of-the-art facilities and dedicated team of healthcare professionals ensure the highest standards of patient care. Founded in 1999, we have grown into a trusted center of excellence serving over 100,000 patients annually across a wide range of specialties — from cardiology and oncology to pediatrics and emergency medicine.
          </p>
          <p className="mt-3 text-muted-foreground">
            We believe that great healthcare goes beyond treatment. It is about building lasting relationships with our patients, listening to their needs, and delivering care that is both evidence-based and deeply human. Every member of our staff — from our board-certified physicians to our nursing teams and support staff — shares a common commitment: your well-being comes first.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patient Trends */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Patient Trends</CardTitle>
            <CardDescription>Patient and appointment growth over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patientTrends}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6bbcba" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6bbcba" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#b0dbd8" />
                  <XAxis dataKey="month" stroke="#3d6472" fontSize={12} />
                  <YAxis stroke="#3d6472" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF7",
                      border: "1px solid #b0dbd8",
                      borderRadius: "8px",
                      color: "#1a3340",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="#2a9d8f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPatients)"
                    name="Patients"
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#6bbcba"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAppointments)"
                    name="Appointments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Patient count by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 285)" />
                  <XAxis type="number" stroke="oklch(0.5 0.05 285)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="oklch(0.5 0.05 285)" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.9 0.02 285)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="patients" radius={[0, 4, 4, 0]}>
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Doctors Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Our Top Doctors</h2>
            <p className="text-sm text-muted-foreground">Meet our experienced medical professionals</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
            <Link href="/dashboard/doctors">
            View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDoctors.map((doctor) => (
            <Card key={doctor._id} className="overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="relative h-48">
                <Image
                  src="/images/doctor-hero.jpg"
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-semibold text-white">{doctor.name}</p>
                  <p className="text-sm text-white/80">{doctor.specialty}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{doctor.rating || 0}</span>
                  <span className="text-xs text-muted-foreground">({doctor.patients || 0}+ patients)</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    doctor.status === "Available" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {doctor.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{doctor.experience || "Experience not listed"} experience</p>
                <Button className="mt-3 w-full" size="sm" asChild><Link href="/dashboard/appointments">Book Appointment</Link></Button>
              </CardContent>
            </Card>
          ))}
          {!loading && featuredDoctors.length === 0 && <p className="text-sm text-muted-foreground">No doctors have been added yet.</p>}
        </div>
      </div>

      {/* Hospital Features */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Why Choose Kenko Hospital?</CardTitle>
          <CardDescription>We are committed to providing world-class healthcare services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hospitalFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointments and Activity Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Today&apos;s scheduled appointments</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild><Link href="/dashboard/appointments">View All</Link></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{apt.doctorName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{apt.time}</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        apt.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : apt.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-primary/10 text-primary"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
              {!loading && upcomingAppointments.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No upcoming appointments yet.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest hospital activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.patient} - {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {!loading && dashboard.recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Team Banner */}
      <Card className="overflow-hidden border-border/50">
        <div className="grid lg:grid-cols-5">
          <div className="relative h-64 lg:col-span-2 lg:h-auto">
            <Image
              src="/images/medical-team.jpg"
              alt="Kenko Medical Team"
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="flex flex-col justify-center p-6 lg:col-span-3 lg:p-8">
            <h2 className="text-2xl font-bold text-foreground">
              Join Our Growing Medical Family
            </h2>
            <p className="mt-2 text-muted-foreground">
              At Kenko Hospital, we believe in teamwork and collaboration. Our diverse team of healthcare professionals works together to deliver exceptional patient care. We are always looking for talented individuals who share our passion for healthcare excellence.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@kenkohospital.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Healthcare Ave, Medical City</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild><a href="mailto:contact@kenkohospital.com">Contact Us</a></Button>
              <Button variant="outline" asChild><Link href="/dashboard/doctors">View Doctors</Link></Button>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/doctors" className="block">
        <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Find a Doctor</p>
              <p className="text-sm text-muted-foreground">Search specialists</p>
            </div>
          </CardContent>
        </Card>
        </Link>
        <Link href="/dashboard/appointments" className="block">
        <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30">
              <Calendar className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Book Appointment</p>
              <p className="text-sm text-muted-foreground">Schedule a visit</p>
            </div>
          </CardContent>
        </Card>
        </Link>
        <Link href="/dashboard/billing" className="block">
        <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Pay Bills</p>
              <p className="text-sm text-muted-foreground">View invoices</p>
            </div>
          </CardContent>
        </Card>
        </Link>
        <a href="tel:108" className="block">
        <Card className="cursor-pointer border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Ambulance className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-foreground">Emergency</p>
              <p className="text-sm text-muted-foreground">24/7 helpline</p>
            </div>
          </CardContent>
        </Card>
        </a>
      </div>
    </div>
  )
}
