document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");
    const phoneInput = document.getElementById("phone");

    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            let numbers = phoneInput.value.replace(/\D/g, "").substring(0, 10);

            if (numbers.length > 6) {
                phoneInput.value = "(" + numbers.substring(0, 3) + ")" + numbers.substring(3, 6) + "-" + numbers.substring(6);
            } else if (numbers.length > 3) {
                phoneInput.value = "(" + numbers.substring(0, 3) + ")" + numbers.substring(3);
            } else if (numbers.length > 0) {
                phoneInput.value = "(" + numbers;
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (validateForm()) {
                const formData = {
                    firstName: document.getElementById("firstName").value.trim(),
                    lastName: document.getElementById("lastName").value.trim(),
                    address: document.getElementById("address").value.trim(),
                    city: document.getElementById("city").value.trim(),
                    state: document.getElementById("state").value,
                    zip: document.getElementById("zip").value.trim(),
                    phone: document.getElementById("phone").value.trim(),
                    email: document.getElementById("email").value.trim(),
                    birthdate: document.getElementById("birthdate").value,
                    message: document.getElementById("message").value.trim()
                };

                sessionStorage.setItem("assignment3FormData", JSON.stringify(formData));
                window.location.href = "confirmation.html";
            }
        });
    }

    displayConfirmation();
});

function setError(id, message) {
    const errorElement = document.getElementById(id);

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    const errors = document.querySelectorAll(".error");

    errors.forEach(function (error) {
        error.textContent = "";
    });
}

function validateForm() {
    clearErrors();

    let isValid = true;

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const birthdate = document.getElementById("birthdate").value;
    const message = document.getElementById("message").value.trim();
    const confirm = document.getElementById("confirm").value.trim();

    const namePattern = /^[A-Za-z\s'-]+$/;
    const addressPattern = /^\d+\s+[A-Za-z0-9\s.'#-]+$/;
    const cityPattern = /^[A-Za-z\s.'-]+$/;
    const zipPattern = /^\d{5}$/;
    const phonePattern = /^\(\d{3}\)\d{3}-\d{4}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (firstName === "" || !namePattern.test(firstName)) {
        setError("firstNameError", "Please enter a valid first name.");
        isValid = false;
    }

    if (lastName === "" || !namePattern.test(lastName)) {
        setError("lastNameError", "Please enter a valid last name.");
        isValid = false;
    }

    if (birthdate === "") {
        setError("birthdateError", "Please enter your birth date.");
        isValid = false;
    } else {
        const birthDateValue = new Date(birthdate);
        const today = new Date();
        const earliestDate = new Date("1900-01-01");

        if (birthDateValue > today) {
            setError("birthdateError", "Birth date cannot be in the future.");
            isValid = false;
        } else if (birthDateValue < earliestDate) {
            setError("birthdateError", "Please enter a reasonable birth date.");
            isValid = false;
        }
    }

    if (address === "" || !addressPattern.test(address)) {
        setError("addressError", "Please enter a valid street address, such as 123 Main Street.");
        isValid = false;
    }

    if (city === "" || !cityPattern.test(city)) {
        setError("cityError", "Please enter a valid city.");
        isValid = false;
    }

    if (state === "") {
        setError("stateError", "Please select a state.");
        isValid = false;
    }

    if (!zipPattern.test(zip)) {
        setError("zipError", "Please enter a valid 5-digit ZIP code.");
        isValid = false;
    }

    if (!phonePattern.test(phone)) {
        setError("phoneError", "Please enter a phone number in the format (000)000-0000.");
        isValid = false;
    }

    if (!emailPattern.test(email)) {
        setError("emailError", "Please enter a valid email address.");
        isValid = false;
    }

    if (message === "") {
        setError("messageError", "Please enter a message.");
        isValid = false;
    }

    if (confirm !== "5") {
        setError("confirmError", "Please answer the security question correctly.");
        isValid = false;
    }

    return isValid;
}

function displayConfirmation() {
    const confirmationDetails = document.getElementById("confirmationDetails");

    if (!confirmationDetails) {
        return;
    }

    const storedData = sessionStorage.getItem("assignment3FormData");

    if (!storedData) {
        confirmationDetails.innerHTML = "<p>No form information was found. Please return to the form and try again.</p>";
        return;
    }

    const formData = JSON.parse(storedData);

    confirmationDetails.innerHTML =
        "<dl class='confirmation-list'>" +
        "<dt>First Name:</dt><dd>" + escapeHTML(formData.firstName) + "</dd>" +
        "<dt>Last Name:</dt><dd>" + escapeHTML(formData.lastName) + "</dd>" +
        "<dt>Address:</dt><dd>" + escapeHTML(formData.address) + "</dd>" +
        "<dt>City:</dt><dd>" + escapeHTML(formData.city) + "</dd>" +
        "<dt>State:</dt><dd>" + escapeHTML(formData.state) + "</dd>" +
        "<dt>ZIP Code:</dt><dd>" + escapeHTML(formData.zip) + "</dd>" +
        "<dt>Phone:</dt><dd>" + escapeHTML(formData.phone) + "</dd>" +
        "<dt>Email:</dt><dd>" + escapeHTML(formData.email) + "</dd>" +
        "<dt>Birth Date:</dt><dd>" + escapeHTML(formData.birthdate) + "</dd>" +
        "<dt>Message:</dt><dd>" + escapeHTML(formData.message) + "</dd>" +
        "</dl>";

    document.getElementById("mailFirstName").value = formData.firstName;
    document.getElementById("mailLastName").value = formData.lastName;
    document.getElementById("mailAddress").value = formData.address;
    document.getElementById("mailCity").value = formData.city;
    document.getElementById("mailState").value = formData.state;
    document.getElementById("mailZip").value = formData.zip;
    document.getElementById("mailPhone").value = formData.phone;
    document.getElementById("mailEmail").value = formData.email;
    document.getElementById("mailBirthdate").value = formData.birthdate;
    document.getElementById("mailMessage").value = formData.message;
}

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}