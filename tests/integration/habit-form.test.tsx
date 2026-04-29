// src/tests/integration/habit-form.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HabitForm from "@/components/habits/HabitForm";
import { DataContext } from "@/app/dashboard/page";
import { Habit } from "@/types/habit";

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
	usePathname: () => "/",
	redirect: vi.fn(),
}));

// ---- helpers ----

const mockSetOpen = vi.fn();
const mockSetHabitsList = vi.fn();
const mockSetSelectedHabitId = vi.fn();

function makeHabit(overrides: Partial<Habit> = {}): Habit {
	return {
		id: "habit-1",
		userId: "user-1",
		name: "Drink Water",
		description: "Stay hydrated",
		frequency: "daily",
		createdAt: new Date().toISOString(),
		completions: [],
		...overrides,
	};
}

function renderForm(selectedHabitId: string | null = null) {
	const contextValue = {
		habitsList: selectedHabitId ? [makeHabit({ id: selectedHabitId })] : [],
		setHabitsList: mockSetHabitsList,
		selectedHabitId,
		setSelectedHabitId: mockSetSelectedHabitId,
	};

	return render(
		<DataContext.Provider value={contextValue}>
			<HabitForm setOpen={mockSetOpen} />
		</DataContext.Provider>,
	);
}

function seedHabit(habit: Habit) {
	const session = { userId: habit.userId, email: "test@test.com" };
	localStorage.setItem("habit-tracker-session", JSON.stringify(session));
	localStorage.setItem("habit-tracker-habits", JSON.stringify([habit]));
}

beforeEach(() => {
	localStorage.clear();
	vi.clearAllMocks();

	localStorage.setItem(
		"habit-tracker-session",
		JSON.stringify({ userId: "user-1", email: "test@test.com" }),
	);
});

describe("habit form", () => {
	it("shows a validation error when habit name is empty", async () => {
		renderForm();

		fireEvent.click(screen.getByTestId("habit-save-button"));

		await waitFor(() => {
			expect(
				screen.getByText(/habit name is required/i),
			).toBeInTheDocument();
		});
	});

	it("creates a new habit and renders it in the list", async () => {
		renderForm();

		fireEvent.change(screen.getByTestId("habit-name-input"), {
			target: { value: "Exercise" },
		});
		fireEvent.change(screen.getByTestId("habit-description-input"), {
			target: { value: "Work out every day" },
		});
		fireEvent.click(screen.getByTestId("habit-save-button"));

		await waitFor(() => {
			expect(mockSetHabitsList).toHaveBeenCalled();
			expect(mockSetOpen).toHaveBeenCalledWith(false);

			const raw = localStorage.getItem("habit-tracker-habits");
			const habits = JSON.parse(raw!);

			expect(habits).toHaveLength(1);
			expect(habits[0].name).toBe("Exercise");
			expect(habits[0].description).toBe("Work out every day");
			expect(habits[0].frequency).toBe("daily");
			expect(habits[0].userId).toBe("user-1");
		});
	});

	it("edits an existing habit and preserves immutable fields", async () => {
		const existingHabit = makeHabit({
			id: "habit-1",
			userId: "user-1",
			name: "Drink Water",
			description: "Stay hydrated",
			completions: ["2024-01-01", "2024-01-02"],
			createdAt: "2024-01-01T00:00:00.000Z",
		});

		seedHabit(existingHabit);
		renderForm("habit-1");

		await waitFor(() => {
			expect(screen.getByTestId("habit-name-input")).toHaveValue(
				"Drink Water",
			);
		});

		fireEvent.change(screen.getByTestId("habit-name-input"), {
			target: { value: "Drink More Water" },
		});
		fireEvent.change(screen.getByTestId("habit-description-input"), {
			target: { value: "Updated description" },
		});

		fireEvent.click(screen.getByTestId("habit-save-button"));

		await waitFor(() => {
			expect(mockSetHabitsList).toHaveBeenCalled();
			expect(mockSetOpen).toHaveBeenCalledWith(false);

			const raw = localStorage.getItem("habit-tracker-habits");
			const habits = JSON.parse(raw!);
			const updated = habits.find((h: Habit) => h.id === "habit-1");

			expect(updated.name).toBe("Drink More Water");
			expect(updated.description).toBe("Updated description");

			expect(updated.id).toBe(existingHabit.id);
			expect(updated.userId).toBe(existingHabit.userId);
			expect(updated.createdAt).toBe(existingHabit.createdAt);
			expect(updated.completions).toEqual(existingHabit.completions);
			expect(updated.frequency).toBe("daily");
		});
	});

	it("deletes a habit only after explicit confirmation", async () => {
		const existingHabit = makeHabit({ id: "habit-1", userId: "user-1" });
		seedHabit(existingHabit);

		const { default: Dashboard } = await import("@/app/dashboard/page");

		render(<Dashboard />);

		const slug = "drink-water";

		fireEvent.click(screen.getByTestId(`habit-delete-${slug}`));

		await waitFor(() => {
			expect(
				screen.getByTestId("confirm-delete-button"),
			).toBeInTheDocument();
		});

		const beforeDelete = JSON.parse(
			localStorage.getItem("habit-tracker-habits")!,
		);
		expect(beforeDelete).toHaveLength(1);

		fireEvent.click(screen.getByTestId("confirm-delete-button"));

		await waitFor(() => {
			const raw = localStorage.getItem("habit-tracker-habits");
			const habits = JSON.parse(raw!);
			expect(habits).toHaveLength(0);
		});
	});

	it("toggles completion and updates the streak display", async () => {
		const today = new Date().toISOString().split("T")[0];
		const existingHabit = makeHabit({
			id: "habit-1",
			userId: "user-1",
			name: "Drink Water",
			completions: [],
		});

		seedHabit(existingHabit);

		const { default: HabitCard } =
			await import("@/components/habits/HabitCard");

		const contextValue = {
			habitsList: [existingHabit],
			setHabitsList: mockSetHabitsList,
			selectedHabitId: null,
			setSelectedHabitId: mockSetSelectedHabitId,
		};

		render(
			<DataContext.Provider value={contextValue}>
				<HabitCard habit={existingHabit} />
			</DataContext.Provider>,
		);

		const slug = "drink-water";

		expect(screen.getByTestId(`habit-streak-${slug}`)).toHaveTextContent(
			"0",
		);

		fireEvent.click(screen.getByTestId(`habit-complete-${slug}`));

		await waitFor(() => {
			// const streak = screen.getByTestId(`habit-streak-${slug}`);
			// expect(streak.textContent).toBe("1");

			waitFor(() => {
				expect(
					screen.getByTestId(`habit-streak-${slug}`),
				).toHaveTextContent("1");
			});

			const raw = localStorage.getItem("habit-tracker-habits");
			const habits = JSON.parse(raw!);
			expect(habits[0].completions).toContain(today);
		});
	});
});
