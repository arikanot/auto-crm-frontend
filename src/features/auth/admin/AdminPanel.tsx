export const AdminPanel = () => {
  return (
    <div className="p-8 bg-slate-900 min-h-screen text-slate-100 flex items-center justify-center">
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">
          Панель Администратора
        </h1>
        <p className="text-sm text-slate-400">
          Сюда имеет доступ только сотрудник с ролью Admin. Здесь будут
          настройки тарифов, управление правами и удаление сотрудников.
        </p>
      </div>
    </div>
  );
};
