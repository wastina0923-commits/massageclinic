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


    // --- 1.6. Automatic Total Price Calculation Based on Therapy Duration and Add-ons ---
    const priceMapping = {
        10: 20,
        20: 40,
        30: 50,
        40: 65,
        45: 70,
        60: 90,
        90: 130,
        120: 170
    };

    const addOnCheckboxes = [
        'hot-stone', 'aroma', 'cupping', 'tiger-balm', 'deep-tissue', 'gua-sha'
    ];

    const addonPrices = {
        'hot-stone': 5,
        'aroma': 5,
        'cupping': 10,
        'tiger-balm': 5,
        'deep-tissue': 5,
        'gua-sha': 10
    };

    const addOnMapping = {
        'hot-stone': 'hotStone',
        'aroma': 'aroma',
        'cupping': 'cupping',
        'tiger-balm': 'tigerBalm',
        'deep-tissue': 'deepTissue',
        'gua-sha': 'guaSha'
    };

    function getSelectedAddOns() {
        const addOnData = {};
        addOnCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            const key = addOnMapping[id];
            if (key) {
                addOnData[key] = checkbox && checkbox.checked ? 1 : 0;
            }
        });
        return addOnData;
    }

    function setAddOnStates(booking) {
        addOnCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            const key = addOnMapping[id];
            if (checkbox && key && booking.hasOwnProperty(key)) {
                checkbox.checked = !!booking[key];
            }
        });
    }

    function calculateTotalPrice() {
        if (!therapyDurationInput || !totalInput) return;

        const duration = parseInt(therapyDurationInput.value);
        let total = 0;

        if (duration && priceMapping[duration]) {
            total = priceMapping[duration];
        }

        // Add add-on prices
        addOnCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                total += addonPrices[checkbox.value] || 0;
            }
        });

        totalInput.value = total > 0 ? total : '';
    }

    if (therapyDurationInput) {
        therapyDurationInput.addEventListener('change', calculateTotalPrice);
    }

    // Add event listeners for add-on checkboxes
    addOnCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', calculateTotalPrice);
        }
    });


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


    // --- 3. Auto-fill Customer Details on Name Input ---
    const customerNameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('phone');
    const insuranceInputBooking = document.getElementById('insurance');

    if (customerNameInput && phoneInput && insuranceInputBooking) {
        customerNameInput.addEventListener('blur', async () => {
            const name = customerNameInput.value.trim();
            if (!name) return;

            try {
                const response = await fetch('/api/bookings');
                const bookings = await response.json();

                // Create a map of customer names to their latest details
                const customerMap = {};
                bookings.forEach(booking => {
                    const lowerName = booking.customerName.toLowerCase();
                    customerMap[lowerName] = {
                        phone: booking.phone,
                        insurance: booking.insurance
                    };
                });

                const customer = customerMap[name.toLowerCase()];
                if (customer) {
                    phoneInput.value = customer.phone || '';
                    insuranceInputBooking.value = customer.insurance || '';
                }
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        });
    }


    // --- 4. Customer Records Search Functionality ---
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
            
            // Get current time in HH:MM format
            const currentHours = String(today.getHours()).padStart(2, '0');
            const currentMinutes = String(today.getMinutes()).padStart(2, '0');
            const currentTime = `${currentHours}:${currentMinutes}`;
            
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
                
                // Sort bookings by appointment time (earliest first, latest last)
                therapistBookings.sort((a, b) => {
                    const timeA = a.appointmentTime.split(':').map(Number);
                    const timeB = b.appointmentTime.split(':').map(Number);
                    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                });
                
                // Check if therapist is currently in treatment
                let isInTreatment = false;
                therapistBookings.forEach(b => {
                    const appointmentStart = b.appointmentTime;
                    const appointmentEnd = b.endTime;
                    if (appointmentStart <= currentTime && currentTime < appointmentEnd) {
                        isInTreatment = true;
                    }
                });
                
                // Update status badge
                const badge = card.querySelector('.badge');
                if (badge) {
                    if (isInTreatment) {
                        badge.textContent = 'In Treatment';
                        badge.className = 'badge in-treatment';
                    } else {
                        badge.textContent = 'Available';
                        badge.className = 'badge available';
                    }
                }
                
                if (therapistBookings.length > 0) {
                    bookingsList.innerHTML = therapistBookings.map(b => `
                        <div class="booking-item">
                            <small>${formatTime(b.appointmentTime)} - ${formatTime(b.endTime)} ${b.customerName}</small>
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
            
            // Check if therapist is already added
            const alreadyAdded = selectedList.querySelector(`[data-therapist="${therapistName}"]`);
            if (alreadyAdded) {
                alert(`${therapistName} is already assigned to the shift.`);
                return;
            }

            // Create a new card for the selected therapist
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
        
        // Refresh therapist bookings every minute to update status
        setInterval(loadTherapistBookings, 60000);
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

    // Function to format time with proper leading zeros
    function formatTime(timeString) {
        if (!timeString) return '';
        // Ensure time format is HH:MM with leading zeros
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            const hours = String(parts[0]).padStart(2, '0');
            const minutes = String(parts[1]).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return timeString;
    }

    // Function to format treatment names
    function formatTreatment(treatment) {
        const treatmentMap = {
            'neck-shoulder': 'Neck & Shoulder',
            'head-neck-shoulder': 'Head Neck & Shoulder',
            'upper-body': 'Upper Body',
            'lower-body': 'Lower Body',
            'full-body': 'Full Body',
            'back-feet': 'Back & Feet',
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
            const timeRange = booking.endTime ? `${formatTime(booking.appointmentTime)} - ${formatTime(booking.endTime)}` : formatTime(booking.appointmentTime);
            const duration = booking.therapyDuration ? `${booking.therapyDuration} mins` : 'N/A';
            return `
            <tr>
                <td>${formatDate(booking.appointmentDate)}</td>
                <td>${timeRange}</td>
                <td>${duration}</td>
                <td><a href="customer-detail.html?id=${booking.id}" style="color: #5D4037; text-decoration: none; cursor: pointer;"><strong>${booking.customerName}</strong></a><br><small>${booking.phone}</small></td>
                <td>${booking.therapist}</td>
                <td>${formatTreatment(booking.treatment)}</td>
                <td>$${booking.totalPrice.toFixed(2)}</td>
                <td>$${booking.insuranceClaim.toFixed(2)}</td>
                <td>$${booking.gapPayment.toFixed(2)}</td>
                <td><span class="pay-method ${booking.paymentMethod}">${booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}</span></td>
                <td>
                    <a href="customer-detail.html?id=${booking.id}" class="action-btn edit-btn" style="color: #5D4037; text-decoration: none; cursor: pointer; font-weight: bold; margin-right: 8px;">Edit</a>
                    <button class="action-btn delete-btn" data-booking-id="${booking.id}" style="background: none; border: none; color: #D32F2F; cursor: pointer; font-weight: bold; padding: 0;">Delete</button>
                </td>
            </tr>
        `}).join('');

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const bookingId = btn.dataset.bookingId;
                if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (!response.ok) throw new Error('Failed to delete booking');
                        
                        alert('Record deleted successfully!');
                        loadCustomerRecords(); // Reload the data
                    } catch (error) {
                        console.error('Error deleting record:', error);
                        alert(`Error: ${error.message}`);
                    }
                }
            });
        });
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
                paymentMethod: document.getElementById('paymentMethod')?.value || 'cash',
                ...getSelectedAddOns()
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
        // Get booking id or customer name from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        let bookingId = urlParams.get('id');
        const customerNameParam = urlParams.get('name');
        let currentBookingId = bookingId;

        if (!bookingId && !customerNameParam) {
            loadingMessage.textContent = 'Booking ID or customer name not found. Please return to customers page.';
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

        // Populate therapist dropdown and set current value
        function populateTherapistDropdownDetail(currentTherapist) {
            const therapistSelect = document.getElementById('therapist');
            if (!therapistSelect) return;
            
            const selectedTherapists = getSelectedTherapists();
            
            // Clear existing options except the first one
            while (therapistSelect.options.length > 1) {
                therapistSelect.remove(1);
            }
            
            // Build list of therapists to show
            const therapistsToShow = new Set(selectedTherapists);
            if (currentTherapist) {
                therapistsToShow.add(currentTherapist);
            }
            
            if (therapistsToShow.size === 0) {
                therapistSelect.disabled = true;
                therapistSelect.options[0].text = 'No therapists selected for today';
                return;
            }
            
            therapistSelect.disabled = false;
            therapistSelect.options[0].text = 'Select Therapist';
            
            // Add therapists to dropdown
            Array.from(therapistsToShow).sort().forEach(therapist => {
                const option = document.createElement('option');
                option.value = therapist;
                option.textContent = therapist;
                therapistSelect.appendChild(option);
            });
            
            // Set the current therapist as selected
            if (currentTherapist) {
                therapistSelect.value = currentTherapist;
            }
        }
        
        // Load customer bookings
        async function loadCustomerDetails() {
            try {
                let booking;
                if (currentBookingId) {
                    const response = await fetch(`/api/bookings/id/${currentBookingId}`);
                    if (!response.ok) {
                        const message = `Failed to load booking details (${response.status})`;
                        throw new Error(message);
                    }
                    booking = await response.json();
                } else {
                    const response = await fetch(`/api/customer/${encodeURIComponent(customerNameParam)}`);
                    if (!response.ok) {
                        const message = `Failed to load customer bookings (${response.status})`;
                        throw new Error(message);
                    }
                    const bookings = await response.json();
                    if (!bookings || bookings.length === 0) {
                        loadingMessage.textContent = 'No bookings found for this customer.';
                        return;
                    }
                    booking = bookings[0];
                    currentBookingId = booking.id;
                }

                if (!booking) {
                    loadingMessage.textContent = 'Booking not found.';
                    return;
                }

                // Populate therapist dropdown FIRST and ensure current therapist is selected
                populateTherapistDropdownDetail(booking.therapist);

                // Populate form with booking data
                document.getElementById('customerName').value = booking.customerName || '';
                document.getElementById('phone').value = booking.phone || '';
                document.getElementById('insurance').value = booking.insurance || '';
                document.getElementById('appointmentDate').value = booking.appointmentDate || '';
                document.getElementById('appointmentTime').value = booking.appointmentTime || '';
                document.getElementById('therapyDuration').value = booking.therapyDuration || '';
                document.getElementById('endTime').value = booking.endTime || '';
                document.getElementById('treatment').value = booking.treatment || '';
                document.getElementById('totalPrice').value = (booking.totalPrice || '').toString();
                document.getElementById('insuranceClaim').value = (booking.insuranceClaim || '').toString();
                document.getElementById('gapPayment').value = (booking.gapPayment || '').toString();
                document.getElementById('paymentMethod').value = booking.paymentMethod || 'cash';

                setAddOnStates(booking);
                calculateTotalPrice();
                calculateGapDetail();

                // Load booking history for the same customer (excluding current booking)
                const historyResponse = await fetch(`/api/customer/${encodeURIComponent(booking.customerName)}`);
                const allBookings = await historyResponse.json();
                const historyBookings = allBookings.filter(b => b.id != currentBookingId);

                // Display booking history
                const bookingHistoryDiv = document.getElementById('bookingHistory');
                if (historyBookings.length > 0) {
                    bookingHistoryDiv.innerHTML = historyBookings.map(b => {
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
                } else {
                    bookingHistoryDiv.innerHTML = '<p style="color: #8D6E63;">No other bookings found for this customer.</p>';
                }

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
                paymentMethod: document.getElementById('paymentMethod').value,
                ...getSelectedAddOns()
            };

            if (!updatedData.customerName || !updatedData.phone || !updatedData.appointmentDate || !updatedData.appointmentTime || !updatedData.therapist || !updatedData.treatment) {
                alert('Please fill in all required fields.');
                return;
            }

            try {
                const response = await fetch(`/api/bookings/${currentBookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || 'Failed to update booking');
                }

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

    // --- 7. Dashboard Earnings Calculation ---
    const commissionRates = {
        'Alice': 0.45,
        'Sunny': 0.45,
        'Helen': 0.45,
        'Melody': 0.45,
        'Jacky': 0.50,
        'Kelly': 0.50,
        'Olie': 0.50,
        'Joanna': 0.50,
        'Coco': 0.50,
        'Tina': 0.50
    };

    if (document.getElementById('totalRevenue')) {
        // Dashboard page
        loadDashboardData();
    }

    async function loadDashboardData() {
        try {
            const response = await fetch('/api/bookings');
            const bookings = await response.json();

            // Get today's date in YYYY-MM-DD format
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const todaysBookings = bookings.filter(b => b.appointmentDate === todayStr);

            let totalRevenue = 0;
            let totalGap = 0;
            let totalInsurance = 0;
            const therapistStats = {};

            todaysBookings.forEach(b => {
                totalRevenue += b.totalPrice;
                totalGap += b.gapPayment;
                totalInsurance += b.insuranceClaim;

                if (!therapistStats[b.therapist]) {
                    therapistStats[b.therapist] = { customers: 0, totalGenerated: 0 };
                }
                therapistStats[b.therapist].customers++;
                therapistStats[b.therapist].totalGenerated += b.totalPrice;
            });

            document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
            document.getElementById('totalGap').textContent = `$${totalGap.toFixed(2)}`;
            document.getElementById('totalInsurance').textContent = `$${totalInsurance.toFixed(2)}`;

            // Update date
            /*document.getElementById('dashboard-date').textContent = `Financial summary for ${today.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

            function updateStatusClass(select) {
                const value = select.value;
                select.className = `status-select status-${value}`;
            }*/

            const tbody = document.getElementById('earningsTableBody');
            tbody.innerHTML = Object.keys(therapistStats).sort().map(therapist => {
                const stats = therapistStats[therapist];
                const rate = commissionRates[therapist] || 0.45;
                const earnings = stats.totalGenerated * rate;
                return `
                    <tr>
                        <td>${therapist} (${(rate * 100).toFixed(0)}%)</td>
                        <td>${stats.customers}</td>
                        <td>$${stats.totalGenerated.toFixed(2)}</td>
                        <td><strong>$${earnings.toFixed(2)}</strong></td>
                        <td><select class="status-select" data-therapist="${therapist}"><option value="pending">Pending</option><option value="paid">Paid</option></select></td>
                    </tr>
                `;
            }).join('');

            // Add event listeners for status selects
            document.querySelectorAll('.status-select').forEach(select => {
                const therapist = select.dataset.therapist;
                const key = `status_${todayStr}_${therapist}`;
                const savedStatus = localStorage.getItem(key) || 'pending';
                select.value = savedStatus;
                updateStatusClass(select);

                select.addEventListener('change', () => {
                    localStorage.setItem(key, select.value);
                    updateStatusClass(select);
                });
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
});