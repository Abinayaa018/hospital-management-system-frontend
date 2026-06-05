"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Calendar, Clock, Stethoscope, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

type Appointment = { _id: string; patientName: string; doctorName: string; date: string; time: string; type: string; status: string; department: string }

const emptyForm = { patientName: "", doctorName: "", date: "", time: "", type: "Consultation", status: "Pending", department: "" }
const statusFilters = ["All", "Confirmed", "Pending", "In Progress", "Completed", "Cancelled"]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try { setAppointments(await api.get("/api/appointments")) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post("/api/appointments", form)
    setIsAddOpen(false); setForm(emptyForm); fetchAppointments()
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    await api.put(`/api/appointments/${id}`, { status })
    fetchAppointments()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return
    await api.delete(`/api/appointments/${id}`)
    fetchAppointments()
  }

  const filtered = appointments.filter(a => {
    const matchesSearch = a.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || a.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "All" || a.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-700"
      case "Pending": return "bg-yellow-100 text-yellow-700"
      case "In Progress": return "bg-primary/10 text-primary"
      case "Completed": return "bg-gray-100 text-gray-700"
      case "Cancelled": return "bg-red-100 text-red-700"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emergency": return "bg-red-500"
      case "Follow-up": return "bg-primary"
      case "Consultation": return "bg-blue-500"
      case "Check-up": return "bg-green-500"
      default: return "bg-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />New Appointment</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Schedule New Appointment</DialogTitle><DialogDescription>Fill in the appointment details.</DialogDescription></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[["Patient Name","patientName","text"],["Doctor","doctorName","text"],["Date","date","date"],["Time","time","time"],["Department","department","text"]].map(([label,key,type]) => (
                  <div key={key} className="space-y-2"><label className="text-sm font-medium">{label}</label><Input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required /></div>
                ))}
                <div className="space-y-2"><label className="text-sm font-medium">Type</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {["Consultation","Follow-up","Check-up","Emergency"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button><Button type="submit">Schedule</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by patient or doctor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statusFilters.map(s => (
                <Button key={s} variant={filterStatus === s ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(s)} className="whitespace-nowrap">{s}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle>All Appointments</CardTitle><CardDescription>{filtered.length} appointment(s) found</CardDescription></CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <div className="space-y-4">
              {filtered.map(apt => (
                <div key={apt._id} className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 h-3 w-3 rounded-full ${getTypeColor(apt.type)}`} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{apt.patientName}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Stethoscope className="h-4 w-4" />{apt.doctorName}</div>
                        <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{apt.date}</div>
                        <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{apt.time}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="rounded bg-muted px-2 py-0.5 text-xs">{apt.type}</span>
                        <span className="text-muted-foreground">{apt.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleStatusUpdate(apt._id, "Confirmed")}><CheckCircle className="h-4 w-4" /><span className="hidden sm:inline">Confirm</span></Button>
                    <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleStatusUpdate(apt._id, "Cancelled")}><XCircle className="h-4 w-4" /><span className="hidden sm:inline">Cancel</span></Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusUpdate(apt._id, "Completed")}><CheckCircle className="mr-2 h-4 w-4" />Mark Completed</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(apt._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No appointments found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
