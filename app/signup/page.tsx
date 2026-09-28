import AuthScreen from "../auth-screen";
import { getChatGPTUser } from "../chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Signup() {
  return <AuthScreen user={await getChatGPTUser()} mode="signup" />;
}
