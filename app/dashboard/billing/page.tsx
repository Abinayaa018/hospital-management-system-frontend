"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Download, DollarSign, TrendingUp, Receipt, CreditCard, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

type Invoice = { _id: string; patientName: string; date: string; amount: number; status: string; items: string[] }

const emptyForm = { patientName: "", date: "", amount: "", status: "Pending", items: "" }

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const fetchInvoices = async () => {
    try { setInvoices(await api.get("/api/invoices")) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post("/api/invoices", { ...form, amount: parseFloat(form.amount), items: form.items.split(",").map(i => i.trim()) })
    setIsAddOpen(false); setForm(emptyForm); fetchInvoices()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return
    await api.delete(`/api/invoices/${id}`)
    fetchInvoices()
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    await api.put(`/api/invoices/${id}`, { status })
    fetchInvoices()
  }

  const filtered = invoices.filter(inv =>
    inv.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700"
      case "Pending": return "bg-yellow-100 text-yellow-700"
      case "Partial": return "bg-blue-100 text-blue-700"
      case "Overdue": return "bg-red-100 text-red-700"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0)
  const paidAmount = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0)
  const pendingAmount = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold text-foreground">Billing</h1><p className="text-muted-foreground">Manage invoices and payments</p></div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Create Invoice</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create New Invoice</DialogTitle><DialogDescription>Generate a new invoice.</DialogDescription></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Patient Name</label><Input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Services (comma separated)</label><Input placeholder="Consultation, Blood Test" value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Amount ($)</label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button><Button type="submit">Create Invoice</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[["Total Revenue", `$${totalRevenue.toLocaleString()}`, "text-foreground", DollarSign, "bg-primary/10", "text-primary"],
          ["Collected", `$${paidAmount.toLocaleString()}`, "text-green-600", TrendingUp, "bg-green-100", "text-green-600"],
          ["Pending", `$${pendingAmount.toLocaleString()}`, "text-yellow-600", Receipt, "bg-yellow-100", "text-yellow-600"]
        ].map(([label, value, textColor, Icon, bgColor, iconColor]) => (
          <Card key={label as string} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-muted-foreground">{label as string}</p><p className={`mt-1 text-2xl font-bold ${textColor as string}`}>{value as string}</p></div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor as string}`}><Icon className={`h-6 w-6 ${iconColor as string}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search invoices..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" /></div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle>Invoices</CardTitle><CardDescription>All billing records</CardDescription></CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border text-left">{["Patient","Date","Amount","Status","Actions"].map(h => <th key={h} className="pb-3 text-sm font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(invoice => (
                    <tr key={invoice._id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="py-4 text-sm font-medium text-foreground">{invoice.patientName}</td>
                      <td className="py-4 text-sm text-muted-foreground">{invoice.date}</td>
                      <td className="py-4 text-sm font-semibold">${invoice.amount?.toFixed(2)}</td>
                      <td className="py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedInvoice(invoice); setIsViewOpen(true) }}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(invoice._id, "Paid")}><CreditCard className="mr-2 h-4 w-4" />Mark as Paid</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(invoice._id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No invoices found.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div><p className="text-sm text-muted-foreground">Patient</p><p className="font-semibold">{selectedInvoice.patientName}</p></div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>{selectedInvoice.status}</span>
              </div>
              <div><p className="mb-2 text-sm font-medium text-muted-foreground">Services</p>
                <ul className="space-y-2">{selectedInvoice.items?.map((item, i) => <li key={i} className="rounded-lg border border-border/50 p-3 text-sm">{item}</li>)}</ul>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">${selectedInvoice.amount?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
