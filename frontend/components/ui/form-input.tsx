"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  value: string
  onValueChange: (value: string) => void
}

export function FormInput({
  label,
  id,
  value,
  onValueChange,
  className,
  required,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          `
          border-none 
          bg-transparent 
          outline-none 
          ring-0
          focus:outline-none 
          focus:ring-0 
          focus:shadow-[inset_0_0_6px_rgba(0,0,0,0.15)]
          transition-shadow
        `,
          className
        )}
        required={required}
        {...props}
      />
    </div>
  )
}
