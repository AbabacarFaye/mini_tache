import { useCallback, useEffect, useState } from "react";
import API from "../services/Api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "" });
  const [taskDrafts, setTaskDrafts] = useState({});
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");
  const [savingTaskId, setSavingTaskId] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");
  const [activeTaskId, setActiveTaskId] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [groupLocked, setGroupLocked] = useState(false);

  const hasEmployees = employees.length > 0;
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "all") {
      return true;
    }

    return task.status === taskFilter;
  });

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const getStatusPillClass = (status) => {
    if (status === "in-progress") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "completed") {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const loadEmployees = async () => {
    try {
      const res = await API.get("/users/employees");
      setEmployees(res.data);
      setForm((currentForm) => ({
        ...currentForm,
        assignedTo: currentForm.assignedTo || res.data?.[0]?._id || "",
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const mapTaskDrafts = useCallback((taskList) => {
    const nextDrafts = {};

    taskList.forEach((task) => {
      nextDrafts[task._id] = {
        status: task.status || "pending",
        note: task.note || "",
      };
    });

    setTaskDrafts(nextDrafts);
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
      mapTaskDrafts(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [mapTaskDrafts]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      setTaskError("");
      setTaskSuccess("");
      await API.post("/tasks", form);
      setForm({ title: "", description: "", assignedTo: employees[0]?._id || "" });
      await loadTasks();
      alert("Tâche créée !");
    } catch (err) {
      setTaskError(err.response?.data?.message || "Impossible de créer la tâche.");
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      setSavingTaskId(taskId);
      setTaskError("");
      setTaskSuccess("");

      const payload = taskDrafts[taskId] || {};
      await API.patch(`/tasks/${taskId}`, payload);
      await loadTasks();
      setTaskSuccess("Tâche mise à jour.");
    } catch (err) {
      setTaskError(err.response?.data?.message || "Impossible de mettre à jour la tâche.");
    } finally {
      setSavingTaskId("");
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    try {
      setEmployeeError("");
      setEmployeeMessage("");

      const res = await API.post("/users/employees", { email: employeeEmail });
      await loadEmployees();
      setEmployeeEmail("");

      setEmployeeMessage(res.data.message);
    } catch (err) {
      setEmployeeError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Impossible d'ajouter cet employe."
      );
    }
  };

  const handleCreateGroup = () => {
    if (!hasEmployees) {
      setEmployeeError("Ajoute au moins un employé avant de créer le groupe.");
      return;
    }

    setEmployeeError("");
    setEmployeeMessage("Groupe créé et étape 1 verrouillée.");
    setGroupLocked(true);
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Navbar />

        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">Tableau de bord</p>
              <h1 className="mt-2 text-3xl font-bold text-ink">Bienvenue {user?.name}</h1>
              <p className="mt-2 text-sm text-slate-600">Suivez l’avancement des tâches et gérez les affectations.</p>
            </div>

            {user?.role === "manager" && (
              <div className="rounded-2xl bg-accentSoft px-4 py-3 text-sm font-semibold text-accent">
                Accès manager activé
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-ink">
                  {user?.role === "employee" ? "Mes tâches" : "Liste des tâches"}
                </h2>

                <select
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value)}
                >
                  <option value="all">Toutes les tâches</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">En progrès</option>
                  <option value="completed">Fini</option>
                </select>
              </div>
              <div className="grid gap-4">
                {filteredTasks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                    Aucune tâche pour le moment.
                  </div>
                )}

                {filteredTasks.map((task) => {
                  const taskDraft = taskDrafts[task._id] || {
                    status: task.status || "pending",
                    note: task.note || "",
                  };

                  return (
                    <article key={task._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTaskId((currentTaskId) =>
                            currentTaskId === task._id ? "" : task._id
                          )
                        }
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-ink">{task.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                          {task.note && (
                            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              Note: {task.note}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-slate-500">
                            Dernière mise à jour: {formatDate(task.updatedAt)}
                          </p>
                          {task.assignedTo?.name && (
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                              Assignée à {task.assignedTo.name}
                            </p>
                          )}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusPillClass(task.status)}`}>
                          {task.status}
                        </span>
                      </button>

                      {user?.role === "employee" && activeTaskId === task._id && (
                        <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-2 text-sm font-medium text-slate-700">
                              <span>Progression</span>
                              <select
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                                value={taskDraft.status}
                                onChange={(e) =>
                                  setTaskDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [task._id]: {
                                      ...(currentDrafts[task._id] || {}),
                                      status: e.target.value,
                                    },
                                  }))
                                }
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">En progrès</option>
                                <option value="completed">Fini</option>
                              </select>
                            </label>

                            <label className="space-y-2 text-sm font-medium text-slate-700">
                              <span>Note rapide</span>
                              <textarea
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                                rows="3"
                                value={taskDraft.note}
                                onChange={(e) =>
                                  setTaskDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [task._id]: {
                                      ...(currentDrafts[task._id] || {}),
                                      note: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Ajoute une petite note"
                              />
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateTask(task._id)}
                            disabled={savingTaskId === task._id}
                            className="w-full rounded-xl bg-ink px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {savingTaskId === task._id ? "Enregistrement..." : "Enregistrer la progression"}
                          </button>
                        </div>
                      )}

                    </article>
                  );
                })}
              </div>
            </div>

            {user?.role === "manager" && (
              <aside className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Workflow manager</p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">Créer un groupe puis assigner des tâches</h2>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      currentStep === 1 ? "bg-accent text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    1. Groupe
                  </button>
                  <button
                    type="button"
                    onClick={() => groupLocked && setCurrentStep(2)}
                    disabled={!groupLocked}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      currentStep === 2
                        ? "bg-ink text-white"
                        : groupLocked
                          ? "bg-slate-100 text-slate-700"
                          : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }`}
                  >
                    2. Tâches
                  </button>
                </div>

                {currentStep === 1 && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-semibold text-ink">Étape 1: Ajouter des employés</h3>
                      {groupLocked && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Groupe verrouillé
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                        placeholder="Email employé"
                        type="email"
                        value={employeeEmail}
                        required
                        disabled={groupLocked}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                      />

                      <button
                        disabled={groupLocked}
                        className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        Ajouter employé
                      </button>
                    </form>

                    {employeeMessage && (
                      <p className="text-sm font-medium text-emerald-700">{employeeMessage}</p>
                    )}
                    {employeeError && (
                      <p className="text-sm font-medium text-red-600">{employeeError}</p>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-ink">Employés du groupe ({employees.length})</p>
                      <ul className="mt-3 space-y-2">
                        {employees.length === 0 && (
                          <li className="text-sm text-slate-500">Aucun employé pour le moment.</li>
                        )}
                        {employees.map((emp) => (
                          <li key={emp._id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            {emp.name} ({emp.email})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateGroup}
                      disabled={!hasEmployees || groupLocked}
                      className={`w-full rounded-2xl px-4 py-3 font-semibold transition ${
                        hasEmployees && !groupLocked
                          ? "bg-ink text-white hover:-translate-y-0.5 hover:bg-slate-800"
                          : "cursor-not-allowed bg-slate-200 text-slate-400"
                      }`}
                    >
                      Créer le groupe
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">Groupe finalisé</p>
                        <p className="text-xs text-emerald-700">Les employés sont verrouillés pour cette session.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGroupLocked(false);
                          setCurrentStep(1);
                          setEmployeeMessage("Le groupe peut maintenant être modifié.");
                        }}
                        className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Modifier le groupe
                      </button>
                    </div>

                    <h3 className="text-base font-semibold text-ink">Étape 2: Créer une tâche</h3>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                        placeholder="Titre"
                        value={form.title}
                        required
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />

                      <textarea
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                        placeholder="Description"
                        rows="4"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />

                      <select
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                        value={form.assignedTo}
                        required
                        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                      >
                        <option value="" disabled>
                          Choisir un employé
                        </option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>

                      <button className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
                        Créer la tâche
                      </button>

                      {taskError && (
                        <p className="text-sm font-medium text-red-600">{taskError}</p>
                      )}
                      {taskSuccess && (
                        <p className="text-sm font-medium text-emerald-700">{taskSuccess}</p>
                      )}
                    </form>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Retour à l'étape 1
                    </button>
                  </div>
                )}
              </aside>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;