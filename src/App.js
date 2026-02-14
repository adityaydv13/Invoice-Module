import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./frontend/pages/Home.jsx";
import InvoiceDetails from "./frontend/pages/InvoiceDetails.jsx";
import AddInvoice from "./frontend/pages/AddInvoice.jsx";
import Login from "./frontend/pages/Login.jsx";
import Register from "./frontend/pages/Register.jsx";

function App() {
  return (
     
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/invoice/:id" element={<InvoiceDetails />} />
        <Route path="/add-invoice" element={<AddInvoice />} />
      </Routes>
     
  );
}

export default App;