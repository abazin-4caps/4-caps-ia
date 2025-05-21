import * as React from "react"
import { toast } from "react-hot-toast"

interface ToastProps {
  title: string
  description: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const notify = ({ title, description, variant = "default" }: ToastProps) => {
    toast(
      <div className="flex flex-col gap-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>,
      {
        duration: 3000,
        style: {
          background: variant === "destructive" ? "#fee2e2" : "#fff",
          color: variant === "destructive" ? "#991b1b" : "#000",
        },
      }
    )
  }

  return {
    toast: notify,
  }
} 