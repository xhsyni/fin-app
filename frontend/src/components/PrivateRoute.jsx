import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    let data = JSON.parse(localStorage.getItem('userInfo'));
    const token = data.token.access;
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
