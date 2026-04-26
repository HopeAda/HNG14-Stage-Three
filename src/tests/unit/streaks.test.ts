import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { calculateCurrentStreak } from "@/lib/streaks";

describe("calculateCurrentStreak", () => {
	it("returns 0 when completions is empty", () => {
		const result = calculateCurrentStreak([]);

		expect(result).toStrictEqual(0);
	});

	it("returns 0 when today is not completed", () => {
		const result = calculateCurrentStreak(
			["2026-04-15", "2026-04-14"],
			"2026-04-16",
		);

		expect(result).toStrictEqual(0);

		expect(
			calculateCurrentStreak(["2026-04-15", "2026-04-14"]),
		).toStrictEqual(0);
	});

	it("returns the correct streak for consecutive completed days", () => {
		const result = calculateCurrentStreak(
			["2026-04-16", "2026-04-15", "2026-04-14"],
			"2026-04-16",
		);

		expect(result).toStrictEqual(3);
	});

	it("ignores duplicate completion dates", () => {
		const result = calculateCurrentStreak(
			[
				"2026-04-16",
				"2026-04-15",
				"2026-04-15",
				"2026-04-14",
				"2026-04-14",
			],
			"2026-04-16",
		);

		expect(result).toStrictEqual(3);
	});

	it("breaks the streak when a calendar day is missing", () => {
		const result = calculateCurrentStreak(
			["2026-04-16", "2026-04-14"],
			"2026-04-16",
		);

		expect(result).toStrictEqual(1);
	});
});
