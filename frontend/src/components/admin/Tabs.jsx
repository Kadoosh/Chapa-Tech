export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
