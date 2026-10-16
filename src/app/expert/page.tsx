import { getExpertRegistrationInfo } from "./actions";
import { ExpertLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function ExpertLoginPage() {
  const info = await getExpertRegistrationInfo();
  return <ExpertLoginForm registrationOpen={info.open} codeRequired={info.codeRequired} />;
}
