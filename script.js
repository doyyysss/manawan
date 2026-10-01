const API = {
  students: "api/students.php",
  companies: "api/companies.php",
  placements: "api/placements.php",
  progress: "api/progress.php",
  evaluations: "api/evaluations.php",
};

const titles = {
  overview: "System Overview",
  students: "Student Profile Management",
  placements: "Internship Placement Management",
  companies: "Company Management",
  progress: "Progress Monitoring",
  evaluations: "Evaluation & Report Management",
};

let data = {
  students: [],
  placements: [],
  companies: [],
  progress: [],
  evaluations: [],
};

async function apiRequest(url, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

async function loadAllData() {
  const [students, companies, placements, progress, evaluations] = await Promise.all([
    apiRequest(API.students),
    apiRequest(API.companies),
    apiRequest(API.placements),
    apiRequest(API.progress),
    apiRequest(API.evaluations),
  ]);

  data = {
    students: students.data,
    companies: companies.data,
    placements: placements.data,
    progress: progress.data,
    evaluations: evaluations.data,
  };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function emptyState(title, message) {
  return `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>`;
}

function badgeClass(value) {
  return (value || "").toLowerCase().replace(/\s+/g, "-");
}

function studentName(id) {
  return data.students.find((s) => s.id === Number(id))?.name || "Unknown";
}

function companyName(id) {
  return data.companies.find((c) => c.id === Number(id))?.name || "Unknown";
}

function populateStudentSelects() {
  ["placementStudent", "progressStudent", "evaluationStudent"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const current = el.value;
    el.innerHTML =
      '<option value="">Select student</option>' +
      data.students
        .map((s) => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.idNo)})</option>`)
        .join("");
    if (current) el.value = current;
  });
}

function populateCompanySelect() {
  const el = document.getElementById("placementCompany");
  if (!el) return;
  const current = el.value;
  el.innerHTML =
    '<option value="">Select company</option>' +
    data.companies
      .map((c) => `<option value="${c.id}">${escapeHtml(c.name)} – ${escapeHtml(c.vacancy)}</option>`)
      .join("");
  if (current) el.value = current;
}

async function handleAction(action) {
  try {
    await action();
    await loadAllData();
    renderAll();
  } catch (error) {
    alert(error.message || "Something went wrong.");
  }
}

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("is-visible"));
    document.getElementById(`section-${section}`).classList.add("is-visible");
    document.getElementById("pageTitle").textContent = titles[section];
  });
});

/* Students */
const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("studentEditId").value;
  const payload = {
    name: document.getElementById("studentName").value.trim(),
    idNo: document.getElementById("studentIdNo").value.trim(),
    phone: document.getElementById("studentPhone").value.trim(),
    course: document.getElementById("studentCourse").value.trim(),
    year: document.getElementById("studentYear").value,
    notes: document.getElementById("studentNotes").value.trim(),
  };

  handleAction(async () => {
    if (editId) {
      await apiRequest(`${API.students}?id=${editId}`, "PUT", payload);
    } else {
      await apiRequest(API.students, "POST", payload);
    }
    resetStudentForm();
  });
});

document.getElementById("studentCancelBtn").addEventListener("click", resetStudentForm);

function resetStudentForm() {
  studentForm.reset();
  document.getElementById("studentEditId").value = "";
  document.getElementById("studentCancelBtn").hidden = true;
  document.getElementById("studentSubmitBtn").textContent = "Save Profile";
}

function editStudent(id) {
  const s = data.students.find((x) => x.id === Number(id));
  if (!s) return;
  document.getElementById("studentEditId").value = s.id;
  document.getElementById("studentName").value = s.name;
  document.getElementById("studentIdNo").value = s.idNo;
  document.getElementById("studentPhone").value = s.phone;
  document.getElementById("studentCourse").value = s.course;
  document.getElementById("studentYear").value = s.year;
  document.getElementById("studentNotes").value = s.notes;
  document.getElementById("studentCancelBtn").hidden = false;
  document.getElementById("studentSubmitBtn").textContent = "Update Profile";
  document.querySelector('[data-section="students"]').click();
}

function deleteStudent(id) {
  if (!confirm("Delete this student profile?")) return;
  handleAction(() => apiRequest(`${API.students}?id=${id}`, "DELETE"));
}

function renderStudents() {
  document.getElementById("studentCount").textContent = `${data.students.length} profile${data.students.length !== 1 ? "s" : ""}`;

  if (!data.students.length) {
    studentList.innerHTML = emptyState("No student profiles", "Add student details, contact, and academic information.");
    return;
  }

  studentList.innerHTML = data.students
    .map(
      (s) => `
    <article class="record-card">
      <div>
        <h4>${escapeHtml(s.name)}</h4>
        <p>${escapeHtml(s.idNo)} · ${escapeHtml(s.course)} · ${escapeHtml(s.year)}</p>
        <p>${escapeHtml(s.phone)}</p>
        ${s.notes ? `<p><em>${escapeHtml(s.notes)}</em></p>` : ""}
        <div class="record-meta"><span class="badge approved">Profile Updated</span></div>
      </div>
      <div class="record-actions">
        <button type="button" class="btn btn-ghost btn-sm" onclick="editStudent(${s.id})">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Delete</button>
      </div>
    </article>`
    )
    .join("");
}

/* Placements */
const placementForm = document.getElementById("placementForm");
const placementList = document.getElementById("placementList");

if (!document.getElementById("placementDate").value) {
  document.getElementById("placementDate").value = new Date().toISOString().slice(0, 10);
}

placementForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("placementEditId").value;
  const payload = {
    studentId: Number(document.getElementById("placementStudent").value),
    companyId: Number(document.getElementById("placementCompany").value),
    position: document.getElementById("placementPosition").value.trim(),
    date: document.getElementById("placementDate").value,
    approval: document.getElementById("placementApproval").value,
    status: document.getElementById("placementStatus").value,
  };

  handleAction(async () => {
    if (editId) {
      await apiRequest(`${API.placements}?id=${editId}`, "PUT", payload);
    } else {
      await apiRequest(API.placements, "POST", payload);
    }
    resetPlacementForm();
  });
});

document.getElementById("placementCancelBtn").addEventListener("click", resetPlacementForm);

function resetPlacementForm() {
  placementForm.reset();
  document.getElementById("placementEditId").value = "";
  document.getElementById("placementDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("placementCancelBtn").hidden = true;
}

function editPlacement(id) {
  const p = data.placements.find((x) => x.id === Number(id));
  if (!p) return;
  document.getElementById("placementEditId").value = p.id;
  document.getElementById("placementStudent").value = p.studentId;
  document.getElementById("placementCompany").value = p.companyId;
  document.getElementById("placementPosition").value = p.position;
  document.getElementById("placementDate").value = p.date;
  document.getElementById("placementApproval").value = p.approval;
  document.getElementById("placementStatus").value = p.status;
  document.getElementById("placementCancelBtn").hidden = false;
  document.querySelector('[data-section="placements"]').click();
}

function deletePlacement(id) {
  if (!confirm("Delete this placement record?")) return;
  handleAction(() => apiRequest(`${API.placements}?id=${id}`, "DELETE"));
}

function renderPlacements() {
  document.getElementById("placementCount").textContent = `${data.placements.length} application${data.placements.length !== 1 ? "s" : ""}`;

  if (!data.placements.length) {
    placementList.innerHTML = emptyState("No placements yet", "Submit application details, preferred company, and coordinator approval.");
    return;
  }

  placementList.innerHTML = data.placements
    .map(
      (p) => `
    <article class="record-card">
      <div>
        <h4>${escapeHtml(studentName(p.studentId))} → ${escapeHtml(companyName(p.companyId))}</h4>
        <p>Position: ${escapeHtml(p.position)} · Applied: ${escapeHtml(p.date)}</p>
        <div class="record-meta">
          <span class="badge ${badgeClass(p.approval)}">${escapeHtml(p.approval)}</span>
          <span class="badge ${badgeClass(p.status)}">${escapeHtml(p.status)}</span>
        </div>
      </div>
      <div class="record-actions">
        <button type="button" class="btn btn-ghost btn-sm" onclick="editPlacement(${p.id})">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deletePlacement(${p.id})">Delete</button>
      </div>
    </article>`
    )
    .join("");
}

/* Companies */
const companyForm = document.getElementById("companyForm");
const companyList = document.getElementById("companyList");

companyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("companyEditId").value;
  const payload = {
    name: document.getElementById("companyName").value.trim(),
    industry: document.getElementById("companyIndustry").value.trim(),
    contact: document.getElementById("companyContact").value.trim(),
    email: document.getElementById("companyEmail").value.trim(),
    phone: document.getElementById("companyPhone").value.trim(),
    address: document.getElementById("companyAddress").value.trim(),
    vacancy: document.getElementById("companyVacancy").value.trim(),
    slots: document.getElementById("companySlots").value,
  };

  handleAction(async () => {
    if (editId) {
      await apiRequest(`${API.companies}?id=${editId}`, "PUT", payload);
    } else {
      await apiRequest(API.companies, "POST", payload);
    }
    resetCompanyForm();
  });
});

document.getElementById("companyCancelBtn").addEventListener("click", resetCompanyForm);

function resetCompanyForm() {
  companyForm.reset();
  document.getElementById("companyEditId").value = "";
  document.getElementById("companySlots").value = 1;
  document.getElementById("companyCancelBtn").hidden = true;
}

function editCompany(id) {
  const c = data.companies.find((x) => x.id === Number(id));
  if (!c) return;
  document.getElementById("companyEditId").value = c.id;
  document.getElementById("companyName").value = c.name;
  document.getElementById("companyIndustry").value = c.industry;
  document.getElementById("companyContact").value = c.contact;
  document.getElementById("companyEmail").value = c.email;
  document.getElementById("companyPhone").value = c.phone;
  document.getElementById("companyAddress").value = c.address;
  document.getElementById("companyVacancy").value = c.vacancy;
  document.getElementById("companySlots").value = c.slots;
  document.getElementById("companyCancelBtn").hidden = false;
  document.querySelector('[data-section="companies"]').click();
}

function deleteCompany(id) {
  if (!confirm("Delete this company record?")) return;
  handleAction(() => apiRequest(`${API.companies}?id=${id}`, "DELETE"));
}

function renderCompanies() {
  document.getElementById("companyCount").textContent = `${data.companies.length} compan${data.companies.length !== 1 ? "ies" : "y"}`;

  if (!data.companies.length) {
    companyList.innerHTML = emptyState("No companies registered", "Add company profiles and internship vacancy listings.");
    return;
  }

  companyList.innerHTML = data.companies
    .map(
      (c) => `
    <article class="record-card">
      <div>
        <h4>${escapeHtml(c.name)}</h4>
        <p>${escapeHtml(c.industry)} · Contact: ${escapeHtml(c.contact)}</p>
        <p>${escapeHtml(c.email)} · ${escapeHtml(c.phone)} · ${escapeHtml(c.address)}</p>
        <div class="record-meta">
          <span class="badge approved">${escapeHtml(c.vacancy)}</span>
          <span class="badge pending">${escapeHtml(c.slots)} slot${c.slots !== "1" ? "s" : ""}</span>
        </div>
      </div>
      <div class="record-actions">
        <button type="button" class="btn btn-ghost btn-sm" onclick="editCompany(${c.id})">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteCompany(${c.id})">Delete</button>
      </div>
    </article>`
    )
    .join("");
}

/* Progress */
const progressForm = document.getElementById("progressForm");
const progressList = document.getElementById("progressList");

progressForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("progressEditId").value;
  const payload = {
    studentId: Number(document.getElementById("progressStudent").value),
    week: document.getElementById("progressWeek").value.trim(),
    attendance: document.getElementById("progressAttendance").value,
    supervisor: document.getElementById("progressSupervisor").value,
    report: document.getElementById("progressReport").value.trim(),
  };

  handleAction(async () => {
    if (editId) {
      await apiRequest(`${API.progress}?id=${editId}`, "PUT", payload);
    } else {
      await apiRequest(API.progress, "POST", payload);
    }
    resetProgressForm();
  });
});

document.getElementById("progressCancelBtn").addEventListener("click", resetProgressForm);

function resetProgressForm() {
  progressForm.reset();
  document.getElementById("progressEditId").value = "";
  document.getElementById("progressAttendance").value = 5;
  document.getElementById("progressCancelBtn").hidden = true;
}

function editProgress(id) {
  const p = data.progress.find((x) => x.id === Number(id));
  if (!p) return;
  document.getElementById("progressEditId").value = p.id;
  document.getElementById("progressStudent").value = p.studentId;
  document.getElementById("progressWeek").value = p.week;
  document.getElementById("progressAttendance").value = p.attendance;
  document.getElementById("progressSupervisor").value = p.supervisor;
  document.getElementById("progressReport").value = p.report;
  document.getElementById("progressCancelBtn").hidden = false;
  document.querySelector('[data-section="progress"]').click();
}

function deleteProgress(id) {
  if (!confirm("Delete this progress log?")) return;
  handleAction(() => apiRequest(`${API.progress}?id=${id}`, "DELETE"));
}

function renderProgress() {
  document.getElementById("progressCount").textContent = `${data.progress.length} log${data.progress.length !== 1 ? "s" : ""}`;

  if (!data.progress.length) {
    progressList.innerHTML = emptyState("No progress logs", "Record attendance, weekly reports, and supervisor updates.");
    return;
  }

  progressList.innerHTML = data.progress
    .map(
      (p) => `
    <article class="record-card">
      <div>
        <h4>${escapeHtml(studentName(p.studentId))} — ${escapeHtml(p.week)}</h4>
        <p>Attendance: ${escapeHtml(p.attendance)} day(s) present</p>
        <p>${escapeHtml(p.report)}</p>
        <div class="record-meta">
          <span class="badge ${badgeClass(p.supervisor)}">${escapeHtml(p.supervisor)}</span>
        </div>
      </div>
      <div class="record-actions">
        <button type="button" class="btn btn-ghost btn-sm" onclick="editProgress(${p.id})">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteProgress(${p.id})">Delete</button>
      </div>
    </article>`
    )
    .join("");
}

/* Evaluations */
const evaluationForm = document.getElementById("evaluationForm");
const evaluationList = document.getElementById("evaluationList");

evaluationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("evaluationEditId").value;
  const payload = {
    studentId: Number(document.getElementById("evaluationStudent").value),
    supervisor: document.getElementById("evaluationSupervisor").value.trim(),
    rating: document.getElementById("evaluationRating").value,
    grade: document.getElementById("evaluationGrade").value.trim(),
    status: document.getElementById("evaluationStatus").value,
    comments: document.getElementById("evaluationComments").value.trim(),
    report: document.getElementById("evaluationReport").value.trim(),
  };

  handleAction(async () => {
    if (editId) {
      await apiRequest(`${API.evaluations}?id=${editId}`, "PUT", payload);
    } else {
      await apiRequest(API.evaluations, "POST", payload);
    }
    resetEvaluationForm();
  });
});

document.getElementById("evaluationCancelBtn").addEventListener("click", resetEvaluationForm);

function resetEvaluationForm() {
  evaluationForm.reset();
  document.getElementById("evaluationEditId").value = "";
  document.getElementById("evaluationRating").value = 4;
  document.getElementById("evaluationCancelBtn").hidden = true;
}

function editEvaluation(id) {
  const ev = data.evaluations.find((x) => x.id === Number(id));
  if (!ev) return;
  document.getElementById("evaluationEditId").value = ev.id;
  document.getElementById("evaluationStudent").value = ev.studentId;
  document.getElementById("evaluationSupervisor").value = ev.supervisor;
  document.getElementById("evaluationRating").value = ev.rating;
  document.getElementById("evaluationGrade").value = ev.grade;
  document.getElementById("evaluationStatus").value = ev.status;
  document.getElementById("evaluationComments").value = ev.comments;
  document.getElementById("evaluationReport").value = ev.report;
  document.getElementById("evaluationCancelBtn").hidden = false;
  document.querySelector('[data-section="evaluations"]').click();
}

function deleteEvaluation(id) {
  if (!confirm("Delete this evaluation record?")) return;
  handleAction(() => apiRequest(`${API.evaluations}?id=${id}`, "DELETE"));
}

function renderEvaluations() {
  document.getElementById("evaluationCount").textContent = `${data.evaluations.length} record${data.evaluations.length !== 1 ? "s" : ""}`;

  if (!data.evaluations.length) {
    evaluationList.innerHTML = emptyState("No evaluations yet", "Submit supervisor evaluations, final reports, and grades.");
    return;
  }

  evaluationList.innerHTML = data.evaluations
    .map(
      (ev) => `
    <article class="record-card">
      <div>
        <h4>${escapeHtml(studentName(ev.studentId))} — Grade: ${escapeHtml(ev.grade)}</h4>
        <p>Supervisor: ${escapeHtml(ev.supervisor)} · Rating: ${escapeHtml(ev.rating)}/5</p>
        <p><strong>Evaluation:</strong> ${escapeHtml(ev.comments)}</p>
        <p><strong>Final Report:</strong> ${escapeHtml(ev.report)}</p>
        <div class="record-meta">
          <span class="badge ${badgeClass(ev.status)}">${escapeHtml(ev.status)}</span>
        </div>
      </div>
      <div class="record-actions">
        <button type="button" class="btn btn-ghost btn-sm" onclick="editEvaluation(${ev.id})">Edit</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteEvaluation(${ev.id})">Delete</button>
      </div>
    </article>`
    )
    .join("");
}

function renderOverview() {
  document.getElementById("statStudents").textContent = data.students.length;
  document.getElementById("statPlacements").textContent = data.placements.filter((p) => p.status === "Confirmed").length;
  document.getElementById("statCompanies").textContent = data.companies.length;
  document.getElementById("statEvaluations").textContent = data.evaluations.filter((e) => e.status !== "Archived").length;

  const feed = document.getElementById("activityFeed");
  const items = [];

  data.students.slice(0, 3).forEach((s) => items.push({ time: s.updatedAt, text: `Student profile updated: ${s.name}` }));
  data.placements.slice(0, 3).forEach((p) =>
    items.push({ time: p.updatedAt, text: `Placement ${p.status.toLowerCase()}: ${studentName(p.studentId)} at ${companyName(p.companyId)}` })
  );
  data.progress.slice(0, 2).forEach((p) =>
    items.push({ time: p.updatedAt, text: `Progress logged for ${studentName(p.studentId)} — ${p.week}` })
  );
  data.evaluations.slice(0, 2).forEach((e) =>
    items.push({ time: e.updatedAt, text: `Evaluation ${e.status.toLowerCase()} for ${studentName(e.studentId)}` })
  );

  items.sort((a, b) => new Date(b.time) - new Date(a.time));

  if (!items.length) {
    feed.innerHTML = emptyState("No activity yet", "Start by adding students, companies, and placement records.");
    return;
  }

  feed.innerHTML = items
    .slice(0, 8)
    .map(
      (item) => `
    <div class="activity-item">
      <span class="activity-dot"></span>
      <div>
        <p>${escapeHtml(item.text)}</p>
        <time>${new Date(item.time).toLocaleString()}</time>
      </div>
    </div>`
    )
    .join("");
}

function renderAll() {
  populateStudentSelects();
  populateCompanySelect();
  renderStudents();
  renderPlacements();
  renderCompanies();
  renderProgress();
  renderEvaluations();
  renderOverview();
}

try {
  const user = JSON.parse(sessionStorage.getItem("internpath_user") || "null");
  if (!user?.username) {
    window.location.href = "index.html";
  } else {
    document.getElementById("adminName").textContent = user.username;
  }
} catch (_) {
  window.location.href = "index.html";
}

loadAllData()
  .then(renderAll)
  .catch(() => {
    alert("Cannot load data. Make sure XAMPP Apache + MySQL are running and the database is imported.");
  });
