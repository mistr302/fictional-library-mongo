// import { Button } from "@/components/ui/button"
import { Route, Routes } from "react-router"
import LoginPage from "./pages/login/page"
function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<p>Root</p>} />
        </Routes>
    )
}

export default App
