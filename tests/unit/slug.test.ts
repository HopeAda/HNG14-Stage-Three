import { describe, it, expect } from "vitest";
import { getHabitSlug } from "@/lib/slug";
import "@testing-library/jest-dom";

describe("getHabitSlug", () => {
	it("returns lowercase hyphenated slug for a habit name", () => {
		const result = getHabitSlug("Go for a walk");
		expect(result).toBe("go-for-a-walk");
	});
	it("trims whitespace and collapses internal repeated spaces", () => {
		const result = getHabitSlug("   Read   books    ");
		expect(result).toBe("read-books");
	});
	it("removes all non alphanumeric characters except hyphens", () => {
		const result = getHabitSlug("go for a 10 minutes run!!!");
		expect(result).toBe("go-for-a-10-minutes-run");
	});
});
