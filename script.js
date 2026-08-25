const teamSize = document.getElementById("teamSize");
const membersContainer = document.getElementById("membersContainer");
const registrationForm = document.getElementById("registrationForm");
const paymentModal = document.getElementById("paymentModal");
const transactionIdInput = document.getElementById("transactionId");
const payerUpiIdInput = document.getElementById("payerUpiId");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
const closePaymentModalBtn = document.getElementById("closePaymentModal");

const STORAGE_KEY = "tezhack2026_registration_form";
const PAYMENT_AMOUNT = 100;
const DEFAULT_UPI_ID = "sharmamandev1@ybl";
const GOOGLE_APPS_SCRIPT_URL = window.GOOGLE_APPS_SCRIPT_URL || "";
const UPI_ID = window.TEZHACK_UPI_ID || DEFAULT_UPI_ID;

function saveFormState() {
    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function restoreFormState() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
        return;
    }

    try {
        const parsed = JSON.parse(savedData);
        Object.entries(parsed).forEach(([key, value]) => {
            const field = registrationForm.elements.namedItem(key);
            if (!field) {
                return;
            }

            if (field.type === "radio" || field.type === "checkbox") {
                field.checked = String(value) === String(field.value);
                return;
            }

            field.value = value;
        });

        if (teamSize.value) {
            renderMembers();
            Object.entries(parsed).forEach(([key, value]) => {
                if (key.startsWith("member") && value) {
                    const field = registrationForm.elements.namedItem(key);
                    if (field) {
                        field.value = value;
                    }
                }
            });
        }
    } catch (error) {
        console.error("Unable to restore saved form state:", error);
    }
}

function buildUpiLink() {
    const params = new URLSearchParams({
        pa: UPI_ID,
        pn: "TEZHACK 2026",
        am: String(PAYMENT_AMOUNT),
        cu: "INR",
        tn: "TEZHACK 2026 Registration"
    });

    return `upi://pay?${params.toString()}`;
}

function updatePaymentModal() {
    const upiLink = buildUpiLink();
    const qrCodeElement = document.getElementById("upiQrCode");
    const upiIdValue = document.getElementById("upiIdValue");
    const upiPayLink = document.getElementById("upiPayLink");

    upiIdValue.textContent = UPI_ID;
    upiPayLink.href = upiLink;
    upiPayLink.textContent = `Pay ${UPI_ID} via UPI app`;
    qrCodeElement.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
}

function openPaymentModal() {
    updatePaymentModal();
    paymentModal.classList.add("show");
    paymentModal.setAttribute("aria-hidden", "false");
}

function closePaymentModal() {
    paymentModal.classList.remove("show");
    paymentModal.setAttribute("aria-hidden", "true");
    transactionIdInput.value = "";
    payerUpiIdInput.value = "";
    transactionIdInput.setCustomValidity("");
}

function submitRegistration() {
    const submitButton = registrationForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    if (!GOOGLE_APPS_SCRIPT_URL) {
        alert("Missing GitHub secret: GOOGLE_APPS_SCRIPT_URL. Add it in your repo settings and redeploy the site before submitting.");
        return Promise.reject(new Error("Missing Apps Script URL"));
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const formData = new FormData(registrationForm);
    const registrationData = Object.fromEntries(formData.entries());
    registrationData.paymentStatus = "Paid - UPI details submitted";
    registrationData.transactionId = transactionIdInput.value.trim();
    registrationData.payerUpiId = payerUpiIdInput.value.trim();

    return fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(registrationData)
    })
        .then(() => {
            alert("Registration submitted! Check your email for confirmation. 🚀");
            registrationForm.reset();
            membersContainer.innerHTML = "";
            localStorage.removeItem(STORAGE_KEY);
            closePaymentModal();
        })
        .catch((error) => {
            console.error("Submission error:", error);
            alert("Unable to submit registration. Check your connection and try again.");
            throw error;
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
}

function createMemberSection(memberNumber, required) {
    const optional = !required;
    const requiredMark = required ? " *" : "";
    const requiredAttr = required ? "required" : "";

    return `
        <fieldset class="member-section ${optional ? "optional-member" : ""}">
            <legend>
                Member ${memberNumber}
                ${optional ? '<span class="field-hint">Leave blank if your team is smaller</span>' : ""}
            </legend>

            <div class="field-grid">
                <div class="field">
                    <label for="member${memberNumber}Name">
                        Full Name${requiredMark}
                    </label>
                    <input type="text"
                           id="member${memberNumber}Name"
                           name="member${memberNumber}Name"
                           ${requiredAttr}>
                </div>

                <div class="field">
                    <label for="member${memberNumber}Email">
                        Email${requiredMark}
                    </label>
                    <input type="email"
                           id="member${memberNumber}Email"
                           name="member${memberNumber}Email"
                           ${requiredAttr}>
                </div>

                <div class="field">
                    <label for="member${memberNumber}Phone">
                        Phone / WhatsApp${requiredMark}
                    </label>
                    <input type="tel"
                           id="member${memberNumber}Phone"
                           name="member${memberNumber}Phone"
                           ${requiredAttr}>
                </div>

                <div class="field">
                    <label for="member${memberNumber}YearBranch">
                        Year &amp; Branch${requiredMark}
                    </label>
                    <input type="text"
                           id="member${memberNumber}YearBranch"
                           name="member${memberNumber}YearBranch"
                           ${requiredAttr}>
                </div>
            </div>
        </fieldset>
    `;
}

function renderMembers() {
    membersContainer.innerHTML = "";

    const totalMembers = Number(teamSize.value);

    if (!totalMembers) {
        return;
    }

    for (let member = 2; member <= 4; member++) {
        const required = member <= totalMembers;
        membersContainer.insertAdjacentHTML(
            "beforeend",
            createMemberSection(member, required)
        );
    }
}

teamSize.addEventListener("change", function () {
    renderMembers();
    saveFormState();
});

registrationForm.addEventListener("input", saveFormState);
registrationForm.addEventListener("change", saveFormState);

restoreFormState();

registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
    }

    openPaymentModal();
});

confirmPaymentBtn.addEventListener("click", function () {
    if (!transactionIdInput.value.trim()) {
        transactionIdInput.setCustomValidity("Please enter your UPI transaction ID.");
        transactionIdInput.reportValidity();
        return;
    }

    transactionIdInput.setCustomValidity("");
    submitRegistration().catch(() => {});
});

cancelPaymentBtn.addEventListener("click", closePaymentModal);
closePaymentModalBtn.addEventListener("click", closePaymentModal);

paymentModal.addEventListener("click", function (event) {
    if (event.target === paymentModal) {
        closePaymentModal();
    }
});
