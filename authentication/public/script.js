const email = document.getElementById("email");
const password = document.getElementById("password");
const username = document.getElementById("username");
const fullName = document.getElementById("fullName");
const signupForm = document.getElementById("signupForm");
const signupSection = document.getElementById("signup");

const logEmail = document.getElementById("logemail");
const logPassword = document.getElementById("logpassword");
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("login");

const redirectLink = document.getElementById("redirect");



window.onload = async function () {
    const token = localStorage.getItem("authorization");

    if (token) {
      const response = await fetch("/me", {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.ok) {
        window.location.href = "/welcome.html";
      }
    }
  };


signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const response = await fetch("/signup", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value,
      fullName: fullName.value,
    }),
  });

  const data = await response.json();
  console.log(data);

  if (response.ok) {
    successToast(data.message);
    signupSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    redirectLink.textContent = "Don't have an account? Sign Up";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      email: logEmail.value,
      password: logPassword.value,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    successToast(data.message);
    localStorage.setItem("authorization", data.token);
    window.location.href = "welcome.html";
  } else {
    alert("Invalid credentials");
  }
});

redirectLink.addEventListener("click", () => {
  signupSection.classList.toggle("hidden");
  loginSection.classList.toggle("hidden");

  if (signupSection.classList.contains("hidden")) {
    redirectLink.textContent = "Don't have an account? Sign Up";
  } else {
    redirectLink.textContent = "Already have an account? Log In";
  }
});

function successToast(message) {
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

