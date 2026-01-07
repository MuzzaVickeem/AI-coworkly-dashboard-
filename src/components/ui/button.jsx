import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-variants"
import { useAuth, ROLES } from "@/context/AuthContext"

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  showInViewOnly = false, // New prop to explicitly allow buttons in view-only mode
  ...props
}) {
  const { currentRole, isLoggedIn, isDirector } = useAuth();
  const Comp = asChild ? Slot : "button"

  // Automatically apply role-specific gradients for default buttons throughout the project
  let effectiveVariant = variant;
  if (variant === "default" && isLoggedIn) {
    if (currentRole === ROLES.ADMIN) effectiveVariant = "admin";
    if (currentRole === ROLES.DIRECTOR) effectiveVariant = "director";
  }

  // RBAC: Hide or disable action buttons for Director role unless explicitly allowed
  // We hide "default" variant buttons for Directors as they are usually actions (Book, Add, Save, etc.)
  const isActionButton = variant === "default";
  if (isLoggedIn && isDirector && isActionButton && !showInViewOnly) {
    return null; // Hide the action button entirely for Directors
  }

  return (
    <Comp
      data-slot="button"
      data-variant={effectiveVariant}
      data-size={size}
      className={cn(buttonVariants({ variant: effectiveVariant, size, className }))}
      {...props}
    />
  );
}

export { Button }
