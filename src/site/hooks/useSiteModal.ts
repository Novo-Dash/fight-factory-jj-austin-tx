/**
 * O contexto de modal DO SITE.
 *
 * A LP migrou para o kit `src/nd` em 24/09 e `src/hooks/useModal` virou um
 * atalho para `useBooking()` do kit. O site institucional continua no seu
 * proprio formulario (`src/booking`), aprovado pelo cliente com o painel
 * THE RECORD, entao precisa do contexto original. Os dois convivem: a LP no
 * kit, o site aqui. Migrar o site para o kit e tarefa separada.
 */
import { createContext, useContext, useState, useCallback } from 'react'

interface ModalContextValue {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextValue>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
})

export function useModal() {
  return useContext(ModalContext)
}

export function useModalState() {
  const [isOpen, setIsOpen] = useState(false)
  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])
  return { isOpen, openModal, closeModal }
}
