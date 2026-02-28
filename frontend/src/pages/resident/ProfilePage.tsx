import { useAuth } from "../../context/AuthContext"
export default function ResidentProfilePage() { const { user } = useAuth(); return <div className="border border-white/10 rounded-2xl p-6">{user?.name}<br/>{user?.email}<br/>Role: {user?.role}</div> }
