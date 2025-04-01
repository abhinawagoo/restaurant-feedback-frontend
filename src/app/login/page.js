// src/app/login/page.js
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In - Restaurant Feedback",
  description: "Sign in to your restaurant feedback dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
