import { Habit, Frequency } from "../types/habit";
import { getHabits, getUserSession, saveHabits } from "./storage";

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
	const dateString = new Date(date).toISOString().split("T")[0];

	let completedDates = [...habit.completions];

	if (!completedDates.includes(dateString)) {
		completedDates.push(dateString);
	} else {
		completedDates = completedDates.filter((itm) => itm !== dateString);
	}
	return { ...habit, completions: completedDates };
}

export function createHabit(name: string, description: string): Habit {
	const currentUser = getUserSession();
	if (!currentUser) throw new Error("No session");
	const frequency: Frequency = "daily";

	const habit = {
		id: crypto.randomUUID(),
		userId: currentUser.userId,
		name: name,
		description: description,
		frequency: frequency,
		createdAt: new Date().toISOString(),
		completions: [],
	};

	const habits = getHabits();
	saveHabits([...habits, habit]);
	return habit;
}

export function getUserHabits(): Habit[] {
	const currentUser = getUserSession();

	if (!currentUser) return [];

	const allHabits = getHabits();
	const userHabits = allHabits.filter(
		(itm) => itm.userId === currentUser.userId,
	);

	return userHabits;
}

export function updateHabit(
	id: string,
	name: string,
	description: string,
): Habit | null {
	const allHabits = getHabits();

	const habitIndex = allHabits.findIndex((itm) => itm.id == id);
	if (habitIndex === -1) return null;

	const updated = {
		...allHabits[habitIndex],
		name: name,
		description,
	};

	allHabits[habitIndex] = updated;
	saveHabits(allHabits);

	return updated;
}

export function deleteHabit(id: string): void {
	const allHabits = getHabits();

	saveHabits(allHabits.filter((itm) => itm.id !== id));
}

export function completeHabit(id: string, date: string): void {
	const allHabits = getHabits();
	const habitIndex = allHabits.findIndex((itm) => itm.id == id);
	if (habitIndex == -1) return;

	const updated = toggleHabitCompletion(allHabits[habitIndex], date);
	allHabits[habitIndex] = updated;

	saveHabits(allHabits);
}
