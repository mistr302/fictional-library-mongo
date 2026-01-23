// import { Button } from "@/components/ui/button"
import { Route, Routes } from "react-router"
import LoginPage from "./pages/login/page"
import { CataloguePage } from "./pages/library/catalogue"
import { BorrowPage } from "./pages/library/borrow"
function App() {
    return (
        <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/admin">
                <Route path="/books" element={<LoginPage />} />
                <Route path="/readers" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
            </Route>
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/" element={<p>Root</p>} />
        </Routes>
    )
}

export default App
