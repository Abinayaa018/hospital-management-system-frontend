"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Star, Phone, Mail, Users, Stethoscope, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

type Doctor = { _id: string; name: string; specialty: string; phone: string; email: string; status: string; patients: number; rating: number; experience: string }

const emptyForm = { name: "", specialty: "", phone: "", email: "", status: "Available", patients: "0", rating: "5.0", experience: "" }

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const fetchDoctors = async () => {
    try { setDoctors(await api.get("/api/doctors")) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post("/api/doctors", form)
    setIsAddOpen(false); setForm(emptyForm); fetchDoctors()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.put(`/api/doctors/${selectedDoctor!._id}`, form)
    setIsEditOpen(false); fetchDoctors()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this doctor?")) return
    await api.delete(`/api/doctors/${id}`)
    fetchDoctors()
  }

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-700"
      case "In Surgery": return "bg-red-100 text-red-700"
      case "On Leave": return "bg-yellow-100 text-yellow-700"
      default: return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground">Manage doctor profiles and schedules</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Doctor</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Doctor</DialogTitle><DialogDescription>Enter doctor information.</DialogDescription></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[["Full Name","name","text","Dr. John Smith"],["Specialty","specialty","text","Cardiology"],["Phone","phone","text","+1 234-567-8900"],["Email","email","email","doctor@kenko.com"],["Experience","experience","text","5 years"],["Rating","rating","number","5.0"]].map(([label,key,type,placeholder]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium">{label}</label>
                    <Input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button><Button type="submit">Save Doctor</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search doctors by name or specialty..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(doctor => (
            <Card key={doctor._id} className="border-border/50 transition-all hover:border-primary/30 hover:shadow-md cursor-pointer" onClick={() => { setSelectedDoctor(doctor); setIsViewOpen(true) }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-lg text-primary">{doctor.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                        <p className="text-sm text-primary">{doctor.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(doctor.status)}`}>{doctor.status}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); setSelectedDoctor(doctor); setForm({ name: doctor.name, specialty: doctor.specialty, phone: doctor.phone, email: doctor.email, status: doctor.status, patients: String(doctor.patients), rating: String(doctor.rating), experience: doctor.experience }); setIsEditOpen(true) }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); handleDelete(doctor._id) }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{doctor.rating}</span></div>
                      <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{doctor.patients} patients</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="col-span-3 py-8 text-center text-muted-foreground">No doctors found.</p>}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Doctor Profile</DialogTitle><DialogDescription>{selectedDoctor?.name}</DialogDescription></DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20"><AvatarFallback className="bg-primary/10 text-2xl text-primary">{selectedDoctor.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-primary">{selectedDoctor.specialty}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(selectedDoctor.status)}`}>{selectedDoctor.status}</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[["Rating",`${selectedDoctor.rating} / 5.0`],["Total Patients",String(selectedDoctor.patients)],["Experience",selectedDoctor.experience],["Specialty",selectedDoctor.specialty]].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" />{selectedDoctor.phone}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{selectedDoctor.email}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Doctor</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[["Full Name","name","text"],["Specialty","specialty","text"],["Phone","phone","text"],["Email","email","email"],["Experience","experience","text"],["Rating","rating","number"]].map(([label,key,type]) => (
                <div key={key} className="space-y-2"><label className="text-sm font-medium">{label}</label><Input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
              ))}
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
