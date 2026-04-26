export function calculateCurrentStreak(
	completions: string[],
	today?: string,
): number {
	const thisDay = today ? new Date(today) : new Date();
	const thisDayString = thisDay.toISOString().split("T")[0];

	let dateArray = [...new Set(completions)];
	dateArray = dateArray.sort((a, b) => {
		return new Date(a).getTime() - new Date(b).getTime();
	});

	const sortedSet = new Set(dateArray);
	if (!sortedSet.has(thisDayString)) return 0;

	let streak = 0;
	const current = new Date(thisDayString);

	while (true) {
		const dateCurrent = current.toISOString().split("T")[0];

		if (sortedSet.has(dateCurrent)) {
			streak++;
			current.setDate(current.getDate() - 1);
		} else {
			break;
		}
	}

	return streak;
}
