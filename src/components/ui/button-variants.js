import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 hover:scale-[1.03] active:scale-[0.97]",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-[#FF0080] to-[#7928CA] text-white shadow-[0_4px_14px_0_rgba(121,40,202,0.39)] hover:shadow-[0_6px_20px_rgba(255,0,128,0.23)] border-none",
                destructive:
                    "bg-destructive text-white shadow-sm hover:bg-destructive/90",
                outline:
                    "border-2 border-slate-200 bg-white text-slate-700 hover:border-[#7928CA] hover:text-[#7928CA] hover:bg-slate-50",
                secondary:
                    "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",
                ghost:
                    "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-8 py-3",
                sm: "h-10 px-6 py-2 text-xs",
                lg: "h-14 px-10 py-4 text-base",
                icon: "size-12",
                "icon-sm": "size-10",
                "icon-lg": "size-14",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);
