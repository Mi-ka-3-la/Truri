import { Link, useLocation } from "react-router";
import {
  BarChart3,
  FileText,
  TrendingUp,
  Calendar,
  FileCheck,
  Receipt,
  DollarSign,
  FileSpreadsheet,
  Layers,
  Folder,
  Settings,
  HelpCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-[240px] bg-[#f8f9fb] border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">AVISE</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/") && !location.pathname.includes("income")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-sm">Balance Sheet</span>
          </Link>

          <Link
            to="/income-statement"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/income-statement")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Income Statement</span>
          </Link>

          <Link
            to="/flux-analysis"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/flux-analysis")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Flux Analysis</span>
          </Link>

          <div className="h-px bg-gray-200 my-4" />

          <Link
            to="/tasks"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/tasks")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="text-sm">Tasks</span>
          </Link>

          <Link
            to="/reconciliations"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/reconciliations")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span className="text-sm">Reconciliations</span>
          </Link>

          <Link
            to="/schedules"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/schedules")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Schedules</span>
          </Link>

          <Link
            to="/revenue"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/revenue")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Revenue</span>
          </Link>

          <Link
            to="/accruals"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/accruals")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="text-sm">Accruals</span>
          </Link>

          <Link
            to="/entries"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/entries")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm">Entries</span>
          </Link>

          <Link
            to="/transactions"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/transactions")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="text-sm">Transactions</span>
          </Link>

          <Link
            to="/bills"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/bills")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Bills</span>
          </Link>

          <Link
            to="/file-library"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/file-library")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="text-sm">File Library</span>
          </Link>

          <div className="h-px bg-gray-200 my-4" />

          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/settings")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>

          <Link
            to="/help"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              isActive("/help")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Help</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section - Avise AI Button */}
      <div className="p-4 border-t border-gray-200">
        {/* Option 1: Modern Card Style with Subtle Accent */}
        <Link
          to="/avise-ai"
          className="group block p-4 rounded-xl bg-white border-2 border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">Avise AI</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded">
                  NEW
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 pl-11">
            AI-powered financial insights
          </p>
        </Link>

        {/* Option 2: Clean with Left Accent Border */}
        {/* <Link
          to="/avise-ai"
          className="group block relative pl-4 pr-3 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"></div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-blue-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 text-sm">Avise AI</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full">
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">Smart insights</p>
            </div>
          </div>
        </Link> */}

        {/* Option 3: Glassmorphic Modern Style */}
        {/* <Link
          to="/avise-ai"
          className="group block p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-500/10 backdrop-blur-sm border border-blue-200/50 hover:border-blue-300/70 hover:from-blue-500/15 hover:via-indigo-500/15 hover:to-blue-500/15 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/80 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-gray-900 text-sm">Avise AI</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full shadow-sm">
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-700">Financial intelligence</p>
            </div>
          </div>
        </Link> */}

        {/* Option 4: Minimalist with Hover Effect */}
        {/* <Link
          to="/avise-ai"
          className="group block p-3 rounded-lg border border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-600 group-hover:bg-blue-700 transition-colors">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 text-sm">Avise AI</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded">
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">Ask me anything</p>
            </div>
            <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link> */}
      </div>
    </div>
  );
}