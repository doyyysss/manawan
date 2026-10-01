const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const togglePass = document.getElementById("togglePass");

togglePass.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePass.textContent = showing ? "Show" : "Hide";
  togglePass.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

function showError(message) {
  formError.hidden = false;
  formError.textContent = message;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError("Please enter your username and password.");
    return;
  }

  submitBtn.classList.add("is-loading");
  submitBtn.querySelector("span").textContent = "Signing in…";

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showError(result.message || "Login failed.");
      return;
    }

    sessionStorage.setItem(
      "internpath_user",
      JSON.stringify({
        ...result.user,
        remember: document.getElementById("rememberMe").checked,
      })
    );

    window.location.href = "dashboard.html";
  } catch (_) {
    showError("Cannot connect to the database server. Open http://localhost:8080/internship/ after starting Apache and MySQL in XAMPP.");
  } finally {
    submitBtn.classList.remove("is-loading");
    submitBtn.querySelector("span").textContent = "Sign in";
  }
});
