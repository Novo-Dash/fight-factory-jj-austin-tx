import { useBooking } from '../nd'

// Novo Dash kit: the page's buttons keep calling useModal(); the funnel itself lives in src/nd.
export function useModal() {
  const booking = useBooking()
  return { isOpen: booking.isOpen, openModal: () => booking.open(), closeModal: booking.close }
}
