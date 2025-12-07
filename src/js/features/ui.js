// UI Utilities - Modal and Feedback Functions

// Modal Elements (will be initialized on DOM load)
let modal, modalTitle, modalMessage, modalConfirmBtn, modalCancelBtn, feedbackMessage;

function initializeUIElements() {
    modal = document.getElementById('custom-modal');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    modalConfirmBtn = document.getElementById('modal-confirm-btn');
    modalCancelBtn = document.getElementById('modal-cancel-btn');
    feedbackMessage = document.getElementById('feedback-message');
}

// Custom Modal Functions
function showAlert(title, message) {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCancelBtn.style.display = 'none';
        modalConfirmBtn.textContent = 'OK';

        modal.classList.remove('hidden');

        const handleConfirm = () => {
            modal.classList.add('hidden');
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            resolve(true);
        };

        modalConfirmBtn.addEventListener('click', handleConfirm);

        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        const handleOverlayClick = () => {
            modal.classList.add('hidden');
            overlay.removeEventListener('click', handleOverlayClick);
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            resolve(true);
        };
        overlay.addEventListener('click', handleOverlayClick);
    });
}

function showConfirm(title, message) {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCancelBtn.style.display = 'inline-block';
        modalConfirmBtn.textContent = 'Conferma';

        modal.classList.remove('hidden');

        const handleConfirm = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            modalCancelBtn.removeEventListener('click', handleCancel);
            overlay.removeEventListener('click', handleCancel);
        };

        modalConfirmBtn.addEventListener('click', handleConfirm);
        modalCancelBtn.addEventListener('click', handleCancel);

        // Close on overlay click (same as cancel)
        const overlay = modal.querySelector('.modal-overlay');
        overlay.addEventListener('click', handleCancel);
    });
}

// Feedback
function showFeedback(message, isCorrect) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message ' + (isCorrect ? 'correct' : 'incorrect');

    // Hide after 1.5 seconds
    setTimeout(() => {
        feedbackMessage.classList.add('hidden');
    }, 1500);
}

export {
    initializeUIElements,
    showAlert,
    showConfirm,
    showFeedback
};
