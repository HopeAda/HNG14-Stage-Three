import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { toggleHabitCompletion } from "@/lib/habits";

const habit = {
	id: "34",
	userId: "ada123",
	name: "go-to-sleep",
	description: "Go to bed early",
	frequency: "daily",
	createdAt: "2026-01-21",
	completions: ["2026-04-02", "2026-04-01", "2026-03-30"],
};

describe("toggleHabitCompletion", () => {
	it("adds a completion date when the date is not present", () => {
		const result = toggleHabitCompletion(habit, "2026-04-03");
		expect(result).toStrictEqual({
			...habit,
			completions: [...habit.completions, "2026-04-03"],
		});
	});

	it("removes a completion date when the date already exists", () => {
		const result = toggleHabitCompletion(habit, "2026-04-02");

		expect(result).toStrictEqual({
			...habit,
			completions: habit.completions.filter(
				(itm) => itm !== "2026-04-02",
			),
		});
	});

	it("does not mutate the original habit object", () => {
		const originalCopy = {
			...habit,
			completions: [...habit.completions],
		};

		toggleHabitCompletion(habit, "2026-04-03");

		expect(habit).toStrictEqual(originalCopy);
	});

	it("does not return duplicate completion dates", () => {
		const result = toggleHabitCompletion(habit, "2026-04-02");

		expect(result).toStrictEqual({
			...habit,
			completions: habit.completions.filter(
				(itm) => itm !== "2026-04-02",
			),
		});

		expect(
			result.completions.filter((itm) => itm === "2026-04-02").length,
		).toStrictEqual(0);
	});
});
