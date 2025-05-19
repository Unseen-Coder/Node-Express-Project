async function shortenUrl() {
  const urlInput = document.getElementById("urlInput");
  const resultDiv = document.getElementById("result");


  const url=urlInput.value;
if (!url) return showToast("Please enter a valid URL.");
  const response = await fetch("/shorten", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ originalURL: url }),
  });
  const data = await response.json();
  console.log(data);

  resultDiv.innerHTML = `<a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a>`;
}



function showToast(message) {
  toast.textContent = message;
  toast.style.opacity = 1;
  toast.style.top = "50px";
  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.top = "30px";
  }, 3000);
}
