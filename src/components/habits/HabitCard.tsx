"use client";

import { DataContext } from "@/app/dashboard/page";
import { getUserHabits, toggleHabitCompletion } from "@/lib/habits";
import { getHabitSlug } from "@/lib/slug";
import { getHabits, saveHabits } from "@/lib/storage";
import { calculateCurrentStreak } from "@/lib/streaks";
import { Habit } from "@/types/habit";
import { useContext } from "react";

type CardProviderProps = {
	habit: Habit;
};

export default function HabitCard({ habit }: CardProviderProps) {
	const ctx = useContext(DataContext);
	const today = new Date().toISOString().split("T")[0];
	const currentHabit =
		ctx?.habitsList.find((itm) => itm.id === habit.id) || habit;

	const streak = calculateCurrentStreak(currentHabit.completions);
	const cardSlug = getHabitSlug(habit.name);

	const toggleComplete = () => {
		const allHabits = getHabits();
		const updatedHabit = toggleHabitCompletion(habit, today);
		const updatedHabitIndex = allHabits.findIndex(
			(itm) => itm.id === updatedHabit.id,
		);
		const userHabits = getUserHabits();

		ctx?.setHabitsList((prev) => {
			const updated = [...prev];
			const updatedIndex = userHabits.findIndex(
				(itm) => itm.id === updatedHabit.id,
			);
			updated[updatedIndex] = updatedHabit;
			return updated;
		});
		allHabits[updatedHabitIndex] = updatedHabit;
		saveHabits(allHabits);
	};

	return (
		<article
			className="flex flex-col w-full bg-[#f8f8f8]  shadow-md p-4! rounded-md gap-4"
			data-testid={`habit-card-${cardSlug}`}
		>
			<div className="flex gap-2 items-start">
				<input
					type="checkbox"
					className="w-4 h-4 accent-blue-300 cursor-pointer"
					aria-labelledby={`${cardSlug}-id`}
					checked={currentHabit.completions.includes(today)}
					onChange={toggleComplete}
					data-testid={`habit-complete-${cardSlug}`}
				/>
				<div className="flex flex-col gap-1.25 w-full">
					<p
						className="text-md leading-none font-semibold cursor-pointer w-full capitalize"
						id={`${cardSlug}-id`}
						onClick={toggleComplete}
					>
						{habit.name}
					</p>
					<span className="text-sm leading-none">
						{habit.description}
					</span>
				</div>
			</div>

			<div className="text-[12px] flex gap-1 items-center   w-fit -mb-3! font-medium px-2! py-1! bg-gray-200 rounded-xl leading-none">
				<span className="capitalize">{habit.frequency}</span>
				<span className="w-0.5 h-0.5 rounded-full bg-gray-400"></span>
				<span>
					Since{" "}
					{new Date(habit.createdAt).toLocaleDateString("en-us", {
						day: "numeric",
						month: "short",
						year: "numeric",
					})}
				</span>
			</div>
			<section className=" flex justify-between items-center gap-2 ">
				<div className="flex gap-1 items-center">
					<span
						className={`w-3.5 h-3.5 cursor-pointer ${habit.completions.includes(today) ? "fill-amber-400" : "fill-gray-400"}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 640 640"
						>
							<path d="M434.8 54.1C446.7 62.7 451.1 78.3 445.7 91.9L367.3 288L512 288C525.5 288 537.5 296.4 542.1 309.1C546.7 321.8 542.8 336 532.5 344.6L244.5 584.6C233.2 594 217.1 594.5 205.2 585.9C193.3 577.3 188.9 561.7 194.3 548.1L272.7 352L128 352C114.5 352 102.5 343.6 97.9 330.9C93.3 318.2 97.2 304 107.5 295.4L395.5 55.4C406.8 46 422.9 45.5 434.8 54.1z" />
						</svg>
					</span>
					<span
						className="text-sm"
						data-testid={`habit-streak-${cardSlug}`}
					>
						{streak}
					</span>
				</div>
				<div className="flex gap-2 items-center">
					<button
						className="w-5 h-5 cursor-pointer bg-transparent fill-gray-400 hover:fill-blue-500 hover:scale-110"
						aria-label="Edit button"
						data-testid={`habit-edit-${cardSlug}`}
						onClick={() => {
							ctx?.setSelectedHabitId(habit.id);
							ctx?.setFormModalOpen(true);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 640 640"
						>
							<path d="M416.9 85.2L372 130.1L509.9 268L554.8 223.1C568.4 209.6 576 191.2 576 172C576 152.8 568.4 134.4 554.8 120.9L519.1 85.2C505.6 71.6 487.2 64 468 64C448.8 64 430.4 71.6 416.9 85.2zM338.1 164L122.9 379.1C112.2 389.8 104.4 403.2 100.3 417.8L64.9 545.6C62.6 553.9 64.9 562.9 71.1 569C77.3 575.1 86.2 577.5 94.5 575.2L222.3 539.7C236.9 535.6 250.2 527.9 261 517.1L476 301.9L338.1 164z" />
						</svg>
					</button>
					<button
						className="w-5 h-5 cursor-pointer bg-transparent fill-gray-400 hover:fill-blue-500 hover:scale-110"
						aria-label="Delete button"
						data-testid={`habit-delete-${cardSlug}`}
						onClick={() => {
							ctx?.setSelectedHabitId(habit.id);
							ctx?.setDeleteModalOpen?.(true);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 640 640"
						>
							<path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
						</svg>
					</button>
				</div>
			</section>
		</article>
	);
}
