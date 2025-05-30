(async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch("/verify-session", {
      method: "GET",
      headers: {
        token: token,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Session check failed:", err);
    alert("Unable to verify session. Please try refreshing.");
  }
})();

async function fetchData() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/get-profile", {
      method: "GET",
      headers: {
        token: token,
      },
    });

    const data = await res.json();

    if (data.success) {
      const profile = data.message;

      document.getElementById("email").value = profile.email || "";
      document.getElementById("name").value = profile.name || "";
      document.getElementById("username").value = profile.username || "";
      document.getElementById("password").value = profile.password || "";
      document.getElementById("address").value = profile.address || "";
      document.getElementById("mobnumber").value = profile.mobnumber || "";
      document.getElementById("bio").value = profile.bio || "";

      const dateStr = new Date(profile.createdAt).toISOString().slice(0, 10);
      const statusWithDate = `${profile.status} since ${dateStr}` || "";
      document.getElementById("status").value = statusWithDate;

      document.getElementById("update-email").value = profile.email || "";
      document.getElementById("update-name").value = profile.name || "";
      document.getElementById("update-username").value = profile.username || "";
      document.getElementById("update-address").value = profile.address || "";
      document.getElementById("update-mobnumber").value = profile.mobnumber || "";
      document.getElementById("update-bio").value = profile.bio || "";

      document.getElementById("update-status").value = statusWithDate;

      const socialLinks = profile.socialLinks || {};
      document.getElementById("update-facebook-input").value = socialLinks.facebook || "";
      document.getElementById("update-instagram-input").value = socialLinks.instagram || "";
      document.getElementById("update-linkedin-input").value = socialLinks.linkedin || "";
      document.getElementById("update-twitter-input").value = socialLinks.twitter || "";

      const profilePic = profile.profilepic;
      if (profilePic) {
        document.getElementById("profile-pic").src = profilePic;
        document.getElementById("sidepic").src = profilePic;
        document.getElementById("update-profile-pic").src = profilePic;
        document.getElementById("uname").innerHTML = profile.username || "";
      }

      const facebookEl = document.querySelector('a[href=""][target="_blank"] i.fa-facebook');
      if (facebookEl && facebookEl.parentElement) {
        facebookEl.parentElement.href = socialLinks.facebook || "#";
      }

      const instagramEl = document.querySelector('a[href=""][target="_blank"] i.fa-instagram');
      if (instagramEl && instagramEl.parentElement) {
        instagramEl.parentElement.href = socialLinks.instagram || "#";
      }

      const linkedinEl = document.querySelector('a[href=""][target="_blank"] i.fa-linkedin');
      if (linkedinEl && linkedinEl.parentElement) {
        linkedinEl.parentElement.href = socialLinks.linkedin || "#";
      }

      const twitterEl = document.querySelector('a[href=""][target="_blank"] i.fa-twitter-square');
      if (twitterEl && twitterEl.parentElement) {
        twitterEl.parentElement.href = socialLinks.twitter || "#";
      }
    } else {
      console.warn("Profile fetch failed:", data.message || "No data.success");
    }
  } catch (err) {
    console.error("Failed to fetch profile:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector("#btn");
  const navLinks = document.querySelectorAll(".nav-list a");
  const sections = document.querySelectorAll(".home-section");

  closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const target = link.getAttribute("data-target");

      sections.forEach(section => {
        section.style.display = section.id === target ? "block" : "none";
      });

      if (target === 'update-profile') {
        fetchData();
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/get-profile", {
      method: "GET",
      headers: {
        token: token,
      },
    });

    const data = await res.json();

    if (data.success) {
      const profilePic = data.message.profilepic;

      if (profilePic) {
        document.getElementById("sidepic").src = profilePic;
        document.getElementById("update-profile-pic").src = profilePic;
        document.getElementById("uname").innerHTML = data.message.username || "";
      }
    } else {
      console.warn("Profile fetch failed:", data.message || "No data.success");
    }
  } catch (err) {
    console.error("Failed to fetch profile:", err);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const enableEditingBtn = document.querySelector("#update-show-form .btn-outline");

  if (enableEditingBtn) {
    enableEditingBtn.addEventListener("click", function () {
      const inputFields = document.querySelectorAll("#update-show-form input:not(#update-email, #update-status)");

      inputFields.forEach(input => {
        if (input.readOnly) {
          input.readOnly = false;
          input.classList.add("editable");
          this.innerHTML = '<i class="fas fa-lock"></i> Disable Editing';
          this.classList.remove("btn-outline");
          this.classList.add("btn-secondary");
        } else {
          input.readOnly = true;
          input.classList.remove("editable");
          this.innerHTML = '<i class="fas fa-edit"></i> Enable Editing';
          this.classList.remove("btn-secondary");
          this.classList.add("btn-outline");
        }
      });
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .editable {
      background-color: white !important;
      border-color: var(--primary-color) !important;
      color: var(--text-primary) !important;
      cursor: text !important;
    }
  `;
  document.head.appendChild(style);
});


window.onload = fetchData;

const chooseFileInput = document.getElementById("update-choose");

chooseFileInput.onchange = async function () {
  const token = localStorage.getItem("token");
  const file = this.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64String = reader.result;

    try {
      const res = await fetch("/profile-pic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          profilepic: base64String,
        }),
      });

      const data = await res.json();

      if (data.success) {

        await fetchData();
        successToast(data.message);
      } else {
        errorToast(data.message || "Failed to upload profile picture");
      }
      console.log(data);
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      errorToast("Profile picture size is too large(50kb limit).");
    }
  };

  reader.onerror = () => {
    errorToast("Failed to read file. Please try again.");
  };

  reader.readAsDataURL(file);
};

document.getElementById("send").addEventListener("click", async (e) => {
  const token = localStorage.getItem("token");
  e.preventDefault();

  const name = document.getElementById("update-name").value;
  const address = document.getElementById("update-address").value;
  const mobnumber = document.getElementById("update-mobnumber").value;
  const username = document.getElementById("update-username").value;
  const facebook = document.getElementById("update-facebook-input").value;
  const instagram = document.getElementById("update-instagram-input").value;
  const linkedin = document.getElementById("update-linkedin-input").value;
  const twitter = document.getElementById("update-twitter-input").value;
  const bio = document.getElementById("update-bio").value;

  const socialLinks = { facebook, instagram, linkedin, twitter };

  try {
    const res = await fetch("/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify({
        name: name,
        username: username,
        address: address,
        mobnumber: mobnumber,
        socialLinks: socialLinks,
        bio: bio,
      })
    });

    const data = await res.json();
    console.log(data);

    if (data.success) {
      successToast(data.message);
    }
  } catch (err) {
    console.error("Failed to update profile:", err);
  }
});



// Toast notification utility functions
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

document.getElementById("delete").addEventListener("click", async (e) => {
  const token = localStorage.getItem("token");
  e.preventDefault();
  console.log("Hello");

  const res = await fetch("/delte-profile", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      token: token,
    },
  });
  const data = await res.json();
  if (data.success) {
    successToast(data.message);
    console.log(data);

    setTimeout(() => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }, 5000)
  }
})
document.getElementById("log_out").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
})


const doc = document.querySelector(".profile-card-row-container");
window.onload = async () => {
  loader.style.display = "block";
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/get-users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: token
      }
    });

    const data = await res.json();
    loader.style.display = "none";
    const users = data.users;
    if (data.success) {


      users.forEach((u) => {
        doc.innerHTML += `
          <div class="profile-card-container">
            <div class="profile-section">
              <div class="pic-view">
                <img src="${u.profilepic || 'usersi.jpg'}" alt="Profile Picture" />
              </div>
            </div>

            <div class="profile-info">
              <div class="profile-username">Name: <span>${u.name || ''}</span></div>
              <div class="profile-name">Username: <span>${u.username || ''}</span></div>
              <div class="profile-email">Email: <span>${u.email || ''}</span></div>
              <div class="profile-bio">Bio: <span>${u.bio || ''}</span></div>

              <div class="social-section">
                <label>Social media</label>
                <div class="social-links">
                  <a href="${u.socialLinks?.facebook || '#'}" target="_blank" class="social-link facebook">
                    <i class="fa-brands fa-facebook"></i>
                  </a>
                  <a href="${u.socialLinks?.instagram || '#'}" target="_blank" class="social-link instagram">
                    <i class="fab fa-instagram"></i>
                  </a>
                  <a href="${u.socialLinks?.linkedin || '#'}" target="_blank" class="social-link linkedin">
                    <i class="fab fa-linkedin"></i>
                  </a>
                  <a href="${u.socialLinks?.twitter || '#'}" target="_blank" class="social-link twitter">
                    <i class="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }

  } catch (error) {
    console.error("Error loading users:", error);
  }
};
