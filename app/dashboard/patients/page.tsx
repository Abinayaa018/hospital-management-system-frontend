"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from "lucide-react"
import { api } from "@/lib/api"

type Patient = { _id: string; name: string; age: number; gender: string; phone: string; email: string; status: string; lastVisit: string; condition: string }

const emptyForm = { name: "", age: "", gender: "", phone: "", email: "", status: "Active", lastVisit: "", condition: "" }

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const fetchPatients = async () => {
    try { setPatients(await api.get("/api/patients")) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPatients() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post("/api/patients", form)
    setIsAddOpen(false); setForm(emptyForm); fetchPatients()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.put(`/api/patients/${selectedPatient!._id}`, form)
    setIsEditOpen(false); fetchPatients()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this patient?")) return
    await api.delete(`/api/patients/${id}`)
    fetchPatients()
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.condition?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700"
      case "Critical": return "bg-red-100 text-red-700"
      case "Discharged": return "bg-gray-100 text-gray-700"
      default: return "bg-primary/10 text-primary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage and view patient records</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Patient</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Patient</DialogTitle><DialogDescription>Enter patient information.</DialogDescription></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[["Full Name","name","text","John Doe"],["Age","age","number","25"],["Gender","gender","text","Male / Female"],["Phone","phone","text","+1 234-567-8900"],["Last Visit","lastVisit","date",""],["Condition","condition","text","Primary condition"]].map(([label, key, type, placeholder]) => (
                  <div key={key} className={`space-y-2${key === "condition" ? " sm:col-span-2" : ""}`}>
                    <label className="text-sm font-medium">{label}</label>
                    <Input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
                  </div>
                ))}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="patient@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit">Save Patient</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients by name or condition..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle>All Patients</CardTitle><CardDescription>{filtered.length} patient(s) found</CardDescription></CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Name","Age/Gender","Condition","Status","Last Visit","Actions"].map(h => (
                      <th key={h} className="pb-3 text-sm font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(patient => (
                    <tr key={patient._id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="py-4"><p className="font-medium text-foreground">{patient.name}</p><p className="text-xs text-muted-foreground">{patient.email}</p></td>
                      <td className="py-4 text-sm">{patient.age} / {patient.gender}</td>
                      <td className="py-4 text-sm">{patient.condition}</td>
                      <td className="py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(patient.status)}`}>{patient.status}</span></td>
                      <td className="py-4 text-sm text-muted-foreground">{patient.lastVisit}</td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedPatient(patient); setIsViewOpen(true) }}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedPatient(patient); setForm({ name: patient.name, age: String(patient.age), gender: patient.gender, phone: patient.phone, email: patient.email, status: patient.status, lastVisit: patient.lastVisit, condition: patient.condition }); setIsEditOpen(true) }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(patient._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No patients found.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Patient Details</DialogTitle><DialogDescription>{selectedPatient?.name}</DialogDescription></DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><span className="text-2xl font-bold text-primary">{selectedPatient.name.charAt(0)}</span></div>
                <div><h3 className="text-lg font-semibold">{selectedPatient.name}</h3></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[["Age / Gender",`${selectedPatient.age} / ${selectedPatient.gender}`],["Status",selectedPatient.status],["Condition",selectedPatient.condition],["Last Visit",selectedPatient.lastVisit]].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" />{selectedPatient.phone}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{selectedPatient.email}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Patient</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[["Full Name","name","text"],["Age","age","number"],["Gender","gender","text"],["Phone","phone","text"],["Last Visit","lastVisit","date"],["Condition","condition","text"]].map(([label, key, type]) => (
                <div key={key} className={`space-y-2${key === "condition" ? " sm:col-span-2" : ""}`}>
                  <label className="text-sm font-medium">{label}</label>
                  <Input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
