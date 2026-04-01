import { Search, Bell, Settings, Menu } from 'lucide-react'

export default function Header({ onMenuClick, searchPlaceholder = 'Buscar producto o código...' }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border-light">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Left: Menu button (mobile) + Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-alt text-text-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="global-search"
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-alt border border-transparent rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-1">
          <button className="relative p-2.5 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text-secondary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full ring-2 ring-white" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text-secondary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
