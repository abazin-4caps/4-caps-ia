import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(description, {
        description: title
      })
    } else {
      sonnerToast(title || description, {
        description: title ? description : undefined
      })
    }
  }

  return { toast }
} 