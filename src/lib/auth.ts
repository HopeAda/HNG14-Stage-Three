import { getUserList, saveUsers, saveSession, clearSession } from "./storage";
import { Session } from "@/types/auth";

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function signup(
	email: string,
	password: string,
): { success: true; session: Session } | { success: false; error: string } {
	if (email.trim() == "" || password.trim() == "") {
		return { success: false, error: "Email and Password are required" };
	}

	// ✅ added validation
	if (!isValidEmail(email)) {
		return { success: false, error: "Invalid email format" };
	}

	const users = getUserList();
	if (users.find((itm) => itm.email === email)) {
		return { success: false, error: "User already exists" };
	}

	const user = {
		id: crypto.randomUUID(),
		email: email,
		password: password,
		createdAt: new Date().toISOString(),
	};
	saveUsers([...users, user]);

	const session: Session = {
		userId: user.id,
		email: user.email,
	};
	saveSession(session);

	return { success: true, session };
}

export function login(
	email: string,
	password: string,
): { success: true; session: Session } | { success: false; error: string } {
	const users = getUserList();

	// ✅ added validation
	if (!isValidEmail(email)) {
		return { success: false, error: "Invalid email format" };
	}

	const foundUser = users.find(
		(itm) => itm.email === email && itm.password === password,
	);

	if (!foundUser) {
		return { success: false, error: "Invalid email or password" };
	}

	const session: Session = {
		userId: foundUser.id,
		email: foundUser.email,
	};

	saveSession(session);

	return {
		success: true,
		session: session,
	};
}

export function logout(): void {
	clearSession();
}
