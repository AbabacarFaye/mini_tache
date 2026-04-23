import { useState } from "react";
import API from "../services/Api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);

      toast.success("Compte créé", {
        style: {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        },
      });

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de créer le compte.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="mb-8 space-y-2 text-center">
          <span className="inline-flex items-center rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Mini Tache
          </span>
          <h1 className="text-3xl font-bold text-ink">Créer un compte</h1>
          <p className="text-sm text-slate-600">Ajoutez un collaborateur ou un manager à l’équipe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            placeholder="Nom"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            placeholder="Email"
            type="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            type="password"
            placeholder="Mot de passe"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            defaultValue="employee"
          >
            <option value="employee">Employé</option>
            <option value="manager">Manager</option>
          </select>

          <button className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
            S’inscrire
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà inscrit ?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-accent transition hover:text-blue-700"
          >
            Retour à la connexion
          </button>
        </p>
      </section>
    </main>
  );
}

export default Register;