import React from "react";
import { NavLink } from "react-router-dom";
import "../../../node_modules/bulma/css/bulma.css";
import "./Menu.css"
const Menu = ({ options, username }) => {
    return (
        <aside className="menu">
            <p className="menu-label">Welcome {username}</p>
            <ul className="menu-list">
                {options.map((option) => (
                    <li key={option.label}>
                        <NavLink to={option.path} className={({ isActive }) => (isActive ? "is-active" : "")}>
                            {option.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Menu;
