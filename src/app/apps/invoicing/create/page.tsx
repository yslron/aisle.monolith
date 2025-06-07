"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Textarea } from "../../../../components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Separator } from "../../../../components/ui/separator"
import { Mail, Plus, Trash2, Send, DollarSign, Users } from "lucide-react"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select"
import { Label } from "../../../../components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"

interface LineItem {
    description: string
    quantity: number
    rate: number
    amount: number
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

export default function CreateInvoicePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('edit')
    const isEditing = !!editId

    const [isLoading, setIsLoading] = useState(false)
    const [savedClients, setSavedClients] = useState<Client[]>([])
    const [selectedClientId, setSelectedClientId] = useState<string>("")

    const [invoiceData, setInvoiceData] = useState<InvoiceData>({
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientName: "",
        clientEmail: "",
        clientCompany: "",
        clientAddress: "",
        yourName: "",
        yourEmail: "",
        yourCompany: "",
        yourAddress: "",
        lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
        notes: "",
        terms: "Payment is due within 30 days of invoice date.",
        currency: "USD",
        taxRate: 0,
        status: "draft",
        total: 0,
    })

    // Load saved clients from localStorage on component mount
    useEffect(() => {
        const saved = localStorage.getItem('invoicing-clients')
        if (saved) {
            try {
                setSavedClients(JSON.parse(saved))
            } catch (error) {
                console.error('Error loading saved clients:', error)
            }
        }
    }, [])

    // Calculate totals
    const subtotal = invoiceData.lineItems.reduce((sum, item) => {
        return sum + (item.quantity * item.rate)
    }, 0)

    const taxAmount = (subtotal * invoiceData.taxRate) / 100
    const total = subtotal + taxAmount

