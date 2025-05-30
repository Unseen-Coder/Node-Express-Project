const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const otpForm = document.getElementById("otp-form");
const showSignupBtn = document.getElementById("show-signup");
const showLoginBtn = document.getElementById("show-login");
const resendOtpBtn = document.getElementById("resend-otp");
const otpInputs = document.querySelectorAll(".otp-digit");
const userEmail = "";

showSignupBtn.addEventListener("click", () => {
  loginForm.classList.remove("active");
  signupForm.classList.add("active");
  otpForm.classList.remove("active");
});

showLoginBtn.addEventListener("click", () => {
  signupForm.classList.remove("active");
  loginForm.classList.add("active");
  otpForm.classList.remove("active");
});

otpInputs.forEach((input, index) => {
  input.addEventListener("keyup", (e) => {
    if (e.key >= "0" && e.key <= "9") {
      if (index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    } else if (e.key === "Backspace") {
      if (index > 0) {
        otpInputs[index - 1].focus();
      }
    }
  });
});

document.getElementById("login-form-element").addEventListener("submit",async function (e) {
  e.preventDefault();
    const email=document.getElementById("login-email").value;
    const password=document.getElementById("login-password").value;

    const response=await fetch("/signin",{
         method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    })

    const data=await response.json();
    
    if(data.success){
        successToast(data.message);
        window.location.href='dashboard.html';
        localStorage.setItem("token", data.token);

    }else{
        errorToast(data.message);
    }

});

document.getElementById("signup-form-element").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  localStorage.setItem("userEmail", email);

  const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();
  successToast(data.message);

  signupForm.classList.remove("active");
  otpForm.classList.add("active");
});

document.getElementById("otp-form-element").addEventListener("submit", async function (e) {
  e.preventDefault();

  const userEmail = localStorage.getItem("userEmail");

  const otpDigits = Array.from(document.querySelectorAll(".otp-digit"))
    .map((input) => input.value.trim())
    .join("");

  if (otpDigits.length !== 4 || isNaN(otpDigits)) {
    errorToast("Please enter a valid 4-digit OTP");
    return;
  }

  if (!userEmail) {
    errorToast("User email not found. Please try again.");
    return;
  }

  try {
    const response = await fetch("/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, otp: otpDigits }),
    });

    const result = await response.json();

    if (result.success) {
      successToast(result.message);
        localStorage.removeItem("userEmail");
      otpForm.classList.remove("active");
      loginForm.classList.add("active");

    } else {
      errorToast(result.message);
    }
  } catch (error) {
    errorToast("Error verifying OTP. Please try again.");
    console.error("Error:", error);
  }
});

resendOtpBtn.addEventListener("click", () => {
  console.log("Resend OTP clicked");
  otpInputs.forEach((input) => (input.value = ""));
  otpInputs[0].focus();
});

















function removeExistingToast(id) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}

function successToast(message) {
  removeExistingToast("success-toast");

  const toast = document.createElement("div");
  toast.className = "toast-base toast-success show";
  toast.id = "success-toast";

  const icon = document.createElement("div");
  icon.className = "toast-icon";
  icon.innerHTML = '<i class="fas fa-check"></i>';

  const msg = document.createElement("div");
  msg.className = "toast-message";
  msg.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(msg);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function errorToast(message) {
  removeExistingToast("error-toast");

  const toast = document.createElement("div");
  toast.className = "toast-base toast-error show";
  toast.id = "error-toast";

  const icon = document.createElement("div");
  icon.className = "toast-icon";
  icon.innerHTML = '<i class="fas fa-times"></i>';

  const msg = document.createElement("div");
  msg.className = "toast-message";
  msg.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(msg);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
