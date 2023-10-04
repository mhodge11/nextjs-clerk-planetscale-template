import { absoluteUrl } from "@/lib/utils";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp afterSignUpUrl={absoluteUrl("")} />;
}
