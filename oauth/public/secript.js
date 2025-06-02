document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const passwordField = this.previousElementSibling;

            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.textContent = 'visibility_off';
            } else {
                passwordField.type = 'password';
                this.textContent = 'visibility';
            }
        });
    });

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        const res = await fetch('/signin', {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
        const data = await res.json();
        if (data.success) {
            console.log(data);
            window.location.href = "welcome.html"

        }
    });

    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const fullname = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const termsChecked = document.getElementById('terms').checked;

        if (!fullname || !email || !password) {
            alert('Please fill in all fields');
            return;
        }


        if (!termsChecked) {
            alert('Please accept the terms and conditions');
            return;
        }

        const res = await fetch("/signup", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ fullname, email, password }),
        })

        const data = await res.json();
        if (data.success) {
            console.log(data.message);
            console.log(data);

            window.location.href = "welcome.html"
        }

    });


    const googleButtons = document.querySelectorAll('.google-btn');

    googleButtons.forEach(button => {
        button.addEventListener('click', async function () {
            window.location.href = "/auth/google";

        });
    });
});