import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';

/**
 * Dynamic Admin Breadcrumbs component
 */
export const AdminBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
      <Link to="/admin" className="hover:text-amber-400 flex items-center gap-1 transition">
        <Shield className="w-3.5 h-3.5 text-amber-500" />
        <span>Admin</span>
      </Link>
      {pathnames.slice(1).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
        const isLast = index === pathnames.slice(1).length - 1;
        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            {isLast ? (
              <span className="text-slate-200 font-semibold uppercase">{name}</span>
            ) : (
              <Link to={routeTo} className="hover:text-amber-400 transition uppercase">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default AdminBreadcrumbs;
