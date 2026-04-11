import type { JwtPayload } from "jwt-decode";
import ChatLayout from "./components/ChatLayout";


export default function HomePage({token}:{token?:JwtPayload & { username?: string; userId?: string; firstName?:string; } | null}){
  if (token)
    return <ChatLayout username={token.username||""} userId={token.userId||""} firstName={token.firstName||""} />
  else
    return <div>Log in</div>
}