import { Habit } from "../types/habit";

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
	const dateString = new Date(date).toLocaleDateString();

	const returnedHabitDateArray = { ...habit };

	if (!returnedHabitDateArray.completions.includes(dateString)) {
		returnedHabitDateArray.completions.push(dateString);
	} else {
		returnedHabitDateArray.completions.filter((itm) => itm !== dateString);
	}
	return returnedHabitDateArray;
}
