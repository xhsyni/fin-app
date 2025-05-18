import './App.css';
import PrivateRoute from './components/PrivateRoute';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import IncomePage from './pages/incomePage';
import ExpensePage from './pages/expensePage';
import DashboardNav from './pages/dashboardNav';
import Profile from './components/profile/Profile';
import './styles/analytic.css';
import AddIncomePage from './pages/AddIncomePage';
import AddExpensePage from './pages/AddExpensePage';
import TaxFiling from './pages/taxPage';
import ExportTaxPage from './pages/ExportTaxPage';
import ChatPage from './pages/chatPage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user"
            element={
              <PrivateRoute>
                <DashboardNav />
              </PrivateRoute>
            }
          >
            <Route path="income" element={<IncomePage />} >
              <Route path="add-income" element={<AddIncomePage />} />
              <Route path="modify-income/:id" element={<AddIncomePage />} />
            </Route>
            <Route path="expense" element={<ExpensePage />} >
              <Route path="add-expense" element={<AddExpensePage />} />
              <Route path="modify-expense/:id" element={<AddExpensePage />} />
            </Route>
            <Route path="tax" element={<TaxFiling />} >
              <Route path="report" element={<ExportTaxPage />} />
              <Route path="manage-tax" element={<ExportTaxPage />} />
            </Route>
            <Route path="chatbot" element={<ChatPage />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="register" element={<SignupPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
