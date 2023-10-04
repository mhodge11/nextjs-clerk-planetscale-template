import { absoluteUrl } from "@/lib/utils";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn afterSignInUrl={absoluteUrl("")} />;
}
