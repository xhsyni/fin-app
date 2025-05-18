import React, { useState } from 'react'
import { RiMoneyCnyCircleLine } from "react-icons/ri";
import { TbReceiptTax, TbMessageChatbot, TbTax } from "react-icons/tb";
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/dashboard.css';
import { BiLogOutCircle } from "react-icons/bi";
import { MdDashboard } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

function DashboardNav() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.expense);
    const [active, setActive] = useState();
    const [expanded, setExpanded] = useState(true);
    const handleClick = (name) => {
        setActive(name);
    }
    const toggleNavbar = () => {
        setExpanded(!expanded);
    }
    let data = JSON.parse(localStorage.getItem('userInfo')).user;
    const menuContent = [
        {
            name: "Income",
            href: "income",
            icon: <RiMoneyCnyCircleLine className='nav-icon' />
        },
        {
            name: "Expense",
            href: "expense",
            icon: <TbReceiptTax className='nav-icon' />
        },
        {
            name: "Tax Filing",
            href: "tax",
            icon: <TbTax className='nav-icon' />
        },
        {
            name: "Chatbot",
            href: "chatbot",
            icon: <TbMessageChatbot className='nav-icon' />
        },
        {
            name: "Profile",
            href: "profile",
            icon: <CgProfile className='nav-icon' />
        }
    ]

    const handleSignOut = async (e) => {
        e.preventDefault();
        dispatch(logoutUser())
            .unwrap()
            .then(() => {
                navigate('/');
            })
            .catch(() => { 'Invalid email and passwords!' });
    };

    return (
        <>
            <div className={`navbar ${expanded ? 'expanded' : 'collapsed'}`}>
                <div className="logo-container">
                    <MdDashboard id='logo' />
                    <span className="logo-text"><strong style={{ color: "red", fontSize: "2rem" }}>LAI</strong> CAI</span>
                </div>
                <button className="toggle-button" onClick={toggleNavbar}>
                    {expanded ? <FiChevronLeft /> : <FiChevronRight />}
                </button>
                <div className='intro'>
                    <h5>Welcome back,</h5>
                    <h4>{data.name}</h4>
                </div>
                <div className='nav-container'>
                    {menuContent.map((item) => (
                        <NavLink
                            to={item.href}
                            onClick={() => handleClick(item.name)}
                            className={`nav-item ${active === item.name ? "active" : ""}`}
                            key={item.name}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                    <NavLink to="/" className='nav-item' id='signout' onClick={handleSignOut}>
                        <BiLogOutCircle className='nav-icon' />
                        <span>Sign Out</span>
                    </NavLink>
                </div>
            </div>
            <div className='nav-content'>
                <Outlet />
                {isLoading}
            </div>
            {error && <p className="error">{error}</p>}
        </>
    )
}

export default DashboardNav