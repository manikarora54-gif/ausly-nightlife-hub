import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = () => {
    const pathnames = window.location.pathname.split('/').filter(x => x);

    return (
        <nav aria-label="Breadcrumb">
            <ol>
                <li>
                    <Link to='/'>Home</Link>
                </li>
                {pathnames.map((pathname, index) => {
                    const routePath = `/${pathnames.slice(0, index + 1).join('/')}`;
                    return (
                        <li key={pathname}>
                            <Link to={routePath}>{pathname}</Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
