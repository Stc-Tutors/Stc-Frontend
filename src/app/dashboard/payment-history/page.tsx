"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Download } from "lucide-react"
import Loading from "../../loading"
import { GetPaymentsAction } from "@/server/payment"
import { Payment, PaymentStatus } from "@/types/payment"



export default function PaymentHistoryPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const loadPayments = async () => {
      try {
       const [data, error] = await GetPaymentsAction()
        if (error) {
          console.error("Failed to load payments:", error)
          return
        }
        setPayments(data?.data || [])
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPayments()
  }, [])

  useEffect(() => {
    let filtered = payments

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          // payment.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.reference.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return "bg-green-100 text-green-800"
      case PaymentStatus.FAILED:
        return "bg-red-100 text-red-800"
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/receipt`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `receipt-${paymentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to download receipt:", error)
    }
  }

  if (isLoading) {
     return <Loading/>
   }

  return (
    <div className="w-full flex-1 bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600">View all your payment transactions</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦
                  {filteredPayments
                    .filter((p) => p.status === PaymentStatus.COMPLETED)
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Successful Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredPayments.filter((p) => p.status === PaymentStatus.COMPLETED).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredPayments.filter((p) => p.status === PaymentStatus.PENDING).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by child name or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={PaymentStatus.COMPLETED}>Successful</SelectItem>
                    <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Records */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 mb-4">No payment records found</p>
                <Button onClick={() => router.push("/dashboard/enroll")}>Make Your First Payment</Button>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{payment.student.fullName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{payment.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">₦{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{payment.method}</p>
                        <p className="text-xs text-gray-400">Ref: {payment.reference}</p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/enroll/review/${payment.enrollmentId}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button> */}

                        {payment.status === PaymentStatus.COMPLETED && (
                          <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(payment.id)}>
                            <Download className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
