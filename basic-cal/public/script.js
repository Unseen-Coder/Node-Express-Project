const btn = document.getElementById("btn");
const result = document.getElementById("result");
const select = document.getElementById("opt");

btn.addEventListener("click", async () => {
  const input1 = document.getElementById("text1");

  const input2 = document.getElementById("text2");
  const operation = select.value;

  if (!input1 || !input2) {
    return alert("Input elements not found.");
  }

  const num1 = parseInt(input1.value);
  const num2 = parseInt(input2.value);

  if (isNaN(num1) || isNaN(num2)) {
    return alert("Please enter valid numbers.");
  }

  switch (operation) {
    case "+":
      try {
        const response = await fetch("/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: num1, b: num2 }),
        });
        const data = await response.json();
        result.textContent = `Result: ${data.msg}`;
      } catch (error) {
        console.log(error);
      }
      break;
    case "-":
      try {
        const response = await fetch("/sub", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: num1, b: num2 }),
        });
        const data = await response.json();
        result.textContent = `Result: ${data.msg}`;
      } catch (error) {
        console.log(error);
      }
      break;
    case "/":
      try {
        const response = await fetch("/div", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: num1, b: num2 }),
        });
        const data = await response.json();
        result.textContent = `Result: ${data.msg}`;
      } catch (error) {
        console.log(error);
      }
      break;
    case "*":
      try {
        const response = await fetch("/mul", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: num1, b: num2 }),
        });
        const data = await response.json();
        result.textContent = `Result: ${data.msg}`;
      } catch (error) {
        console.log(error);
      }
      break;

    default:
      result.innerHTML = "Please select oprations";
      break;
  }
});
