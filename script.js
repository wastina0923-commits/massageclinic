/**
 * INFS7009 - Massage Clinic Management System
 * Description: Client-side logic for booking, automatic calculations, and real-time data updates.
 * Contemporary Web Standards: Event Listeners, DOM Manipulation, and Dynamic Date Handling.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Initialize Page Data & Live Clock ---
    const dateSubtitle = document.querySelector('.subtitle'); 
    const dateInput = document.getElementById('appointmentDate');
    const liveDateEl = document.getElementById('live-date'); 

    // Function to update the clock every second
    function updateClock() {
        const now = new Date();

        // Format for Date: Tuesday, 31 March 2026
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Format for Time: 20:30:45 (24-hour format)
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

        const formattedDate = now.toLocaleDateString('en-AU', dateOptions);
        const formattedTime = now.toLocaleTimeString('en-AU', timeOptions);

        // Update Homepage Header (e.g., Tuesday, 31 March 2026 | 20:30:45)
        if (liveDateEl) {
            liveDateEl.textContent = `${formattedDate} | ${formattedTime}`;
        }

        // Update form subtitle (Only shows Date, usually doesn't need to tick seconds)
        if (dateSubtitle) {
            dateSubtitle.textContent = `Today is ${formattedDate}`;
        }
    }

    // Start the clock immediately and set it to repeat every 1000ms (1 second)
    updateClock();
    setInterval(updateClock, 1000);

    // Set the default appointment date (YYYY-MM-DD) - This only needs to run once
    if (dateInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }


    // --- 2. Automatic Gap Payment Calculation Logic ---
    const totalInput = document.getElementById('totalPrice');
    const insuranceInput = document.getElementById('insuranceClaim');
    const gapInput = document.getElementById('gapPayment');

    /**
     * Formula: Gap = Total Price - Insurance Claim
     * This updates in real-time as the user types.
     */
    function calculateGap() {
        if (!totalInput || !insuranceInput || !gapInput) return;

        const total = parseFloat(totalInput.value) || 0;
        const insurance = parseFloat(insuranceInput.value) || 0;
        const gap = total - insurance;

        // Display results to two decimal places
        gapInput.value = gap >= 0 ? gap.toFixed(2) : "0.00";
        
        // Visual feedback based on calculation
        if (gap === 0 && total > 0) {
            gapInput.style.color = "#8D6E63"; // Muted brown for zero gap
        } else {
            gapInput.style.color = "#4E342E"; // Standard text color
        }
    }

    if (totalInput && insuranceInput) {
        totalInput.addEventListener('input', calculateGap);
        insuranceInput.addEventListener('input', calculateGap);
    }


    // --- 3. Customer Records Search Functionality ---
    const searchInput = document.getElementById('customerSearch');
    const tableBody = document.getElementById('customerTableBody');

    if (searchInput && tableBody) {
        searchInput.addEventListener('keyup', () => {
            const filter = searchInput.value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                const textContent = rows[i].textContent.toLowerCase();
                // Toggle row visibility based on the filter string
                rows[i].style.display = textContent.includes(filter) ? "" : "none";
            }
        });
    }


    // --- 4. Form Submission Handling ---
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            // Prevent page refresh to maintain state (SPA approach)
            e.preventDefault(); 

            // Consolidate data for logging or future database submission
            const formData = {
                date: dateInput ? dateInput.value : 'N/A',
                customer: document.getElementById('customerName')?.value || 'N/A',
                therapist: document.getElementById('therapist')?.value || 'N/A',
                gap: gapInput ? gapInput.value : '0.00'
            };

            console.log("Data to be sent to server:", formData);
            alert(`Success! Appointment confirmed for ${formData.customer}.`);
        });
    }
});