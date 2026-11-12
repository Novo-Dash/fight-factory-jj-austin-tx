import { cn } from '../../lib/utils'
import { useModal } from '../../hooks/useModal'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'white' | 'red'
  size?: 'sm' | 'md' | 'lg'
  openModal?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  openModal: shouldOpenModal = false,
  className,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const { openModal } = useModal()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (shouldOpenModal) {
      // ViewContent é disparado pelo próprio modal ao abrir (analytics.ts).
      // NÃO disparar InitiateCheckout aqui — proibido neste funil (trial grátis).
      openModal()
    }
    onClick?.(e)
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none rounded-full',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        size === 'sm' && 'px-4 py-2 text-sm min-h-[36px]',
        size === 'md' && 'px-6 py-3 text-sm min-h-[44px]',
        size === 'lg' && 'px-8 py-4 text-base min-h-[52px]',
        variant === 'primary' && 'bg-gradient-to-br from-[#262626] to-[#0A0A0A] text-white hover:from-[#333333] hover:to-[#1A1A1A] hover:scale-[1.02] active:scale-[0.99]',
        variant === 'white' && 'bg-white text-[#0A0A0A] hover:bg-[#F0F0F0] shadow-[0_4px_24px_rgba(255,255,255,0.25)] hover:shadow-[0_6px_32px_rgba(255,255,255,0.35)] hover:scale-[1.03] active:scale-[0.98]',
        variant === 'red' && 'bg-[#CC0000] text-white hover:bg-[#B30000] shadow-[0_4px_24px_rgba(204,0,0,0.35)] hover:shadow-[0_6px_32px_rgba(204,0,0,0.5)] hover:scale-[1.03] active:scale-[0.98]',
        variant === 'secondary' && 'border border-[#D8D8D8] text-[#0A0A0A] hover:border-[#0A0A0A] bg-transparent',
        variant === 'ghost' && 'text-[#666666] hover:text-[#0A0A0A] bg-transparent',
        className
      )}
      onClick={handleClick}
      // Black Friday: marca os botões que abrem o form (abas da roupagem, src/blackfriday/ctafx.ts)
      data-book={shouldOpenModal || undefined}
      {...props}
    >
      {children}
    </button>
  )
}
