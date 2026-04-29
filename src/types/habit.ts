export type Frequency = "daily";

export type Habit = {
	id: string;
	userId: string;
	name: string;
	description: string;
	frequency: Frequency;
	createdAt: string;
	completions: string[];
};
