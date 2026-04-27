import { getUserList, saveUsers, saveSession, clearSession } from "./storage";
import { Session } from "@/types/auth";

export function signup(
	email: string,
	password: string,
): { success: true; session: Session } | { success: false; error: string } {
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
