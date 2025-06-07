"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Plus, Edit, Trash2, FileText, User, Users } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface LineItem {
    description: string
    quantity: number
    rate: number
    amount: number
}

interface InvoiceData {
    id?: string
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    clientName: string
    clientEmail: string
    clientCompany: string
    clientAddress: string
    yourName: string
    yourEmail: string
    yourCompany: string
    yourAddress: string
    lineItems: LineItem[]
    notes: string
    terms: string
    currency: string
    taxRate: number
    status: "draft" | "sent" | "paid" | "overdue"
    total: number
}

interface BusinessInfo {
    name: string
    email: string
    company: string
    address: string
    phone: string
    website: string
    taxId: string
}

interface Client {
    id: string
    name: string
    email: string
    company: string
    address: string
    phone: string
    website?: string
    notes?: string
}

export default function InvoicingPage() {
    const router = useRouter()
    const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([])
    const [activeTab, setActiveTab] = useState<"all" | "draft" | "sent" | "paid" | "account" | "clients">("all")
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        name: "",
        email: "",
        company: "",
        address: "",
        phone: "",
        website: "",
        taxId: ""
    })
    const [clients, setClients] = useState<Client[]>([])
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [isClientModalOpen, setIsClientModalOpen] = useState(false)
    const [clientForm, setClientForm] = useState<Omit<Client, 'id'>>({
        name: "",
        email: "",
        company: "",
        address: "",
        phone: "",
        website: "",
        notes: ""
    })

    // Load clients from localStorage on component mount
    useEffect(() => {
        const saved = localStorage.getItem('invoicing-clients')
        if (saved) {
            try {
                setClients(JSON.parse(saved))
            } catch (error) {
                console.error('Error loading saved clients:', error)
            }
        }
    }, [])

    // Filter invoices based on active tab
    const filteredInvoices = savedInvoices.filter(invoice => {
        if (activeTab === "all") return true
        return invoice.status === activeTab
    })

    const handleEdit = (invoice: InvoiceData) => {
        // Navigate to create page with edit query parameter
        router.push(`/apps/invoicing/create?edit=${invoice.id}`)
    }

    const handleDelete = (invoiceId: string) => {
        setSavedInvoices(prev => prev.filter(inv => inv.id !== invoiceId))
        toast.success("Invoice deleted successfully!")
    }

    const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
        setBusinessInfo(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSaveBusinessInfo = () => {
        // Here you would typically save to a backend or local storage
        toast.success("Business information saved successfully!")
    }

    const handleClientFormChange = (field: keyof Omit<Client, 'id'>, value: string) => {
        setClientForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

        const handleSaveClient = () => {
        if (!clientForm.name || !clientForm.email) {
            toast.error("Name and email are required!")
            return
        }

        let updatedClients: Client[]

        if (editingClient) {
            // Update existing client
            updatedClients = clients.map(client => 
                client.id === editingClient.id 
                    ? { ...clientForm, id: editingClient.id }
                    : client
            )
            setClients(updatedClients)
            toast.success("Client updated successfully!")
        } else {
            // Add new client
            const newClient: Client = {
                ...clientForm,
                id: Date.now().toString()
            }
            updatedClients = [...clients, newClient]
            setClients(updatedClients)
            toast.success("Client added successfully!")
        }

        // Save to localStorage for use in create invoice page
        localStorage.setItem('invoicing-clients', JSON.stringify(updatedClients))

        // Reset form
        setClientForm({
            name: "",
            email: "",
            company: "",
            address: "",
            phone: "",
            website: "",
            notes: ""
        })
        setEditingClient(null)
        setIsClientModalOpen(false)
    }

    const handleEditClient = (client: Client) => {
        setClientForm({
            name: client.name,
            email: client.email,
            company: client.company,
            address: client.address,
            phone: client.phone,
            website: client.website || "",
            notes: client.notes || ""
        })
        setEditingClient(client)
        setIsClientModalOpen(true)
    }

    const handleDeleteClient = (clientId: string) => {
        const updatedClients = clients.filter(client => client.id !== clientId)
        setClients(updatedClients)
        // Update localStorage
        localStorage.setItem('invoicing-clients', JSON.stringify(updatedClients))
        toast.success("Client deleted successfully!")
    }

    const handleCancelClientForm = () => {
        setClientForm({
            name: "",
            email: "",
            company: "",
            address: "",
            phone: "",
            website: "",
            notes: ""
        })
        setEditingClient(null)
        setIsClientModalOpen(false)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "draft": return "bg-gray-100 text-gray-800"
            case "sent": return "bg-blue-100 text-blue-800"
            case "paid": return "bg-green-100 text-green-800"
            case "overdue": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const renderAccountDetails = () => (
        <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">Account Details</h2>
                    <p className="text-sm text-gray-600">Enter your business information for invoices</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                            id="name"
                            value={businessInfo.name}
                            onChange={(e) => handleBusinessInfoChange("name", e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={businessInfo.email}
                            onChange={(e) => handleBusinessInfoChange("email", e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                            id="company"
                            value={businessInfo.company}
                            onChange={(e) => handleBusinessInfoChange("company", e.target.value)}
                            placeholder="Your Company Inc."
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={businessInfo.phone}
                            onChange={(e) => handleBusinessInfoChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            value={businessInfo.website}
                            onChange={(e) => handleBusinessInfoChange("website", e.target.value)}
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="taxId">Tax ID / EIN</Label>
                        <Input
                            id="taxId"
                            value={businessInfo.taxId}
                            onChange={(e) => handleBusinessInfoChange("taxId", e.target.value)}
                            placeholder="12-3456789"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Textarea
                            id="address"
                            value={businessInfo.address}
                            onChange={(e) => handleBusinessInfoChange("address", e.target.value)}
                            placeholder="123 Business St&#10;Suite 100&#10;City, State 12345"
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSaveBusinessInfo}>
                    Save Business Information
                </Button>
            </div>
        </div>
    )

    const renderClientsTab = () => (
        <div className="space-y-6 w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium">Client Management</h2>
                    <p className="text-sm text-gray-600">Manage your client information for easy invoice creation</p>
                </div>
                <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Client
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingClient ? "Edit Client" : "Add New Client"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="clientName">Client Name *</Label>
                                <Input
                                    id="clientName"
                                    value={clientForm.name}
                                    onChange={(e) => handleClientFormChange("name", e.target.value)}
                                    placeholder="Enter client name"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientEmail">Email Address *</Label>
                                <Input
                                    id="clientEmail"
                                    type="email"
                                    value={clientForm.email}
                                    onChange={(e) => handleClientFormChange("email", e.target.value)}
                                    placeholder="client@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientCompany">Company Name</Label>
                                <Input
                                    id="clientCompany"
                                    value={clientForm.company}
                                    onChange={(e) => handleClientFormChange("company", e.target.value)}
                                    placeholder="Client Company Inc."
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientPhone">Phone Number</Label>
                                <Input
                                    id="clientPhone"
                                    value={clientForm.phone}
                                    onChange={(e) => handleClientFormChange("phone", e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientWebsite">Website</Label>
                                <Input
                                    id="clientWebsite"
                                    value={clientForm.website}
                                    onChange={(e) => handleClientFormChange("website", e.target.value)}
                                    placeholder="https://clientwebsite.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="clientAddress">Address</Label>
                                <Textarea
                                    id="clientAddress"
                                    value={clientForm.address}
                                    onChange={(e) => handleClientFormChange("address", e.target.value)}
                                    placeholder="123 Client St, City, State 12345"
                                    rows={2}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="clientNotes">Notes</Label>
                                <Textarea
                                    id="clientNotes"
                                    value={clientForm.notes}
                                    onChange={(e) => handleClientFormChange("notes", e.target.value)}
                                    placeholder="Additional notes about this client..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={handleCancelClientForm}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveClient}>
                                {editingClient ? "Update Client" : "Save Client"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col gap-4 items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-500">No clients added yet</h3>
                    <p className="text-sm text-gray-400">Add your first client to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.company || "-"}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.phone || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClient(client)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClient(client.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )

    return (
        <div className="w-full min-h-screen overflow-x-hidden  py-[20px] px-[20px]">
            <div className="max-w-[1024px] mx-auto">
                <header className="flex w-full justify-between items-center">
                    <h1 className="text-3xl font-regular">
                        <span className="pr-1 cursor-pointer text-2xl font-bold" onClick={() => router.back()}>←</span>
                        INVOICES
                    </h1>
                    <h1 className="text-3xl font-regular">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        }).toUpperCase()} - {new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        }).toUpperCase()}
                    </h1>
                </header>

                <section className="flex flex-col mt-[20px]">
                    <div className="flex justify-between">
                        <div className="flex">
                            <div
                                className={`border-t border-x border-primary px-[5px] py-[5px] flex gap-2 cursor-pointer ${activeTab === "all" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                                onClick={() => setActiveTab("all")}
                            >
                                <h1 className="text-base font-regular">ALL INVOICES</h1>
                                <div className="flex items-center justify-center bg-primary text-white px-2">
                                    {savedInvoices.length}
                                </div>
                            </div>
                            <div
                                className={`border-t border-r border-primary px-[5px] py-[5px] flex gap-2 cursor-pointer ${activeTab === "draft" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                                onClick={() => setActiveTab("draft")}
                            >
                                <h1 className="text-base font-regular">DRAFTS</h1>
                                <div className="flex items-center justify-center bg-primary text-white px-2">
                                    {savedInvoices.filter(inv => inv.status === "draft").length}
                                </div>
                            </div>
                            <div
                                className={`border-t border-r border-primary px-[5px] py-[5px] flex gap-2 cursor-pointer ${activeTab === "sent" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                                onClick={() => setActiveTab("sent")}
                            >
                                <h1 className="text-base font-regular">SENT</h1>
                                <div className="flex items-center justify-center bg-primary text-white px-2">
                                    {savedInvoices.filter(inv => inv.status === "sent").length}
                                </div>
                            </div>
                            <div
                                className={`border-t border-r border-primary px-[5px] py-[5px] flex gap-2 cursor-pointer ${activeTab === "paid" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                                onClick={() => setActiveTab("paid")}
                            >
                                <h1 className="text-base font-regular">PAID</h1>
                                <div className="flex items-center justify-center bg-primary text-white px-2">
                                    {savedInvoices.filter(inv => inv.status === "paid").length}
                                </div>
                            </div>
                        </div>
                        <div className="flex">
                            <div
                            className={`border-t border-x border-primary px-[5px] py-[5px] flex justify-center items-center gap-2 cursor-pointer ${activeTab === "clients" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                            onClick={() => setActiveTab("clients")}
                        >
                            <Users className="h-4 w-4" />
                            <h1 className="text-base font-regular">CLIENTS</h1>
                            <div className="flex items-center justify-center bg-primary text-white px-2">
                                {clients.length}
                            </div>
                        </div>
                            <div
                                className={`border-t border-r border-primary px-[5px] py-[5px] flex justify-center items-center gap-2 cursor-pointer ${activeTab === "account" ? "bg-white" : "bg-white opacity-50 hover:opacity-100"}`}
                                onClick={() => setActiveTab("account")}
                            >
                                <User className="h-4 w-4" />
                                <h1 className="text-base font-regular">ACCOUNT DETAILS</h1>
                            </div></div>
                    </div>

                    <div className="border flex flex-col justify-center items-center p-[20px] bg-white ">
                        {activeTab === "account" ? (
                            renderAccountDetails()
                        ) : activeTab === "clients" ? (
                            renderClientsTab()
                        ) : filteredInvoices.length === 0 ? (
                            <div className="flex flex-col gap-[10px]w-full items-center justify-center py-[40px]">
                                <Image src="/assets/icons/file-text.svg" alt="invoices" width={50} height={50} />
                                <h1 className="text-base font-regular opacity-50">No invoices found</h1>
                                <Button
                                    onClick={() => router.push('/apps/invoicing/create')}
                                    className="mt-4  hover:bg-secondary hover:border-primary hover:cursor-pointer border hover:text-primary"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Invoice
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium">
                                        {activeTab === "all" ? "All Invoices" :
                                            activeTab === "draft" ? "Draft Invoices" :
                                                activeTab === "sent" ? "Sent Invoices" : "Paid Invoices"}
                                    </h2>
                                    <Button
                                        onClick={() => router.push('/apps/invoicing/create')}
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Invoice
                                    </Button>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{invoice.clientName}</div>
                                                        <div className="text-sm text-gray-500">{invoice.clientCompany}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{invoice.invoiceDate}</TableCell>
                                                <TableCell>{invoice.dueDate}</TableCell>
                                                <TableCell className="font-medium">
                                                    {invoice.currency} ${invoice.total.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getStatusColor(invoice.status)}
                                                        variant="secondary"
                                                    >
                                                        {invoice.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(invoice)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(invoice.id!)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
