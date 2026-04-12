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


    // --- 1.5. Automatic End Time Calculation Based on Start Time & Therapy Duration ---
    const startTimeInput = document.getElementById('appointmentTime');
    const therapyDurationInput = document.getElementById('therapyDuration');
    const endTimeInput = document.getElementById('endTime');

    function calculateEndTime() {
        if (!startTimeInput || !therapyDurationInput || !endTimeInput) return;

        const startTime = startTimeInput.value;
        const duration = parseInt(therapyDurationInput.value);

        if (!startTime || !duration) {
            endTimeInput.value = '';
            return;
        }

        // Parse start time (HH:MM format)
        const [hours, minutes] = startTime.split(':').map(Number);

        // Calculate end time by adding duration
        let endHours = hours;
        let endMinutes = minutes + duration;

        if (endMinutes >= 60) {
            endHours += Math.floor(endMinutes / 60);
            endMinutes = endMinutes % 60;
        }

        // Handle day overflow (24 hours)
        if (endHours >= 24) {
            endHours = endHours % 24;
        }

        // Format as HH:MM
        const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        endTimeInput.value = formattedEndTime;
    }

    if (startTimeInput && therapyDurationInput) {
        startTimeInput.addEventListener('change', calculateEndTime);
        therapyDurationInput.addEventListener('change', calculateEndTime);
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

    const therapistSelect = document.getElementById('therapist-select');
    const addTherapistButton = document.getElementById('add-btn');
    const selectedList = document.getElementById('selected-list');

    // Function to load selected therapists from localStorage
    function loadSelectedTherapists() {
        if (!selectedList) return;
        const today = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const storageKey = `selectedTherapists_${today}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            const therapistNames = JSON.parse(saved);
            therapistNames.forEach((name, index) => {
                const listItem = document.createElement('div');
                listItem.className = 'status-card animated-fadeIn assigned-therapist-card';
                listItem.dataset.therapist = name;
                listItem.innerHTML = `
                    <h4>${index + 1}. ${name}</h4>
                    <span class="badge available">On Shift</span>
                    <button type="button" class="remove-btn">Remove</button>
                `;
                selectedList.appendChild(listItem);
                
                listItem.querySelector('.remove-btn').addEventListener('click', () => {
                    listItem.remove();
                    saveSelectedTherapists();
                    loadTherapistBookings();
                    refreshTherapistNumbers();
                });
            });
            loadTherapistBookings();
        }
    }

    // Function to save selected therapists to localStorage
    function saveSelectedTherapists() {
        if (!selectedList) return;
        const today = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const storageKey = `selectedTherapists_${today}`;
        const cards = selectedList.querySelectorAll('.assigned-therapist-card');
        const therapistNames = Array.from(cards).map(card => card.dataset.therapist);
        
        if (therapistNames.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(therapistNames));
        } else {
            localStorage.removeItem(storageKey);
        }
    }

    // Function to get selected therapists
    function getSelectedTherapists() {
        const today = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const storageKey = `selectedTherapists_${today}`;
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    }

    // Function to load and display bookings for each therapist
    async function loadTherapistBookings() {
        const selectedTherapists = getSelectedTherapists();
        if (selectedTherapists.length === 0) return;

        try {
            const response = await fetch('http://localhost:3000/api/bookings');
            if (!response.ok) throw new Error('Failed to load bookings');
            
            const bookings = await response.json();
            
            // Get today's date in YYYY-MM-DD format
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            // Filter bookings for today and selected therapists
            const todaysBookings = bookings.filter(b => 
                b.appointmentDate === todayStr && selectedTherapists.includes(b.therapist)
            );
            
            // Display bookings under each therapist card
            selectedList.querySelectorAll('.assigned-therapist-card').forEach(card => {
                const therapistName = card.dataset.therapist;
                let bookingsList = card.querySelector('.therapist-bookings');
                
                if (!bookingsList) {
                    bookingsList = document.createElement('div');
                    bookingsList.className = 'therapist-bookings';
                    card.appendChild(bookingsList);
                }
                
                const therapistBookings = todaysBookings.filter(b => b.therapist === therapistName);
                
                if (therapistBookings.length > 0) {
                    bookingsList.innerHTML = therapistBookings.map(b => `
                        <div class="booking-item">
                            <small>${b.appointmentTime} - ${b.customerName}</small>
                        </div>
                    `).join('');
                } else {
                    bookingsList.innerHTML = '<small style="color: #8D6E63;">No bookings yet</small>';
                }
            });
        } catch (error) {
            console.error('Error loading therapist bookings:', error);
        }
    }

    function refreshTherapistNumbers() {
        const cards = selectedList.querySelectorAll('.assigned-therapist-card');
        cards.forEach((card, index) => {
            const title = card.querySelector('h4');
            const therapistName = card.dataset.therapist;
            if (title) {
                title.textContent = `${index + 1}. ${therapistName}`;
            }
        });
    }

    if (therapistSelect && addTherapistButton && selectedList) {
        addTherapistButton.addEventListener('click', () => {
            const therapistName = therapistSelect.value;
            if (!therapistName) {
                alert('Please choose a therapist before adding to the shift.');
                return;
            }

            const alreadyAdded = selectedList.querySelector(`[data-therapist="${therapistName}"]`);
            if (alreadyAdded) {
                alert(`${therapistName} is already assigned to the shift.`);
                return;
            }

            const listItem = document.createElement('div');
            listItem.className = 'status-card animated-fadeIn assigned-therapist-card';
            listItem.dataset.therapist = therapistName;
            listItem.innerHTML = `
                <h4>${therapistName}</h4>
                <span class="badge available">On Shift</span>
                <button type="button" class="remove-btn">Remove</button>
            `;

            selectedList.appendChild(listItem);
            refreshTherapistNumbers();
            saveSelectedTherapists();
            loadTherapistBookings();
            therapistSelect.selectedIndex = 0;

            listItem.querySelector('.remove-btn').addEventListener('click', () => {
                listItem.remove();
                saveSelectedTherapists();
                loadTherapistBookings();
                refreshTherapistNumbers();
            });
        });

        // Load saved therapists on page load
        loadSelectedTherapists();
    }


    // --- 5. Customer Records Search and Display ---
    const customerTableBody = document.getElementById('customerTableBody');
    const customerSearchInput = document.getElementById('customerSearch');
    const searchBtn = document.getElementById('searchBtn');

    // Function to format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Function to format treatment names
    function formatTreatment(treatment) {
        const treatmentMap = {
            'neck-shoulder': 'Neck & Shoulder',
            'whole-body': 'Whole Body',
            'remedial': 'Remedial Massage',
            'foot': 'Foot Massage'
        };
        return treatmentMap[treatment] || treatment;
    }

    // Function to load customer records from database
    async function loadCustomerRecords() {
        try {
            const response = await fetch('http://localhost:3000/api/bookings');
            if (!response.ok) {
                throw new Error('Failed to load customer records');
            }
            const bookings = await response.json();
            displayCustomerRecords(bookings);
        } catch (error) {
            console.error('Error loading customer records:', error);
            customerTableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #8D6E63;">Unable to load customer records. Please ensure the server is running.</td></tr>';
        }
    }

    // Function to display customer records in the table
    function displayCustomerRecords(bookings) {
        if (!customerTableBody) return;

        if (bookings.length === 0) {
            customerTableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #8D6E63;">No customer records found.</td></tr>';
            return;
        }

        customerTableBody.innerHTML = bookings.map(booking => {
            const timeRange = booking.endTime ? `${booking.appointmentTime} - ${booking.endTime}` : booking.appointmentTime;
            const duration = booking.therapyDuration ? `${booking.therapyDuration} mins` : 'N/A';
            return `
            <tr>
                <td>${formatDate(booking.appointmentDate)}</td>
                <td>${timeRange}</td>
                <td>${duration}</td>
                <td><a href="customer-detail.html?name=${encodeURIComponent(booking.customerName)}" style="color: #5D4037; text-decoration: none; cursor: pointer;"><strong>${booking.customerName}</strong></a><br><small>${booking.phone}</small></td>
                <td>${booking.therapist}</td>
                <td>${formatTreatment(booking.treatment)}</td>
                <td>${booking.totalPrice.toFixed(2)}</td>
                <td>${booking.insuranceClaim.toFixed(2)}</td>
                <td>${booking.gapPayment.toFixed(2)}</td>
                <td><span class="pay-method ${booking.paymentMethod}">${booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}</span></td>
            </tr>
        `}).join('');
    }

    // Function to filter customer records
    function filterCustomerRecords(searchTerm) {
        const rows = customerTableBody.getElementsByTagName('tr');
        const term = searchTerm.toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const textContent = row.textContent.toLowerCase();
            row.style.display = textContent.includes(term) ? '' : 'none';
        }
    }

    // Initialize customer records page
    if (customerTableBody) {
        loadCustomerRecords();
    }

    // Customer search functionality
    if (customerSearchInput && searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = customerSearchInput.value.trim();
            filterCustomerRecords(searchTerm);
        });

        customerSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = customerSearchInput.value.trim();
                filterCustomerRecords(searchTerm);
            }
        });
    }
    const bookingForm = document.getElementById('bookingForm');
    const therapistDropdown = document.getElementById('therapist');

    // Function to populate therapist dropdown based on selected therapists
    function populateTherapistDropdown() {
        if (!therapistDropdown) return;
        
        const selectedTherapists = getSelectedTherapists();
        
        // Clear existing options except the first one
        while (therapistDropdown.options.length > 1) {
            therapistDropdown.remove(1);
        }
        
        if (selectedTherapists.length === 0) {
            therapistDropdown.disabled = true;
            therapistDropdown.options[0].text = 'No therapists selected for today';
            return;
        }
        
        therapistDropdown.disabled = false;
        therapistDropdown.options[0].text = 'Assign Therapist';
        
        // Add selected therapists to dropdown
        selectedTherapists.forEach(therapist => {
            const option = document.createElement('option');
            option.value = therapist;
            option.textContent = therapist;
            therapistDropdown.appendChild(option);
        });
    }

    if (bookingForm) {
        // Populate therapist dropdown on page load
        setTimeout(populateTherapistDropdown, 100);

        bookingForm.addEventListener('submit', async (e) => {
            // Prevent page refresh to maintain state (SPA approach)
            e.preventDefault(); 

            // Consolidate data for database submission
            const formData = {
                appointmentDate: document.getElementById('appointmentDate')?.value || '',
                appointmentTime: document.getElementById('appointmentTime')?.value || '',
                therapyDuration: parseInt(document.getElementById('therapyDuration')?.value) || 0,
                endTime: document.getElementById('endTime')?.value || '',
                customerName: document.getElementById('customerName')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                insurance: document.getElementById('insurance')?.value || '',
                therapist: document.getElementById('therapist')?.value || '',
                treatment: document.getElementById('treatment')?.value || '',
                totalPrice: parseFloat(document.getElementById('totalPrice')?.value) || 0,
                insuranceClaim: parseFloat(document.getElementById('insuranceClaim')?.value) || 0,
                gapPayment: parseFloat(document.getElementById('gapPayment')?.value) || 0,
                paymentMethod: document.getElementById('paymentMethod')?.value || 'cash'
            };

            console.log("Data to be sent to server:", formData);

            try {
                const response = await fetch('http://localhost:3000/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to save booking');
                }

                const result = await response.json();
                alert(`Success! Booking #${result.bookingId} confirmed for ${formData.customerName}.`);
                bookingForm.reset();
                
                // Reset appointment date to today
                if (dateInput) {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    dateInput.value = `${year}-${month}-${day}`;
                }
                calculateGap();
            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // --- 6. Customer Detail Page ---
    const customerDetailForm = document.getElementById('customerDetailForm');
    const loadingMessage = document.getElementById('loadingMessage');

    if (customerDetailForm) {
        // Get customer name from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const customerName = urlParams.get('name');

        if (!customerName) {
            loadingMessage.textContent = 'Customer name not found. Please return to customers page.';
            return;
        }

        // Calculation functions for customer detail page
        const detailStartTime = document.getElementById('appointmentTime');
        const detailDuration = document.getElementById('therapyDuration');
        const detailEndTime = document.getElementById('endTime');
        const detailTotal = document.getElementById('totalPrice');
        const detailInsurance = document.getElementById('insuranceClaim');
        const detailGap = document.getElementById('gapPayment');

        function calculateEndTimeDetail() {
            if (!detailStartTime || !detailDuration || !detailEndTime) return;

            const startTime = detailStartTime.value;
            const duration = parseInt(detailDuration.value);

            if (!startTime || !duration) {
                detailEndTime.value = '';
                return;
            }

            const [hours, minutes] = startTime.split(':').map(Number);
            let endHours = hours;
            let endMinutes = minutes + duration;

            if (endMinutes >= 60) {
                endHours += Math.floor(endMinutes / 60);
                endMinutes = endMinutes % 60;
            }

            if (endHours >= 24) {
                endHours = endHours % 24;
            }

            const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
            detailEndTime.value = formattedEndTime;
        }

        function calculateGapDetail() {
            if (!detailTotal || !detailInsurance || !detailGap) return;

            const total = parseFloat(detailTotal.value) || 0;
            const insurance = parseFloat(detailInsurance.value) || 0;
            const gap = total - insurance;

            detailGap.value = gap >= 0 ? gap.toFixed(2) : "0.00";
        }

        if (detailStartTime && detailDuration) {
            detailStartTime.addEventListener('change', calculateEndTimeDetail);
            detailDuration.addEventListener('change', calculateEndTimeDetail);
        }

        if (detailTotal && detailInsurance) {
            detailTotal.addEventListener('input', calculateGapDetail);
            detailInsurance.addEventListener('input', calculateGapDetail);
        }

        // Function to populate therapist dropdown based on selected therapists
        function populateTherapistDropdownDetail() {
            const therapistSelect = document.getElementById('therapist');
            if (!therapistSelect) return;
            
            const selectedTherapists = getSelectedTherapists();
            
            // Clear existing options except the first one
            while (therapistSelect.options.length > 1) {
                therapistSelect.remove(1);
            }
            
            if (selectedTherapists.length === 0) {
                therapistSelect.disabled = true;
                therapistSelect.options[0].text = 'No therapists selected for today';
                return;
            }
            
            therapistSelect.disabled = false;
            therapistSelect.options[0].text = 'Assign Therapist';
            
            // Add selected therapists to dropdown
            selectedTherapists.forEach(therapist => {
                const option = document.createElement('option');
                option.value = therapist;
                option.textContent = therapist;
                therapistSelect.appendChild(option);
            });
        }

        // Load customer bookings
        async function loadCustomerDetails() {
            try {
                const response = await fetch(`http://localhost:3000/api/customer/${encodeURIComponent(customerName)}`);
                if (!response.ok) throw new Error('Failed to load customer details');
                
                const bookings = await response.json();
                
                if (bookings.length === 0) {
                    loadingMessage.textContent = 'No bookings found for this customer.';
                    return;
                }

                // Populate form with first booking's info
                const firstBooking = bookings[0];
                document.getElementById('customerName').value = firstBooking.customerName || '';
                document.getElementById('phone').value = firstBooking.phone || '';
                document.getElementById('insurance').value = firstBooking.insurance || '';
                document.getElementById('appointmentDate').value = firstBooking.appointmentDate || '';
                document.getElementById('appointmentTime').value = firstBooking.appointmentTime || '';
                document.getElementById('therapyDuration').value = firstBooking.therapyDuration || '';
                document.getElementById('endTime').value = firstBooking.endTime || '';
                document.getElementById('therapist').value = firstBooking.therapist || '';
                document.getElementById('treatment').value = firstBooking.treatment || '';
                document.getElementById('totalPrice').value = firstBooking.totalPrice || '';
                document.getElementById('insuranceClaim').value = firstBooking.insuranceClaim || '';
                document.getElementById('gapPayment').value = firstBooking.gapPayment || '';
                document.getElementById('paymentMethod').value = firstBooking.paymentMethod || '';

                // Populate therapist dropdown
                populateTherapistDropdownDetail();

                // Calculate gap payment
                calculateGapDetail();

                // Display booking history
                const bookingHistoryDiv = document.getElementById('bookingHistory');
                bookingHistoryDiv.innerHTML = bookings.map(b => {
                    const date = formatDate(b.appointmentDate);
                    const timeRange = b.endTime ? `${b.appointmentTime} - ${b.endTime}` : b.appointmentTime;
                    return `
                        <div style="padding: 12px; border-bottom: 1px solid #F3E5F5; margin-bottom: 10px;">
                            <small><strong>${date} | ${timeRange}</strong></small><br>
                            <small style="color: #8D6E63;">
                                ${formatTreatment(b.treatment)} with ${b.therapist}
                                <br>
                                Total: $${b.totalPrice.toFixed(2)} | 
                                Insurance: $${b.insuranceClaim.toFixed(2)} | 
                                Gap: $${b.gapPayment.toFixed(2)}
                            </small>
                        </div>
                    `;
                }).join('');

                // Show form
                loadingMessage.style.display = 'none';
                customerDetailForm.style.display = 'block';
            } catch (error) {
                console.error('Error loading customer details:', error);
                loadingMessage.textContent = 'Error loading customer details. Please try again.';
            }
        }

        // Handle form submission
        customerDetailForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedData = {
                customerName: document.getElementById('customerName').value,
                phone: document.getElementById('phone').value,
                insurance: document.getElementById('insurance').value,
                appointmentDate: document.getElementById('appointmentDate').value,
                appointmentTime: document.getElementById('appointmentTime').value,
                therapyDuration: parseInt(document.getElementById('therapyDuration').value),
                endTime: document.getElementById('endTime').value,
                therapist: document.getElementById('therapist').value,
                treatment: document.getElementById('treatment').value,
                totalPrice: parseFloat(document.getElementById('totalPrice').value),
                insuranceClaim: parseFloat(document.getElementById('insuranceClaim').value),
                gapPayment: parseFloat(document.getElementById('gapPayment').value),
                paymentMethod: document.getElementById('paymentMethod').value
            };

            if (!updatedData.customerName || !updatedData.phone || !updatedData.appointmentDate || !updatedData.appointmentTime || !updatedData.therapist || !updatedData.treatment) {
                alert('Please fill in all required fields.');
                return;
            }

            try {
                // Get all bookings for this customer
                const response = await fetch(`http://localhost:3000/api/customer/${encodeURIComponent(customerName)}`);
                const bookings = await response.json();

                // Update all bookings for this customer
                const updatePromises = bookings.map(booking =>
                    fetch(`http://localhost:3000/api/bookings/${booking.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData)
                    })
                );

                await Promise.all(updatePromises);
                alert('Customer information updated successfully!');
                window.location.href = 'customers.html';
            } catch (error) {
                console.error('Error updating customer details:', error);
                alert(`Error: ${error.message}`);
            }
        });

        // Load customer details on page load
        loadCustomerDetails();
    }
});