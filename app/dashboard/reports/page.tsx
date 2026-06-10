"use client"

import { useEffect, useState } from "react"
import { useRoleGuard } from "@/lib/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Users, Calendar, DollarSign, Activity, FileText } from "lucide-react"
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
  LineChart,
  Line,
} from "recharts"

// Reports charts should be data-driven; no hardcoded mock chart datasets.


export default function ReportsPage() {
  const { hasAccess, loaded } = useRoleGuard(["Admin"])
  const [reportData, setReportData] = useState({
    stats: {
      totalPatients: 0,
      totalAppointments: 0,
      monthlyRevenue: 0,
      patientGrowth: 0,
      appointmentGrowth: 0,
      revenueGrowth: 0,
    },
    departmentStats: [] as { name: string; patients: number; color: string }[],
    appointmentTypes: [] as { name: string; value: number; color: string }[],
  })

  useEffect(() => {
    if (!hasAccess) return

    const fetchReports = async () => {
      try {
        setReportData(await api.get("/api/dashboard"))
      } catch (error) {
        console.error(error)
      }
    }

    fetchReports()
  }, [hasAccess])

  if (!loaded) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>
  if (!hasAccess) return null

  const departmentStats = reportData.departmentStats.length
    ? reportData.departmentStats
    : [{ name: "No data", patients: 0, color: "#2a9d8f" }]

  const appointmentTypes = reportData.appointmentTypes.length
    ? reportData.appointmentTypes
    : []

  const revenueSeries = (reportData as any).revenueSeries as { month: string; revenue: number }[]
  const expensesSeries = (reportData as any).expensesSeries as { month: string; expenses: number }[]

  const revenueVsExpenses = revenueSeries.map((r, idx) => ({
    month: r.month,
    revenue: r.revenue,
    expenses: expensesSeries[idx]?.expenses ?? 0,
  }))

  const weeklyPatientsSeries = ((reportData as any).weeklyPatients ?? []) as { day: string; patients: number }[]




  const handleExport = (name = "kenko-report") => {
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${name}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and hospital performance metrics</p>
        </div>
        <Button className="gap-2" onClick={() => handleExport("kenko-full-report")}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{reportData.stats.totalPatients.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{reportData.stats.patientGrowth}% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <p className="text-2xl font-bold">{reportData.stats.totalAppointments.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{reportData.stats.appointmentGrowth}% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">Rs. {(reportData.stats.monthlyRevenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-green-600">+{reportData.stats.revenueGrowth}% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-xs text-green-600">+2.1% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue vs Expenses
          </CardTitle>
          <CardDescription>Monthly financial overview for the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueVsExpenses}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e05c6a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e05c6a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#b0dbd8" />
                <XAxis dataKey="month" stroke="#3d6472" fontSize={12} />
                <YAxis stroke="#3d6472" fontSize={12} tickFormatter={(value) => `$${value / 1000}K`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  contentStyle={{
                    backgroundColor: "#FFFDF7",
                    border: "1px solid #b0dbd8",
                    borderRadius: "8px",
                    color: "#1a3340",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2a9d8f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#e05c6a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment Types */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Appointment Types Distribution</CardTitle>
            <CardDescription>Breakdown of appointments by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {appointmentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF7",
                      border: "1px solid #b0dbd8",
                      borderRadius: "8px",
                      color: "#1a3340",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Patients */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Weekly Patient Visits</CardTitle>
            <CardDescription>Average daily patient count this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyPatientsSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#b0dbd8" />
                  <XAxis dataKey="day" stroke="#3d6472" fontSize={12} />
                  <YAxis stroke="#3d6472" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFDF7",
                      border: "1px solid #b0dbd8",
                      borderRadius: "8px",
                      color: "#1a3340",
                    }}
                  />
                  <Bar dataKey="patients" fill="#2a9d8f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Patient distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#b0dbd8" />
                <XAxis type="number" stroke="#3d6472" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#3d6472" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFDF7",
                    border: "1px solid #b0dbd8",
                    borderRadius: "8px",
                    color: "#1a3340",
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

      {/* Quick Reports */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quick Reports
          </CardTitle>
          <CardDescription>Download pre-generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Monthly Summary", description: "Complete monthly overview" },
              { name: "Patient Report", description: "Patient statistics and trends" },
              { name: "Financial Report", description: "Revenue and expense analysis" },
              { name: "Department Report", description: "Performance by department" },
            ].map((report) => (
              <div
                key={report.name}
                className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium text-foreground">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleExport(report.name.toLowerCase().replace(/\s+/g, "-"))}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
