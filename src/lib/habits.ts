import { Habit } from "../types/habit";

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
