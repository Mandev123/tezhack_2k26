const teamSize = document.getElementById("teamSize");
const membersContainer = document.getElementById("membersContainer");
const registrationForm = document.getElementById("registrationForm");
const paymentModal = document.getElementById("paymentModal");
const transactionIdInput = document.getElementById("transactionId");
const payerUpiIdInput = document.getElementById("payerUpiId");
const paymentScreenshotInput = document.getElementById("paymentScreenshot");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
const closePaymentModalBtn = document.getElementById("closePaymentModal");

const STORAGE_KEY = "tezhack2026_registration_form";
const PAYMENT_AMOUNT = 100;
const DEFAULT_UPI_ID = "sharmamandev1@ybl";
const GOOGLE_APPS_SCRIPT_URL = window.GOOGLE_APPS_SCRIPT_URL || "";
const UPI_ID = window.TEZHACK_UPI_ID || DEFAULT_UPI_ID;

function saveFormState() {
    const data = {};

    Array.from(registrationForm.elements).forEach((element) => {
        if (!element.name || element.disabled) {
            return;
        }

        if (element.type === "radio") {
            if (element.checked) {
                data[element.name] = element.value;
            }
            return;
        }

        if (element.type === "checkbox") {
            data[element.name] = element.checked ? (element.value || true) : false;
            return;
        }

        if (element.type === "file") {
            return;
        }

        data[element.name] = element.value;
    });

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
            const fieldList = registrationForm.elements.namedItem(key);
            if (!fieldList) {
                return;
            }

            if (fieldList instanceof RadioNodeList) {
                fieldList.forEach((radio) => {
                    radio.checked = String(value) === String(radio.value);
                });
                return;
            }

            if (fieldList.type === "checkbox") {
                fieldList.checked = value === true || value === "true" || value === fieldList.value;
                return;
            }

            if (fieldList.type === "radio") {
                fieldList.checked = String(value) === String(fieldList.value);
                return;
            }

            fieldList.value = value;
        });

        if (teamSize.value) {
            renderMembers();
            Object.entries(parsed).forEach(([key, value]) => {
                if (key.startsWith("member") && value !== undefined && value !== null && value !== false) {
                    const memberField = registrationForm.elements.namedItem(key);
                    if (memberField && !(memberField instanceof RadioNodeList)) {
                        memberField.value = value;
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
    if (paymentScreenshotInput) {
        paymentScreenshotInput.value = "";
        paymentScreenshotInput.setCustomValidity("");
    }
    transactionIdInput.setCustomValidity("");
}

function readScreenshotAsBase64() {
    return new Promise((resolve) => {
        const file = paymentScreenshotInput && paymentScreenshotInput.files && paymentScreenshotInput.files[0];
        if (!file) {
            resolve({ base64: "", type: "", name: "" });
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const dataUrl = e.target.result || "";
            const base64 = dataUrl.split(",")[1] || "";
            resolve({
                base64: base64,
                type: file.type || "image/png",
                name: file.name || "screenshot.png"
            });
        };
        reader.onerror = function () {
            resolve({ base64: "", type: "", name: "" });
        };
        reader.readAsDataURL(file);
    });
}

function buildRegistrationPayload(screenshotData = {}) {
    const raw = {};

    Array.from(registrationForm.elements).forEach((element) => {
        if (!element.name || element.disabled || element.type === "file") {
            return;
        }

        if (element.type === "radio") {
            if (element.checked) {
                raw[element.name] = element.value;
            } else if (!(element.name in raw)) {
                raw[element.name] = "";
            }
            return;
        }

        if (element.type === "checkbox") {
            raw[element.name] = element.checked ? (element.value || "Yes") : "";
            return;
        }

        raw[element.name] = element.value || "";
    });

    return {
        teamName: raw.teamName || "",
        teamSize: raw.teamSize || "",
        institute: raw.collegeName || "",
        city: raw.instituteLocation || "",

        leaderName: raw.leaderName || "",
        leaderEmail: raw.leaderEmail || "",
        leaderPhone: raw.leaderPhone || "",
        leaderYear: raw.leaderYearBranch || "",
        leaderGithub: raw.leaderGithubLinkedin || "",

        m2Name: raw.member2Name || "",
        m2Email: raw.member2Email || "",
        m2Phone: raw.member2Phone || "",
        m2Year: raw.member2YearBranch || "",

        m3Name: raw.member3Name || "",
        m3Email: raw.member3Email || "",
        m3Phone: raw.member3Phone || "",
        m3Year: raw.member3YearBranch || "",

        m4Name: raw.member4Name || "",
        m4Email: raw.member4Email || "",
        m4Phone: raw.member4Phone || "",
        m4Year: raw.member4YearBranch || "",

        idea: raw.hasProjectIdea || "",
        track: raw.preferredTrack || "",
        stack: raw.techStack || "",

        stay: raw.accommodation || "",
        diet: raw.dietaryPreference || "",
        heard: raw.heardAbout || "",

        paymentStatus: "Paid - UPI details submitted",
        transactionId: transactionIdInput.value.trim(),
        payerUpiId: payerUpiIdInput.value.trim(),
        screenshotBase64: screenshotData.base64 || "",
        screenshotType: screenshotData.type || "",
        screenshotName: screenshotData.name || ""
    };
}

function submitRegistration(screenshotData = {}) {
    const submitButton = registrationForm.querySelector('button[type="submit"]');
    const modalSubmitButton = document.getElementById("confirmPaymentBtn");
    const originalText = submitButton.textContent;

    if (!GOOGLE_APPS_SCRIPT_URL) {
        alert("Missing GitHub secret: GOOGLE_APPS_SCRIPT_URL. Add it in your repo settings and redeploy the site before submitting.");
        return Promise.reject(new Error("Missing Apps Script URL"));
    }

    if (submitButton.disabled || modalSubmitButton.disabled) {
        return Promise.resolve();
    }

    submitButton.disabled = true;
    modalSubmitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    modalSubmitButton.textContent = "Submitting...";

    const registrationData = buildRegistrationPayload(screenshotData);

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
            modalSubmitButton.disabled = false;
            submitButton.textContent = originalText;
            modalSubmitButton.textContent = "Confirm Payment & Submit";
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

confirmPaymentBtn.addEventListener("click", async function () {
    if (!transactionIdInput.value.trim()) {
        transactionIdInput.setCustomValidity("Please enter your UPI transaction ID.");
        transactionIdInput.reportValidity();
        return;
    }
    transactionIdInput.setCustomValidity("");

    if (paymentScreenshotInput && !paymentScreenshotInput.files.length) {
        paymentScreenshotInput.setCustomValidity("Please attach your payment screenshot.");
        paymentScreenshotInput.reportValidity();
        return;
    }
    if (paymentScreenshotInput) {
        paymentScreenshotInput.setCustomValidity("");
    }

    try {
        const screenshotData = await readScreenshotAsBase64();
        await submitRegistration(screenshotData);
    } catch (error) {
        // error handling inside submitRegistration
    }
});

cancelPaymentBtn.addEventListener("click", closePaymentModal);
closePaymentModalBtn.addEventListener("click", closePaymentModal);

paymentModal.addEventListener("click", function (event) {
    if (event.target === paymentModal) {
        closePaymentModal();
    }
});
