import * as React from "react"
import { Label } from "@/components/atoms/Label"
import { Input } from "@/components/atoms/Input"
import { useFieldSession } from "@/store/useFieldSession"
import { cn } from "@/lib/utils"

interface CodeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function CodeInput({ className, ...props }: CodeInputProps) {
  const { value, error, setValue, mounted } = useFieldSession("codeInput")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const displayValue = mounted ? (value as string) || "" : ""

  return (
    <div className="flex flex-col gap-2 p-2 w-full">
      <Label
        htmlFor="codeInput"
        className={cn("cursor-pointer", error ? "text-red-500" : "")}
      >
        Your invitation code
      </Label>
      <Input
        id="codeInput"
        value={displayValue}
        onChange={handleChange}
        placeholder="Enter your code"
        className={cn(
          "w-full transition-colors",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "focus-visible:ring-brand-500/40 focus-visible:border-brand-500",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium italic">{error}</span>
      )}
    </div>
  )
}
