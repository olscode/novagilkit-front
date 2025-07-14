import './Modal.scss';

interface ModalPropsI {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean; // New prop to control close button visibility
}
export default function Modal(modalProps: ModalPropsI) {
  if (!modalProps.isOpen) {
    return null;
  }

  const handleBackdropClick = () => {
    if (modalProps.closeOnBackdropClick !== false) {
      // Default to true if undefined
      modalProps.onClose?.();
    }
  };

  return (
    <div
      className={`modal-backdrop ${modalProps.isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick} // Updated onClick handler
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {' '}
        {/* Prevent click through to backdrop */}
        <div className="modal-header">
          <h2>{modalProps.title}</h2>
          {(modalProps.showCloseButton === undefined ||
            modalProps.showCloseButton === true) && ( // Show by default or if true
            <button
              className="close-button"
              onClick={modalProps.onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          )}
        </div>
        <div className="modal-content">{modalProps.children}</div>
      </div>
    </div>
  );
}
