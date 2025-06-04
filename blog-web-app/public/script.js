document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.getElementById('menuIcon');
    const slideMenu = document.getElementById('slideMenu');
    const overlay = document.getElementById('overlay');
    const closeMenu = document.getElementById('closeMenu');
    const menuLinks = document.querySelectorAll('.slide-menu-nav a');
    const contentPages = document.querySelectorAll('.content-page');
    const logoutBtn = document.getElementById('logoutBtn');
    const logo = document.getElementById('logo');
    const blogForm = document.querySelector('.blog-form form');
    function openMenu() {
        menuIcon.classList.add('active');
        slideMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMenuFunc() {
        menuIcon.classList.remove('active');
        slideMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPage(category) {
        contentPages.forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(category + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
        }

        menuLinks.forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-category="${category}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    menuIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        if (slideMenu.classList.contains('active')) {
            closeMenuFunc();
        } else {
            openMenu();
        }
    });
    logo.addEventListener('click', function () {
        showPage('home');
    });

    closeMenu.addEventListener('click', closeMenuFunc);
    overlay.addEventListener('click', closeMenuFunc);

    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');

            showPage(category);

            closeMenuFunc();
        });
    });

    if (blogForm) {
        blogForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const title = document.getElementById('blogTitle').value;
            const content = document.getElementById('blogContent').value;
            const category = document.getElementById('blogCategory').value;
            const imageInput = document.getElementById('blogImage');


            if (imageInput.files.length === 0) {
                errorToast('Please select an image');
                return;
            }

            const file = imageInput.files[0];

            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });

            try {
                const base64String = await toBase64(file);

                const res = await fetch('/api/blogs/newpost', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        body: content,
                        category,
                        imagepost: base64String,
                    }),
                    credentials: 'include',
                });

                const data = await res.json();

                if (data.success) {
                    successToast(data.message)
                    allBlogs();
                    userBlogs();
                    blogForm.reset();
                } else {
                    errorToast(data.message)
                    console.error('Post error:', data);
                }
            } catch (err) {
                console.error('Error reading or sending image:', err);
            }
        });
    }


    logoutBtn.addEventListener('click', async function () {

        try {
            const res = await fetch("/api/users/logout", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                console.log(data);
                successToast(data.message)
                window.location.href = "authentication.html"
            } else {
                errorToast(data.message)

            }
        } catch (err) {
            console.error("Error on logout:", err);
        }

    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && slideMenu.classList.contains('active')) {
            closeMenuFunc();
        }
    });

    slideMenu.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});

window.onload = allBlogs();

