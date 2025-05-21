const input = document.getElementById("input");
const userName = document.getElementById("userName");
const btn = document.getElementById("btn");
const resultTask = document.querySelector(".task");
const getTodo = document.getElementById("getTodo");

btn.addEventListener("click", async () => {
  const response = await fetch("/add", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ user: userName.value, title: input.value }),
  });

  const data = await response.json();
  console.log(data);
});

getTodo.addEventListener("click", async () => {
  const response = await fetch(`/todos?user=${userName.value}`, {
    headers: { "Content-type": "application/json" },
  });
  const data = await response.json();
  resultTask.innerHTML = ``;
  console.log(data);

  data.forEach((todo) => {
    const p = document.createElement("p");
    p.textContent = `Id: ${todo.id}   Task: ${todo.title}`;
    resultTask.appendChild(p);
  });
});

const update = document.getElementById("update");
const deleteTask = document.getElementById("delete");
const TaskId = document.getElementById("TaskId");

update.addEventListener("click", async () => {
  const id = TaskId.value;
  const response = await fetch(`/update?user=${userName.value}&id=${id}`, {
    headers: { "Content-type": "application/json" },
    method: "PUT",
    body: JSON.stringify({ title: input.value }),
  });
  const data = await response.json();
  console.log(data);
});

deleteTask.addEventListener("click", async () => {
  const ids = TaskId.value;
  const response = await fetch(`/delete?user=${userName.value}&id=${ids}`, {
    headers: { "Content-type": "application/json" },
    method: "DELETE",
  });
  const data = await response.json();
  console.log(data);
});