    const updateField = (field: keyof InvoiceData, value: any) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }))
    }

    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId)
        
        if (clientId === "") {
            // Clear client fields when "Manual Entry" is selected
            updateField('clientName', "")
            updateField('clientEmail', "")
            updateField('clientCompany', "")
            updateField('clientAddress', "")
            return
        }

        const selectedClient = savedClients.find(client => client.id === clientId)
        if (selectedClient) {
            updateField('clientName', selectedClient.name)
            updateField('clientEmail', selectedClient.email)
            updateField('clientCompany', selectedClient.company)
            updateField('clientAddress', selectedClient.address)
        }
    }

    const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
        const newLineItems = [...invoiceData.lineItems]
        newLineItems[index] = { ...newLineItems[index], [field]: value }

        // Auto-calculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
            newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].rate
        }

        setInvoiceData(prev => ({ ...prev, lineItems: newLineItems }))
    }

    const addLineItem = () => {
        setInvoiceData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { description: "", quantity: 1, rate: 0, amount: 0 }]
        }))
    }

    const removeLineItem = (index: number) => {
        if (invoiceData.lineItems.length > 1) {
            setInvoiceData(prev => ({
                ...prev,
                lineItems: prev.lineItems.filter((_, i) => i !== index)
            }))
        }
    }

    const generateInvoicePDF = async (data: InvoiceData) => {
        // This would integrate with a PDF generation service
        toast.success("Invoice PDF generated successfully!")
        return "invoice-pdf-url"
    }

    const sendInvoiceEmail = async (data: InvoiceData, pdfUrl: string) => {
        setIsLoading(true)
        try {
            // This would integrate with an email service (like Resend, SendGrid, etc.)
            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: data.clientEmail,
                    clientName: data.clientName,
                    invoiceNumber: data.invoiceNumber,
                    total: total,
                    currency: data.currency,
                    pdfUrl: pdfUrl,
                    fromName: data.yourName,
                    fromEmail: data.yourEmail
                })
            })

            if (response.ok) {
                toast.success(`Invoice sent successfully to ${data.clientEmail}!`)
                // Redirect back to invoices list
                router.push('/apps/invoicing')
            } else {
                throw new Error('Failed to send email')
            }
        } catch (error) {
            toast.error("Failed to send invoice. Please try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (!invoiceData.clientName || !invoiceData.clientEmail) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            const pdfUrl = await generateInvoicePDF(invoiceData)
            await sendInvoiceEmail(invoiceData, pdfUrl)
        } catch (error) {
            console.error(error)
        }
    }

    const saveAsDraft = () => {
        // This would save to your database/storage
        toast.success("Invoice saved as draft!")
        router.push('/apps/invoicing')
    }

    return (
        <div className="max-w-[1024px] mx-auto h-full">
            <header className="flex w-full justify-between items-center mb-6">
                <h1 className="text-3xl font-regular">
                    <span className="pr-1 cursor-pointer text-2xl font-bold" onClick={() => router.back()}>←</span>
                    {isEditing ? "EDIT INVOICE" : "CREATE INVOICE"}
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

            <div className="bg-white border border-primary p-[20px]">
                <div className="w-full">
                    <form onSubmit={handleSubmit} className="space-y-6 w-full">
                        <div className="w-full">
                            {/* Client Information */}
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Client Information
                                    </CardTitle>
                                    <CardDescription>
                                        Select from saved clients or enter information manually
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {savedClients.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="clientSelect">Select Client</Label>
                                            <Select value={selectedClientId} onValueChange={handleClientSelect}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a saved client or enter manually" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Manual Entry</SelectItem>
                                                    {savedClients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name} {client.company && `(${client.company})`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="clientName">Client Name *</Label>
                                        <Input
                                            id="clientName"
                                            placeholder="Jane Smith"
                                            value={invoiceData.clientName}
                                            onChange={(e) => {
                                                updateField('clientName', e.target.value)
                                                // Clear selection if manually typing
                                                if (selectedClientId && e.target.value !== savedClients.find(c => c.id === selectedClientId)?.name) {
                                                    setSelectedClientId("")
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientEmail">Client Email *</Label>
                                        <Input
                                            id="clientEmail"
                                            type="email"
                                            placeholder="jane@client.com"
                                            value={invoiceData.clientEmail}
                                            onChange={(e) => {
                                                updateField('clientEmail', e.target.value)
                                                // Clear selection if manually typing
                                                if (selectedClientId && e.target.value !== savedClients.find(c => c.id === selectedClientId)?.email) {
                                                    setSelectedClientId("")
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientCompany">Company (Optional)</Label>
                                        <Input
                                            id="clientCompany"
                                            placeholder="Client Company Inc"
                                            value={invoiceData.clientCompany}
                                            onChange={(e) => {
                                                updateField('clientCompany', e.target.value)
                                                // Clear selection if manually typing
                                                if (selectedClientId && e.target.value !== savedClients.find(c => c.id === selectedClientId)?.company) {
                                                    setSelectedClientId("")
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientAddress">Address *</Label>
                                        <Textarea
                                            id="clientAddress"
                                            placeholder="456 Client Ave&#10;City, State 54321&#10;Country"
                                            value={invoiceData.clientAddress}
                                            onChange={(e) => {
                                                updateField('clientAddress', e.target.value)
                                                // Clear selection if manually typing
                                                if (selectedClientId && e.target.value !== savedClients.find(c => c.id === selectedClientId)?.address) {
                                                    setSelectedClientId("")
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    {savedClients.length === 0 && (
                                        <div className="flex items-center gap-2 p-3 bg-slate-50 opacity-50 border border-primary">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span className="text-sm text-primary">
                                                No saved clients yet. Add clients in the main invoicing page to quickly select them here.
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Invoice Details */}
                        <Card className="bg-white">
                            <CardHeader>
                                <CardTitle>Invoice Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                        <Input
                                            id="invoiceNumber"
                                            value={invoiceData.invoiceNumber}
                                            onChange={(e) => updateField('invoiceNumber', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invoiceDate">Invoice Date</Label>
                                        <Input
                                            id="invoiceDate"
                                            type="date"
                                            value={invoiceData.invoiceDate}
                                            onChange={(e) => updateField('invoiceDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            value={invoiceData.dueDate}
                                            onChange={(e) => updateField('dueDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Line Items */}
                        <Card className="bg-white">
                            <CardHeader>
                                <CardTitle>Invoice Items</CardTitle>
                                <CardDescription>
                                    Add the services or products you're invoicing for
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="w-24">Qty</TableHead>
                                                <TableHead className="w-32">Rate</TableHead>
                                                <TableHead className="w-32">Amount</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoiceData.lineItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Input
                                                            placeholder="Service description"
                                                            value={item.description}
                                                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.rate}
                                                            onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            ${(item.quantity * item.rate).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeLineItem(index)}
                                                            disabled={invoiceData.lineItems.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addLineItem}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Line Item
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Totals and Settings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle>Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select value={invoiceData.currency} onValueChange={(value) => updateField('currency', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                    <SelectItem value="GBP">GBP</SelectItem>
                                                    <SelectItem value="CAD">CAD</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                            <Input
                                                id="taxRate"
                                                type="number"
                                                step="0.01"
                                                max="100"
                                                value={invoiceData.taxRate}
                                                onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Additional notes for the client"
                                            value={invoiceData.notes}
                                            onChange={(e) => updateField('notes', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="terms">Terms & Conditions</Label>
                                        <Textarea
                                            id="terms"
                                            placeholder="Payment terms and conditions"
                                            value={invoiceData.terms}
                                            onChange={(e) => updateField('terms', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle>Invoice Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        {invoiceData.taxRate > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tax ({invoiceData.taxRate}%):</span>
                                                <span>${taxAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isLoading}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {isLoading ? "Sending..." : "Send Invoice"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={saveAsDraft}
                                        >
                                            Save as Draft
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 