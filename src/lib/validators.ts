export function validateHabitName(name: string): {
	valid: boolean;
	value: string;
	error: string | null;
} {
	let value = name.trim();
	let error = null;

	if (value == "") {
		error = "Habit name is required";
	} else if (value.length > 60) {
		error = "Habit name must be 60 characters or fewer";
	}

	const valid = !error;

	if (valid) {
		value = name.trim();
	} else {
		value = "";
	}

	return {
		valid,
		value,
		error,
	};
}
