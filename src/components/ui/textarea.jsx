// components/ui/textarea.jsx
import * as React from "react"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-20 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }