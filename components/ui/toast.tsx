"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const toast = ToastPrimitive.createToastManager()

const ToastProvider = ({ ...props }: ToastPrimitive.Provider.Props) => {
  return <ToastPrimitive.Provider {...props} />
};

const ToastPortal = ({ ...props }: ToastPrimitive.Portal.Props) => {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
};

const ToastViewport = ({ className, ...props }: ToastPrimitive.Viewport.Props) => {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-2 w-full max-w-md px-4 outline-none",
        className
      )}
      {...props}
    />
  )
};

const Toast = ({ className, ...props }: ToastPrimitive.Root.Props) => {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto relative w-full rounded-xl border border-border/80 bg-background/95 backdrop-blur-md text-foreground shadow-lg transition-all duration-300 ease-out outline-none select-none",
        "data-starting-style:-translate-y-3 data-starting-style:opacity-0",
        "data-ending-style:-translate-y-3 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  )
};

const ToastContent = ({ className, ...props }: ToastPrimitive.Content.Props) => {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex items-center gap-3 p-3.5",
        className
      )}
      {...props}
    />
  )
};

const ToastTitle = ({ className, ...props }: ToastPrimitive.Title.Props) => {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium leading-tight", className)}
      {...props}
    />
  )
};

const ToastDescription = ({
  className,
  ...props
}: ToastPrimitive.Description.Props) => {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
};

const ToastAction = ({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) => {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
};

const ToastClose = ({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) => {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className
      )}
      {...props}
    >
      {children ?? (
        <XIcon aria-hidden="true" />
      )}
    </ToastPrimitive.Close>
  )
};

const ToastIcon = ({ type }: { type: string | undefined }) => {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = (
      <CircleCheckIcon aria-hidden="true" />
    )
  }

  if (type === "info") {
    icon = (
      <InfoIcon aria-hidden="true" />
    )
  }

  if (type === "warning") {
    icon = (
      <TriangleAlertIcon aria-hidden="true" />
    )
  }

  if (type === "error") {
    icon = (
      <OctagonXIcon className="text-destructive" aria-hidden="true" />
    )
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon className="animate-spin" aria-hidden="true" />
    )
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  )
};

const ToastList = () => {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
};

const Toaster = ({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) => {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
};

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
