const form = document.getElementById("restoreForm");

form.addEventListener("submit", (e) => {

  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  
  fetch("/api/users/restore", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (response.status === 200) {
        console.log("contraseña cambiada")
    } else {
      console.log("algo salio mal");
    }
  });
});