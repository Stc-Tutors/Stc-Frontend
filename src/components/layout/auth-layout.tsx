"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense, type ReactNode } from "react"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  onBack?: () => void
  showBackButton?: boolean
}

export default function AuthLayout({ title, subtitle, children, onBack, showBackButton = true }: AuthLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      {showBackButton && (
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 pt-0 pb-12">
        <div className="w-full max-w-md space-y-8 bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>

          {/* Form Content */}
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <div className="">{children}</div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
