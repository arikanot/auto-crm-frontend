import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "manager":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "mechanic":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tight text-blue-500">
                AutoShift
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400 border border-slate-700">
                v1.0
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>

              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadge(user?.role)}`}
              >
                {user?.role.toUpperCase()}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white px-3 py-1.5 text-sm font-medium text-slate-300 transition-all cursor-pointer"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-6 backdrop-blur-md">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Рабоковое пространство
          </h1>
          <p className="text-slate-400 text-sm">
            Вы успешно авторизовались. В следующем шаге здесь появится
            полноценная база данных клиентов СТО и их автомобилей.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center opacity-40">
              <p className="font-semibold text-sm">Модуль "Клиенты"</p>
              <p className="text-xs text-slate-500 mt-1">
                В разработке (Спринт 2)
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center opacity-40">
              <p className="font-semibold text-sm">Модуль "Заказы"</p>
              <p className="text-xs text-slate-500 mt-1">
                В разработке (Спринт 3)
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center opacity-40">
              <p className="font-semibold text-sm">Модуль "Склад"</p>
              <p className="text-xs text-slate-500 mt-1">
                В разработке (Спринт 3)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
