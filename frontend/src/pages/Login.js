import { useState } from "react";
import API from "../services/Api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await API.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    navigate("/dashboard");
  };

  return (
    <main className="flex flex-col md:flex-row h-screen px-4 py-6">
      <section className="flex items-center justify-center  w-full md:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-glow backdrop-blur-xl">
          <div className="mb-8 space-y-2 text-center">
            <span className="inline-flex items-center rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Mini Tache
            </span>
            <h1 className="text-3xl font-bold text-ink">Connexion</h1>
            <p className="text-sm text-slate-600">Accédez à votre espace de travail en quelques secondes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
              Se connecter
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-accent transition hover:text-blue-700"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </section>

      <section className="w-full md:w-1/2  md:flex flex-col ">
        <div className=" w-full h-screen border-white/60 bg-[url('../public/stock-vector-project-management-mind-map-scheme-removebg-preview.png')] bg-no-repeat bg-cover bg-center"> </div> 
        <div className="hidden w-full  border-white/60 p-8 md:block">
          <h2 className="text-2xl font-bold text-black">Gérez vos tâches efficacement</h2>
          <p className="mt-4 text-slate-500">
            Mini Tache vous aide à suivre l'avancement de vos projets et à collaborer avec votre équipe en toute simplicité.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;