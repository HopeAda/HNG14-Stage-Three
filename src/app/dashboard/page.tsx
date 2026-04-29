"use client";
import { useEffect, useState } from "react";
import Empty from "../../../public/icons/icon-192.png";
import Image from "next/image";
import HabitList from "@/components/habits/HabitList";
import HabitForm from "@/components/habits/HabitForm";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { deleteHabit, getUserHabits } from "@/lib/habits";
import { createContext } from "react";
import { Habit } from "@/types/habit";

type DataContextType = {
	habitsList: Habit[];
	setHabitsList: React.Dispatch<React.SetStateAction<Habit[]>>;
	deleteModalOpen: boolean;
	setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedHabitId: string | null;
	setSelectedHabitId: React.Dispatch<React.SetStateAction<string | null>>;
	formModalOpen: boolean;
	setFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const DataContext = createContext<DataContextType | null>(null);

export default function Dashboard() {
	const router = useRouter();

	const today = new Date().toISOString().split("T")[0];

	const dateToday = new Date(today).toLocaleDateString("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
		weekday: "long",
	});

	const [formModalOpen, setFormModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

	const [habitsList, setHabitsList] = useState<Habit[]>([]);
	useEffect(() => {
		setHabitsList(getUserHabits());
	}, []);

	return (
		<DataContext.Provider
			value={{
				habitsList,
				setHabitsList,
				deleteModalOpen,
				setDeleteModalOpen,
				selectedHabitId,
				setSelectedHabitId,
				formModalOpen,
				setFormModalOpen,
			}}
		>
			<div className="bg-white rounded-xl flex flex-col w-full p-4! min-h-[calc(100vh-2rem)]! gap-4 shadow-md">
				<header className="flex justify-between items-center border-b-2 border-gray-100 pb-2!">
					<div className="flex flex-col gap-0!">
						<h2 className="font-semibold text-3xl  leading-none md:text-4xl">
							Habit Tracker
						</h2>
						<span className="leading-none text-sm">
							Building better habits daily
						</span>
					</div>
					<button
						className="w-fit flex justify-center items-center bg-blue-200 cursor-pointer text-white text-sm font-semibold px-2! py-1! rounded-3xl hover:bg-blue-400"
						onClick={() => {
							logout();
							router.push("/login");
						}}
						data-testid="auth-logout-button"
					>
						Log out
					</button>
				</header>
				<main
					data-testid="dashboard-page"
					className="flex flex-col  mt-4! min-h-full grow items-center"
				>
					<div className="flex justify-between items-start mb-6! w-full">
						<span className="flex flex-col">
							<h2 className="text-xl font-semibold leading-none">
								Habits
							</h2>
							<span className="text-sm">{dateToday}</span>
							<span className="text-sm leading-none">
								{habitsList.length === 0
									? "No Habits"
									: habitsList.filter((itm) =>
												itm.completions.includes(today),
										  )
										? habitsList.filter((itm) =>
												itm.completions.includes(today),
											).length + " Completed Habits"
										: ""}
							</span>
						</span>
						<button
							className="bg-blue-500 flex gap-2 h-9 pl-1.5! pr-4! rounded-4xl items-center text-white cursor-pointer font-semibold hover:bg-blue-400"
							onClick={() => {
								setFormModalOpen(true);
							}}
						>
							<span className="rounded-full bg-white w-6 h-6  text-lg flex justify-center items-center text-black fill-blue-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 640 640"
									width={15}
									height={15}
									className=" place-self-center relative -top-0.4 -left-0.4"
								>
									<path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
								</svg>
							</span>
							<span className="h-fit leading-none">Add</span>
						</button>
					</div>

					{habitsList.length === 0 ? (
						<div
							data-testid="empty-state"
							className=" rounded-xl flex flex-col w-full h-87 p-4! md:max-w-lg justify-center items-center grow"
						>
							{/* <img src={"../../../public/icons/icon-192.png"} alt="" /> */}
							<Image
								src={Empty}
								className="w-30 h-30 mb-2!"
								width={500}
								height={500}
								alt="Empty state image"
								loading="eager"
							/>
							<p className="font-semibold text-2xl mt-6!">
								No Habits Listed
							</p>
							<p className="text-sm">
								Click the plus button to get started
							</p>
						</div>
					) : (
						<HabitList habitList={habitsList} />
					)}
				</main>

				{formModalOpen ? <HabitForm setOpen={setFormModalOpen} /> : ""}

				{deleteModalOpen ? (
					<section
						className="w-full min-h-full bg-black/50 flex justify-center items-center fixed top-0 left-0 p-4! "
						id="delete-modal"
						onClick={() => {
							setDeleteModalOpen(false);
						}}
					>
						<div
							className="p-4! rounded-md flex flex-col gap-6 bg-white max-w-md"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<p className="text-md">
								Are you sure you want to delete this habit? This
								action cannot be undone.
							</p>
							<div className="flex items-center justify-between gap-2 md:justify-end">
								<button
									className="text-sm py-1! px-4! cursor-pointer w-fit  rounded-md bg-gray-500 text-white font-semibold hover:bg-gray-400"
									onClick={() => {
										setDeleteModalOpen(false);
										setSelectedHabitId(null);
									}}
								>
									Cancel
								</button>
								<button
									className="text-sm py-1! px-4! cursor-pointer w-fit  rounded-md bg-red-500 text-white font-semibold hover:bg-red-400"
									onClick={() => {
										if (selectedHabitId === null) return;
										deleteHabit(selectedHabitId);
										setDeleteModalOpen(false);
										setHabitsList((prev) =>
											prev.filter(
												(itm) =>
													itm.id !== selectedHabitId,
											),
										);
									}}
									data-testid="confirm-delete-button"
								>
									Delete
								</button>
							</div>
						</div>
					</section>
				) : (
					""
				)}
			</div>
		</DataContext.Provider>
	);
}
