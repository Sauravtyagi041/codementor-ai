import AuthScreen from "../auth-screen";
import { getChatGPTUser } from "../chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Login() {
  return <AuthScreen user={await getChatGPTUser()} mode="login" />;
}
