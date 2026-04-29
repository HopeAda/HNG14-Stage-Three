import { storageKeys } from "./constants";
import { Session, User } from "@/types/auth";
import { Habit } from "@/types/habit";

export const getUserList = (): User[] => {
	if (typeof window === "undefined") return [];

	const userList = localStorage.getItem(storageKeys.userKey);
	return userList ? JSON.parse(userList) : [];
};

export const saveUsers = (users: User[]): void => {
	localStorage.setItem(storageKeys.userKey, JSON.stringify(users));
};

export const getUserSession = (): Session | null => {
	if (typeof window === "undefined") return null;

	const sessionData = localStorage.getItem(storageKeys.sessionKey);
	return sessionData ? JSON.parse(sessionData) : null;
};

export const saveSession = (session: Session): void => {
	localStorage.setItem(storageKeys.sessionKey, JSON.stringify(session));
};

export const clearSession = (): void => {
	localStorage.removeItem(storageKeys.sessionKey);
};

export const getHabits = (): Habit[] => {
	if (typeof window === "undefined") return [];

	const data = localStorage.getItem(storageKeys.habitsKey);
	return data ? JSON.parse(data) : [];
};

export const saveHabits = (habits: Habit[]): void => {
	localStorage.setItem(storageKeys.habitsKey, JSON.stringify(habits));
};
