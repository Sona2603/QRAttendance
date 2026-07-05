export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="text-2xl" />
          </div>
        )}
      </div>
    </div>
  )
}
