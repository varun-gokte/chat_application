import type { JwtPayload } from "jwt-decode";
import ChatLayout from "./components/ChatLayout";
import LandingPage from "./components/LandingPage";


export default function HomePage({token}:{token?:JwtPayload & { username?: string; userId?: string; firstName?:string; } | null}){
  if (token)
    return <ChatLayout username={token.username||""} userId={token.userId||""} />
  else
    return <LandingPage />
}