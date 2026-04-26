import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { validateHabitName } from "@/lib/validators";

describe("validateHabitName", () => {
	it("returns an error when habit name is empty", () => {
		const result = validateHabitName("");
		expect(result).toStrictEqual({
			valid: false,
			value: "",
			error: "Habit name is required",
		});
	});

	it("returns an error when habit name exceeds 60 characters", () => {
		const result = validateHabitName(
			"iafua ufa fiaufaiufiauf aiufoa foia uofuaof uaof uoaufoia fioa oifaio foiafo iaof ao foau foia ufoaufo auofuao fuoa foauif asoif saof oaf oas fa f a fapo fuaof ua faofa fua f asf a fp",
		);

		expect(result).toStrictEqual({
			valid: false,
			value: "",
			error: "Habit name must be 60 characters or fewer",
		});
	});

	it("returns a trimmed value when habit name is valid", () => {
		const result = validateHabitName(" Go on a walk ");

		expect(result).toStrictEqual({
			valid: true,
			value: "Go on a walk",
			error: null,
		});
	});
});
