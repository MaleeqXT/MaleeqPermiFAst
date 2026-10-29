import BookingDrawer from "../monitordashboard/BookingDrawer.jsx";
import "./ReservationDetailDrawer.css";

export default function ReservationDetailDrawer({ reservation, onClose, onOpenMonitor, onDeleteReservation, onMarkUnavailable, onEditReservation }) {
  if (!reservation) {
    return null;
  }

  return (
    <BookingDrawer
      booking={reservation}
      onClose={onClose}
      onOpenMonitor={onOpenMonitor}
      onDeleteReservation={onDeleteReservation}
      onMarkUnavailable={onMarkUnavailable}
      onEditReservation={onEditReservation}
      drawerTitle="Reservation details"
      primaryActionLabel="Immediate call"
    />
  );
}
