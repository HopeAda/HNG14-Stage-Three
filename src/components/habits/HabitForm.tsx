"use client";

import { DataContext } from "@/app/dashboard/page";
import { createHabit, getUserHabits, updateHabit } from "@/lib/habits";
import { validateHabitName } from "@/lib/validators";
import { useContext, useState, useEffect, useRef } from "react";

type FormProviderProps = {
	setOpen: (a: boolean) => void;
};

export default function HabitForm({ setOpen }: FormProviderProps) {
	const ctx = useContext(DataContext);
	const [error, setError] = useState({
		errorExists: false,
		errorMsg: "",
	});

	const modalRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!modalRef.current) return;

		const focusableElement = Array.from(
			modalRef.current.querySelectorAll("input, button"),
		);

		const firstElement = focusableElement[0];
		const last = focusableElement[focusableElement.length - 1];

		firstElement?.focus();

		function handleTab(e: KeyboardEvent) {
			if (e.key !== "Tab") return;

			if (focusableElement.length === 0) return;

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault();
					last?.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		}

		document.addEventListener("keydown", handleTab);

		return () => {
			document.removeEventListener("keydown", handleTab);
		};
	}, []);

	const mode = ctx?.selectedHabitId ? "edit" : "add";

	let habitToEdit;

	if (ctx?.selectedHabitId) {
		habitToEdit = getUserHabits().find(
			(itm) => itm.id === ctx?.selectedHabitId,
		);
	}

	const [formDetails, setFormDetails] = useState({
		name: "",
		description: "",
	});

	useEffect(() => {
		if (!ctx?.selectedHabitId) return;

		const habit = getUserHabits().find(
			(itm) => itm.id === ctx.selectedHabitId,
		);

		if (mode === "edit" && habit) {
			setFormDetails({
				name: habit.name,
				description: habit.description,
			});
		}
	}, [ctx?.selectedHabitId, mode]);

	if (mode === "edit" && !habitToEdit) return null;

	function submitHandler(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		const isValid = validateHabitName(formDetails.name);

		if (!isValid.valid) {
			setError({
				errorExists: !isValid.valid,
				errorMsg: isValid.error || "",
			});
			return;
		}

		if (mode === "add") {
			const habit = createHabit(
				formDetails.name,
				formDetails.description,
			);
			ctx?.setHabitsList((prev) => [...prev, habit]);
		} else {
			const habit = updateHabit(
				ctx!.selectedHabitId!,
				formDetails.name,
				formDetails.description,
			);

			if (!habit) return;

			ctx?.setHabitsList((prev) => {
				const updatedIndex = prev.findIndex(
					(itm) => itm.id === habit.id,
				);

				const updated = [...prev];
				updated[updatedIndex] = habit;

				return updated;
			});
		}

		setOpen(false);
		ctx?.setSelectedHabitId(null);
	}

	return (
		<section
			className="fixed top-0 left-0 w-full min-h-lvh bg-black/50 flex justify-center items-center p-4!"
			id="habit-form-modal"
			ref={modalRef}
			onClick={() => {
				setOpen(false);
				ctx?.setSelectedHabitId(null);
			}}
		>
			<div
				className="bg-white p-4! rounded-xl flex flex-col w-full max-w-lg"
				onClick={(e) => {
					e.stopPropagation();
				}}
				data-testid="habit-form"
			>
				<h2 className="text-2xl font-semibold mb-3!">
					{mode == "add" ? "Create Habit" : "Edit Habit"}
				</h2>

				<form className="flex flex-col gap-4" onSubmit={submitHandler}>
					<div className="form-item">
						<label htmlFor="" className="form-label">
							Enter the habit
						</label>

						<input
							type="text"
							placeholder="eg. Exercise"
							className="form-input"
							value={formDetails.name}
							onChange={(e) => {
								setFormDetails((prev) => ({
									...prev,
									name: e.target.value,
								}));
							}}
							data-testid="habit-name-input"
							autoComplete="offf"
						/>
					</div>

					<div className="form-item">
						<label htmlFor="" className="form-label">
							Description (Optional)
						</label>

						<input
							type="text"
							placeholder="Describe the habit"
							className="form-input"
							value={formDetails.description}
							onChange={(e) => {
								setFormDetails((prev) => ({
									...prev,
									description: e.target.value,
								}));
							}}
							data-testid="habit-description-input"
							autoComplete="off"
						/>
					</div>

					<div className="form-item">
						<label htmlFor="" className="form-label">
							Frequency
						</label>

						<div className="form-input flex flex-row justify-between items-center">
							<input
								type="text"
								placeholder="Daily"
								id="login-password"
								className="grow outline-none h-full cursor-pointer"
								data-testid="habit-frequency-select"
								readOnly
							/>
							<span className="w-4 h-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 640 640"
								>
									<path d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z" />
								</svg>
							</span>
						</div>
					</div>
					{error.errorExists ? (
						<div className="text-sm text-red-400">
							-{error.errorMsg}
						</div>
					) : (
						""
					)}

					<div className="flex flex-row gap-2 w-full mt-2! md:flex-row justify-end">
						<button
							className="text-white text-lg font-medium bg-gray-500 rounded-md p-1! cursor-pointer hover:bg-gray-400 px-2!"
							onClick={() => {
								ctx?.setSelectedHabitId(null);
								setOpen(false);
							}}
							type="button"
						>
							Cancel
						</button>

						<button
							className="text-white text-lg font-medium bg-blue-500 rounded-md p-1! cursor-pointer hover:bg-blue-400 px-2!"
							data-testid={"habit-save-button"}
						>
							{mode === "add" ? "Create Habit" : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}
