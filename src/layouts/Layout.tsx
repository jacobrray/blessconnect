import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/map', label: 'Map', icon: MapIcon },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex flex-col md:flex-row w-screen h-screen bg-gray-50 overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden">
                <Outlet />
            </main>

            {/* Navigation Bar (Bottom on Mobile, Side on Desktop) */}
            <nav className="
                md:w-64 md:h-full md:border-l md:border-t-0 border-t border-gray-200 bg-white
                flex md:flex-col justify-around md:justify-start
                px-2 py-3 md:p-4 z-50
                flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]
            ">
                <div className="hidden md:block mb-8 px-4">
                    <h1 className="text-xl font-black text-indigo-900 tracking-tight">BLESS<span className="text-indigo-500">Connect</span></h1>
                </div>

                <div className="flex md:flex-col w-full justify-around md:justify-start md:gap-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex flex-col md:flex-row items-center gap-1 md:gap-3
                                p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                                    : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-50 font-medium'
                                }
                            `}
                        >
                            <item.icon className="w-6 h-6 md:w-5 md:h-5" />
                            <span className="text-[10px] md:text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};
