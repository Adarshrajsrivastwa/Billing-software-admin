import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Tag,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  List,
  Receipt,
  UserPlus,
  FolderOpen,
  UserCog,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const [activeItem, setActiveItem] = useState("/dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    {
      name: "Projects",
      icon: Building2,
      path: "/projects",
      children: [
        { name: "Add Project", path: "/projects/add", icon: PlusCircle },
        { name: "All Projects", path: "/projects/all", icon: List },
        { name: "Project Billing", path: "/projects/billing", icon: Receipt },
      ],
    },
    {
      name: "Clients",
      icon: Users,
      path: "/clients",
      children: [
        { name: "Add Client", path: "/clients/add", icon: UserPlus },
        { name: "All Clients", path: "/clients/all", icon: List },
      ],
    },
    {
      name: "Item / Service Catalog",
      icon: Package,
      path: "/catalog",
      children: [
        { name: "Add Item", path: "/catalog/add", icon: PlusCircle },
        { name: "All Items", path: "/catalog/all", icon: List },
      ],
    },
    {
      name: "Categories",
      icon: Tag,
      path: "/categories",
      children: [
        { name: "Add Category", path: "/categories/add", icon: PlusCircle },
        { name: "All Categories", path: "/categories/all", icon: FolderOpen },
      ],
    },
    {
      name: "Quotation",
      icon: FileText,
      path: "/quotation",
      children: [
        { name: "Create Quotation", path: "/quotation?action=create", icon: PlusCircle },
        { name: "All Quotations",   path: "/quotation", icon: List },
      ],
    },
    { name: "Admin Management", icon: UserCog, path: "/users", adminOnly: true },
    { name: "Logout", icon: LogOut, path: "/logout" },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  const isParentActive = (item) =>
    item.path === activeItem ||
    (item.children || []).some((c) => c.path === activeItem);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? "" : name));
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logoutUser();
    navigate("/");
  };

  const handleNavigation = (item) => {
    if (item.path === "/logout") {
      setShowLogoutModal(true); // 👈 Show popup instead of navigating
      return;
    }
    if (item.children && item.children.length > 0) {
      toggleMenu(item.name);
    } else {
      setActiveItem(item.path);
      setOpenMenu("");
      if (window.innerWidth < 768) setIsOpen(false);
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden text-white bg-purple-600 p-2.5 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        onClick={() => setIsOpen((s) => !s)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white text-gray-800 shadow-xl flex flex-col transition-transform duration-300 z-40 border-r border-gray-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="px-3 py-4 mb-2 bg-gradient-to-r from-purple-600 to-purple-700 mx-3 mt-3 rounded-xl shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Interior Billing
              </h2>
              <p className="text-[10px] text-purple-200">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-5 mb-2 mt-1">
          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
            Main Menu
          </p>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          <ul className="text-sm flex flex-col space-y-1">
            {visibleItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const parentActive = isParentActive(item);
              const isOpenThis = openMenu === item.name;
              const Icon = item.icon;

              return (
                <li key={item.name} className="flex flex-col">
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 w-full text-left
                      ${
                        item.path === "/logout"
                          ? "hover:bg-red-50 text-red-500 mt-1"
                          : isOpenThis || parentActive
                            ? "bg-purple-600 text-white shadow-md"
                            : "hover:bg-purple-50 text-gray-700"
                      }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        size={17}
                        className={
                          item.path === "/logout"
                            ? "text-red-400"
                            : isOpenThis || parentActive
                              ? "text-white"
                              : "text-gray-500"
                        }
                      />
                      <span className="text-[13px]">{item.name}</span>
                    </span>
                    {hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`transform transition-transform duration-300 ${
                          isOpenThis ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {hasChildren && (
                    <div
                      className={`ml-6 mt-1 overflow-hidden transition-all duration-300 ${
                        isOpenThis
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="flex flex-col space-y-0.5 pb-1 border-l-2 border-purple-200 pl-3">
                        {item.children.map((sub) => {
                          const subActive = activeItem === sub.path;
                          const SubIcon = sub.icon || List;
                          return (
                            <li key={sub.name}>
                              <button
                                onClick={() => {
                                  setActiveItem(sub.path);
                                  setOpenMenu(item.name);
                                  if (window.innerWidth < 768) setIsOpen(false);
                                  navigate(sub.path);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium transition-all duration-200 w-full text-left
                                  ${
                                    subActive
                                      ? "bg-purple-100 text-purple-600"
                                      : "hover:bg-gray-50 text-gray-600"
                                  }`}
                              >
                                <SubIcon size={14} />
                                <span>{sub.name}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="mx-3 mb-3 px-3 py-2.5 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-[11px] font-semibold text-gray-700 mb-0.5">
            Need Help?
          </p>
          <p className="text-[10px] text-gray-500">Contact Support</p>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ✅ LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-7 h-7 text-red-500" />
              </div>
            </div>
            {/* Text */}
            <h3 className="text-center text-gray-800 font-semibold text-base mb-1">
              Logout karna chahte hain?
            </h3>
            <p className="text-center text-gray-500 text-[13px] mb-6">
              Aap sure hain? Aapko dobara login karna padega.
            </p>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d8b4fe; }
      `}</style>
    </>
  );
};

export default Sidebar;
