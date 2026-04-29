import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		prefetch: vi.fn(),
	}),
	usePathname: () => "/",
	redirect: vi.fn(),
}));

vi.mock("@/components/shared/eyes", () => ({
	EyeOpen: () => <span>show</span>,
	EyeClosed: () => <span>hide</span>,
}));

function seedUser(email: string, password: string) {
	const users = [
		{
			id: "user-1",
			email,
			password,
			createdAt: new Date().toISOString(),
		},
	];
	localStorage.setItem("habit-tracker-users", JSON.stringify(users));
}

beforeEach(() => {
	localStorage.clear();
});

describe("auth flow", () => {
	it("submits the signup form and creates a session", async () => {
		render(<SignupForm />);

		fireEvent.change(screen.getByTestId("auth-signup-email"), {
			target: { value: "newuser@test.com" },
		});
		fireEvent.change(screen.getByTestId("auth-signup-password"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByTestId("auth-signup-submit"));

		await waitFor(() => {
			const raw = localStorage.getItem("habit-tracker-session");
			expect(raw).not.toBeNull();
			const session = JSON.parse(raw!);
			expect(session.email).toBe("newuser@test.com");
			expect(session.userId).toBeDefined();
		});
	});

	it("shows an error for duplicate signup email", async () => {
		seedUser("existing@test.com", "password123");

		render(<SignupForm />);

		fireEvent.change(screen.getByTestId("auth-signup-email"), {
			target: { value: "existing@test.com" },
		});
		fireEvent.change(screen.getByTestId("auth-signup-password"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByTestId("auth-signup-submit"));

		await waitFor(() => {
			expect(screen.getByText("User already exists")).toBeInTheDocument();
		});
	});

	it("submits the login form and stores the active session", async () => {
		seedUser("user@test.com", "mypassword");

		render(<LoginForm />);

		fireEvent.change(screen.getByTestId("auth-login-email"), {
			target: { value: "user@test.com" },
		});
		fireEvent.change(screen.getByTestId("auth-login-password"), {
			target: { value: "mypassword" },
		});
		fireEvent.click(screen.getByTestId("auth-login-submit"));

		await waitFor(() => {
			const raw = localStorage.getItem("habit-tracker-session");
			expect(raw).not.toBeNull();
			const session = JSON.parse(raw!);
			expect(session.email).toBe("user@test.com");
		});
	});

	it("shows an error for invalid login credentials", async () => {
		seedUser("user@test.com", "correctpassword");

		render(<LoginForm />);

		fireEvent.change(screen.getByTestId("auth-login-email"), {
			target: { value: "user@test.com" },
		});
		fireEvent.change(screen.getByTestId("auth-login-password"), {
			target: { value: "wrongpassword" },
		});
		fireEvent.click(screen.getByTestId("auth-login-submit"));

		await waitFor(() => {
			expect(
				screen.getByText("Invalid email or password"),
			).toBeInTheDocument();
		});
	});
});
