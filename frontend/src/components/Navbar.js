import { useNavigate } from "react-router-dom";

function Navbar() {
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem("user"));

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Mini Tache</p>
				<h2 className="mt-1 text-lg font-bold text-ink">Espace {user?.role ?? "utilisateur"}</h2>
			</div>

			<button
				type="button"
				onClick={handleLogout}
				className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
			>
				Déconnexion
			</button>
		</header>
	);
}

export default Navbar;
