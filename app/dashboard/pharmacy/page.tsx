"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Package, AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

type Medicine = { _id: string; name: string; category: string; stock: number; unit: string; price: number; supplier: string; expiry: string; status: string }

const emptyForm = { name: "", category: "", stock: "", unit: "Tablets", price: "", supplier: "", expiry: "", status: "In Stock" }

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const fetchMedicines = async () => {
    try { setMedicines(await api.get("/api/medicines")) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMedicines() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post("/api/medicines", { ...form, stock: parseInt(form.stock), price: parseFloat(form.price) })
    setIsAddOpen(false); setForm(emptyForm); fetchMedicines()
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.put(`/api/medicines/${selectedMedicine!._id}`, { ...form, stock: parseInt(form.stock), price: parseFloat(form.price) })
    setIsEditOpen(false); fetchMedicines()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this medicine?")) return
    await api.delete(`/api/medicines/${id}`)
    fetchMedicines()
  }

  const categories = ["All", ...Array.from(new Set(medicines.map(m => m.category).filter(Boolean)))]

  const filtered = medicines.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "All" || m.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (s: string) => ({ "In Stock": "bg-green-100 text-green-700", "Low Stock": "bg-yellow-100 text-yellow-700", "Out of Stock": "bg-red-100 text-red-700" }[s] || "bg-muted text-muted-foreground")
  const getStatusIcon = (s: string) => s === "In Stock" ? <CheckCircle className="h-4 w-4 text-green-600" /> : s === "Low Stock" ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> : <XCircle className="h-4 w-4 text-red-600" />

  const inStock = medicines.filter(m => m.status === "In Stock").length
  const lowStock = medicines.filter(m => m.status === "Low Stock").length
  const outOfStock = medicines.filter(m => m.status === "Out of Stock").length

  const FormFields = () => <>
    {[["Medicine Name","name","text","sm:col-span-2"],["Category","category","text",""],["Stock","stock","number",""],["Price ($)","price","number",""],["Expiry Date","expiry","date",""],["Supplier","supplier","text","sm:col-span-2"],["Unit","unit","text",""]].map(([label,key,type,span]) => (
      <div key={key} className={`space-y-2 ${span}`}><label className="text-sm font-medium">{label}</label><Input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
    ))}
    <div className="space-y-2"><label className="text-sm font-medium">Status</label>
      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
        {["In Stock","Low Stock","Out of Stock"].map(s => <option key={s}>{s}</option>)}
      </select>
    </div>
  </>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold text-foreground">Pharmacy</h1><p className="text-muted-foreground">Manage medicine inventory and stock</p></div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Medicine</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Medicine</DialogTitle><DialogDescription>Enter medicine details.</DialogDescription></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FormFields /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button><Button type="submit">Add Medicine</Button></div></form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[["In Stock", inStock, "text-green-600", CheckCircle, "bg-green-100", "text-green-600"],
          ["Low Stock", lowStock, "text-yellow-600", AlertTriangle, "bg-yellow-100", "text-yellow-600"],
          ["Out of Stock", outOfStock, "text-red-600", XCircle, "bg-red-100", "text-red-600"]
        ].map(([label, value, textColor, Icon, bgColor, iconColor]) => (
          <Card key={label as string} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-muted-foreground">{label as string}</p><p className={`mt-1 text-2xl font-bold ${textColor as string}`}>{value as number}</p></div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor as string}`}><Icon className={`h-6 w-6 ${iconColor as string}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search medicines..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" /></div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(c => <Button key={c} variant={filterCategory === c ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(c)} className="whitespace-nowrap">{c}</Button>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle>Inventory</CardTitle><CardDescription>Complete list of medicines</CardDescription></CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-left">{["Medicine","Category","Stock","Price","Expiry","Status","Actions"].map(h => <th key={h} className="pb-3 text-sm font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(medicine => (
                    <tr key={medicine._id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="py-4"><p className="font-medium text-foreground">{medicine.name}</p><p className="text-xs text-muted-foreground">{medicine.supplier}</p></td>
                      <td className="py-4"><span className="rounded bg-muted px-2 py-1 text-xs">{medicine.category}</span></td>
                      <td className="py-4 text-sm">{medicine.stock} {medicine.unit}</td>
                      <td className="py-4 text-sm font-medium">${medicine.price?.toFixed(2)}</td>
                      <td className="py-4 text-sm text-muted-foreground">{medicine.expiry}</td>
                      <td className="py-4"><div className="flex items-center gap-2">{getStatusIcon(medicine.status)}<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(medicine.status)}`}>{medicine.status}</span></div></td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedMedicine(medicine); setForm({ name: medicine.name, category: medicine.category, stock: String(medicine.stock), unit: medicine.unit, price: String(medicine.price), supplier: medicine.supplier, expiry: medicine.expiry, status: medicine.status }); setIsEditOpen(true) }}><Edit className="mr-2 h-4 w-4" />Edit Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(medicine._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No medicines found.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Medicine</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FormFields /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></div></form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