async function allBlogs() {
    const blogs = document.getElementById("homeContent");

    try {
        const res = await fetch("/api/blogs/allblogs", {
            method: "GET",
            headers: { "Content-type": "application/json" }
        });

        const data = await res.json();

        if (data.success) {

            blogs.innerHTML = "";
            data.blog.forEach((e) => {
                blogs.innerHTML += `
                    <div class="parent">
                    <div class="user-profile">
                        <div class="avatar">
                            <img src="${e.author.profilepic || 'logos.svg'}" alt="User Avatar" />
                        </div>
                        <div class="details">
                            <h4>${e.author.name}</h4>
                            <p>${e.author.about}</p>
                        </div>
                        </div>
                        <div class="div2">${e.title}
                        </div>
                        <div class="content-wrapper">
                            <img src="${e.imagepost}" alt="Blog image" class="div1">
                            <div class="text-content">
                                <div class="div3">${e.body}</div>
                                <div class="div4">Published by ${e.author?.name || "Unknown"}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            blogs.innerHTML = "<p>Failed to load blogs.</p>";
            window.location.href = "authentication.html"
        }
    } catch (err) {
        console.error("Error fetching blogs:", err);
        blogs.innerHTML = "<p>Error loading blogs.</p>";
    }
};

async function fetchData() {
    try {
        const res = await fetch("/api/users/get-user", {
            method: "GET",
            headers: { "Content-type": "application/json" },
            credentials: "include"
        })
        const data = await res.json();
        if (data.success) {
            document.getElementById("update-email").value = data.user.email;
            document.getElementById("update-name").value = data.user.name;
            document.getElementById("update-bio").value = data.user.about;
            document.getElementById("update-profile-pic").src = data.user.profilepic || "logos.svg";
            document.getElementById("profile-pic").src = data.user.profilepic || "logos.svg";
            document.getElementById("profile-name").innerHTML = data.user.name;
            document.getElementById("profile-bio").innerHTML = data.user.about;
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

document.addEventListener("DOMContentLoaded", fetchData())


const chooseFileInput = document.getElementById("update-choose");

chooseFileInput.onchange = async function () {
    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async function () {
        const base64String = reader.result;

        try {
            const res = await fetch("/api/users/profilepic", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    profilepic: base64String,
                }),
                credentials: "include"
            });

            const data = await res.json();

            if (data.success) {

                await fetchData();
                successToast(data.message)
            } else {
                errorToast("Image should be less then 50kb")
            }
        } catch (err) {
            console.error("Failed to upload profile picture:", err);
        }
    };

    reader.onerror = () => {
        errorToast("Failed to read file. Please try again.");
    };

    reader.readAsDataURL(file);
};


//Authentication.js Logic here
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


document.getElementById("send").addEventListener("click", async (e) => {
    e.preventDefault();
    const name = document.getElementById("update-name").value;
    const about = document.getElementById("update-bio").value;
    try {
        const res = await fetch("/api/users/profileupdate", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                about: about
            }),
            credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
            fetchData()
            successToast(data.message)

        } else {
            errorToast(data.message)
        }
    } catch (err) {
        console.error("Failed to update profile:", err);
    }
})
document.addEventListener("DOMContentLoaded", userBlogs())

async function userBlogs() {
    const containenBlog = document.getElementById("allBlogsContent");
    containenBlog.innerHTML = "";
    try {
        const res = await fetch("/api/blogs/getpost", {
            method: "GET",
            headers: { "Content-type": "application/json" },
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            data.posts.forEach((e) => {
                const newDiv = document.createElement("div");
                newDiv.className = "area-blogs";
                newDiv.innerHTML = `
                <div class="heading">
                        <h3>${e.title}</h3>
                    </div>
                    <div class="body-blog">
                        <textarea name="blog" class="all-blogs" rows="7" readonly>${e.body}</textarea>
                        <div class="buttons">
                            <button id="edit" class="edit">Edit</button>
                            <button id="delete" class="delete">Delete</button>
                        </div>
                </div>
                `;
                containenBlog.appendChild(newDiv);

                const editBtn = newDiv.querySelector('.edit');
                const deleteBtn = newDiv.querySelector('.delete');

                editBtn.addEventListener("click", () => openModal(e));
                deleteBtn.addEventListener("click", async () => {
                    try {
                        const res = await fetch("/api/blogs/deleteblogs", {
                            method: "DELETE",
                            headers: { "Content-type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ blogId: e._id })
                        })
                        const data = await res.json();
                        if (data.success) {
                            allBlogs();
                            userBlogs();
                            successToast(data.message);

                        }
                        else {
                            errorToast(e.message)
                        }

                    } catch (err) {
                        console.error("Failed to delete blogs:", err);
                    }
                });
            })
        }

    } catch (err) {
        console.error("Failed to getting blogs:", err);
    }
}

const modal = document.getElementById("editBlogModal");
const closeBtn = document.getElementById("closeEditModal");

function openModal(article) {
    document.getElementById("editModalTitle").textContent = "Edit Blog";
    document.getElementById("editBlogTitle").value = article.title;
    document.getElementById("editBlogContent").value = article.body;
    document.getElementById("blogId").value = article._id
    document.getElementById("editBlogCategory").value = article.category || "";

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
}



closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
        closeModal();
    }
});


document.querySelector(".update-blog-btn").addEventListener("click", async (e) => {
    e.preventDefault();

    const title = document.getElementById("editBlogTitle").value;
    const blogId = document.getElementById("blogId").value;
    const body = document.getElementById("editBlogContent").value;
    const imageInput = document.getElementById("editBlogImage");
    const category = document.getElementById("editBlogCategory").value;

    let base64String = null;

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }

    try {
        const res = await fetch("/api/blogs/updatepost", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                blogId,
                title,
                body,
                imagepost: base64String,
                category
            }),
        });

        const data = await res.json();
        if (data.success) {
            allBlogs();
            successToast(data.message)
        } else {
            console.warn("Update failed:", data.message);
            errorToast(data.message);
        }
    } catch (err) {
        console.error("Failed to update:", err);
    }
});



//toast

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


async function searchQuery(query) {
  const blogs = document.getElementById("homeContent");
  blogs.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(`/api/blogs/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();

    if (data.success) {
      if (data.results.length === 0) {
        blogs.innerHTML = "<p>No blogs found for your search.</p>";
        return;
      }

      blogs.innerHTML = "";

      data.results.forEach((e) => {
        blogs.innerHTML += `
          <div class="parent">
            <div class="user-profile">
              <div class="avatar">
                <img src="${e.author?.profilepic || "logos.svg"}" alt="User Avatar" />
              </div>
              <div class="details">
                <h4>${e.author?.name || "Anonymous"}</h4>
                <p>${e.author?.about || ""}</p>
              </div>
            </div>
            <div class="div2">${e.title}</div>
            <div class="content-wrapper">
              <img src="${e.imagepost}" alt="Blog image" class="div1" />
              <div class="text-content">
                <div class="div3">${e.body}</div>
                <div class="div4">Published by ${e.author?.name || "Unknown"}</div>
              </div>
            </div>
          </div>
        `;
      });
    } else {
      blogs.innerHTML = "<p>No blogs found for your search.</p>";
    }
  } catch (error) {
    console.error("Search error:", error);
    blogs.innerHTML = "<p>Something went wrong. Please try again later.</p>";
  }
}

document.getElementById("btn").addEventListener("click", async (e) => {
    e.preventDefault();
  const query = document.getElementById("query").value.trim();
  if (query) {
    await searchQuery(query);
  } else {
    await allBlogs();
  }
});

document.getElementById("query").addEventListener("input", async (e) => {
  if (e.target.value.trim() === "") {
    await allBlogs();
  }
});

document.getElementById("query").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = document.getElementById("query").value.trim();
    if (query) {
      await searchQuery(query);
    } else {
      await allBlogs();
    }
  }
});
